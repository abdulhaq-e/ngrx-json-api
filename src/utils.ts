// import * as _.filter from 'lodash/filter';
// import * as _.includes from 'lodash/includes';
// import * as _.reduce from 'lodash/reduce';
// import * as _.get from 'lodash/get';
// import * as _.merge from 'lodash/merge';
// import * as _.isArray from 'lodash/isArray';
// import * as _.isUndefined from 'lodash/_.isUndefined';
// import * as _.find from 'lodash/find';

import * as _ from 'lodash';


import { Actions } from '@ngrx/effects';

import {
    Resource,
    NgrxJsonApiStore,
    ResourceDefinition,
    Document,
    RelationDefinition,
    Query
} from './interfaces';

export const initNgrxStore = (
    resourcesDefinition: Array<ResourceDefinition>): NgrxJsonApiStore => {

    return ({
        isCreating: false,
        isReading: false,
        isUpdating: false,
        isDeleting: false,
        resourcesDefinitions: resourcesDefinition,
        data: []
    })
};

// export const transformResource = (resource: Resource): Resource => {
//     let newResource: Resource = {
//         id: resource.id,
//         type: resource.type
//     };
//     if (typeof resource.attributes !== 'undefined') {
//         _forEach(resource.attributes, (value, key) => {
//             newResource[key] = value;
//         });
//     }
//     if (typeof resource.relationships !== 'undefined') {
//         _forEach(resource.attributes, (value, key) => {
//             newResource[key] = value;
//         });
//     }
//
//     return newResource;
// }

export const updateResourceObject = (original: Resource,
    source: Resource): Resource => {

    return _.merge({}, original, source);

};

export const insertResource = (state: Array<Resource>,
    resource: Resource): Array<Resource> => {

    return [...state, resource];

};

export const updateResource = (state: Array<Resource>, resource: Resource,
    foundResource: Resource): Array<Resource> => {

    return [..._.filter(state, (r) => !(r.type === resource.type && r.id === resource.id)),
        updateResourceObject(foundResource, resource)
    ];

};

export const updateOrInsertResource = (state: Array<Resource>,
    resource: Resource): Array<Resource> => {

    // Check if the resource already exists in the state
    let foundResource = _.find(state, { type: resource.type, id: resource.id });

    // If it is not there, we simply add it to the state
    if (_.isUndefined(foundResource)) {
        return insertResource(state, resource);
    }

    return updateResource(state, resource, foundResource);

};

export const updateStoreResources = (state: Array<Resource>,
    payload: Document): Array<Resource> => {

    let data = <Array<Resource> | Resource>_.get(payload, 'data');

    if (_.isUndefined(data)) {
        return state;
    }

    data = _.isArray(data) ? data : [data]

    let included = <Array<Resource>>_.get(payload, 'included');

    if (!_.isUndefined(included)) {
        data = [...data, ...included];
    }

    return <Array<Resource>>_.reduce(
        data, (result: Array<Resource>,
            resource: Resource) => {
            // let resourcePath: string = getResourcePath(
            //   result.resourcesDefinitions, resource.type);
            // Extremely ugly, needs refactoring!
            // let newPartialState = { data: {} };
            // newPartialState.data[resourcePath] = { data: {} } ;
            // newPartialState.data = updateOrInsertResource(
            // result.data, resource);
            return updateOrInsertResource(result, resource)
            // result.data[resourcePath].data = updateOrInsertResource(
            // result.data[resourcePath].data, resource);
            // return <NgrxJsonApiStore>_.merge({}, result, newPartialState);
        }, state);
};

export const deleteFromState = (state: Array<Resource>, query: Query) => {
    if (typeof query.id === 'undefined') {
        return state.filter(r => (r.type != query.type));
    } else {
        return state.filter(r => (r.type != query.type || r.id != query.id));
    }
};

export function toPayload(action): any {
    return action.payload;
}
