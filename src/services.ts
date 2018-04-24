import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { Store } from '@ngrx/store';

import {
  selectManyQueryResult,
  selectNgrxJsonApiDefaultZone,
  selectNgrxJsonApiZone,
  selectOneQueryResult,
  selectStoreResource,
  selectStoreResources,
} from './selectors';
import {
  ApiApplyInitAction,
  ApiDeleteInitAction,
  ApiGetInitAction,
  ApiPatchInitAction,
  ApiPostInitAction,
  ApiQueryRefreshAction,
  ClearStoreAction,
  CompactStoreAction,
  DeleteStoreResourceAction,
  LocalQueryInitAction,
  ModifyStoreResourceErrorsAction,
  NewStoreResourceAction,
  PatchStoreResourceAction,
  PostStoreResourceAction,
  RemoveQueryAction,
} from './actions';
import {
  ManyQueryResult,
  NGRX_JSON_API_DEFAULT_ZONE,
  NgrxJsonApiConfig,
  NgrxJsonApiStore,
  NgrxJsonApiStoreData,
  OneQueryResult,
  Query,
  QueryResult,
  Resource,
  ResourceError,
  ResourceIdentifier,
  StoreResource,
} from './interfaces';
import {
  denormaliseStoreResource,
  denormaliseStoreResources,
  getDenormalisedPath,
  getDenormalisedValue,
  uuid,
} from './utils';

export interface FindOptions {
  query: Query;
  fromServer?: boolean;
  denormalise?: boolean;
}

export interface PutQueryOptions {
  query: Query;
  fromServer?: boolean;
}

export interface PostResourceOptions {
  resource: Resource;
  toRemote?: boolean;
}

export interface PatchResourceOptions {
  resource: Resource;
  toRemote?: boolean;
}

export interface NewResourceOptions {
  resource: Resource;
}

export interface DeleteResourceOptions {
  resourceId: ResourceIdentifier;
  toRemote?: boolean;
}

/**
 * This internface is deprecated, do no longer use.
 */
export interface Options {
  query?: Query;
  denormalise?: boolean;
  fromServer?: boolean;
  resource?: Resource;
  toRemote?: boolean;
  resourceId?: ResourceIdentifier;
}

/**
 * Represents an isolated area in the store with its own set of resources and queries.
 * 'api' is the default zone that already historically has been put beneath NgrxJsonApi within the store.
 */
export class NgrxJsonApiZoneService {
  constructor(protected zoneId: string, protected store: Store<any>) {}

  /**
   * Adds the given query to the store. Any existing query with the same queryId is replaced.
   * Make use of selectResults(...) to fetch the data.

   * @param query
   * @param fromServer
   */
  public putQuery(options: PutQueryOptions) {
    let query = options.query;
    let fromServer = _.isUndefined(options.fromServer)
      ? true
      : options.fromServer;

    if (!query.queryId) {
      throw new Error('to query must have a queryId');
    }

    if (fromServer) {
      this.store.dispatch(new ApiGetInitAction(query, this.zoneId));
    } else {
      this.store.dispatch(new LocalQueryInitAction(query, this.zoneId));
    }
  }

  public refreshQuery(queryId: string) {
    this.store.dispatch(new ApiQueryRefreshAction(queryId, this.zoneId));
  }

  public removeQuery(queryId: string) {
    this.store.dispatch(new RemoveQueryAction(queryId, this.zoneId));
  }

  /**
   * Selects the data of the given query.
   *
   * @param queryId
   * @returns observable holding the data as array of resources.
   */
  public selectManyResults(
    queryId: string,
    denormalize = false
  ): Observable<ManyQueryResult> {
    return this.store
      .let(selectNgrxJsonApiZone(this.zoneId))
      .let(selectManyQueryResult(queryId, denormalize));
  }

  /**
   * Selects the data of the given query.
   *
   * @param queryId
   * @returns observable holding the data as array of resources.
   */
  public selectOneResults(
    queryId: string,
    denormalize = false
  ): Observable<OneQueryResult> {
    return this.store
      .let(selectNgrxJsonApiZone(this.zoneId))
      .let(selectOneQueryResult(queryId, denormalize));
  }

  /**
   * @param identifier of the resource
   * @returns observable of the resource
   */
  public selectStoreResource(
    identifier: ResourceIdentifier
  ): Observable<StoreResource> {
    return this.store
      .let(selectNgrxJsonApiZone(this.zoneId))
      .let(selectStoreResource(identifier));
  }

