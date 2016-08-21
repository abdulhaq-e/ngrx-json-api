import { Injectable, OnDestroy } from '@angular/core';

import { Effect, Actions } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';

import { JsonApiActions } from './actions';
import { JsonApi } from './api';
import { JsonApiPayload } from './interfaces';
import { toPayload } from './utils';

@Injectable()
export class JsonApiEffects implements OnDestroy {
  constructor(
    private actions$: Actions,
    private jsonApiActions: JsonApiActions,
    private jsonApi: JsonApi
  ) { }

  @Effect() createEntity$ = this.actions$
    .ofType(JsonApiActions.API_CREATE_INIT)
    .map<JsonApiPayload>(toPayload)
    .mergeMap((payload: JsonApiPayload) => {
      return this.jsonApi.create(payload.options.resourceType, payload.data)
        .mapTo(this.jsonApiActions.apiCreateSuccess(payload))
        .catch(() => Observable.of(
          this.jsonApiActions.apiCreateFail(payload)
        ))
    });

  @Effect() updateEntity$ = this.actions$
    .ofType(JsonApiActions.API_UPDATE_INIT)
    .map<JsonApiPayload>(toPayload)
    .mergeMap((payload: JsonApiPayload) => {
      return this.jsonApi.update(payload.options.resourceType, payload.data)
        .mapTo(this.jsonApiActions.apiUpdateSuccess(payload))
        .catch(() => Observable.of(
          this.jsonApiActions.apiUpdateFail(payload)
        ));
    });

  @Effect() readEntity$ = this.actions$
    .ofType(JsonApiActions.API_READ_INIT)
    .map<JsonApiPayload>(toPayload)
    .mergeMap((payload: JsonApiPayload) => {
      return this.jsonApi.find(payload.options)
        .map(res => ({ data: res.json(), options: payload.options }))
        .map(data => this.jsonApiActions.apiReadSuccess(data))
        .catch(() => Observable.of(
          this.jsonApiActions.apiReadFail(payload)
        ));
    });

    @Effect() deleteEntity$ = this.actions$
      .ofType(JsonApiActions.API_DELETE_INIT)
      .map<JsonApiPayload>(toPayload)
      .mergeMap((payload: JsonApiPayload) => {
        return this.jsonApi.delete(payload.options)
          .mapTo(this.jsonApiActions.apiDeleteSuccess(payload))
          .catch(() => Observable.of(
            this.jsonApiActions.apiDeleteFail(payload)
          ));
      });

    ngOnDestroy() {

    }

}
