import { Action, ActionReducer } from '@ngrx/store';

import { JsonApiActions } from './actions';
import {
    Query,
    Document,
    Resource,
    NgrxJsonApiStore
} from './interfaces';

import {
    updateOrInsertResource,
    deleteFromState,
    updateStoreResources
} from './utils';

export const NgrxStoreReducer: ActionReducer<any> =
    (state: NgrxJsonApiStore, action: Action) => {
        let newState;

        switch (action.type) {
            case JsonApiActions.API_CREATE_INIT:
                return Object.assign({}, state, { 'isCreating': true });

            case JsonApiActions.API_READ_INIT:
                return Object.assign({}, state, { 'isReading': true });

            case JsonApiActions.API_UPDATE_INIT:
                return Object.assign({}, state, { 'isUpdating': true });

            case JsonApiActions.API_DELETE_INIT:
            case JsonApiActions.DELETE_FROM_STATE:
                return Object.assign({}, state, { 'isDeleting': true });

            case JsonApiActions.API_CREATE_SUCCESS:
                newState = Object.assign({},
                    state, {
                        data: updateStoreResources(state.data, action.payload.data),
                    },
                    { 'isCreating': false }
                );
                return newState;

            case JsonApiActions.API_READ_SUCCESS:
                newState = Object.assign({},
                    state, {
                        data: updateStoreResources(state.data, action.payload.data),
                    },
                    { 'isReading': false }
                );
                return newState;

            case JsonApiActions.API_UPDATE_SUCCESS:
                newState = Object.assign(
                    {},
                    state, {
                        data: updateStoreResources(state.data, action.payload.data),
                    },
                    { 'isUpdating': false }
                );
                return newState;

            case JsonApiActions.API_DELETE_SUCCESS:
            case JsonApiActions.DELETE_FROM_STATE:
                newState = Object.assign({}, state,
                    { data: deleteFromState(state.data, action.payload.query) },
                    { 'isDeleting': false });
                return newState;

            case JsonApiActions.API_CREATE_FAIL:
                newState = Object.assign({}, state, { 'isCreating': false });
                return newState;

            case JsonApiActions.API_READ_FAIL:
                newState = Object.assign({}, state, { 'isReading': false });
                return newState;

            case JsonApiActions.API_UPDATE_FAIL:
                newState = Object.assign({}, state, { 'isUpdating': false });
                return newState;

            case JsonApiActions.API_DELETE_FAIL:
                newState = Object.assign({}, state, { 'isDeleting': false });
                return newState;

            default:
                return state;
        }
    };
