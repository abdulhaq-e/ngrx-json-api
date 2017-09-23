import { Injectable, OnDestroy } from '@angular/core';

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import * as _ from 'lodash';

import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

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
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/takeUntil';

import {
  ApiApplyFailAction,
  ApiApplyInitAction,
  ApiApplySuccessAction,
  ApiDeleteFailAction,
  ApiDeleteInitAction,
  ApiDeleteSuccessAction,
  ApiGetFailAction,
  ApiGetInitAction,
  ApiGetSuccessAction,
  ApiPatchFailAction,
  ApiPatchInitAction,
  ApiPatchSuccessAction,
  ApiPostFailAction,
  ApiPostInitAction,
  ApiPostSuccessAction,
  ApiQueryRefreshAction,
  LocalQueryFailAction,
  LocalQueryInitAction,
  LocalQuerySuccessAction,
  NgrxJsonApiActionTypes,
} from './actions';
import { NgrxJsonApi } from './api';
import {getNgrxJsonApiStore, NgrxJsonApiSelectors} from './selectors';
import {
  NgrxJsonApiStore,
  OperationType,
  Payload,
  Query,
  Resource,
  ResourceError,
  ResourceIdentifier,
  StoreResource,
} from './interfaces';
import {
  generatePayload,
  getPendingChanges,
  sortPendingChanges,
} from './utils';

@Injectable()
export class NgrxJsonApiEffects implements OnDestroy {
  @Effect()
  createResource$: Observable<Action> = this.actions$
    .ofType<ApiPostInitAction>(NgrxJsonApiActionTypes.API_POST_INIT)
    .map(it => this.generatePayload(it.payload, 'POST'))
    .mergeMap((payload: Payload) => {
      return this.jsonApi
        .create(payload.query, payload.jsonApiData)
        .map(
          (response: HttpResponse<any>) =>
            new ApiPostSuccessAction({
              jsonApiData: response.body,
              query: payload.query,
            })
        )
        .catch(error =>
          Observable.of(
            new ApiPostFailAction(this.toErrorPayload(payload.query, error))
          )
        );
    });

  @Effect()
  updateResource$ = this.actions$
    .ofType<ApiPatchInitAction>(NgrxJsonApiActionTypes.API_PATCH_INIT)
    .map(it => this.generatePayload(it.payload, 'PATCH'))
    .mergeMap((payload: Payload) => {
      return this.jsonApi
        .update(payload.query, payload.jsonApiData)
        .map(
          (response: HttpResponse<any>) =>
            new ApiPatchSuccessAction({
              jsonApiData: response.body,
              query: payload.query,
            })
        )
        .catch(error =>
          Observable.of(
            new ApiPatchFailAction(this.toErrorPayload(payload.query, error))
          )
        );
    });

  @Effect()
  readResource$ = this.actions$
    .ofType<ApiGetInitAction>(NgrxJsonApiActionTypes.API_GET_INIT)
    .map(it => it.payload)
    .mergeMap((query: Query) => {
      return this.jsonApi
        .find(query)
        .map((response: HttpResponse<any>) => response.body)
        .map(
          data =>
            new ApiGetSuccessAction({
              jsonApiData: data,
              query: query,
            })
        )
        .catch(error =>
          Observable.of(new ApiGetFailAction(this.toErrorPayload(query, error)))
        );
    });

  private localQueryInitEventFor(query: Query) {
    return this.actions$
      .ofType<LocalQueryInitAction>(NgrxJsonApiActionTypes.LOCAL_QUERY_INIT)
      .map(action => action as LocalQueryInitAction)
      .filter(action => query.queryId == action.payload.queryId);
  }

  private removeQueryEventFor(query: Query) {
    return this.actions$
      .ofType<LocalQueryInitAction>(NgrxJsonApiActionTypes.REMOVE_QUERY)
      .map(action => action as LocalQueryInitAction)
      .filter(action => query.queryId == action.payload);
  }

  @Effect()
  queryStore$ = this.actions$
    .ofType<LocalQueryInitAction>(NgrxJsonApiActionTypes.LOCAL_QUERY_INIT)
    .map(it => it.payload)
    .mergeMap((query: Query) => {
      return this.store
        .let(this.selectors.getNgrxJsonApiStore$())
        .let(this.selectors.queryStore$(query))
        .map(
          results =>
            new LocalQuerySuccessAction({
              jsonApiData: { data: results },
              query: query,
            })
        )
        .catch(error =>
          Observable.of(
            new LocalQueryFailAction(this.toErrorPayload(query, error))
          )
        )
        .takeUntil(this.localQueryInitEventFor(query))
        .takeUntil(this.removeQueryEventFor(query));
    });

  @Effect()
  deleteResource$ = this.actions$
    .ofType<ApiDeleteInitAction>(NgrxJsonApiActionTypes.API_DELETE_INIT)
    .map(it => it.payload)
    .map<ResourceIdentifier, Payload>(it => this.generatePayload(it, 'DELETE'))
    .mergeMap((payload: Payload) => {
      return this.jsonApi
        .delete(payload.query)
        .map((response: HttpResponse<any>) => response.body)
        .map(
          data =>
            new ApiDeleteSuccessAction({
              jsonApiData: data,
              query: payload.query,
            })
        )
        .catch(error =>
          Observable.of(
            new ApiDeleteFailAction(this.toErrorPayload(payload.query, error))
          )
        );
    });

