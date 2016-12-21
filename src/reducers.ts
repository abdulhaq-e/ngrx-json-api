import { Action, ActionReducer } from '@ngrx/store';

import {
  NgrxJsonApiActionTypes
} from './actions';
import {
    ResourceQuery,
    ResourceState,
    NgrxJsonApiStore
} from './interfaces';
import {
    deleteStoreResources,
    updateQueryParams,
    updateQueryResults,
    updateQueryErrors,
    updateStoreResources,
    updateOrInsertResource,
    updateResourceState,
    removeQuery,
    rollbackStoreResources,
    updateResourceErrors,
} from './utils';

export const initialNgrxJsonApiState = {
    isCreating: false,
    isReading: false,
    isUpdating: false,
    isDeleting: false,
    isCommitting : false,
    data: {},
    queries : {}
};

export const NgrxJsonApiStoreReducer: ActionReducer<any> =
    (state: NgrxJsonApiStore = initialNgrxJsonApiState, action: Action) => {
        let newState;

        // console.log("reduce", state, action);

        switch (action.type) {
            case NgrxJsonApiActionTypes.API_CREATE_INIT:
                return Object.assign({}, state, { 'isCreating': true });

            case NgrxJsonApiActionTypes.API_READ_INIT:
                newState = Object.assign({}, state, { 'isReading': true });
                let query = action.payload.query as ResourceQuery;
                // FIXME: handle queries with no queryId
                if(query.queryId){
                    newState = Object.assign({}, state, {
                        queries: updateQueryParams( state.queries, query),
                    });
                }
                return newState;

            case NgrxJsonApiActionTypes.REMOVE_QUERY:
                let queryId = action.payload as string;
                newState = Object.assign({}, state, {
                    queries: removeQuery( state.queries, queryId),
                });
                return newState;

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
                        queries: updateQueryResults(
                            state.queries, action.payload.query.queryId, action.payload.jsonApiData),
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
                newState = Object.assign({}, state,
                    { data: deleteStoreResources(state.data, action.payload.query) },
                    { 'isDeleting': false });
                return newState;

            case NgrxJsonApiActionTypes.API_CREATE_FAIL:
                newState = Object.assign({}, state, {
                  data: updateResourceErrors(state.data, action.payload.query, action.payload.jsonApiData),
                  'isCreating': false }
                );
                return newState;

            case NgrxJsonApiActionTypes.API_READ_FAIL:
                newState = Object.assign({}, state, {
                  queries: updateQueryErrors(state.queries, action.payload.query.queryId, action.payload.jsonApiData),
                  'isReading': false
                });
                return newState;

            case NgrxJsonApiActionTypes.API_UPDATE_FAIL:
                newState = Object.assign({}, state, {
                  data: updateResourceErrors(state.data, action.payload.query, action.payload.jsonApiData),
                  'isUpdating': false }
                );
                return newState;

            case NgrxJsonApiActionTypes.API_DELETE_FAIL:
                newState = Object.assign({}, state, {
                  data: updateResourceErrors(state.data, action.payload.query, action.payload.jsonApiData),
                  'isDeleting': false }
                );
                return newState;

            case NgrxJsonApiActionTypes.QUERY_STORE_SUCCESS:
              newState = Object.assign({}, state, {
                queries: updateQueryResults(
                    state.queries,
                    action.payload.query.queryId,
                    action.payload.jsonApiData),
              })
              return newState;

            case NgrxJsonApiActionTypes.PATCH_STORE_RESOURCE:
                newState = Object.assign({},
                    state, {
                        data: updateOrInsertResource(
                            state.data, action.payload, false, false)
                    }
                );
                return newState;
            case NgrxJsonApiActionTypes.POST_STORE_RESOURCE:
                newState = Object.assign({},
                    state, {
                        data: updateOrInsertResource(
                            state.data, action.payload, false, true)
                    }
                );
                return newState;
            case NgrxJsonApiActionTypes.DELETE_STORE_RESOURCE:
                newState = Object.assign({},
                    state, {
                        data: updateResourceState(
                            state.data, action.payload, ResourceState.DELETED)
                    }
                );
                return newState;
            case NgrxJsonApiActionTypes.API_COMMIT_INIT:
                newState = Object.assign({}, state, { 'isCommitting': true });
                return newState;
            case NgrxJsonApiActionTypes.API_COMMIT_SUCCESS:
            case NgrxJsonApiActionTypes.API_COMMIT_FAIL:
                // apply all the committed or failed changes
                let actions = action.payload as Array<Action>;
                newState = state;
                for(let commitAction of actions){
                    newState = NgrxJsonApiStoreReducer(newState, commitAction);
                }
                newState = Object.assign({}, newState, {isCommitting: false});
                return newState;
            case NgrxJsonApiActionTypes.API_ROLLBACK:
                newState = Object.assign({},
                    state, {
                        data: rollbackStoreResources(state.data)
                    }
                );
                return newState;
            default:
                return state;
        }
    };
