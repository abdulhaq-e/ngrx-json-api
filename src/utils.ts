import * as _ from 'lodash';


import { Actions } from '@ngrx/effects';

import {
    Resource,
    NgrxJsonApiStore,
    ResourceIdentifier,
    ResourceDefinition,
    Document,
    RelationDefinition,
    ResourceQuery
} from './interfaces';

export const denormaliseObject = (
    resource: Resource, resources: Array<Resource>, bag: Array<Resource>) => {
    // this function MUST MUTATE resource

    let denormalised: any = resource;

    if (resource.hasOwnProperty('attributes')) {
        Object.keys(resource.attributes)
            .forEach(attribute => {
                denormalised[attribute] = resource.attributes[attribute]
            });
    }

    if (resource.hasOwnProperty('relationships')) {

        Object.keys(resource.relationships)
            .forEach(relation => {

                let data = resource.relationships[relation].data;
                let denormalisedRelation;

                if (data === null || _.isEqual(data, [])) {

                    denormalisedRelation = data;

                } else if (_.isPlainObject(data)) {
                    // hasOne relation
                    let relatedResource = getSingleResource(data, resources);
                    denormalisedRelation = denormaliseResource(
                        relatedResource, resources, bag);
                } else if (_.isArray(data)) {
                    // hasMany relation
                    let relatedResources = getMultipleResources(data, resources);
                    denormalisedRelation = relatedResources.map(
                        r => denormaliseResource(r, resources, bag));
                }

                denormalised = _.set(
                    denormalised,
                    relation,
                    denormalisedRelation
                );
            });
    }

    delete denormalised.attributes;
    delete denormalised.relationships;

    return denormalised;
}

export const denormaliseResource = (
    resource: Resource, resources: Array<Resource>, bag: Array<Resource> = []
) => {

    if (_.isUndefined(resource)) {
        return undefined;
    }

    if (!_.find(bag, { type: resource.type, id: resource.id })) {
        let obj = _.assign({}, resource);

        bag = [obj, ...bag];
        bag[0] = denormaliseObject(obj, resources, bag);
        return bag[0];
    } else {
        return _.find(bag, { type: resource.type, id: resource.id });
    }
}

export const getSingleResource = (
    query: ResourceQuery,
    resources: Array<Resource>): Resource => {
    return _.find(resources, { type: query.type, id: query.id })
}

export const getMultipleResources = (
    queries: Array<ResourceQuery>,
    resources: Array<Resource>): Array<Resource> => {
    return queries.map(query => getSingleResource(query, resources));
}

export const getSingleTypeResources = (
    query: ResourceQuery,
    resources: Array<Resource>): Array<Resource> => {
    return resources.filter(resource => resource.type === query.type);
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

export const deleteFromState = (state: Array<Resource>, query: ResourceQuery) => {
    if (typeof query.id === 'undefined') {
        return state.filter(r => (r.type != query.type));
    } else {
        return state.filter(r => (r.type != query.type || r.id != query.id));
    }
};

export function toPayload(action): any {
    return action.payload;
}

export const filterResources = (resources, query: ResourceQuery) => {
    return resources.filter(resource => {
        if (query.hasOwnProperty('params') && query.params.hasOwnProperty('filtering')) {
            return query.params.filtering.every(element => {
                let resolvedPath = element.hasOwnProperty('path') ? _.get(resource, element.path) : resource

                if (_.isUndefined(resolvedPath) || _.isNull(resolvedPath)) {
                    return false;
                } else if (_.isArray(resolvedPath)) {
                    let newQuery = {
                        params: {
                            filtering: [
                                {
                                    type: element.type,
                                    field: element.field,
                                    value: element.value
                                }
                            ]
                        }
                    };
                    if (!_.isEmpty(filterResources(resolvedPath, newQuery))) {
                        return true;
                    } else {
                        return false;
                    }
                }

                let resourceField: any = _.get(resolvedPath, element.field);
                element.type = element.hasOwnProperty('type') ? element.type : 'iexact';

                switch (element.type) {
                    case 'iexact':
                        if (_.isString(element.value) && _.isString(resourceField)) {
                            return element.value.toLowerCase() === resourceField.toLowerCase()
                        } else {
                            return element.value === resourceField;
                        }

                    case 'exact':
                        return element.value === resourceField;

                    case 'contains':
                        return _.includes(resourceField, element.value);

                    case 'icontains':
                        return _.includes(resourceField.toLowerCase(),
                            element.value.toLowerCase());

                    case 'in':
                        if (_.isArray(element.value)) {
                            return _.includes(element.value, resourceField);
                        } else {
                            return _.includes([element.value], resourceField);
                        }
                    case 'gt':
                        return element.value > resourceField;

                    case 'gte':
                        return element.value >= resourceField;

                    case 'lt':
                        return element.value < resourceField;

                    case 'lte':
                        return element.value <= resourceField;

                    case 'startswith':
                        return _.startsWith(resourceField, element.value);

                    case 'istartswith':
                        return _.startsWith(resourceField.toLowerCase(),
                            element.value.toLowerCase())

                    case 'endswith':
                        return _.endsWith(resourceField, element.value);

                    case 'iendswith':
                        return _.endsWith(resourceField.toLowerCase(),
                            element.value.toLowerCase());

                    default:
                        return true;
                }
            });
        } else {
            return true;
        }
    });
}
