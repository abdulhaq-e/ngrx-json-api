import { Injectable, OnDestroy } from '@angular/core';
import { Response } from '@angular/http';

import * as _ from 'lodash';

import { Action, Store } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/withLatestFrom';


import {
  ApiGetInitAction,
  ApiApplyFailAction,
  ApiApplySuccessAction,
  ApiPostFailAction,
  ApiPostSuccessAction,
  ApiDeleteFailAction,
  ApiDeleteSuccessAction,
  ApiGetFailAction,
  ApiGetSuccessAction,
  ApiPatchFailAction,
  ApiPatchSuccessAction,
  NgrxJsonApiActionTypes,
  LocalQuerySuccessAction,
  LocalQueryFailAction,
  ApiQueryRefreshAction
} from './actions';
import { NgrxJsonApi } from './api';
import { NgrxJsonApiSelectors } from './selectors';
import {
  NgrxJsonApiStore,
  OperationType,
  Payload,
  Resource,
  ResourceError,
  ResourceIdentifier,
  Query,
  ResourceState,
  StoreResource,
} from './interfaces';
import {
  generatePayload
} from './utils';

interface TopologySortContext {
  pendingResources: Array<StoreResource>;
  cursor: number;
  sorted: Array<StoreResource>;
  visited: Array<boolean>;
  dependencies: { [id: string]: Array<StoreResource> };
}

@Injectable()
export class NgrxJsonApiEffects implements OnDestroy {

