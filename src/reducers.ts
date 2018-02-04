import { Action } from '@ngrx/store';

import {
  ApiApplyInitAction,
  ApiRollbackAction,
  NgrxJsonApiActionTypes,
} from './actions';
import {
  ModifyStoreResourceErrorsPayload,
  NgrxJsonApiState,
  NgrxJsonApiZone,
  Query,
  ResourceIdentifier,
  StoreResource,
} from './interfaces';
import {
  clearQueryResult,
  compactStore,
  deleteStoreResources,
  getPendingChanges,
  removeQuery,
  removeStoreResource,
  rollbackStoreResources,
  setIn,
  updateQueriesForDeletedResource,
  updateQueryErrors,
  updateQueryParams,
  updateQueryResults,
  updateResourceErrors,
  updateResourceErrorsForQuery,
  updateResourceState,
  updateStoreDataFromPayload,
  updateStoreDataFromResource,
} from './utils';

export const initialNgrxJsonApiZone: NgrxJsonApiZone = {
  isCreating: 0,
  isReading: 0,
  isUpdating: 0,
  isDeleting: 0,
  isApplying: 0,
  data: {},
  queries: {},
};

export const initialNgrxJsonApiState: NgrxJsonApiState = {
  zones: {},
};

export function NgrxJsonApiStoreReducer(
  state: NgrxJsonApiState = initialNgrxJsonApiState,
  action: any
): NgrxJsonApiState {
  const zoneId = action['zoneId'];
  if (!zoneId) {
    return state;
  }
  let zone = state.zones[zoneId];
  if (!zone) {
    zone = initialNgrxJsonApiZone;
  }
  let newZone = NgrxJsonApiZoneReducer(zone, action);
  if (zone != newZone) {
    return {
      ...state,
      zones: {
        ...state.zones,
        [zoneId]: newZone,
      },
    };
  } else {
    return state;
  }
}