  /**
   * @param identifiers of the resources
   * @returns observable of the resources
   */
  public selectStoreResources(
    identifiers: ResourceIdentifier[]
  ): Observable<StoreResource[]> {
    return this.store
      .let(selectNgrxJsonApiZone(this.zoneId))
      .let(selectStoreResources(identifiers));
  }

  /**
   * Updates the given resource in the store with the provided data.
   * Use commit() to send the changes to the remote JSON API endpoint.
   *
   * @param resource
   */
  public patchResource(options: PatchResourceOptions) {
    let resource = options.resource;
    let toRemote = _.isUndefined(options.toRemote) ? false : options.toRemote;

    if (toRemote) {
      this.store.dispatch(new ApiPatchInitAction(resource, this.zoneId));
    } else {
      this.store.dispatch(new PatchStoreResourceAction(resource, this.zoneId));
    }
  }

  /**
   * Creates a new resources that is hold locally in the store
   * and my later be posted.
   *
   * @param resource
   */
  public newResource(options: NewResourceOptions) {
    let resource = options.resource;
    this.store.dispatch(new NewStoreResourceAction(resource, this.zoneId));
  }

  /**
   * Adds the given resource to the store. Any already existing
   * resource with the same id gets replaced. Use commit() to send
   * the changes to the remote JSON API endpoint.
   *
   * @param resource
   */
  public postResource(options: PostResourceOptions): Observable<QueryResult> {
    let resource = options.resource;
    let toRemote = _.isUndefined(options.toRemote) ? false : options.toRemote;

    const queryId = uuid();
    if (toRemote) {
      this.store.dispatch(
        new ApiPostInitAction(resource, queryId, this.zoneId)
      );
    } else {
      this.store.dispatch(new PostStoreResourceAction(resource, this.zoneId));
    }
    return this.store
      .let(selectNgrxJsonApiZone(this.zoneId))
      .let(selectOneQueryResult(queryId));
  }

  /**
   * Marks the given resource for deletion.
   *
   * @param resourceId
   */
  public deleteResource(options: DeleteResourceOptions) {
    let resourceId = options.resourceId;
    let toRemote = _.isUndefined(options.toRemote) ? false : options.toRemote;

    if (toRemote) {
      this.store.dispatch(new ApiDeleteInitAction(resourceId, this.zoneId));
    } else {
      this.store.dispatch(
        new DeleteStoreResourceAction(resourceId, this.zoneId)
      );
    }
  }

  /**
   * Applies all pending changes to the remote JSON API endpoint.
   */
  public apply() {
    this.store.dispatch(new ApiApplyInitAction({}, this.zoneId));
  }

  /**
   * Clear all the contents from the store.
   */
  public clear() {
    this.store.dispatch(new ClearStoreAction(this.zoneId));
  }

  /**
   * Compacts the store by removing unreferences and unchanges resources.
   */
  public compact() {
    this.store.dispatch(new CompactStoreAction(this.zoneId));
  }

  /**
   * Adds the given errors to the resource with the given id.
   * @param id
   * @param errors
   */
  public addResourceErrors(
    id: ResourceIdentifier,
    errors: Array<ResourceError>
  ) {
    this.store.dispatch(
      new ModifyStoreResourceErrorsAction(
        {
          resourceId: id,
          errors: errors,
          modificationType: 'ADD',
        },
        this.zoneId
      )
    );
  }

  /**
   * Removes the given errors to the resource with the given id.
   * @param id
   * @param errors
   */
  public removeResourceErrors(
    id: ResourceIdentifier,
    errors: Array<ResourceError>
  ) {
    this.store.dispatch(
      new ModifyStoreResourceErrorsAction(
        {
          resourceId: id,
          errors: errors,
          modificationType: 'REMOVE',
        },
        this.zoneId
      )
    );
  }

  /**
   * Sets the given errors to the resource with the given id.
   * @param id
   * @param errors
   */
  public setResourceErrors(
    id: ResourceIdentifier,
    errors: Array<ResourceError>
  ) {
    this.store.dispatch(
      new ModifyStoreResourceErrorsAction(
        {
          resourceId: id,
          errors: errors,
          modificationType: 'SET',
        },
        this.zoneId
      )
    );
  }
}

export class NgrxJsonApiService extends NgrxJsonApiZoneService {
  private test = true;

