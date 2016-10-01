import * as _ from 'lodash';


import { Actions } from '@ngrx/effects';

import {
    Resource,
    NgrxJsonApiStore,
    NgrxJsonApiStoreData,
    NgrxJsonApiStoreResources,
    ResourceIdentifier,
    ResourceDefinition,
    Document,
    RelationDefinition,
    ResourceQuery
} from './interfaces';

export const denormaliseObject = (
    resource: Resource,
    resources: NgrxJsonApiStoreData,
    bag: NgrxJsonApiStoreData): any => {
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
    resource: Resource, resources: NgrxJsonApiStoreData, bag: NgrxJsonApiStoreData = {}
): any => {

    if (_.isUndefined(resource)) {
        return undefined;
    }

    if (_.isUndefined(bag[resource.type])) {
        bag[resource.type] = {};
    }

    if (_.isUndefined(bag[resource.type][resource.id])) {

        let obj = Object.assign({}, resource);

        bag[resource.type][resource.id] = obj;
        bag[resource.type][resource.id] = denormaliseObject(obj, resources, bag);
    }

    return bag[resource.type][resource.id];
}

export const getSingleResource = (
    query: ResourceQuery,
    resources: NgrxJsonApiStoreData): Resource => {
    return resources[query.type][query.id];
}

export const getMultipleResources = (
    queries: Array<ResourceQuery>,
    resources: NgrxJsonApiStoreData): Array<Resource> => {
    return queries.map(query => getSingleResource(query, resources));
}

export const getSingleTypeResources = (
    query: ResourceQuery,
    resources: NgrxJsonApiStoreData): Array<Resource> => {
    return <Array<Resource>>_.flatMap(resources[query.type]);
}


export const updateResourceObject = (original: Resource,
    source: Resource): Resource => {

    return _.merge({}, original, source);

};

export const insertResource = (state: NgrxJsonApiStoreResources,
    resource: Resource): NgrxJsonApiStoreResources => {
    let newState = Object.assign({}, state);
    newState[resource.id] = resource
    return newState;

};

export const updateResource = (state: NgrxJsonApiStoreResources,
    resource: Resource, foundResource: Resource): NgrxJsonApiStoreResources => {

    let newState = Object.assign({}, state);
    newState[resource.id] = updateResourceObject(foundResource, resource);
    return newState;
};

export const updateOrInsertResource = (state: NgrxJsonApiStoreData,
    resource: Resource): NgrxJsonApiStoreData => {

    let newState: NgrxJsonApiStoreData = Object.assign({}, state);

    if (_.isUndefined(state[resource.type])) {
        // we must mutate the main state (ngrxjsonapistoredata)
        newState[resource.type] = {};
        newState[resource.type] = insertResource(newState[resource.type], resource);
        return newState;

    } else if (_.isUndefined(state[resource.type][resource.id])) {
        newState[resource.type] = insertResource(
            newState[resource.type],
            resource);
        return newState;
    } else {
        newState[resource.type] = updateResource(
            newState[resource.type],
            resource,
            state[resource.type][resource.id]);
        return newState;
    }

};

export const updateStoreResources = (state: NgrxJsonApiStoreData,
    payload: Document): NgrxJsonApiStoreData => {

    let data = <Array<Resource> | Resource>_.get(payload, 'data');

    if (_.isUndefined(data)) {
        return state;
    }

    data = _.isArray(data) ? data : [data]

    let included = <Array<Resource>>_.get(payload, 'included');

    if (!_.isUndefined(included)) {
        data = [...data, ...included];
    }

    return <NgrxJsonApiStoreData>_.reduce(
        data, (result: NgrxJsonApiStoreData,
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

export const deleteFromState = (state: NgrxJsonApiStoreData, query: ResourceQuery) => {
    let newState = Object.assign({}, state);
    if (typeof query.id === 'undefined') {
        newState[query.type] = {};
    } else {
        delete newState[query.type][query.id]
    }
    return newState;
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

/**
*
* Copied as it is from @ngrx/example-app
* I'm sure the guys at @ngrx won't mind :>
*
*/
/**
 * This function coerces a string into a string literal type.
 * Using tagged union types in TypeScript 2.0, this enables
 * powerful typechecking of our reducers.
 *
 * Since every action label passes through this function it
 * is a good place to ensure all of our action labels
 * are unique.
 */

let typeCache: { [label: string]: boolean } = {};
export function type<T>(label: T | ''): T {
  if (typeCache[<string>label]) {
    throw new Error(`Action type "${label}" is not unqiue"`);
  }

  typeCache[<string>label] = true;

  return <T>label;
}
