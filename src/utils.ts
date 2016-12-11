import * as _ from 'lodash';


import { Actions } from '@ngrx/effects';

import {
    FilteringParam,
    SortingParam,
    Direction,
    Resource,
    StoreResource,
    NgrxJsonApiStore,
    NgrxJsonApiStoreData,
    NgrxJsonApiStoreResources,
    NgrxJsonApiStoreQueries,
    NgrxJsonApiStoreQuery,
    ResourceIdentifier,
    ResourceState,
    ResourceDefinition,
    Document,
    RelationDefinition,
    ResourceQuery,
    QueryParams,
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

        var storeResource : StoreResource = {
            errors : [],
            resource : obj,
            originalResource : obj
        };

        bag[resource.type][resource.id] = storeResource;
        storeResource.resource = denormaliseObject(obj, resources, bag);
    }

    return bag[resource.type][resource.id];
}

export const getSingleResource = (
    query: ResourceQuery,
    resources: NgrxJsonApiStoreData): Resource => {
    if (_.isUndefined(resources[query.type])) {
        return undefined;
    }
    let storeResource = resources[query.type][query.id];
    return storeResource ? storeResource.resource : null;
}

export const getMultipleResources = (
    queries: Array<ResourceQuery>,
    resources: NgrxJsonApiStoreData): Array<Resource> => {
    return queries.map(query => getSingleResource(query, resources));
}

export const getSingleTypeResources = (
    query: ResourceQuery,
    resources: NgrxJsonApiStoreData): NgrxJsonApiStoreResources => {
    return resources[query.type];
}


export const transformStoreResources = (
    resources: NgrxJsonApiStoreResources): Array<Resource> => {

    return <Array<Resource>>_.flatMap(resources);
}

export const transformStoreData = (
    resources: NgrxJsonApiStoreData): Array<Resource> => {

    return Object.keys(resources).reduce((result, key) => {
        return [...result, ...transformStoreResources(getSingleTypeResources(
            { type: key }, resources))];
    }, []);

}


export const updateResourceObject = (original: Resource,
    source: Resource): Resource => {

    return _.merge({}, original, source);

};

export const insertStoreResource = (state: NgrxJsonApiStoreResources,
    resource: Resource, fromServer : boolean): NgrxJsonApiStoreResources => {

    let newState = Object.assign({}, state);
    if(fromServer){
        newState[resource.id] = {
            resource : resource,
            originalResource : resource,
            state : ResourceState.IN_SYNC,
            errors : [],
            loading : false
        };
    }else{
        newState[resource.id] = {
            resource : resource,
            originalResource : null,
            state : ResourceState.CREATED,
            errors : [],
            loading : false
        };
    }

    return newState;

};

export const updateStoreResource = (state: NgrxJsonApiStoreResources,
    resource: Resource, fromServer : boolean): NgrxJsonApiStoreResources => {

    let foundResource = state[resource.id].resource;
    let originalResource = state[resource.id].originalResource;

    let newResource : Resource;
    let newResourceState : ResourceState;
    if(fromServer){
        // form server, override everything
        // TODO need to handle check and keep local updates?
        newResource= resource;
        originalResource = resource;
        newResourceState = ResourceState.IN_SYNC;
    }else {
        let mergedResource = updateResourceObject(foundResource, resource);
        if (_.isEqual(mergedResource, originalResource)) {
            // no changes anymore, do nothing
            newResource = originalResource;
            newResourceState = ResourceState.IN_SYNC;
        }
        else {
            // merge changes and mark as CREATED or UPDATED depending on whether
            // an original version is available
            newResource = mergedResource;
            newResourceState = originalResource == null ? ResourceState.CREATED : ResourceState.UPDATED;
        }
    }

    let newState = Object.assign({}, state);
    newState[resource.id] = {
        resource : newResource,
        originalResource : originalResource,
        state : newResourceState,
        errors : [],
        loading : false
    };
    return newState;
};