  @Effect()
  triggerReadOnQueryRefresh$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_QUERY_REFRESH)
    .withLatestFrom(this.store, (action: any, store) => {
      let queryId = action.payload;
      let state = store['NgrxJsonApi']['api'] as NgrxJsonApiStore;
      let query = state.queries[queryId].query;
      return new ApiGetInitAction(query);
    });

  @Effect()
  refreshQueriesOnDelete$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_DELETE_SUCCESS)
    .withLatestFrom(this.store, (action: any, store) => {
      let id = { id: action.payload.query.id, type: action.payload.query.type };
      if (!id.id || !id.type) {
        throw new Error(
          'API_DELETE_SUCCESS did not carry resource id and type information'
        );
      }

      let state = store['NgrxJsonApi']['api'] as NgrxJsonApiStore;

      let actions = [];
      for (let queryId in state.queries) {
        if (state.queries.hasOwnProperty(queryId)) {
          let query = state.queries[queryId];
          if (query.resultIds) {
            let needsRefresh =
              _.findIndex(query.resultIds, function(o) {
                return _.isEqual(id, o);
              }) !== -1;

            let sameIdRequested =
              query.query.id === id.id && query.query.type === id.type;
            if (sameIdRequested && (needsRefresh || _.isEmpty(query.errors))) {
              throw new Error(
                'store is in invalid state, queries for deleted' +
                  ' resource should have been emptied and marked with 404 error'
              );
            }

            if (needsRefresh) {
              actions.push(new ApiQueryRefreshAction(queryId));
            }
          }
        }
      }
      return actions;
    })
    .flatMap(actions => Observable.of(...actions));

  @Effect()
  applyResources$ = this.actions$
    .ofType(NgrxJsonApiActionTypes.API_APPLY_INIT)
    .filter(() => this.jsonApi.config.applyEnabled !== false)
    .withLatestFrom(
      this.store.let(getNgrxJsonApiStore),
      (action, ngrxstore: NgrxJsonApiStore) => {
        let payload = (action as ApiApplyInitAction).payload;
        const pending: Array<StoreResource> = getPendingChanges(
          ngrxstore.data,
          payload.ids,
          payload.include
        );
        return pending;
      }
    )
    .flatMap(pending => {
      if (pending.length === 0) {
        return Observable.of(new ApiApplySuccessAction([]));
      }
      pending = sortPendingChanges(pending);

      let actions: Array<Observable<Action>> = [];
      for (let pendingChange of pending) {
        if (pendingChange.state === 'CREATED') {
          let payload: Payload = this.generatePayload(pendingChange, 'POST');
          actions.push(
            this.jsonApi
              .create(payload.query, payload.jsonApiData)
              .map(
                response =>
                  new ApiPostSuccessAction({
                    jsonApiData: response.body,
                    query: payload.query,
                  })
              )
              .catch(error =>
                Observable.of(
                  new ApiPostFailAction(
                    this.toErrorPayload(payload.query, error)
                  )
                )
              )
          );
        } else if (pendingChange.state === 'UPDATED') {
          // prepare payload, omit links and meta information
          let payload: Payload = this.generatePayload(pendingChange, 'PATCH');
          actions.push(
            this.jsonApi
              .update(payload.query, payload.jsonApiData)
              .map(
                response =>
                  new ApiPatchSuccessAction({
                    jsonApiData: response.body,
                    query: payload.query,
                  })
              )
              .catch(error =>
                Observable.of(
                  new ApiPatchFailAction(
                    this.toErrorPayload(payload.query, error)
                  )
                )
              )
          );
        } else if (pendingChange.state === 'DELETED') {
          let payload: Payload = this.generatePayload(pendingChange, 'DELETE');
          actions.push(
            this.jsonApi
              .delete(payload.query)
              .map(
                response =>
                  new ApiDeleteSuccessAction({
                    jsonApiData: response.body,
                    query: payload.query,
                  })
              )
              .catch(error =>
                Observable.of(
                  new ApiDeleteFailAction(
                    this.toErrorPayload(payload.query, error)
                  )
                )
              )
          );
        } else {
          throw new Error('unknown state ' + pendingChange.state);
        }
      }

      return Observable.of(...actions)
        .concatAll()
        .toArray()
        .map(actions => this.toApplyAction(actions));
    });

  constructor(
    private actions$: Actions,
    private jsonApi: NgrxJsonApi,
    private store: Store<any>,
    private selectors: NgrxJsonApiSelectors
  ) {}

  ngOnDestroy() {}

  private toApplyAction(actions: Array<Action>): any {
    for (let action of actions) {
      if (
        action.type === NgrxJsonApiActionTypes.API_POST_FAIL ||
        action.type === NgrxJsonApiActionTypes.API_PATCH_FAIL ||
        action.type === NgrxJsonApiActionTypes.API_DELETE_FAIL
      ) {
        return new ApiApplyFailAction(actions);
      }
    }
    return new ApiApplySuccessAction(actions);
  }

  private toErrorPayload(
    query: Query,
    response: HttpErrorResponse | any
  ): Payload {
    let contentType: String = null;
    if (response && response.headers) {
      contentType = response.headers.get('Content-Type');
    }
    let document = null;
    if (
      contentType != null &&
      contentType.startsWith('application/vnd.api+json')
    ) {
      document = response;
    }
    if (
      document &&
      document.error &&
      document.error.errors &&
      document.error.errors.length > 0
    ) {
      return {
        query: query,
        jsonApiData: document.error,
      };
    } else {
      // transform http to json api error
      let errors: Array<ResourceError> = [];
      let error: ResourceError = {
        status: String(response.status),
        code: response.statusText,
      };

      errors.push(error);
      // got json api errors

      return {
        query: query,
        jsonApiData: {
          errors: errors,
        },
      };
    }
  }

  private generatePayload(
    resource: Resource,
    operation: OperationType
  ): Payload {
    return generatePayload(resource, operation);
  }
}
