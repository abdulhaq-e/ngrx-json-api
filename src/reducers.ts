import { Action, ActionReducer } from '@ngrx/store';

import {
  NgrxJsonApiActionTypes
} from './actions';
import {
  Query,
  ResourceState,
  NgrxJsonApiStore
} from './interfaces';
import {
  deleteStoreResources,
  updateQueryParams,
  updateQueryResults,
  updateQueryErrors,
  updateStoreDataFromPayload,
  updateStoreDataFromResource,
  updateResourceState,
  removeQuery,
  rollbackStoreResources,
  updateResourceErrors,
} from './utils';

export const initialNgrxJsonApiState: NgrxJsonApiStore = {
  isCreating: 0,
  isReading: 0,
  isUpdating: 0,
  isDeleting: 0,
  isApplying: 0,
  data: {},
  queries: {}
};

export const NgrxJsonApiStoreReducer: ActionReducer<any> =
  (state: NgrxJsonApiStore = initialNgrxJsonApiState, action: Action) => {
    let newState;

    // console.log("reduce", state, action);

    switch (action.type) {
      case NgrxJsonApiActionTypes.API_CREATE_INIT: {
        return Object.assign({}, state, { isCreating: state['isCreating'] + 1 });
      }
      case NgrxJsonApiActionTypes.API_READ_INIT: {
        let query = action.payload.query as Query;
        newState = Object.assign({}, state, {
          queries: updateQueryParams(state.queries, query),
          isReading: state.isReading + 1
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.REMOVE_QUERY: {
        let queryId = action.payload as string;
        newState = Object.assign({}, state, {
          queries: removeQuery(state.queries, queryId),
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_UPDATE_INIT: {
        return Object.assign({}, state, { isUpdating: state['isUpdating'] + 1 });
      }
      case NgrxJsonApiActionTypes.API_DELETE_INIT: {
        return Object.assign({}, state, { isDeleting: state['isDeleting'] + 1 });
      }
      case NgrxJsonApiActionTypes.API_CREATE_SUCCESS: {
        newState = Object.assign({},
          state, {
            data: updateStoreDataFromPayload(
              state.data, action.payload.jsonApiData),
            isCreating: state.isCreating - 1
          }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.API_READ_SUCCESS: {
        newState = Object.assign({},
          state, {
            data: updateStoreDataFromPayload(
              state.data, action.payload.jsonApiData),
            queries: updateQueryResults(
              state.queries, action.payload.query.queryId, action.payload.jsonApiData),
            isReading: state.isReading - 1
          }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.API_UPDATE_SUCCESS: {
        newState = Object.assign(
          {},
          state, {
            data: updateStoreDataFromPayload(
              state.data, action.payload.jsonApiData),
            isUpdating: state.isUpdating - 1
          }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.API_DELETE_SUCCESS: {
        newState = Object.assign({}, state,
          {
            data: deleteStoreResources(state.data, action.payload.query),
            isDeleting: state.isDeleting - 1
          });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_CREATE_FAIL: {
        newState = Object.assign({}, state, {
          data: updateResourceErrors(state.data, action.payload.query, action.payload.jsonApiData),
          isCreating: state.isCreating - 1
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_READ_FAIL: {
        newState = Object.assign({}, state, {
          queries: updateQueryErrors(state.queries, action.payload.query.queryId, action.payload.jsonApiData),
          isReading: state.isReading - 1
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_UPDATE_FAIL: {
        newState = Object.assign({}, state, {
          data: updateResourceErrors(state.data, action.payload.query, action.payload.jsonApiData),
          isUpdating: state.isUpdating - 1
        }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.API_DELETE_FAIL: {
        newState = Object.assign({}, state, {
          data: updateResourceErrors(state.data, action.payload.query, action.payload.jsonApiData),
          isDeleting: state.isDeleting - 1
        }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.QUERY_STORE_INIT: {
        let query = action.payload as Query;
        newState = Object.assign({}, state, {
          queries: updateQueryParams(state.queries, query),
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.QUERY_STORE_SUCCESS: {
        newState = Object.assign({}, state, {
          queries: updateQueryResults(
            state.queries,
            action.payload.query.queryId,
            action.payload.jsonApiData),
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.PATCH_STORE_RESOURCE: {
        let updatedData = updateStoreDataFromResource(state.data, action.payload, false, false);
        if (updatedData !== state.data) {
          newState = Object.assign({},
            state, {
              data: updatedData
            }
          );
          return newState;
        } else {
          return state;
        }
      }
      case NgrxJsonApiActionTypes.POST_STORE_RESOURCE: {
        let updatedData = updateStoreDataFromResource(state.data, action.payload, false, true);
        if (updatedData !== state.data) {
          newState = Object.assign({},
            state, {
              data: updatedData
            }
          );
          return newState;
        } else {
          return state;
        }
      }
      case NgrxJsonApiActionTypes.DELETE_STORE_RESOURCE: {
        newState = Object.assign({},
          state, {
            data: updateResourceState(
              state.data, action.payload, ResourceState.DELETED)
          }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.API_APPLY_INIT: {
        newState = Object.assign({}, state, { isApplying: state.isApplying + 1 });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_APPLY_SUCCESS:
      case NgrxJsonApiActionTypes.API_APPLY_FAIL: {
        // apply all the committed or failed changes
        let actions = action.payload as Array<Action>;
        newState = state;
        for (let commitAction of actions) {
          newState = NgrxJsonApiStoreReducer(newState, commitAction);
        }
        newState = Object.assign({}, newState, { isApplying: state['isApplying'] - 1 });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_ROLLBACK: {
        newState = Object.assign({},
          state, {
            data: rollbackStoreResources(state.data)
          }
        );
        return newState;
      }
      default:
        return state;
    }
  };
