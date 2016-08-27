import _ = require('lodash');

import { Actions } from '@ngrx/effects';

import {
    Resource,
    Store,
    ResourceDefinition,
    Document,
    RelationDefinition
} from './interfaces';

export const initialiseStore = (
    resourcesDefinition: Array<ResourceDefinition>): Store => {

    return ({
        isCreating: false,
        isReading: false,
        isUpdating: false,
        isDeleting: false,
        resourcesDefinitions: resourcesDefinition,
        data: []
    })
};

export const transformResource = (resource: Resource): Resource => {
    let newResource: Resource = {
        id: resource.id,
        type: resource.type
    };
    if (typeof resource.attributes !== 'undefined') {
        _.forEach(resource.attributes, (value, key) => {
            newResource[key] = value;
        });
    }
    if (typeof resource.relationships !== 'undefined') {
        _.forEach(resource.attributes, (value, key) => {
            newResource[key] = value;
        });
    }

    return newResource;
}


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

export function toPayload(action): any {
    return action.payload;
}
