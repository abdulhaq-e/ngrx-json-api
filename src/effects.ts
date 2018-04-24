import { Injectable, OnDestroy } from '@angular/core';

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import * as _ from 'lodash';

import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import 'rxjs/add/operator/concatAll';
import {
  catchError,
  concatAll,
  combineLatest,
  debounceTime,
  filter,
  flatMap,
  map,
  mapTo,
  mergeMap,
  skip,
  switchMap,
  switchMapTo,
  tap,
  take,
  toArray,
  withLatestFrom,
  takeWhile,
  takeUntil,
} from 'rxjs/operators';
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
import {
  getNgrxJsonApiZone,
  selectNgrxJsonApiZone,
  selectStoreResource,
  selectStoreResourcesOfType,
} from './selectors';
import {
  NgrxJsonApiConfig,
  NgrxJsonApiStore,
  NgrxJsonApiStoreData,
  NgrxJsonApiStoreResources,
  OperationType,
  Payload,
  Query,
  Resource,
  ResourceError,
  StoreResource,
} from './interfaces';
import {
  generatePayload,
  getPendingChanges,
  sortPendingChanges,
  filterResources,
} from './utils';

@Injectable()
export class NgrxJsonApiEffects implements OnDestroy {
  @Effect()
  createResource$: Observable<Action> = this.actions$.pipe(
    ofType<ApiPostInitAction>(NgrxJsonApiActionTypes.API_POST_INIT),
    mergeMap((action: ApiPostInitAction) => {
      const payload = this.generatePayload(action.payload, 'POST');
      return this.jsonApi.create(payload.query, payload.jsonApiData).pipe(
        map(
          (response: HttpResponse<any>) =>
            new ApiPostSuccessAction(
              {
                jsonApiData: response.body,
                query: payload.query,
              },
              action.queryId,
              action.zoneId
            )
        ),
        catchError(error =>
          of(
            new ApiPostFailAction(
              this.toErrorPayload(payload.query, error),
              action.queryId,
              action.zoneId
            )
          )
        )
      );
    })
  );

  @Effect()
  updateResource$: Observable<Action> = this.actions$.pipe(
    ofType<ApiPatchInitAction>(NgrxJsonApiActionTypes.API_PATCH_INIT),
    mergeMap((action: ApiPatchInitAction) => {
      const payload = this.generatePayload(action.payload, 'PATCH');
      return this.jsonApi.update(payload.query, payload.jsonApiData).pipe(
        map(
          (response: HttpResponse<any>) =>
            new ApiPatchSuccessAction(
              {
                jsonApiData: response.body,
                query: payload.query,
              },
              action.zoneId
            )
        ),
        catchError(error =>
          of(
            new ApiPatchFailAction(
              this.toErrorPayload(payload.query, error),
              action.zoneId
            )
          )
        )
      );
    })
  );

  @Effect()
  readResource$: Observable<Action> = this.actions$.pipe(
    ofType<ApiGetInitAction>(NgrxJsonApiActionTypes.API_GET_INIT),
    mergeMap((action: ApiGetInitAction) => {
      const query = action.payload;
      return this.jsonApi.find(query).pipe(
        map((response: HttpResponse<any>) => response.body),
        map(
          data =>
            new ApiGetSuccessAction(
              {
                jsonApiData: data,
                query: query,
              },
              action.zoneId
            )
        ),
        catchError(error =>
          of(
            new ApiGetFailAction(
              this.toErrorPayload(query, error),
              action.zoneId
            )
          )
        )
      );
    })
  );

  private localQueryInitEventFor(query: Query) {
    return this.actions$.pipe(
      ofType<LocalQueryInitAction>(NgrxJsonApiActionTypes.LOCAL_QUERY_INIT),
      map(action => action as LocalQueryInitAction),
      filter(action => query.queryId == action.payload.queryId)
    );
  }