export const updateQueryErrors = (state: NgrxJsonApiStoreQueries, queryId: string, document : Document): NgrxJsonApiStoreQueries => {
  if(!queryId || !state[queryId]){
    return state;
  }
  let newState = Object.assign({}, state);
  let newStoreQuery = Object.assign({}, newState[queryId]);
  newStoreQuery.errors.length = 0;
  if(document.errors){
    newStoreQuery.errors.push(...document.errors);
  }
  newState[queryId] = newStoreQuery;
  return newState;
}


export const updateResourceErrors = (state: NgrxJsonApiStoreData, query: ResourceQuery, document : Document): NgrxJsonApiStoreData => {
  if(!query.type || !query.id || document.data instanceof Array){
    throw new Error("invalid parameters");
  }
  if(!state[query.type] || !state[query.type][query.id]){
    // resource is not locally stored, no need to update(?)
    return state;
  }

  let newState: NgrxJsonApiStoreData = Object.assign({}, state);
  newState[query.type] = Object.assign({}, newState[query.type]);
  let storeResource =  Object.assign({}, newState[query.type][query.id]);;
  storeResource.errors.length = 0;
  if(document.errors){
    storeResource.errors.push(...document.errors);
  }
  newState[query.type][query.id] = storeResource;
  return newState;
}

export const rollbackStoreResources = (state: NgrxJsonApiStoreData): NgrxJsonApiStoreData => {
  let newState: NgrxJsonApiStoreData = Object.assign({}, state);
  for(let type in newState){
    newState[type] = Object.assign({}, newState[type]);
    for(let id in newState[type]){
      let storeResource = newState[type][id];
      if(storeResource.originalResource == null){
        delete newState[type][id];
      }else if(storeResource.state != ResourceState.IN_SYNC){
        newState[type][id] = Object.assign({}, newState[type][id], {
          state : ResourceState.IN_SYNC,
          resource :  newState[type][id].originalResource
        });
      }
    }
  }
  return newState;
};

export const updateOrInsertResource = (state: NgrxJsonApiStoreData,
    resource: Resource, fromServer : boolean, override : boolean): NgrxJsonApiStoreData => {

    let newState: NgrxJsonApiStoreData = Object.assign({}, state);

    // handle relationships first.
    // FIXME this is not working, the data section of a relationship contains only <type, id>, not a complete resource
    //if (resource.hasOwnProperty('relationships')) {
    //    Object.keys(resource.relationships)
    //       .forEach(relation => {
    //           let data = resource.relationships[relation].data;
    //           if (_.isPlainObject(data)) {
    //               // hasOne relation
    //               newState = updateOrInsertResource(state, data, resourceState);
    //           } else if (_.isArray(data)) {
    //                // hasMany relation
    //                newState = <NgrxJsonApiStoreData>data.reduce(
    //                    (partialState: NgrxJsonApiStoreData, currentResource: Resource): NgrxJsonApiStoreData => {
    //                        return updateOrInsertResource(partialState, currentResource, resourceState);
    //                    }, newState);
    //            }
    //        });
    //}

    if (_.isUndefined(state[resource.type])) {
        // we must mutate the main state (ngrxjsonapistoredata)
        newState[resource.type] = {};
        newState[resource.type] = insertStoreResource(newState[resource.type], resource, fromServer);
        return newState;

    } else if (_.isUndefined(state[resource.type][resource.id]) || override) {
        newState[resource.type] = insertStoreResource(
            newState[resource.type], resource, fromServer);
        return newState;
    } else {
        newState[resource.type] = updateStoreResource(
            newState[resource.type], resource, fromServer);
        return newState;
    }

};

/**
 * Updates the state of a resource in the store.
 *
 * @param state
 * @param resourceId
 * @param resourceState
 * @param loading
 * @returns {NgrxJsonApiStoreData}
 */
export const updateResourceState = (state: NgrxJsonApiStoreData,
    resourceId: ResourceIdentifier, resourceState? : ResourceState, loading? : boolean): NgrxJsonApiStoreData => {
    if (_.isUndefined(state[resourceId.type]) || _.isUndefined(state[resourceId.type][resourceId.id])) {
        return state;
    }
    let newState: NgrxJsonApiStoreData = Object.assign({}, state);
    newState[resourceId.type] = Object.assign({}, newState[resourceId.type]);
    newState[resourceId.type][resourceId.id] = Object.assign({}, newState[resourceId.type][resourceId.id]);
    if(resourceState != null){
        newState[resourceId.type][resourceId.id].state = resourceState;
    }
    if(loading != null){
        newState[resourceId.type][resourceId.id].loading = loading;
    }
    return newState;
};

