import _ = require('lodash');

import { JsonApiResource,
    JsonApiStore,
    JsonApiResourceDefinition,
    JsonApiDocument} from './interfaces';

export const getResourcePath = (
    resourcesDefinition: Array<JsonApiResourceDefinition>,
    resourceType: string): string => {
    let definition: JsonApiResourceDefinition = <JsonApiResourceDefinition>_.find(
        resourcesDefinition, { type: resourceType });

    if (typeof definition === 'undefined') {
        throw new Error('Definition not found');
    }
    else {
        return definition.path;
    }
};

export const initialiseJsonApiStore = (
    resourcesDefinition: Array<JsonApiResourceDefinition>): JsonApiStore => {
    let data = _.reduce(resourcesDefinition,
        (result, definition) => {
            result[definition.path] = {
                data: []
            }
            return result;
        }, {});
    return {
        isCreating: false,
        isReading: false,
        isUpdating: false,
        isDeleting: false,
        resourcesDefinition: resourcesDefinition,
        data: data
    }
};


export const updateResourceObject = (original: JsonApiResource,
    source: JsonApiResource): JsonApiResource => {

    return _.merge({}, original, source);

};

export const insertResource = (state: Array<JsonApiResource>,
    resource: JsonApiResource): Array<JsonApiResource> => {

    return [...state, resource];

};

export const updateResource = (state: Array<JsonApiResource>, resource: JsonApiResource,
    foundResource: JsonApiResource): Array<JsonApiResource> => {

    return [..._.filter(state, (r) => !(r.type === resource.type && r.id === resource.id)),
        updateResourceObject(foundResource, resource)
    ];

};

export const updateOrInsertResource = (state: Array<JsonApiResource>,
    resource: JsonApiResource): Array<JsonApiResource> => {

    // Check if the entity alread exists in the state
    let foundResource = _.find(state, { type: resource.type, id: resource.id });

    // If it is not there, we simply add it to the state
    if (_.isUndefined(foundResource)) {
        return insertResource(state, resource);
    }

    return updateResource(state, resource, foundResource);

};