  private removeQueryEventFor(query: Query) {
    return this.actions$.pipe(
      ofType<LocalQueryInitAction>(NgrxJsonApiActionTypes.REMOVE_QUERY),
      map(action => action as LocalQueryInitAction),
      filter(action => query.queryId == action.payload)
    );
  }

  @Effect()
  queryStore$ = this.actions$.pipe(
    ofType<LocalQueryInitAction>(NgrxJsonApiActionTypes.LOCAL_QUERY_INIT),
    mergeMap((action: LocalQueryInitAction) => {
      const query = action.payload;
      return this.store
        .let(selectNgrxJsonApiZone(action.zoneId))
        .let(this.executeLocalQuery(query))
        .pipe(
          map(
            results =>
              new LocalQuerySuccessAction(
                {
                  jsonApiData: { data: results },
                  query: query,
                },
                action.zoneId
              )
          ),
          catchError(error =>
            of(
              new LocalQueryFailAction(
                this.toErrorPayload(query, error),
                action.zoneId
              )
            )
          ),
          takeUntil(this.localQueryInitEventFor(query)),
          takeUntil(this.removeQueryEventFor(query))
        );
    })
  );

  private executeLocalQuery(query: Query) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      let selected$: Observable<any>;
      if (!query.type) {
        return state$.map(() => Observable.throw('Unknown query'));
      } else if (query.type && query.id) {
        selected$ = state$.let(
          selectStoreResource({ type: query.type, id: query.id })
        );
      } else {
        selected$ = state$
          .let(selectStoreResourcesOfType(query.type))
          .pipe(
            combineLatest(
              state$.map(it => it.data),
              (
                resources: NgrxJsonApiStoreResources,
                storeData: NgrxJsonApiStoreData
              ) =>
                filterResources(
                  resources,
                  storeData,
                  query,
                  this.config.resourceDefinitions,
                  this.config.filteringConfig
                )
            )
          );
      }
      return selected$.distinctUntilChanged();
    };
  }

  @Effect()
  deleteResource$ = this.actions$.pipe(
    ofType<ApiDeleteInitAction>(NgrxJsonApiActionTypes.API_DELETE_INIT),
    mergeMap((action: ApiDeleteInitAction) => {
      const payload = this.generatePayload(action.payload, 'DELETE');
      return this.jsonApi.delete(payload.query).pipe(
        map((response: HttpResponse<any>) => response.body),
        map(
          data =>
            new ApiDeleteSuccessAction(
              {
                jsonApiData: data,
                query: payload.query,
              },
              action.zoneId
            )
        ),
        catchError(error =>
          of(
            new ApiDeleteFailAction(
              this.toErrorPayload(payload.query, error),
              action.zoneId
            )
          )
        )
      );
    })
  );

  @Effect()
  triggerReadOnQueryRefresh$ = this.actions$.pipe(
    ofType(NgrxJsonApiActionTypes.API_QUERY_REFRESH),
    withLatestFrom(this.store, (action: ApiQueryRefreshAction, store) => {
      let queryId = action.payload;
      let state = getNgrxJsonApiZone(store, action.zoneId);
      let query = state.queries[queryId].query;
      return new ApiGetInitAction(query, action.zoneId);
    })
  );

  @Effect()
  refreshQueriesOnDelete$: Observable<Action> = this.actions$.pipe(
    ofType(NgrxJsonApiActionTypes.API_DELETE_SUCCESS),
    withLatestFrom(this.store, (action: ApiDeleteSuccessAction, store) => {
      let id = { id: action.payload.query.id, type: action.payload.query.type };
      if (!id.id || !id.type) {
        throw new Error(
          'API_DELETE_SUCCESS did not carry resource id and type information'
        );
      }

      let state = getNgrxJsonApiZone(store, action.zoneId);
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
              actions.push(new ApiQueryRefreshAction(queryId, action.zoneId));
            }
          }
        }
      }
      return actions;
    }),
    flatMap(actions => of(...actions))
  );

  private handlePendingCreate(pendingChange: StoreResource, zoneId: string) {
    let payload: Payload = this.generatePayload(pendingChange, 'POST');
    return this.jsonApi.create(payload.query, payload.jsonApiData).pipe(
      map(
        response =>
          new ApiPostSuccessAction(
            {
              jsonApiData: response.body,
              query: payload.query,
            },
            null,
            zoneId
          )
      ),
      catchError(error =>
        of(
          new ApiPostFailAction(
            this.toErrorPayload(payload.query, error),
            null,
            zoneId
          )
        )
      )
    );
  }

  private handlePendingUpdate(pendingChange: StoreResource, zoneId: string) {
    let payload: Payload = this.generatePayload(pendingChange, 'PATCH');
    return this.jsonApi.update(payload.query, payload.jsonApiData).pipe(
      map(
        response =>
          new ApiPatchSuccessAction(
            {
              jsonApiData: response.body,
              query: payload.query,
            },
            zoneId
          )
      ),
      catchError(error =>
        of(
          new ApiPatchFailAction(
            this.toErrorPayload(payload.query, error),
            zoneId
          )
        )
      )
    );
  }

  private handlePendingDelete(pendingChange: StoreResource, zoneId: string) {
    let payload: Payload = this.generatePayload(pendingChange, 'DELETE');
    return this.jsonApi.delete(payload.query).pipe(
      map(
        response =>
          new ApiDeleteSuccessAction(
            {
              jsonApiData: response.body,
              query: payload.query,
            },
            zoneId
          )
      ),
      catchError(error =>
        of(
          new ApiDeleteFailAction(
            this.toErrorPayload(payload.query, error),
            zoneId
          )
        )
      )
    );
  }

  @Effect()
  applyResources$: Observable<Action> = this.actions$.pipe(
    ofType(NgrxJsonApiActionTypes.API_APPLY_INIT),
    filter(() => this.jsonApi.config.applyEnabled !== false),
    withLatestFrom(
      this.store,
      (action: ApiApplyInitAction, storeState: any) => {
        const ngrxstore = getNgrxJsonApiZone(storeState, action.zoneId);
        const payload = (action as ApiApplyInitAction).payload;
        const pending: Array<StoreResource> = getPendingChanges(
          ngrxstore.data,
          payload.ids,
          payload.include
        );

        if (pending.length === 0) {
          return of(new ApiApplySuccessAction([], action.zoneId));
        }
        const sortedPending = sortPendingChanges(pending);
        let actions: Array<Observable<Action>> = [];
        for (let pendingChange of sortedPending) {
          if (pendingChange.state === 'CREATED') {
            actions.push(
              this.handlePendingCreate(pendingChange, action.zoneId)
            );
          } else if (pendingChange.state === 'UPDATED') {
            actions.push(
              this.handlePendingUpdate(pendingChange, action.zoneId)
            );
          } else if (pendingChange.state === 'DELETED') {
            actions.push(
              this.handlePendingDelete(pendingChange, action.zoneId)
            );
          } else {
            throw new Error('unknown state ' + pendingChange.state);
          }
        }
        return of(...actions)
          .concatAll()
          .pipe(
            toArray(),
            map(actions => this.toApplyAction(actions, action.zoneId))
          );
      }
    ),
    flatMap(actions => actions)
  );

  private config: NgrxJsonApiConfig;

  constructor(
    private actions$: Actions,
    private jsonApi: NgrxJsonApi,
    private store: Store<any>
  ) {
    this.config = this.jsonApi.config;
  }

  ngOnDestroy() {}

  private toApplyAction(actions: Array<Action>, zoneId: string): any {
    for (let action of actions) {
      if (
        action.type === NgrxJsonApiActionTypes.API_POST_FAIL ||
        action.type === NgrxJsonApiActionTypes.API_PATCH_FAIL ||
        action.type === NgrxJsonApiActionTypes.API_DELETE_FAIL
      ) {
        return new ApiApplyFailAction(actions, zoneId);
      }
    }
    return new ApiApplySuccessAction(actions, zoneId);
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
