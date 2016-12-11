import { Injectable, OnDestroy } from '@angular/core';
import { Response } from '@angular/http';

import { Action, Store } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/toarray';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/take';


import {
  NgrxJsonApiActionTypes,
  ApiCreateSuccessAction,
  ApiCreateFailAction,
  ApiUpdateSuccessAction,
  ApiUpdateFailAction,
  ApiReadSuccessAction,
  ApiReadFailAction,
  ApiDeleteSuccessAction,
  ApiDeleteFailAction,
  ApiCommitSuccessAction,
  ApiCommitFailAction,
} from './actions';
import { NgrxJsonApi } from './api';
import {Payload, ResourceError, ResourceQuery, NgrxJsonApiStore, StoreResource, ResourceState } from './interfaces';

@Injectable()
export class NgrxJsonApiEffects implements OnDestroy {
  constructor(
    private actions$: Actions,
    private jsonApi: NgrxJsonApi,
    private store: Store<any>,
  ) { }

  @Effect() createResource$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_CREATE_INIT)
    .map<Action, Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.create(payload)
        .mapTo(new ApiCreateSuccessAction(payload))
        .catch(() => Observable.of(
          new ApiCreateFailAction(payload)
        ));
    });

  @Effect() updateResource$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_UPDATE_INIT)
    .map<Action, Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.update(payload)
        .mapTo(new ApiUpdateSuccessAction(payload))
        .catch(() => Observable.of(new ApiUpdateFailAction(payload)));
    });

  @Effect() readResource$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_READ_INIT)
    .map<Action, Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.find(payload)
        .map(res => res.json())
        .map(data => new ApiReadSuccessAction({
          jsonApiData: data,
          query: payload.query
        }))
        .catch(() => Observable.of(new ApiReadFailAction(payload)));
    });

  @Effect() deleteResource$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_DELETE_INIT)
    .map<Action, Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.delete(payload)
        .mapTo(new ApiDeleteSuccessAction(payload))
        .catch(() => Observable.of(new ApiDeleteFailAction(payload)));
    });

  @Effect() commitResources$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_COMMIT_INIT)
    .map<Action, string>(toPayload)
    .mergeMap((storeLocation : string) => this.store.select(storeLocation).take(1))
    .mergeMap((store : NgrxJsonApiStore) => {
      // TODO add support for bulk updates as well (jsonpatch, etc.)
      // to get atomicity for multiple updates

      console.log("commit", store);

      let pending : Array<StoreResource> = this.getPendingChanges(store);
      console.log("pending", pending);

      if(pending.length > 0){
        pending = this.sortPendingChanges(pending);

        let actions : Array<Observable<Action>> = [];
        for(let pendingChange of pending){
          if(pendingChange.state == ResourceState.CREATED){
            let payload : Payload = {
              jsonApiData : {
                data : {
                  id :  pendingChange.resource.id,
                  type :  pendingChange.resource.type,
                  attributes :  pendingChange.resource.attributes,
                  relationships :  pendingChange.resource.relationships
                },
              },
              query : {
                queryType : 'create',
                type : pendingChange.resource.type
              }
            };
            actions.push(this.jsonApi.create(payload)
              .mapTo(new ApiCreateSuccessAction(payload))
              .catch(error => Observable.of(new ApiCreateFailAction(this.toErrorPayload(payload.query, error))))
            );
          }else if(pendingChange.state == ResourceState.UPDATED){
            // prepare payload, omit links and meta information
            let payload : Payload = {
              jsonApiData : {
                data : {
                  id :  pendingChange.resource.id,
                  type :  pendingChange.resource.type,
                  attributes :  pendingChange.resource.attributes,
                  relationships :  pendingChange.resource.relationships
                },
              },
              query : {
                queryType : 'update',
                type : pendingChange.resource.type,
                id : pendingChange.resource.id
              }
            };
            actions.push(this.jsonApi.update(payload)
              .map(res => res.json())
              .map(data => new ApiUpdateSuccessAction({
                jsonApiData: data,
                query: payload.query
              }))
              .catch(error => Observable.of(new ApiUpdateFailAction(this.toErrorPayload(payload.query, error))))
            );
          }else if(pendingChange.state == ResourceState.DELETED){
            let payload : Payload = {
              query : {
                queryType : 'deleteOne',
                type : pendingChange.resource.type,
                id : pendingChange.resource.id
              }
            };
            actions.push(this.jsonApi.delete(payload)
              .map(res => res.json())
              .map(data => new ApiDeleteSuccessAction({
                jsonApiData: data,
                query: payload.query
              }))
              .catch(error => Observable.of(new ApiDeleteFailAction(this.toErrorPayload(payload.query, error))))
            );
          }else{
            throw new Error("unknown state " + pendingChange.state);
          }
        }

        return actions[0];

        //return Observable.of(...actions).map(it => {console.log(it); return it;}).concatAll().toArray().map(actions => this.toCommitAction(actions));
      }else{
        return Observable.of(new ApiCommitSuccessAction([]));
      }
    });

  private toCommitAction(actions : Array<Action>){
    console.log("actions done", actions);
    for(let action of actions){
      if(action.type == NgrxJsonApiActionTypes.API_CREATE_FAIL
        || action.type == NgrxJsonApiActionTypes.API_CREATE_FAIL
        || action.type == NgrxJsonApiActionTypes.API_CREATE_FAIL){
        return new ApiCommitFailAction(actions);
      }
    }
    return new ApiCommitSuccessAction(actions);
  }

  private toErrorPayload(query : ResourceQuery, response : Response) : Payload{
    var document = response.json();
    if(document && document.errors && document.errors.length > 0){
      // got json api errors
      return {
        query : query,
        jsonApiData : document
      }
    }else{
      // transform http to json api error
      let errors : Array<ResourceError> = [];

      let error : ResourceError = {
        status : response.status.toString(),
        code : response.statusText
      };
      errors.push(error);

      return {
        query : query,
        jsonApiData : {
          errors : errors
        }
      };
    }
  }

  private sortPendingChanges(pending :  Array<StoreResource>) : Array<StoreResource> {
    return pending; // TODO we need sorting? by change order?
  }

  private getPendingChanges(state : NgrxJsonApiStore) : Array<StoreResource> {
    let pending : Array<StoreResource> = [];
    for(let type in state.data){
      console.log(type);
      for(let id in state.data[type]){
        console.log(id);
        let storeResource = state.data[type][id];
        if(storeResource.state != ResourceState.IN_SYNC){
           pending.push(storeResource);
        }
      }
    }
    return pending;
  }


  ngOnDestroy() {

  }

}
