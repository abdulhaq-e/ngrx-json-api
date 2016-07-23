import { Action, ActionReducer } from '@ngrx/store';

import { JsonApiActions } from './actions';
import { JsonApiQuery,
  JsonApiDocument,
  JsonApiResource,
  JsonApiStore
} from './interfaces';
import { getResourcePath, updateOrInsertResource } from './utils';


export interface JsonApiPayload {
  data: {[key: string]: any};
  options?: JsonApiQuery;
}

export const updateJsonApiStoreReducer = (state: JsonApiStore,
    payload: JsonApiDocument): JsonApiStore => {

    let data = <Array<JsonApiResource> | JsonApiResource>_.get(payload, 'data');

    if (_.isUndefined(data)) {
        return state;
    }

    data = _.isArray(data) ? data : [data]

    let included = <Array<JsonApiResource>>_.get(payload, 'included');

    if (!_.isUndefined(included)) {
        data = [...data, ...included];
    }

    return <JsonApiStore>_.reduce(
        data, (result: JsonApiStore,
          resource: JsonApiResource) => {
            let resourcePath: string = getResourcePath(
              result.resourcesDefinition, resource.type);
            // Extremely ugly, needs refactoring!
            let newPartialState = { data: {} };
            newPartialState.data[resourcePath] = { data: {} } ;
            newPartialState.data[resourcePath].data = updateOrInsertResource(
              result.data[resourcePath].data, resource);
              // result.data[resourcePath].data = updateOrInsertResource(
                // result.data[resourcePath].data, resource);
            return <JsonApiStore>_.merge({}, result, newPartialState);
        }, state);
};


export const JsonApiReducer: ActionReducer<any> =
  (state: JsonApiStore, action: Action) => {
    let newState;

    switch (action.type) {
      case JsonApiActions.API_CREATE_INIT:
        return Object.assign({}, state, { 'isCreating': true });

      case JsonApiActions.API_READ_INIT:
        return Object.assign({}, state, { 'isReading': true });

      case JsonApiActions.API_UPDATE_INIT:
        return Object.assign({}, state, { 'isUpdating': true });

      case JsonApiActions.API_DELETE_INIT:
        return Object.assign({}, state, { 'isDeleting': true });

      case JsonApiActions.API_CREATE_SUCCESS:
        newState = Object.assign({},
          state,
          updateJsonApiStoreReducer(state, action.payload.data),
          { 'isCreating': false }
        );
        return newState;

      case JsonApiActions.API_READ_SUCCESS:
        newState = Object.assign({},
          state,
          updateJsonApiStoreReducer(state, action.payload.data),
          { 'isReading': false }
        );
        return newState;

      case JsonApiActions.API_UPDATE_SUCCESS:
        newState = Object.assign(
          {},
          state,
          updateJsonApiStoreReducer(state, action.payload.data),
          { 'isUpdating': false }
        );
        return newState;

      case JsonApiActions.API_DELETE_SUCCESS:
        newState = Object.assign({}, state, { 'isDeleting': false });
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
