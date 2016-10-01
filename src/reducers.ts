import { Action, ActionReducer } from '@ngrx/store';

import {
  NgrxJsonApiActions,
  NgrxJsonApiActionTypes
} from './actions';
import {
    ResourceQuery,
    Document,
    Resource,
    NgrxJsonApiStore
} from './interfaces';

import {
    updateOrInsertResource,
    deleteFromState,
    updateStoreResources
} from './utils';

export const initialNgrxJsonApiState = {
    isCreating: false,
    isReading: false,
    isUpdating: false,
    isDeleting: false,
    data: {}
};

export const NgrxStoreReducer: ActionReducer<any> =
    (state: NgrxJsonApiStore = initialNgrxJsonApiState, action: Action) => {
        let newState;

        switch (action.type) {
            case NgrxJsonApiActionTypes.API_CREATE_INIT:
                return Object.assign({}, state, { 'isCreating': true });

            case NgrxJsonApiActionTypes.API_READ_INIT:
                return Object.assign({}, state, { 'isReading': true });

            case NgrxJsonApiActionTypes.API_UPDATE_INIT:
                return Object.assign({}, state, { 'isUpdating': true });

            case NgrxJsonApiActionTypes.API_DELETE_INIT:
                return Object.assign({}, state, { 'isDeleting': true });

            case NgrxJsonApiActionTypes.API_CREATE_SUCCESS:
                newState = Object.assign({},
                    state, {
                        data: updateStoreResources(
                          state.data, action.payload.jsonApiData),
                    },
                    { 'isCreating': false }
                );
                return newState;

            case NgrxJsonApiActionTypes.API_READ_SUCCESS:
                newState = Object.assign({},
                    state, {
                        data: updateStoreResources(
                          state.data, action.payload.jsonApiData),
                    },
                    { 'isReading': false }
                );
                return newState;

            case NgrxJsonApiActionTypes.API_UPDATE_SUCCESS:
                newState = Object.assign(
                    {},
                    state, {
                        data: updateStoreResources(
                          state.data, action.payload.jsonApiData),
                    },
                    { 'isUpdating': false }
                );
                return newState;

            case NgrxJsonApiActionTypes.API_DELETE_SUCCESS:
            case NgrxJsonApiActionTypes.DELETE_FROM_STATE:
                newState = Object.assign({}, state,
                    { data: deleteFromState(state.data, action.payload.query) },
                    { 'isDeleting': false });
                return newState;

            case NgrxJsonApiActionTypes.API_CREATE_FAIL:
                newState = Object.assign({}, state, { 'isCreating': false });
                return newState;

            case NgrxJsonApiActionTypes.API_READ_FAIL:
                newState = Object.assign({}, state, { 'isReading': false });
                return newState;

            case NgrxJsonApiActionTypes.API_UPDATE_FAIL:
                newState = Object.assign({}, state, { 'isUpdating': false });
                return newState;

            case NgrxJsonApiActionTypes.API_DELETE_FAIL:
                newState = Object.assign({}, state, { 'isDeleting': false });
                return newState;

            default:
                return state;
        }
    };
