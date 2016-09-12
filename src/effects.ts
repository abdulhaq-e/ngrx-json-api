import { Injectable, OnDestroy } from '@angular/core';

import { Effect, Actions } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/mapTo';

import { NgrxJsonApiActions } from './actions';
import { NgrxJsonApi } from './api';
import { Payload } from './interfaces';
import { toPayload } from './utils';

@Injectable()
export class JsonApiEffects implements OnDestroy {
  constructor(
    private actions$: Actions,
    private jsonApi: NgrxJsonApi
  ) { }

  @Effect() createResource$ = this.actions$
    .ofType(NgrxJsonApiActions.API_CREATE_INIT)
    .map<Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.create({type: payload.data})
        .mapTo(NgrxJsonApiActions.apiCreateSuccess(payload))
        .catch(() => Observable.of(
          NgrxJsonApiActions.apiCreateFail(payload)
        ))
    });

  @Effect() updateResource$ = this.actions$
    .ofType(NgrxJsonApiActions.API_UPDATE_INIT)
    .map<Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.update(payload.data)
        .mapTo(NgrxJsonApiActions.apiUpdateSuccess(payload))
        .catch(() => Observable.of(
          NgrxJsonApiActions.apiUpdateFail(payload)
        ));
    });

  @Effect() readResource$ = this.actions$
    .ofType(NgrxJsonApiActions.API_READ_INIT)
    .map<Payload>(toPayload)
    .mergeMap((payload: Payload) => {
      return this.jsonApi.find(payload.query)
        .map(res => ({ data: res.json() }))
        .map(data => NgrxJsonApiActions.apiReadSuccess(data))
        .catch(() => Observable.of(
          NgrxJsonApiActions.apiReadFail(payload)
        ));
    });

    @Effect() deleteResource$ = this.actions$
      .ofType(NgrxJsonApiActions.API_DELETE_INIT)
      .map<Payload>(toPayload)
      .mergeMap((payload: Payload) => {
        return this.jsonApi.delete(payload.query)
          .mapTo(NgrxJsonApiActions.apiDeleteSuccess(payload))
          .catch(() => Observable.of(
            NgrxJsonApiActions.apiDeleteFail(payload)
          ));
      });

    ngOnDestroy() {

    }

}
