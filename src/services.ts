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
  ClearStoreAction,
  CompactStoreAction,
  QueryRefreshAction
} from './actions';
import {
  NgrxJsonApiStore,
  NgrxJsonApiStoreData,
  Options,
  Resource,
  ResourceIdentifier,
  Query,
  QueryResult,
  OneQueryResult,
  ManyQueryResult,
  StoreResource,
} from './interfaces';
import {
  denormaliseStoreResource,
  getDenormalisedPath,
  getDenormalisedValue,
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

  public findOne(options: Options): Observable<OneQueryResult> {
    return this.findInternal(Object.assign({}, options, { multi: false }));
  };

  public findMany(options: Options): Observable<ManyQueryResult> {
    return this.findInternal(Object.assign({}, options, { multi: true }));
  };

  /**
   * Adds the given query to the store. Any existing query with the same queryId is replaced.
   * Make use of selectResults(...) to fetch the data.

   * @param query
   * @param fromServer
   */
  public putQuery(options: Options) {

    let query = options.query;
    let fromServer = _.isUndefined(options.fromServer) ? true : options.fromServer;

    if (!query.queryId) {
      throw new Error('to query must have a queryId');
    }

    if (fromServer) {
      this.store.dispatch(new ApiReadInitAction(query));
    } else {
      this.store.dispatch(new QueryStoreInitAction(query));
    }
  }

  public refreshQuery(queryId: string) {
    this.store.dispatch(new QueryRefreshAction(queryId));
  }

  private removeQuery(queryId: string) {
    this.store.dispatch(new RemoveQueryAction(queryId));
  }

  private findInternal(options: Options): Observable<QueryResult> {

    let query = options.query;
    let fromServer = _.isUndefined(options.fromServer) ? true : options.fromServer;
    let multi = _.isUndefined(options.multi) ? false : options.multi;
    let denormalise = _.isUndefined(options.denormalise) ? false : options.denormalise;

    let newQuery;
    if (!query.queryId) {
      newQuery = Object.assign({}, query, { queryId: this.uuid() });
    } else {
      newQuery = query;
    }

    this.putQuery({ query: newQuery, fromServer });

    let queryResult$;
    if (multi) {
      queryResult$ = this.selectManyResults(newQuery.queryId, denormalise);
    } else {
      queryResult$ = this.selectOneResults(newQuery.queryId, denormalise);
    }

    return queryResult$.finally(() => this.removeQuery(newQuery.queryId));
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
    if (snapshot.data[identifier.type] && snapshot.data[identifier.type][identifier.id]) {
      return snapshot.data[identifier.type][identifier.id].persistedResource;
    }
    return null;
  }

  /**
   * Selects the data of the given query.
   *
   * @param queryId
   * @returns observable holding the data as array of resources.
   */
  public selectManyResults(queryId: string,
      denormalize = false): Observable<ManyQueryResult> {
    let queryResult$ = this.store
      .select(this.selectors.storeLocation)
      .let(this.selectors.getManyResults$(queryId));
    if (denormalize) {
      return this.denormaliseQueryResult(queryResult$) as Observable<ManyQueryResult>;
    }
    return queryResult$;
  }

  /**
   * Selects the data of the given query.
   *
   * @param queryId
   * @returns observable holding the data as array of resources.
   */
  public selectOneResults(queryId: string,
      denormalize = false): Observable<OneQueryResult> {
    let queryResult$ = this.store
      .select(this.selectors.storeLocation)
      .let(this.selectors.getOneResult$(queryId));
    if (denormalize) {
      return this.denormaliseQueryResult(queryResult$) as Observable<OneQueryResult>;
    }
    return queryResult$;
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

  public denormaliseQueryResult(queryResult$: Observable<QueryResult>): Observable<QueryResult> {
    return queryResult$
      .combineLatest(this.store
        .select(this.selectors.storeLocation)
        .let(this.selectors.getStoreData$()), (
          queryResult: QueryResult, storeData: NgrxJsonApiStoreData
        ) => {
        let results;
        if (!queryResult.data) {
          return queryResult;
        } if (_.isArray(queryResult.data)) {
          results = queryResult.data.map(r =>
            denormaliseStoreResource(r, storeData)) as StoreResource[];
        } else {
          results = denormaliseStoreResource(queryResult.data, storeData) as StoreResource;
        }
        let denormalizedQueryResult = Object.assign({}, queryResult, {
          data: results,
        });
        return denormalizedQueryResult;
      });
  }

  public denormaliseResource(storeResource$: Observable<StoreResource> | Observable<StoreResource[]>
  ): Observable<StoreResource> | Observable<StoreResource[]> {
    return storeResource$
      .combineLatest(this.store
        .select(this.selectors.storeLocation)
        .let(this.selectors.getStoreData$()), (
          storeResource: StoreResource | StoreResource[], storeData: NgrxJsonApiStoreData
        ) => {
        if (_.isArray(storeResource)) {
          return storeResource.map(
            r => denormaliseStoreResource(r, storeData)) as StoreResource[];
        } else {
          return denormaliseStoreResource(storeResource, storeData) as StoreResource;
        }
      });
  }

  public getDenormalisedPath(path, resourceType): string {
    let pathSeparator = _.get(this.selectors.config, 'filteringConfig.pathSeparator') as string;
    return getDenormalisedPath(path, resourceType, this.selectors.config.resourceDefinitions,
      pathSeparator);
  }

  public getDenormalisedValue(path, storeResource): any {
    let pathSeparator = _.get(this.selectors.config, 'filteringConfig.pathSeparator') as string;
    return getDenormalisedValue(path, storeResource, this.selectors.config.resourceDefinitions,
      pathSeparator);
  }

  /**
   * Updates the given resource in the store with the provided data.
   * Use commit() to send the changes to the remote JSON API endpoint.
   *
   * @param resource
   */
  public patchResource(options: Options) {
    let resource = options.resource;
    let toRemote = _.isUndefined(options.toRemote) ? false : options.toRemote;

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
  public postResource(options: Options) {

    let resource = options.resource;
    let toRemote = _.isUndefined(options.toRemote) ? false : options.toRemote;

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
  public deleteResource(options: Options) {
    let resourceId = options.resourceId;
    let toRemote = _.isUndefined(options.toRemote) ? false : options.toRemote;

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

  /**
   * Clear all the contents from the store.
   */
  public clear() {
    this.store.dispatch(new ClearStoreAction());
  }

  /**
   * Compacts the store by removing unreferences and unchanges resources.
   */
  public compact() {
    this.store.dispatch(new CompactStoreAction());
  }
}
