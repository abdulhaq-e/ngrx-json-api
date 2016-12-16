import { Injectable, Pipe, PipeTransform } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Store } from '@ngrx/store';

import { NgrxJsonApiSelectors } from './selectors';
import {
  ApiCommitInitAction,
  ApiCreateInitAction,
  ApiReadInitAction,
  ApiUpdateInitAction,
  ApiDeleteInitAction,
  AddQueryAction,
  DeleteStoreResourceAction,
  PatchStoreResourceAction,
  PostStoreResourceAction,
  RemoveQueryAction,
} from './actions';
import {
  NgrxJsonApiStore,
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


@Injectable()
export class NgrxJsonApiService {

  private test: boolean = true;

  /**
   * Keeps current snapshot of the store to allow fast access to resources.
   */
  private storeSnapshot : NgrxJsonApiStore;

  constructor(
      private store: Store<any>,
      private selectors: NgrxJsonApiSelectors<any>,
      private apiUrl : string,
      private resourceDefinitions : Array<ResourceDefinition>,
  ) {

    this.store.select(selectors.storeLocation).subscribe(it => this.storeSnapshot = it as NgrxJsonApiStore);
  }

  public findOne(query: ResourceQuery, fromServer: boolean = true) : ResourceQueryHandle<Resource> {
    query.queryType = "getOne";
    this.findInternal(query, fromServer);

    return {
      results : this.selectResults(query.queryId).map(it => {
        if(it.length == 0){
          return null;
        }else if(it.length == 1){
          return it[0];
        }else{
          throw new Error("Unique result expected");
        }}
      ),
      unsubscribe : () => this.removeQuery(query.queryId)
    }
  }

  public findMany(query: ResourceQuery, fromServer: boolean = true) : ResourceQueryHandle<Array<Resource>> {
    query.queryType = "getMany";
    this.findInternal(query, fromServer);
    return {
      results : this.selectResults(query.queryId),
      unsubscribe : () => this.removeQuery(query.queryId)
    }
  }

  private removeQuery(queryId : string){
    this.store.dispatch(new RemoveQueryAction(queryId));
  }

  private findInternal(query: ResourceQuery, fromServer: boolean = true){
    if (fromServer) {
      let payload : Payload = {
        query: query
      };
      this.store.dispatch(new ApiReadInitAction(payload));
    } else {
      this.store.dispatch(new AddQueryAction(query));
    }

  }

  /**
   * Gets the current state of the given resources. Consider the use of selectResource(...) to get an observable of the resource.
   *
   * @param identifier
   */
  public getResourceSnapshot(identifier : ResourceIdentifier){
    let snapshot = this.storeSnapshot;
    if( snapshot.data[identifier.type] && snapshot.data[identifier.type][identifier.id]){
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
  public getPersistedResourceSnapshot(identifier : ResourceIdentifier){
    let snapshot = this.storeSnapshot;
    if( snapshot.data[identifier.type] && snapshot.data[identifier.type][identifier.id]){
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
  public selectResults(queryId: string) : Observable<Array<Resource>> {
    return this.selectors.getResults$(this.store, queryId);
  }

  /**
   * Selects the result identifiers of the given query.
   *
   * @param queryId
   * @returns {any}
   */
  public selectResultIdentifiers(queryId: string) : Observable<Array<ResourceIdentifier>> {
    return this.selectors.getResultIdentifiers$(this.store, queryId);
  }

  /**
   * @param identifier of the resource
   * @returns observable of the resource
   */
  public selectResource(identifier: ResourceIdentifier) : Observable<Resource> {
    return this.selectors.getResource$(this.store, identifier);
  }

  /**
   * @param identifier of the resource
   * @returns observable of the resource
   */
  public selectResourceStore(identifier: ResourceIdentifier) : Observable<ResourceStore> {
    return this.selectors.getResourceStore$(this.store, identifier);
  }


  /**
   * Updates the given resource in the store with the provided data.
   * Use commit() to send the changes to the remote JSON API endpoint.
   *
   * @param resource
   */
  public patchResource(resource: Resource) {
    this.store.dispatch(new PatchStoreResourceAction(resource));
  }

  /**
   * Adds the given resource to the store. Any already existing
   * resource with the same id gets replaced. Use commit() to send
   * the changes to the remote JSON API endpoint.
   *
   * @param resource
   */
  public postResource(resource: Resource) {
    this.store.dispatch(new PostStoreResourceAction(resource));
  }

  /**
   * Marks the given resource for deletion.
   *
   * @param resourceId
   */
  public deleteResource(resourceId: ResourceIdentifier) {
    this.store.dispatch(new DeleteStoreResourceAction(resourceId));
  }

  /**
   * Applies all pending changes to the remote JSON API endpoint.
   */
  public commit() {
    let storeLocation = this.selectors.storeLocation;
    this.store.dispatch(new ApiCommitInitAction(storeLocation));
  }
}



@Pipe({name: 'jaGetResource'})
export class GetResourcePipe implements PipeTransform {

  constructor(private service : NgrxJsonApiService){
  }

  transform(id: ResourceIdentifier): Resource {
    return this.service.getResourceSnapshot(id);
  }
}

@Pipe({name: 'jaSelectResource'})
export class SelectResourcePipe implements PipeTransform {

  constructor(private service : NgrxJsonApiService){
  }

  transform(id: ResourceIdentifier): Observable<Resource> {
    return this.service.selectResource(id);
  }
}


@Pipe({name: 'jaSelectResourceStore'})
export class SelectResourceStorePipe implements PipeTransform {

  constructor(private service : NgrxJsonApiService){
  }

  transform(id: ResourceIdentifier): Observable<ResourceStore> {
    return this.service.selectResourceStore(id);
  }
}