  @Effect() createResource$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_POST_INIT)
    .map<Action, Resource>(toPayload)
    .map<Resource, Payload>(it => this.generatePayload(it, 'POST'))
    .switchMap((payload: Payload) => {
      return this.jsonApi.create(payload.query, payload.jsonApiData)
        .mapTo(new ApiPostSuccessAction(payload))
        .catch(error => Observable.of(
          new ApiPostFailAction(this.toErrorPayload(payload.query, error))));
    });

  @Effect() updateResource$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_PATCH_INIT)
    .map<Action, Resource>(toPayload)
    .map<Resource, Payload>(it => this.generatePayload(it, 'PATCH'))
    .switchMap((payload: Payload) => {
      return this.jsonApi.update(payload.query, payload.jsonApiData)
        .mapTo(new ApiPatchSuccessAction(payload))
        .catch(error => Observable.of(
          new ApiPatchFailAction(this.toErrorPayload(payload.query, error))));
    });

  @Effect() readResource$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_GET_INIT)
    .map<Action, Query>(toPayload)
    .switchMap((query: Query) => {
      return this.jsonApi.find(query)
        .map(res => res.json())
        .map(data => new ApiGetSuccessAction({
          jsonApiData: data,
          query: query
        }))
        .catch(error => Observable.of(
          new ApiGetFailAction(this.toErrorPayload(query, error))));
    });

  @Effect() queryStore$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.LOCAL_QUERY_INIT)
    .map<Action, Query>(toPayload)
    .switchMap((query: Query) => {
      return this.store
        .select(this.selectors.storeLocation)
        .let(this.selectors.queryStore$(query))
        .map(results => new LocalQuerySuccessAction({
          jsonApiData: {data: results},
          query: query
        }))
        .catch(error => Observable.of(
          new LocalQueryFailAction(this.toErrorPayload(query, error))));
    });

  @Effect() deleteResource$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_DELETE_INIT)
    .map<Action, ResourceIdentifier>(toPayload)
    .map<ResourceIdentifier, Payload>(it => this.generatePayload(it, 'DELETE'))
    .switchMap((payload: Payload) => {
      return this.jsonApi.delete(payload.query)
        .map(res => res.json())
        .map(data => new ApiDeleteSuccessAction({
          jsonApiData: data,
          query: payload.query
        }))
        .catch(error => Observable.of(
          new ApiDeleteFailAction(this.toErrorPayload(payload.query, error))));
    });

  @Effect() triggerReadOnQueryRefresh$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_QUERY_REFRESH)
    .withLatestFrom(this.store, (action, store) => {
      let queryId = action.payload;
      let state = store[this.selectors.storeLocation] as NgrxJsonApiStore;
      let query = state.queries[queryId].query;
      return new ApiGetInitAction(query);
    });

  @Effect() refreshQueriesOnDelete$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_DELETE_SUCCESS)
    .withLatestFrom(this.store, (action, store) => {
      let id = {id: action.payload.query.id, type: action.payload.query.type};
      if (!id.id || !id.type) {
        throw new Error('API_DELETE_SUCCESS did not carry resource id and type information');
      }

      let state = store[this.selectors.storeLocation] as NgrxJsonApiStore;

      let actions = [];
      for (let queryId in state.queries) {
        if (state.queries.hasOwnProperty(queryId)) {
          let query = state.queries[queryId];
          if (query.resultIds) {
            let needsRefresh = _.findIndex(query.resultIds,
                function (o) {
                  return _.isEqual(id, o);
                }
              ) !== -1;

            let sameIdRequested = query.query.id === id.id && query.query.type === id.type;
            if (sameIdRequested && (needsRefresh || _.isEmpty(query.errors))) {
              throw new Error('store is in invalid state, queries for deleted'
                + ' resource should have been emptied and marked with 404 error');
            }

            if (needsRefresh) {
              actions.push(new ApiQueryRefreshAction(queryId));
            }
          }
        }
      }
      return actions;
    })
    .flatMap(actions => Observable.of(...actions))
    ;


  @Effect() applyResources$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_APPLY_INIT)
    .mergeMap(() => this.store.select(this.selectors.storeLocation).take(1))
    .mergeMap((ngrxstore: NgrxJsonApiStore) => {
      // TODO add support for bulk updates as well (jsonpatch, etc.)
      // to get atomicity for multiple updates
      let pending: Array<StoreResource> = this.getPendingChanges(ngrxstore);
      if (pending.length > 0) {
        pending = this.sortPendingChanges(pending);

        let actions: Array<Observable<Action>> = [];
        for (let pendingChange of pending) {
          if (pendingChange.state === 'CREATED') {
            let payload: Payload = this.generatePayload(pendingChange, 'POST');
            actions.push(this.jsonApi.create(payload.query, payload.jsonApiData)
              .mapTo(new ApiPostSuccessAction(payload))
              .catch(error => Observable.of(
                new ApiPostFailAction(this.toErrorPayload(payload.query, error))))
            );
          } else if (pendingChange.state === 'UPDATED') {
            // prepare payload, omit links and meta information
            let payload: Payload = this.generatePayload(pendingChange, 'PATCH');
            actions.push(this.jsonApi.update(payload.query, payload.jsonApiData)
              .map(res => res.json())
              .map(data => new ApiPatchSuccessAction({
                jsonApiData: data,
                query: payload.query
              }))
              .catch(error => Observable.of(
                new ApiPatchFailAction(this.toErrorPayload(payload.query, error))))
            );
          } else if (pendingChange.state === 'DELETED') {
            let payload: Payload = this.generatePayload(pendingChange, 'DELETE');
            actions.push(this.jsonApi.delete(payload)
              .map(res => res.json())
              .map(data => new ApiDeleteSuccessAction({
                jsonApiData: data,
                query: payload.query
              }))
              .catch(error => Observable.of(
                new ApiDeleteFailAction(this.toErrorPayload(payload.query, error))))
            );
          } else {
            throw new Error('unknown state ' + pendingChange.state);
          }
        }

        return Observable.of(...actions)
          .concatAll()
          .toArray()
          .map(actions => this.toApplyAction(actions));
      } else {
        return Observable.of(new ApiApplySuccessAction([]));
      }
    });

  constructor(private actions$: Actions,
    private jsonApi: NgrxJsonApi,
    private store: Store<any>,
    private selectors: NgrxJsonApiSelectors<any>) {
  }

  ngOnDestroy() {

  }

  private toApplyAction(actions: Array<Action>): any {
    for (let action of actions) {
      if (action.type === NgrxJsonApiActionTypes.API_POST_FAIL
        || action.type === NgrxJsonApiActionTypes.API_PATCH_FAIL
        || action.type === NgrxJsonApiActionTypes.API_DELETE_FAIL) {
        return new ApiApplyFailAction(actions);
      }
    }
    return new ApiApplySuccessAction(actions);
  }

  private toErrorPayload(query: Query, response: Response): Payload {

    let contentType = null;
    if (response && response.headers) {
      contentType = response.headers.get('Content-Type');
    }
    let document = null;
    if (contentType === 'application/vnd.api+json') {
      document = response.json();
    }
    if (document && document.errors && document.errors.length > 0) {
      return {
        query: query,
        jsonApiData: document
      };
    } else {
      // transform http to json api error
      let errors: Array<ResourceError> = [];
      let error: ResourceError = {
        status: response.status.toString(),
        code: response.statusText
      };

      errors.push(error);
      // got json api errors

      return {
        query: query,
        jsonApiData: {
          errors: errors
        }
      };
    }
  }

  private toKey(id: ResourceIdentifier) {
    return id.id + '@' + id.type;
  }

  private sortPendingChanges(pendingResources: Array<StoreResource>): Array<StoreResource> {

    // allocate dependency
    let dependencies: any = {};
    let pendingMap: any = {};
    for (let pendingResource of pendingResources) {
      let resource = pendingResource;
      dependencies[this.toKey(resource)] = [];
      pendingMap[this.toKey(resource)] = pendingResource;
    }

    // extract dependencies
    for (let pendingResource of pendingResources) {
      let resource = pendingResource;
      if (resource.relationships) {
        let key = this.toKey(resource);
        Object.keys(resource.relationships).forEach(relationshipName => {
          let data = resource.relationships[relationshipName].data;
          if (data) {
            let dependencyIds: Array<ResourceIdentifier> = data instanceof Array ? data : [data];
            for (let dependencyId of dependencyIds) {
              let dependencyKey = this.toKey(dependencyId);
              if (pendingMap[dependencyKey]) {
                // we have a dependency between two unsaved objects
                dependencies.push[key].push(pendingMap[dependencyKey]);
              }
            }
          }
        });
      }
    }

    // order
    let context = {
      pendingResources: pendingResources,
      cursor: pendingResources.length,
      sorted: new Array(pendingResources.length),
      dependencies: dependencies,
      visited: []
    };

    let i = context.cursor;
    while (i--) {
      if (!context.visited[i]) {
        this.visit(pendingResources[i], i, [], context);
      }
    }

    return context.sorted;
  }


  private visit(pendingResource: StoreResource, i, predecessors, context: TopologySortContext) {
    let key = this.toKey(pendingResource);
    if (predecessors.indexOf(key) >= 0) {
      throw new Error('Cyclic dependency: ' + key + ' with ' + JSON.stringify(predecessors));
    }

    if (context.visited[i]) {
      return;
    }
    context.visited[i] = true;

    // outgoing edges
    let outgoing: Array<StoreResource> = context.dependencies[key];

    let preds = predecessors.concat(key);
    for (let child of outgoing) {
      this.visit(child, context.pendingResources.indexOf(child), preds, context);
    }
    ;

    context.sorted[--context.cursor] = pendingResource;
  }

  private generatePayload(resource: Resource, operation: OperationType): Payload {
    return generatePayload(resource, operation);
  }


  private getPendingChanges(state: NgrxJsonApiStore): Array<StoreResource> {
    let pending: Array<StoreResource> = [];
    Object.keys(state.data).forEach(type => {
      Object.keys(state.data[type]).forEach(id => {
        let storeResource = state.data[type][id];
        if (storeResource.state !== 'IN_SYNC') {
          pending.push(storeResource);
        }
      });
    });
    return pending;
  }

}
