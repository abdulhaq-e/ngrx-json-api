import { Action, ActionReducer } from '@ngrx/store';

import {
  NgrxJsonApiActionTypes
} from './actions';
import {
  Query,
  ResourceState,
  NgrxJsonApiStore, ModifyStoreResourceErrorsPayload
} from './interfaces';
import {
  deleteStoreResources,
  clearQueryResult,
  updateQueryParams,
  updateQueryResults,
  updateQueryErrors,
  updateStoreDataFromPayload,
  updateStoreDataFromResource,
  updateResourceState,
  removeQuery,
  rollbackStoreResources,
  updateResourceErrorsForQuery,
  updateQueriesForDeletedResource,
  compactStore,
  updateResourceErrors
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

export function NgrxJsonApiStoreReducer(state: NgrxJsonApiStore = initialNgrxJsonApiState,
  action: Action) {
    let newState;

    switch (action.type) {
      case NgrxJsonApiActionTypes.API_POST_INIT: {
        let updatedData = updateStoreDataFromResource(state.data, action.payload, false, true);
        if (updatedData !== state.data) {
          newState = Object.assign({},
            state, {
              data: updatedData,
              isCreating: state.isCreating + 1
            }
          );
          return newState;
        } else {
          newState = Object.assign({},
            state, {
              isUpdating: state.isUpdating + 1
            }
          );
          return newState;
        }
      }
      case NgrxJsonApiActionTypes.API_GET_INIT: {
        let query = action.payload as Query;
        newState = Object.assign({}, state, {
          queries: updateQueryParams(state.queries, query),
          isReading: state.isReading + 1
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_PATCH_INIT: {
        let updatedData = updateStoreDataFromResource(state.data, action.payload, false, false);
        if (updatedData !== state.data) {
          newState = Object.assign({},
            state, {
              data: updatedData,
              isUpdating: state.isUpdating + 1
            }
          );
          return newState;
        } else {
          newState = Object.assign({},
            state, {
              isUpdating: state.isUpdating + 1
            }
          );
          return newState;
        }
      }
      case NgrxJsonApiActionTypes.API_DELETE_INIT: {
        newState = Object.assign({},
          state, {
            data: updateResourceState(
              state.data, action.payload, 'DELETED'),
            isDeleting: state.isDeleting + 1
          }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.API_POST_SUCCESS: {
        newState = Object.assign({},
          state, {
            data: updateStoreDataFromPayload(
              state.data, action.payload.jsonApiData),
            isCreating: state.isCreating - 1
          }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.API_GET_SUCCESS: {
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
      case NgrxJsonApiActionTypes.API_PATCH_SUCCESS: {
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
            queries: updateQueriesForDeletedResource(state.queries,
              {id: action.payload.query.id, type: action.payload.query.type}
            ),
            isDeleting: state.isDeleting - 1
          });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_QUERY_REFRESH: {
        // clear result ids and wait until new data is fetched (triggered by effect)
        newState = Object.assign({}, state, {
            queries: clearQueryResult(state.queries, action.payload)
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_POST_FAIL: {
        newState = Object.assign({}, state, {
          data: updateResourceErrorsForQuery(state.data,
            action.payload.query, action.payload.jsonApiData),
          isCreating: state.isCreating - 1
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_GET_FAIL: {
        newState = Object.assign({}, state, {
          queries: updateQueryErrors(state.queries, action.payload.query.queryId,
            action.payload.jsonApiData),
          isReading: state.isReading - 1
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.API_PATCH_FAIL: {
        newState = Object.assign({}, state, {
          data: updateResourceErrorsForQuery(state.data,
            action.payload.query, action.payload.jsonApiData),
          isUpdating: state.isUpdating - 1
        }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.API_DELETE_FAIL: {
        newState = Object.assign({}, state, {
          data: updateResourceErrorsForQuery(state.data,
            action.payload.query, action.payload.jsonApiData),
          isDeleting: state.isDeleting - 1
        }
        );
        return newState;
      }
      case NgrxJsonApiActionTypes.REMOVE_QUERY: {
        let queryId = action.payload as string;
        newState = Object.assign({}, state, {
          queries: removeQuery(state.queries, queryId),
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.LOCAL_QUERY_INIT: {
        let query = action.payload as Query;
        newState = Object.assign({}, state, {
          queries: updateQueryParams(state.queries, query),
        });
        return newState;
      }
      case NgrxJsonApiActionTypes.MODIFY_STORE_RESOURCE_ERRORS: {
        let payload = action.payload as ModifyStoreResourceErrorsPayload;
        newState = Object.assign({}, state, {
            data: updateResourceErrors(state.data, payload.resourceId,
              payload.errors, payload.modificationType),
          }
        );
        return newState;

      }
      case NgrxJsonApiActionTypes.LOCAL_QUERY_SUCCESS: {
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
              state.data, action.payload, 'DELETED')
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
      case NgrxJsonApiActionTypes.CLEAR_STORE: {
        return initialNgrxJsonApiState;
      }
      case NgrxJsonApiActionTypes.COMPACT_STORE: {
        return compactStore(state);
      }
      default:
        return state;
    }
  };