export function NgrxJsonApiZoneReducer(
  zone: NgrxJsonApiZone,
  action: any
): NgrxJsonApiZone {
  let newZone;
  switch (action.type) {
    case NgrxJsonApiActionTypes.API_POST_INIT: {
      let updatedData = updateStoreDataFromResource(
        zone.data,
        action.payload,
        false,
        true
      );
      newZone = {
        ...zone,
        data: updatedData,
        isCreating: zone.isCreating + 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_GET_INIT: {
      let query = action.payload as Query;
      newZone = {
        ...zone,
        queries: updateQueryParams(zone.queries, query),
        isReading: zone.isReading + 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_PATCH_INIT: {
      let updatedData = updateStoreDataFromResource(
        zone.data,
        action.payload,
        false,
        false
      );
      newZone = {
        ...zone,
        data: updatedData,
        isUpdating: zone.isUpdating + 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_DELETE_INIT: {
      newZone = {
        ...zone,
        data: updateResourceState(zone.data, action.payload, 'DELETED'),
        isDeleting: zone.isDeleting + 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_POST_SUCCESS: {
      newZone = {
        ...zone,
        data: updateStoreDataFromPayload(zone.data, action.payload.jsonApiData),
        isCreating: zone.isCreating - 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_GET_SUCCESS: {
      newZone = {
        ...zone,
        data: updateStoreDataFromPayload(zone.data, action.payload.jsonApiData),
        queries: updateQueryResults(
          zone.queries,
          action.payload.query.queryId,
          action.payload.jsonApiData
        ),
        isReading: zone.isReading - 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_PATCH_SUCCESS: {
      newZone = {
        ...zone,
        data: updateStoreDataFromPayload(zone.data, action.payload.jsonApiData),
        isUpdating: zone.isUpdating - 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_DELETE_SUCCESS: {
      newZone = {
        ...zone,
        data: deleteStoreResources(zone.data, action.payload.query),
        queries: updateQueriesForDeletedResource(zone.queries, {
          id: action.payload.query.id,
          type: action.payload.query.type,
        }),
        isDeleting: zone.isDeleting - 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_QUERY_REFRESH: {
      // clear result ids and wait until new data is fetched (triggered by effect)
      newZone = {
        ...zone,
        queries: clearQueryResult(zone.queries, action.payload),
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_POST_FAIL: {
      newZone = {
        ...zone,
        data: updateResourceErrorsForQuery(
          zone.data,
          action.payload.query,
          action.payload.jsonApiData
        ),
        isCreating: zone.isCreating - 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_GET_FAIL: {
      newZone = {
        ...zone,
        queries: updateQueryErrors(
          zone.queries,
          action.payload.query.queryId,
          action.payload.jsonApiData
        ),
        isReading: zone.isReading - 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_PATCH_FAIL: {
      newZone = {
        ...zone,
        data: updateResourceErrorsForQuery(
          zone.data,
          action.payload.query,
          action.payload.jsonApiData
        ),
        isUpdating: zone.isUpdating - 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_DELETE_FAIL: {
      newZone = {
        ...zone,
        data: updateResourceErrorsForQuery(
          zone.data,
          action.payload.query,
          action.payload.jsonApiData
        ),
        isDeleting: zone.isDeleting - 1,
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.REMOVE_QUERY: {
      let queryId = action.payload as string;
      newZone = { ...zone, queries: removeQuery(zone.queries, queryId) };
      return newZone;
    }
    case NgrxJsonApiActionTypes.LOCAL_QUERY_INIT: {
      let query = action.payload as Query;
      newZone = { ...zone, queries: updateQueryParams(zone.queries, query) };
      return newZone;
    }
    case NgrxJsonApiActionTypes.MODIFY_STORE_RESOURCE_ERRORS: {
      let payload = action.payload as ModifyStoreResourceErrorsPayload;
      newZone = {
        ...zone,
        data: updateResourceErrors(
          zone.data,
          payload.resourceId,
          payload.errors,
          payload.modificationType
        ),
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.LOCAL_QUERY_SUCCESS: {
      return setIn(
        zone,
        'queries',
        updateQueryResults(
          zone.queries,
          action.payload.query.queryId,
          action.payload.jsonApiData
        )
      );
    }
    case NgrxJsonApiActionTypes.PATCH_STORE_RESOURCE: {
      let updatedData = updateStoreDataFromResource(
        zone.data,
        action.payload,
        false,
        false
      );
      if (updatedData !== zone.data) {
        newZone = { ...zone, data: updatedData };
        return newZone;
      } else {
        return zone;
      }
    }
    case NgrxJsonApiActionTypes.POST_STORE_RESOURCE: {
      let updatedData = updateStoreDataFromResource(
        zone.data,
        action.payload,
        false,
        true
      );
      if (updatedData !== zone.data) {
        newZone = { ...zone, data: updatedData };
        return newZone;
      } else {
        return zone;
      }
    }
    case NgrxJsonApiActionTypes.NEW_STORE_RESOURCE: {
      let updatedData = updateStoreDataFromResource(
        zone.data,
        action.payload,
        false,
        true
      );
      updatedData = updateResourceState(updatedData, action.payload, 'NEW');
      if (updatedData !== zone.data) {
        newZone = { ...zone, data: updatedData };
        return newZone;
      } else {
        return zone;
      }
    }
    case NgrxJsonApiActionTypes.DELETE_STORE_RESOURCE: {
      let resourceId = action.payload as ResourceIdentifier;
      if (
        zone.data[resourceId.type] &&
        zone.data[resourceId.type][resourceId.id]
      ) {
        let resource = zone.data[resourceId.type][resourceId.id];

        if (resource.state === 'NEW' || resource.state === 'CREATED') {
          // not yet stored on server-side, just delete
          newZone = {
            ...zone,
            data: removeStoreResource(zone.data, resourceId),
          };
          return newZone;
        } else {
          // stored on server, mark for deletion
          newZone = {
            ...zone,
            data: updateResourceState(zone.data, action.payload, 'DELETED'),
          };
          return newZone;
        }
      }
      return zone;
    }
    case NgrxJsonApiActionTypes.API_APPLY_INIT: {
      let payload = (action as ApiApplyInitAction).payload;
      let pending: Array<StoreResource> = getPendingChanges(
        zone.data,
        payload.ids,
        payload.include
      );
      newZone = { ...zone, isApplying: zone.isApplying + 1 };
      for (let pendingChange of pending) {
        if (pendingChange.state === 'CREATED') {
          newZone.isCreating++;
        } else if (pendingChange.state === 'UPDATED') {
          newZone.isUpdating++;
        } else if (pendingChange.state === 'DELETED') {
          newZone.isDeleting++;
        } else {
          throw new Error('unknown state ' + pendingChange.state);
        }
      }
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_APPLY_SUCCESS:
    case NgrxJsonApiActionTypes.API_APPLY_FAIL: {
      // apply all the committed or failed changes
      let actions = action.payload as Array<Action>;
      newZone = zone;
      for (let commitAction of actions) {
        newZone = NgrxJsonApiZoneReducer(newZone, commitAction);
      }
      newZone = { ...newZone, isApplying: zone['isApplying'] - 1 };
      return newZone;
    }
    case NgrxJsonApiActionTypes.API_ROLLBACK: {
      let payload = (action as ApiRollbackAction).payload;
      newZone = {
        ...zone,
        data: rollbackStoreResources(zone.data, payload.ids, payload.include),
      };
      return newZone;
    }
    case NgrxJsonApiActionTypes.CLEAR_STORE: {
      return initialNgrxJsonApiZone;
    }
    case NgrxJsonApiActionTypes.COMPACT_STORE: {
      return compactStore(zone);
    }
    default:
      return zone;
  }
}

export const reducer = NgrxJsonApiStoreReducer;
