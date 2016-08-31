import { Injectable, OnDestroy } from '@angular/core';

import { Effect, Actions } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/mapTo';

import { JsonApiActions } from './actions';
import { JsonApi } from './api';
import { Payload } from './interfaces';
import { toPayload } from './utils';

@Injectable()
export class JsonApiEffects implements OnDestroy {
  constructor(
    private actions$: Actions,
    private jsonApi: JsonApi
  ) { }

  @Effect() createEntity$ = this.actions$
    .ofType(JsonApiActions.API_CREATE_INIT)
    .map<Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.create({type: payload.data})
        .mapTo(JsonApiActions.apiCreateSuccess(payload))
        .catch(() => Observable.of(
          JsonApiActions.apiCreateFail(payload)
        ))
    });

  @Effect() updateEntity$ = this.actions$
    .ofType(JsonApiActions.API_UPDATE_INIT)
    .map<Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.update(payload.data)
        .mapTo(JsonApiActions.apiUpdateSuccess(payload))
        .catch(() => Observable.of(
          JsonApiActions.apiUpdateFail(payload)
        ));
    });

  @Effect() readEntity$ = this.actions$
    .ofType(JsonApiActions.API_READ_INIT)
    .map<Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.find(payload.query)
        .map(res => ({ data: res.json() }))
        .map(data => JsonApiActions.apiReadSuccess(data))
        .catch(() => Observable.of(
          JsonApiActions.apiReadFail(payload)
        ));
    });

    @Effect() deleteEntity$ = this.actions$
      .ofType(JsonApiActions.API_DELETE_INIT)
      .map<Payload>(toPayload)
      .mergeMap((payload: Payload) => {
        return this.jsonApi.delete(payload.query)
          .mapTo(JsonApiActions.apiDeleteSuccess(payload))
          .catch(() => Observable.of(
            JsonApiActions.apiDeleteFail(payload)
          ));
      });

    ngOnDestroy() {

    }

}
