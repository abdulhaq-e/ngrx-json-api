import { Injectable, OnDestroy } from '@angular/core';

import { Effect, Actions } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/mapTo';

import {
    NgrxJsonApiActionTypes,
    ApiCreateInitAction,
    ApiCreateSuccessAction,
    ApiCreateFailAction,
    ApiUpdateInitAction,
    ApiUpdateSuccessAction,
    ApiUpdateFailAction,
    ApiReadInitAction,
    ApiReadSuccessAction,
    ApiReadFailAction,
    ApiDeleteInitAction,
    ApiDeleteSuccessAction,
    ApiDeleteFailAction,
    DeleteFromStateAction
} from './actions';
import { NgrxJsonApi } from './api';
import { Payload } from './interfaces';
import { toPayload } from './utils';

@Injectable()
export class NgrxJsonApiEffects implements OnDestroy {
    constructor(
        private actions$: Actions,
        private jsonApi: NgrxJsonApi
    ) { }

    @Effect() createResource$ = this.actions$
        .ofType(NgrxJsonApiActionTypes.API_CREATE_INIT)
        .map<Payload>(toPayload)
        .mergeMap((payload: Payload) => {
            return this.jsonApi.create({ type: payload.jsonApiData })
                .mapTo(ApiCreateSuccessAction(payload))
                .catch(() => Observable.of(
                    new ApiCreateFailAction(payload)
                ))
        });

    @Effect() updateResource$ = this.actions$
        .ofType(NgrxJsonApiActionTypes.API_UPDATE_INIT)
        .map<Payload>(toPayload)
        .mergeMap((payload: Payload) => {
            return this.jsonApi.update(payload.jsonApiData)
                .mapTo(new ApiUpdateSuccessAction(payload))
                .catch(() => Observable.of(new ApiUpdateFailAction(payload)));
        });

    @Effect() readResource$ = this.actions$
        .ofType(NgrxJsonApiActionTypes.API_READ_INIT)
        .map<Payload>(toPayload)
        .mergeMap((payload: Payload) => {
            return this.jsonApi.find(payload.query)
                .map(res => ({ data: res.json() }))
                .map(data => new ApiReadSuccessAction(data))
                .catch(() => Observable.of(new ApiReadFailAction(payload)));
        });

    @Effect() deleteResource$ = this.actions$
        .ofType(NgrxJsonApiActionTypes.API_DELETE_INIT)
        .map<Payload>(toPayload)
        .mergeMap((payload: Payload) => {
            return this.jsonApi.delete(payload.query)
                .mapTo(new ApiDeleteSuccessAction(payload))
                .catch(() => Observable.of(new ApiDeleteFailAction(payload)));
        });

    ngOnDestroy() {

    }

}
