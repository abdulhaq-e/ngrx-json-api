import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { Store } from '@ngrx/store';

import { NgrxJsonApiSelectors } from './selectors';
import {
  ApiApplyInitAction,
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
  DenormalisedStoreResource,
  NgrxJsonApiStore,
  NgrxJsonApiStoreData,
  Payload,
  QueryType,
  Resource,
  ResourceDefinition,
  ResourceIdentifier,
  Query,
  ResourceRelationship,
  StoreResource,
} from './interfaces';
import {
  denormaliseStoreResource,
  uuid
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
    this.store.select(selectors.storeLocation)
      .subscribe(it => this.storeSnapshot = it as NgrxJsonApiStore);
  }

  public findOne(query: Query, fromServer = true,
    denormalise = false): Observable<StoreResource> | Observable<DenormalisedStoreResource> {
    query.queryType = 'getOne';
    let obs$ = this.findInternal(query, fromServer);
    if (denormalise) {
      return this.denormaliseOne(obs$) as Observable<DenormalisedStoreResource>;
    }
    return obs$ as Observable<StoreResource>;
  };

  public findMany(query: Query, fromServer = true,
    denormalise = false): Observable<StoreResource[]> | Observable<DenormalisedStoreResource[]> {
    query.queryType = 'getMany';
    let obs$ = this.findInternal(query, fromServer);
    if (denormalise) {
      return this.denormaliseMany(obs$) as Observable<DenormalisedStoreResource[]>;
    }
    return obs$ as Observable<StoreResource[]>;
  };

  private removeQuery(queryId: string) {
    this.store.dispatch(new RemoveQueryAction(queryId));
  }

  private findInternal(query: Query,
    fromServer = true): Observable<StoreResource | StoreResource[]> {
    if (!query.queryId) {
      query.queryId = this.uuid();
    }
    if (fromServer) {
      this.store.dispatch(new ApiReadInitAction(query));
    } else {
      this.store.dispatch(new QueryStoreInitAction(query));
    }
    return this.selectResults(query.queryId)
      .map(it => {
        switch (query.queryType) {
          case 'getMany': {
            return it;
          }
          case 'getOne': {
            if (it.length === 0) {
              return null;
            } else if (it.length === 1) {
              return it[0];
            } else {
              throw new Error('Unique result expected');
            }
          }
        }
      })
      .finally(() => this.removeQuery(query.queryId));
  }

  private uuid() {
    return uuid();
  }

  /**
   * Gets the current state of the given resources.
   * Consider the use of selectResource(...) to get an observable of the resource.
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
   * Gets the current persisted state of the given resources.
   * Consider the use of selectResource(...) to get an observable of the resource.
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
  public selectResults(queryId: string): Observable<Array<StoreResource>> {
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
  public selectStoreResource(identifier: ResourceIdentifier): Observable<StoreResource> {
    return this.store
      .select(this.selectors.storeLocation)
      .let(this.selectors.getStoreResource$(identifier));
  }

  public denormaliseOne(storeResource$: Observable<StoreResource>
  ): Observable<DenormalisedStoreResource> {
    return this.store
      .select(this.selectors.storeLocation)
      .let(this.selectors.getStoreData$())
      .mergeMap((storeData: NgrxJsonApiStoreData) => storeResource$
        .map<StoreResource, DenormalisedStoreResource>(
        it => it ? denormaliseStoreResource(it, storeData) : undefined)
      );
  }

  public denormaliseMany(storeResources$: Observable<StoreResource[]>
  ): Observable<DenormalisedStoreResource[]> {
    return this.store
      .select(this.selectors.storeLocation)
      .let(this.selectors.getStoreData$())
      .mergeMap((storeData: NgrxJsonApiStoreData) => storeResources$
        .map<StoreResource[], DenormalisedStoreResource[]>(
        it => it ? it.map(r => denormaliseStoreResource(r, storeData)) : undefined
        ));
  }

  /**
   * Updates the given resource in the store with the provided data.
   * Use commit() to send the changes to the remote JSON API endpoint.
   *
   * @param resource
   */
  public patchResource(resource: Resource, toRemote = false) {
    if (toRemote) {
      this.store.dispatch(new ApiUpdateInitAction(resource));
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
  public postResource(resource: Resource, toRemote = false) {
    if (toRemote) {
      this.store.dispatch(new ApiCreateInitAction(resource));
    } else {
      this.store.dispatch(new PostStoreResourceAction(resource));
    }
  }

  /**
   * Marks the given resource for deletion.
   *
   * @param resourceId
   */
  public deleteResource(resourceId: ResourceIdentifier, toRemote = false) {
    if (toRemote) {
      this.store.dispatch(new ApiDeleteInitAction(resourceId));
    } else {
      this.store.dispatch(new DeleteStoreResourceAction(resourceId));
    }
  }

  /**
   * Applies all pending changes to the remote JSON API endpoint.
   */
  public apply() {
    this.store.dispatch(new ApiApplyInitAction());
  }
}
