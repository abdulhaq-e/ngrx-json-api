import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Store } from '@ngrx/store';

import { NgrxJsonApiSelectors } from './selectors';
import {
  ApiCreateInitAction,
  ApiReadInitAction,
  ApiUpdateInitAction,
  ApiDeleteInitAction,
  DeleteFromStateAction,
  ApiPostStoreResourceAction,
  ApiPatchStoreResourceAction,
  ApiDeleteStoreResourceAction,
  ApiCommitInitAction,
} from './actions';
import {
  ResourceQuery,
  Payload,
  QueryType,
  Resource,
  ResourceIdentifier
} from './interfaces';

@Injectable()
export class NgrxJsonApiService<T> {

  constructor(
    private store: Store<T>,
    private selectors: NgrxJsonApiSelectors<T>) {}

  public select$(queryType: QueryType, query: ResourceQuery) {
    return this.selectors.get$(queryType, query);
  }

  public create(payload: Payload) {
    this.store.dispatch(new ApiCreateInitAction(payload));
  }

  public read(payload: Payload) {
    this.store.dispatch(new ApiReadInitAction(payload));
  }

  public update(payload: Payload) {
    this.store.dispatch(new ApiUpdateInitAction(payload));
  }

  public delete(payload: Payload) {
    this.store.dispatch(new ApiDeleteInitAction(payload));
  }

  public deleteFromState(payload: Payload) {
    return this.store.dispatch(new DeleteFromStateAction(payload));
  }
}


@Injectable()
export class NgrxJsonApiServiceV2<T> {

  private test: boolean = true;
  constructor(
      private store: Store<T>,
      private selectors: NgrxJsonApiSelectors<T>) {}


  public getOne(query: ResourceQuery) {
    query.queryType = "getOne";
    var result = this.getInternal(query);
    if(result != null){
      return result.map(it => {
        if(it.length == 0){
          return null;
        }else if(it.length == 1){
          return it[0];
        }else{
          throw new Error("Unique result expected");
        }
      });
    }else{
      return null;
    }
  }

  public getMany(query: ResourceQuery) {
    query.queryType = "getMany";
    return this.getInternal(query);
  }

  private getInternal(query: ResourceQuery) {
    let payload : Payload = {
      query: query
    };
    this.store.dispatch(new ApiReadInitAction(payload));

    let queryId = query.queryId;
    if(queryId != null){
      return this.selectQuery(queryId);
    }else{
      return null;
    }
  }

  public selectQuery(queryId: string) : Observable<Array<Resource>> {
    return this.selectors.getQuery$(this.store, queryId);
  }

  /**
   * Updates the given resource in the store with the provided data.
   * Use commit() to send the changes to the remote JSON API endpoint.
   *
   * @param resource
   */
  public patchResource(resource: Resource) {
    this.store.dispatch(new ApiPatchStoreResourceAction(resource));
  }

  /**
   * Adds the given resource to the store. Any already existing
   * resource with the same id gets replaced. Use commit() to send
   * the changes to the remote JSON API endpoint.
   *
   * @param resource
   */
  public postResource(resource: Resource) {
    this.store.dispatch(new ApiPostStoreResourceAction(resource));
  }

  /**
   * Marks the given resource for deletion.
   *
   * @param resourceId
   */
  public deleteResource(resourceId: ResourceIdentifier) {
    this.store.dispatch(new ApiDeleteStoreResourceAction(resourceId));
  }

  /**
   * Applies all pending changes to the remote JSON API endpoint.
   */
  public commit() {
    let storeLocation = this.selectors.storeLocation;
    this.store.dispatch(new ApiCommitInitAction(storeLocation));
  }

}
