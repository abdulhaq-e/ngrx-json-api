
import { Observable } from 'rxjs/Observable';

import { Store } from '@ngrx/store';

import { NgrxJsonApiSelectors } from './selectors';
import {
    ApiCommitInitAction,
    ApiCreateInitAction,
    ApiReadInitAction,
    ApiUpdateInitAction,
    ApiDeleteInitAction,
    DeleteStoreResourceAction,
    PatchStoreResourceAction,
    PostStoreResourceAction,
    RemoveQueryAction,
    QueryStoreInitAction,
} from './actions';
import {
    NgrxJsonApiStore,
    NgrxJsonApiStoreData,
    Payload,
    QueryType,
    Resource,
    ResourceDefinition,
    ResourceIdentifier,
    ResourceQuery,
    ResourceQueryHandle,
    ResourceRelationship,
    ResourceStore,
} from './interfaces';
import {
    denormaliseResource
} from './utils';

export class NgrxJsonApiService {

    private test: boolean = true;

    /**
     * Keeps current snapshot of the store to allow fast access to resources.
     */
    private storeSnapshot: NgrxJsonApiStore;

    constructor(
        private store: Store<any>,
        private selectors: NgrxJsonApiSelectors<any>,
    ) {
        this.store.select(selectors.storeLocation).subscribe(it => this.storeSnapshot = it as NgrxJsonApiStore);
    }

    public findOne(
        query: ResourceQuery,
        fromServer: boolean = true,
        resource: boolean = false
    ): ResourceQueryHandle<Resource> {
        query.queryType = "getOne";
        this.findInternal(query, fromServer);

        return {
            results: this.selectResults(query.queryId).map(it => {
                if (it.length == 0) {
                    return null;
                } else if (it.length == 1) {
                    return resource ? it[0].resource : it[0];
                } else {
                    throw new Error("Unique result expected");
                }
            }
            ),
            unsubscribe: () => this.removeQuery(query.queryId)
        }
    }

    public findMany(
      query: ResourceQuery,
      fromServer: boolean = true,
      resource: boolean = false
    ): ResourceQueryHandle<Array<Resource>> {
        query.queryType = "getMany";
        this.findInternal(query, fromServer);
        return {
            results: this.selectResults(query.queryId)
                .map(it => resource ? it.map(r => r.resource) : it),
            unsubscribe: () => this.removeQuery(query.queryId)
        }
    }

    private removeQuery(queryId: string) {
        this.store.dispatch(new RemoveQueryAction(queryId));
    }

    private findInternal(query: ResourceQuery, fromServer: boolean = true) {
        if (fromServer) {
            let payload: Payload = {
                query: query
            };
            this.store.dispatch(new ApiReadInitAction(payload));
        } else {
            this.store.dispatch(new QueryStoreInitAction(query));
        }

    }

    /**
     * Gets the current state of the given resources. Consider the use of selectResource(...) to get an observable of the resource.
     *
     * @param identifier
     */
    public getResourceSnapshot(identifier: ResourceIdentifier) {
        let snapshot = this.storeSnapshot;
        if (snapshot.data[identifier.type] && snapshot.data[identifier.type][identifier.id]) {
            return snapshot.data[identifier.type][identifier.id].resource;
        }
        return null;
    }

    /**
     * Gets the current persisted state of the given resources. Consider the use of selectResource(...) to get an observable of the
     * resource.
     *
     * @param identifier
     */
    public getPersistedResourceSnapshot(identifier: ResourceIdentifier) {
        let snapshot = this.storeSnapshot;
        if (snapshot.data[identifier.type] && snapshot.data[identifier.type][identifier.id]) {
            return snapshot.data[identifier.type][identifier.id].persistedResource;
        }
        return null;
    }

    /**
     * Selects the results of the given query.
     *
     * @param queryId
     * @returns observable holding the results as array of resources.
     */
    public selectResults(queryId: string): Observable<Array<ResourceStore>> {
        return this.store
            .select(this.selectors.storeLocation)
            .let(this.selectors.getResults$(queryId));
    }

    /**
     * Selects the result identifiers of the given query.
     *
     * @param queryId
     * @returns {any}
     */
    public selectResultIdentifiers(queryId: string): Observable<Array<ResourceIdentifier>> {
        return this.store
            .select(this.selectors.storeLocation)
            .let(this.selectors.getResultIdentifiers$(queryId));
    }

    /**
     * @param identifier of the resource
     * @returns observable of the resource
     */
    public selectResource(identifier: ResourceIdentifier): Observable<Resource> {
        return this.store
            .select(this.selectors.storeLocation)
            .let(this.selectors.getResource$(identifier));
    }

    /**
     * @param identifier of the resource
     * @returns observable of the resource
     */
    public selectResourceStore(identifier: ResourceIdentifier): Observable<ResourceStore> {
        return this.store
            .select(this.selectors.storeLocation)
            .let(this.selectors.getResourceStore$(identifier));
    }

    public denormalise() {
        return (resourceStore$: Observable<ResourceStore | ResourceStore>) => {
            return resourceStore$
                .combineLatest(this.store
                    .select(this.selectors.storeLocation)
                    .let(this.selectors.getStoreData$()),
                (
                    resourceStore: ResourceStore,
                    storeData: NgrxJsonApiStoreData
                ) => {
                    return denormaliseResource(resourceStore, storeData)
                });
        }
    }

    /**
     * Updates the given resource in the store with the provided data.
     * Use commit() to send the changes to the remote JSON API endpoint.
     *
     * @param resource
     */
    public patchResource(resource: Resource, toRemote : boolean = false) {
      if (toRemote) {
        let payload: Payload = {
            jsonApiData: {
                data: {
                    id: resource.id,
                    type: resource.type,
                    attributes: resource.attributes,
                    relationships: resource.relationships
                },
            },
            query: {
                queryType: 'update',
                type: resource.type,
                id: resource.id
            }
        };
        this.store.dispatch(new ApiUpdateInitAction(payload));
      } else {
        this.store.dispatch(new PatchStoreResourceAction(resource));
      }
    }

    /**
     * Adds the given resource to the store. Any already existing
     * resource with the same id gets replaced. Use commit() to send
     * the changes to the remote JSON API endpoint.
     *
     * @param resource
     */
    public postResource(resource: Resource, toRemote: boolean = false) {
      if (toRemote) {
        let payload: Payload = {
            jsonApiData: {
                data: {
                    id: resource.id,
                    type: resource.type,
                    attributes: resource.attributes,
                    relationships: resource.relationships
                },
            },
            query: {
                queryType: 'create',
                type: resource.type
            }
        };
        this.store.dispatch(new ApiCreateInitAction(payload));
      } else {
        this.store.dispatch(new PostStoreResourceAction(resource));
      }
    }

    /**
     * Marks the given resource for deletion.
     *
     * @param resourceId
     */
    public deleteResource(resourceId: ResourceIdentifier, toRemote: boolean = false) {
      if (toRemote) {
        let payload: Payload = {
            query: {
                queryType: 'deleteOne',
                type: resourceId.type,
                id: resourceId.id
            }
        };
        this.store.dispatch(new ApiDeleteInitAction(payload));
      } else {
        this.store.dispatch(new DeleteStoreResourceAction(resourceId));
      }
    }

    /**
     * Applies all pending changes to the remote JSON API endpoint.
     */
    public commit() {
        let storeLocation = this.selectors.storeLocation;
        this.store.dispatch(new ApiCommitInitAction(storeLocation));
    }
}