  /**
   * Keeps current snapshot of the store to allow fast access to resources.
   */
  private _storeSnapshot: NgrxJsonApiStore;

  constructor(store: Store<any>, private config: NgrxJsonApiConfig) {
    super(NGRX_JSON_API_DEFAULT_ZONE, store);
  }

  public getDefaultZone(): NgrxJsonApiZoneService {
    return this;
  }

  public getZone(zoneId: string): NgrxJsonApiZoneService {
    return new NgrxJsonApiZoneService(zoneId, this.store);
  }

  public findOne(options: FindOptions): Observable<OneQueryResult> {
    return <Observable<OneQueryResult>>this.findInternal(options, false);
  }

  public findMany(options: FindOptions): Observable<ManyQueryResult> {
    return <Observable<ManyQueryResult>>this.findInternal(options, true);
  }

  public get storeSnapshot() {
    if (!this._storeSnapshot) {
      this.store
        .let(selectNgrxJsonApiDefaultZone())
        .subscribe(it => (this._storeSnapshot = it as NgrxJsonApiStore));

      if (!this._storeSnapshot) {
        throw new Error('failed to initialize store snapshot');
      }
    }
    return this._storeSnapshot;
  }

  private findInternal(
    options: FindOptions,
    multi: boolean
  ): Observable<QueryResult> {
    let query = options.query;
    let fromServer = _.isUndefined(options.fromServer)
      ? true
      : options.fromServer;
    let denormalise = _.isUndefined(options.denormalise)
      ? false
      : options.denormalise;

    let newQuery: Query;
    if (!query.queryId) {
      newQuery = { ...query, queryId: this.uuid() };
    } else {
      newQuery = query;
    }

    this.putQuery({ query: newQuery, fromServer });
    let queryResult$: Observable<QueryResult>;
    if (multi) {
      queryResult$ = this.selectManyResults(newQuery.queryId, denormalise);
    } else {
      queryResult$ = this.selectOneResults(newQuery.queryId, denormalise);
    }
    return <Observable<QueryResult>>queryResult$.finally(() =>
      this.removeQuery(newQuery.queryId)
    );
  }

  private uuid() {
    return uuid();
  }

  /**
   * Gets the current persisted state of the given resources.
   * Consider the use of selectResource(...) to get an observable of the resource.
   *
   * @param identifier
   */
  public getPersistedResourceSnapshot(identifier: ResourceIdentifier) {
    let snapshot = this.storeSnapshot;
    if (
      snapshot.data[identifier.type] &&
      snapshot.data[identifier.type][identifier.id]
    ) {
      return snapshot.data[identifier.type][identifier.id].persistedResource;
    }
    return null;
  }

  /**
   * Gets the current state of the given resources in the store.
   * Consider the use of selectResource(...) to get an observable of the resource.
   *
   * @param identifier
   */
  public getResourceSnapshot(identifier: ResourceIdentifier) {
    let snapshot = this.storeSnapshot;
    if (
      snapshot.data[identifier.type] &&
      snapshot.data[identifier.type][identifier.id]
    ) {
      return snapshot.data[identifier.type][identifier.id];
    }
    return null;
  }

  public denormaliseResource(
    storeResource$: Observable<StoreResource | StoreResource[]>
  ): Observable<StoreResource | StoreResource[]> {
    return storeResource$.combineLatest(
      this.store
        .let(selectNgrxJsonApiZone(this.zoneId))
        .map(state => state.data),
      (
        storeResource: StoreResource | StoreResource[],
        storeData: NgrxJsonApiStoreData
      ) => {
        if (_.isArray(storeResource)) {
          return denormaliseStoreResources(
            storeResource as Array<StoreResource>,
            storeData
          );
        } else {
          let resource = storeResource as StoreResource;
          return denormaliseStoreResource(resource, storeData) as StoreResource;
        }
      }
    );
  }

  public getDenormalisedPath(path: string, resourceType: string): string {
    let pathSeparator = _.get(
      this.config,
      'filteringConfig.pathSeparator'
    ) as string;
    return getDenormalisedPath(
      path,
      resourceType,
      this.config.resourceDefinitions,
      pathSeparator
    );
  }

  public getDenormalisedValue(path: string, storeResource: StoreResource): any {
    let pathSeparator = _.get(
      this.config,
      'filteringConfig.pathSeparator'
    ) as string;
    return getDenormalisedValue(
      path,
      storeResource,
      this.config.resourceDefinitions,
      pathSeparator
    );
  }
}