export const cloneQueryParams = (queryParams: QueryParams): QueryParams => {
    let newQueryParams : QueryParams = {};
    if(queryParams.include){
      newQueryParams.include = queryParams.include.splice(0);
    }
    if(queryParams.fields){
      newQueryParams.fields = queryParams.fields.splice(0);
    }
    if(queryParams.filtering){
      newQueryParams.filtering = queryParams.filtering.map(it => Object.assign({}, it));
    }
    if(queryParams.sorting){
      newQueryParams.sorting = queryParams.sorting.map(it => Object.assign({}, it));
    }
    return newQueryParams;
}

export const cloneResourceQuery = (query: ResourceQuery): ResourceQuery => {
    let newQuery = Object.assign({}, query);
    if(newQuery.params){
        newQuery.params = cloneQueryParams(newQuery.params);
    }
    return newQuery;
}

/**
 * Updates the query information for the given query in the store.
 */
export const updateQueryParams = (state: NgrxJsonApiStoreQueries,
    query: ResourceQuery): NgrxJsonApiStoreQueries => {

    let storeQuery : NgrxJsonApiStoreQuery = state[query.queryId];
    let newQueryStore = Object.assign({}, storeQuery);
    newQueryStore.loading = true;
    newQueryStore.query = cloneResourceQuery(query);

    let newState: NgrxJsonApiStoreQueries = Object.assign({}, state);
    newState[query.queryId] = newQueryStore;
    return newState;
}

const toResourceIdentifier = (resource: Resource): ResourceIdentifier => {
    return {type: resource.type, id : resource.id};
}


/**
 * Updates the query results for the given query in the store.
 */
export const updateQueryResults = (state: NgrxJsonApiStoreQueries, queryId : string,
    document: Document): NgrxJsonApiStoreQueries => {

    let storeQuery : NgrxJsonApiStoreQuery = state[queryId];
    if(storeQuery){
        let data = _.isArray(document.data) ? document.data : [document.data];
        let newQueryStore = Object.assign({}, storeQuery, {
            resultIds : data.map(it => toResourceIdentifier(it)),
            loading : false
        });

        let newState: NgrxJsonApiStoreQueries = Object.assign({}, state);
        newState[queryId] = newQueryStore;
        return newState;
    }
    return state;
}


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
            return updateOrInsertResource(result, resource, true, true)
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

export const generateIncludedQueryParams = (included: Array<string>): string => {
    if (_.isEmpty(included)) {
        return '';
    }

    return 'include=' + included.join();

}

export const generateFieldsQueryParams = (fields: Array<string>): string => {
  if (_.isEmpty(fields)) {
    return '';
  }

  return 'fields=' + fields.join();

}

export const generateFilteringQueryParams = (filtering: Array<FilteringParam>): string => {
    if (_.isEmpty(filtering)) {
      return '';
    }
    let filteringParams = filtering.map(f => 'filter[' + f.api + ']'+ (f.type ? '[' + f.type + ']' : '') + '=' + encodeURIComponent(f.value));
    return filteringParams.join('&');
}

export const generateSortingQueryParams = (sorting: Array<SortingParam>): string => {
  if (_.isEmpty(sorting)) {
    return '';
  }
  return "sort=" +  sorting.map(f => (f.direction == Direction.ASC ? '' : '-') + f.api).join(",");

}

export const generateQueryParams = (first: string, second: string, third: string, forth: string) => {

  let arrayOfParams: Array<string> = []

  if (first !== '') {
    arrayOfParams.push(first);
  }

  if (second !== '') {
    arrayOfParams.push(second);
  }

  if (third !== '') {
    arrayOfParams.push(third);
  }

  if (forth !== '') {
    arrayOfParams.push(forth);
  }

  let queryParams = '?' + arrayOfParams.join('&');

  // if both params are empty string, queryParams will end up to be '?',
  // we don't want this to happen
  if (queryParams !== '?') {
    return queryParams;
  }

  return '';
}
