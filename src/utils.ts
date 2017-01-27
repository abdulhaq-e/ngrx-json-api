import * as _ from 'lodash';

import { Actions } from '@ngrx/effects';

import {
  Direction,
  Document,
  FilteringOperator,
  FilteringParam,
  NgrxJsonApiFilteringConfig,
  NgrxJsonApiStore,
  NgrxJsonApiStoreData,
  NgrxJsonApiStoreResources,
  NgrxJsonApiStoreQueries,
  OperationType,
  Payload,
  Query,
  Resource,
  ResourceDefinition,
  ResourceIdentifier,
  ResourceError,
  ResourceState,
  StoreQuery,
  SortingParam,
  StoreResource,
} from './interfaces';

export const denormaliseObject = (resource: Resource,
  storeData: NgrxJsonApiStoreData, bag: NgrxJsonApiStoreData): any => {
  // this function MUST MUTATE resource
  let denormalised = resource;

  if (resource.hasOwnProperty('relationships')) {

    Object.keys(resource.relationships)
      .forEach(relation => {
        resource.relationships[relation]['reference'] = {} as Resource;
        let data: ResourceIdentifier | Array<ResourceIdentifier> = resource
          .relationships[relation].data;
        // denormalised relation
        let relationDenorm;

        if (data === null || _.isEqual(data, [])) {

          relationDenorm = data;

        }else if (_.isPlainObject(data)) {
          // hasOne relation
          let relatedRS = getSingleStoreResource(<ResourceIdentifier>data, storeData);
          relationDenorm = denormaliseStoreResource(relatedRS, storeData, bag);
        }else if (_.isArray(data)) {
          // hasMany relation
          let relatedRSs: Array<StoreResource> = getMultipleStoreResource(data, storeData);
          relationDenorm = relatedRSs.map(r => denormaliseStoreResource(r, storeData, bag));
        }
        let relationDenormPath = 'relationships.' + relation + '.reference';
        denormalised = <Resource>_.set(
          denormalised,
          relationDenormPath,
          relationDenorm
        );
      });
  }

  return denormalised;
};

export const denormaliseStoreResource = (item: StoreResource, storeData: NgrxJsonApiStoreData,
  bag: any = {}): any => {

  if (!item) {
    return null;
  }
  let storeResource = _.cloneDeep(<StoreResource>item);

  if (_.isUndefined(bag[storeResource.type])) {
    bag[storeResource.type] = {};
  }
  if (_.isUndefined(bag[storeResource.type][storeResource.id])) {
    bag[storeResource.type][storeResource.id] = storeResource;
    storeResource = denormaliseObject(storeResource, storeData, bag);
    storeResource.persistedResource = denormaliseObject(storeResource.persistedResource,
      storeData, bag);
  }

  return bag[storeResource.type][storeResource.id];

};

export const getSingleStoreResource = (resourceId: ResourceIdentifier,
  storeData: NgrxJsonApiStoreData): StoreResource => {
  return _.get(storeData, [resourceId.type, resourceId.id], null);
};

export const getMultipleStoreResource = (resourceIds: Array<ResourceIdentifier>,
  resources: NgrxJsonApiStoreData): Array<StoreResource> => {
  return resourceIds.map(id => getSingleStoreResource(id, resources));
};

export const getDenormalisedPath = (path: string, baseResourceType: string,
  resourceDefinitions: Array<ResourceDefinition>, pathSeparator?: string): string => {
  let denormPath: string[] = [];
  if (_.isUndefined(pathSeparator)) {
    pathSeparator = '.';
  }
  let fields: Array<string> = path.split(pathSeparator);
  let currentResourceType = baseResourceType;
  for (let i = 0; i < fields.length; i++) {
    let definition = _.find(resourceDefinitions, {type: currentResourceType});

    if (_.isUndefined(definition)) {
      throw new Error('Definition not found');
    }
    // if both attributes and relationships are missing, raise an error
    if (_.isUndefined(definition.attributes) && _.isUndefined(definition.relationships)) {
      throw new Error('Attributes or Relationships must be provided');
    }

    if (definition.attributes.hasOwnProperty(fields[i])) {
      denormPath.push('attributes', fields[i]);
      break;
    } else if (definition.relationships.hasOwnProperty(fields[i])) {
      let resourceRelation = definition.relationships[fields[i]];
      if (resourceRelation.relationType === 'hasMany') {
        if (i !== fields.length - 1) {
          throw new Error('Cannot filter past a hasMany relation');
        } else {
          denormPath.push('relationships', fields[i], 'reference');
        }
      } else {
        currentResourceType = resourceRelation.type;
        denormPath.push('relationships', fields[i], 'reference');
      }
    } else {
      throw new Error('Cannot find field in attributes or relationships');
    }
  }
  return denormPath.join(pathSeparator);
};

export const getDenormalisedValue = (path: string, storeResource: StoreResource,
  resourceDefinitions: Array<ResourceDefinition>, pathSeparator?: string) => {
  let denormalisedPath = getDenormalisedPath(path, storeResource.type, resourceDefinitions,
    pathSeparator);
  return _.get(storeResource, denormalisedPath);
};

/**
 * Given two objects, it will merge the second in the first.
 *
 */
export const updateResourceObject = (original: Resource,
  source: Resource): Resource => {

  return _.merge({}, original, source);

};

/**
 * Insert a StoreResource given the Resource and the StoreResources
 *
 */
export const insertStoreResource = (storeResources: NgrxJsonApiStoreResources,
  resource: Resource, fromServer: boolean): NgrxJsonApiStoreResources => {

  let newStoreResources = Object.assign({}, storeResources);
  if (fromServer) {
    newStoreResources[resource.id] = Object.assign({}, resource, {
      persistedResource: resource,
      state: 'IN_SYNC',
      errors: [],
      loading: false
    }) as StoreResource;
  } else {
    newStoreResources[resource.id] = Object.assign({}, resource, {
      persistedResource: null,
      state: 'CREATED',
      errors: [],
      loading: false
    }) as StoreResource;
  }
  return _.isEqual(storeResources, newStoreResources) ? storeResources : newStoreResources;
};

/**
 * Updates the state of a StoreResource in the store.
 *
 * @param storeData
 * @param resourceId
 * @param resourceState
 * @param loading
 * @returns {NgrxJsonApiStoreData}
 */
export const updateResourceState = (storeData: NgrxJsonApiStoreData,
  resourceId: ResourceIdentifier, resourceState?: ResourceState,
  loading?: OperationType): NgrxJsonApiStoreData => {
  if (_.isUndefined(storeData[resourceId.type])
    || _.isUndefined(storeData[resourceId.type][resourceId.id])) {

    if (resourceState === 'DELETED') {
      let newState: NgrxJsonApiStoreData = Object.assign({}, storeData);
      newState[resourceId.type] = Object.assign({}, newState[resourceId.type]);
      newState[resourceId.type][resourceId.id] = Object.assign({},
        newState[resourceId.type][resourceId.id]);
      newState[resourceId.type][resourceId.id] = {
        type: resourceId.type,
        id: resourceId.id,
        persistedResource: null
      } as StoreResource;
      newState[resourceId.type][resourceId.id].state = 'NOT_LOADED';
      return newState;
    } else {
      return storeData;
    }
  }
  let newState: NgrxJsonApiStoreData = Object.assign({}, storeData);
  newState[resourceId.type] = Object.assign({}, newState[resourceId.type]);
  newState[resourceId.type][resourceId.id] = Object.assign({},
    newState[resourceId.type][resourceId.id]);
  if (resourceState !== null) {
    newState[resourceId.type][resourceId.id].state = resourceState;
  }
  if (loading != null) {
    newState[resourceId.type][resourceId.id].loading = loading;
  }
  return newState;
};

export const updateStoreResource = (state: NgrxJsonApiStoreResources,
  resource: Resource, fromServer: boolean): NgrxJsonApiStoreResources => {

  let foundStoreResource = state[resource.id];
  let persistedResource = state[resource.id].persistedResource;

  let newResource: Resource;
  let newResourceState: ResourceState;
  if (fromServer) {
    // form server, override everything
    // TODO need to handle check and keep local updates?
    newResource = resource;
    persistedResource = resource;
    newResourceState = 'IN_SYNC';
  } else {
    let mergedResource = updateResourceObject(foundStoreResource, resource);
    if (_.isEqual(mergedResource, persistedResource)) {
      // no changes anymore, do nothing
      newResource = persistedResource;
      newResourceState = 'IN_SYNC';
    } else {
      // merge changes and mark as CREATED or UPDATED depending on whether
      // an original version is available
      newResource = mergedResource;
      newResourceState = persistedResource === null ? 'CREATED' : 'UPDATED';
    }
  }

  let newState = Object.assign({}, state);
  newState[resource.id] = Object.assign({}, newResource, {
    persistedResource: persistedResource,
    state: newResourceState,
    errors: [],
    loading: false
  }) as StoreResource;

  return _.isEqual(newState[resource.id], state[resource.id]) ? state : newState;
};

export const updateQueriesForDeletedResource = (state: NgrxJsonApiStoreQueries,
  deletedId: ResourceIdentifier): NgrxJsonApiStoreQueries => {
  let newState: NgrxJsonApiStoreQueries = state;
  for(let queryId in state){
    if(state.hasOwnProperty(queryId)){
      let queryState = state[queryId];
      if(queryState.query.id == deletedId.id && queryState.query.type == deletedId.type){
        // found a query for a resource that was deleted => modify to 404
        newState = clearQueryResult(newState, queryState.query.queryId);
        let notFoundError : ResourceError = {code: '404', status: "Not Found"};
        newState[queryState.query.queryId].errors = [notFoundError];
      }
    }
  }
  return newState;
};

export const updateResourceErrors = (storeData: NgrxJsonApiStoreData,
  query: Query, document: Document): NgrxJsonApiStoreData => {
  if (!query.type || !query.id || document.data instanceof Array) {
    // TODO: Why does document.data has to be an Array?
    throw new Error('invalid parameters');
  }
  if (!storeData[query.type] || !storeData[query.type][query.id]) {
    return storeData;
  }
  let newState: NgrxJsonApiStoreData = Object.assign({}, storeData);
  newState[query.type] = Object.assign({}, newState[query.type]);
  let storeResource = Object.assign({}, newState[query.type][query.id]);
  storeResource.errors = [];
  if (document.errors) {
    storeResource.errors.push(...document.errors);
  }
  newState[query.type][query.id] = storeResource;
  return newState;
};

export const rollbackStoreResources = (storeData: NgrxJsonApiStoreData): NgrxJsonApiStoreData => {
  let newState: NgrxJsonApiStoreData = Object.assign({}, storeData);
  Object.keys(newState).forEach(type => {
    newState[type] = Object.assign({}, newState[type]);
    Object.keys(newState[type]).forEach(id => {
      let storeResource = newState[type][id];
      if (!storeResource.persistedResource) {
        delete newState[type][id];
      } else if (storeResource.state !== 'IN_SYNC') {
        newState[type][id] = Object.assign({}, newState[type][id], {
          state: 'IN_SYNC',
          resource: newState[type][id].persistedResource
        });
      }
    });
  });
  return newState;
};

export const deleteStoreResources = (storeData: NgrxJsonApiStoreData, query: Query) => {
  let newState = Object.assign({}, storeData);
  // if an id is not provided, all resources of the provided type will be deleted
  if (typeof query.id === 'undefined') {
    newState[query.type] = {};
  } else {
    newState[query.type] = _.omit(newState[query.type], [query.id]) as NgrxJsonApiStoreResources;
  }
  return newState;
};


export const clearQueryResult = (storeData: NgrxJsonApiStoreQueries, queryId: string) => {
  let newQuery = Object.assign({}, storeData[queryId]);
  delete newQuery.resultIds;
  delete newQuery.errors;
  delete newQuery.resultMeta;
  delete newQuery.resultLinks;

  let newState = Object.assign({}, storeData);
  newState[queryId] = newQuery;
  return newState;
};



/**
 * Updates a given storeData by either inserting a resource or updating
 * an existing resource.
 *
 * @param storeData
 * @param resource
 * @param fromServer
 * @param override
 *
 * @returns a new NgrxJsonApiStoreData with an inserted/updated resource.
 */
export const updateStoreDataFromResource = (storeData: NgrxJsonApiStoreData, resource: Resource,
  fromServer: boolean, override: boolean): NgrxJsonApiStoreData => {

  if (_.isUndefined(storeData[resource.type])) {
    let newStoreData: NgrxJsonApiStoreData = Object.assign({}, storeData);
    newStoreData[resource.type] = {};
    newStoreData[resource.type] = insertStoreResource(newStoreData[resource.type],
      resource, fromServer);
    return newStoreData;
  } else if (_.isUndefined(storeData[resource.type][resource.id]) || override) {
    let updatedStoreResources = insertStoreResource(storeData[resource.type], resource, fromServer);

    // check if nothing has changed
    if (updatedStoreResources !== storeData[resource.type]) {
      let newStoreData: NgrxJsonApiStoreData = Object.assign({}, storeData);
      newStoreData[resource.type] = updatedStoreResources;
      return newStoreData;
    }
    return storeData;
  } else {
    let updatedStoreResources = updateStoreResource(storeData[resource.type], resource, fromServer);

    // check if nothing has changed
    if (updatedStoreResources !== storeData[resource.type]) {
      let newStoreData: NgrxJsonApiStoreData = Object.assign({}, storeData);
      newStoreData[resource.type] = updatedStoreResources;
      return newStoreData;
    }
    return storeData;
  }

};

export const updateStoreDataFromPayload = (storeData: NgrxJsonApiStoreData,
  payload: Document): NgrxJsonApiStoreData => {
  let data = <Array<Resource> | Resource>_.get(payload, 'data');

  if (_.isUndefined(data)) {
    return storeData;
  }

  data = _.isArray(data) ? data : [data];

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
      return updateStoreDataFromResource(result, resource, true, true);
      // result.data[resourcePath].data = updateOrInsertResource(
      // result.data[resourcePath].data, resource);
      // return <NgrxJsonApiStore>_.merge({}, result, newPartialState);
    }, storeData);
};

/**
 * Updates the storeQueries by either adding a new ResourceQueryStore
 * or modifying an existing one.
 *
 * @param storeQueries
 * @param query
 *
 * @return a new NgrxJsonApiStoreQueries with the inserted/modified
 * ResourceQueryStore
 */
export const updateQueryParams = (storeQueries: NgrxJsonApiStoreQueries,
  query: Query): NgrxJsonApiStoreQueries => {

  if (!query.queryId) {
    return storeQueries;
  }

  let newStoreQuery = Object.assign({}, storeQueries[query.queryId]);
  newStoreQuery.loading = true;
  newStoreQuery.query = _.cloneDeep(query);

  if (_.isUndefined(newStoreQuery.errors)) {
    newStoreQuery.errors = [];
  }

  let newStoreQueries: NgrxJsonApiStoreQueries = Object.assign({}, storeQueries);
  newStoreQueries[newStoreQuery.query.queryId] = newStoreQuery;
  return newStoreQueries;
};

/**
 * Updates the query results for given a queryId and the results.
 */
export const updateQueryResults = (storeQueries: NgrxJsonApiStoreQueries,
  queryId: string, document: Document): NgrxJsonApiStoreQueries => {

  let storeQuery: StoreQuery = storeQueries[queryId];
  if (storeQuery) {
    let data = _.isArray(document.data) ? document.data : [document.data];
    let newQueryStore = Object.assign({}, storeQuery, {
      resultIds: data.map(it => it ? toResourceIdentifier(it) : []),
      resultMeta: document.meta,
      resultLinks: document.links,
      loading: false
    });

    let newState: NgrxJsonApiStoreQueries = Object.assign({}, storeQueries);
    newState[queryId] = newQueryStore;
    return newState;
  }
  return storeQueries;
};

/**
 * Update the query errors given the queryId and a storeQueries and the
 * document containing the error
 *
 *
 */
export const updateQueryErrors = (storeQueries: NgrxJsonApiStoreQueries,
  queryId: string, document: Document): NgrxJsonApiStoreQueries => {

  if (!queryId || !storeQueries[queryId]) {
    return storeQueries;
  }
  let newState = Object.assign({}, storeQueries);
  let newStoreQuery = Object.assign({}, newState[queryId]);
  newStoreQuery.errors = [];
  if (document.errors) {
    newStoreQuery.errors.push(...document.errors);
  }
  newState[queryId] = newStoreQuery;
  return newState;
};

/**
 * Removes a query given its queryId from the NgrxJsonApiStoreQueries.
 */
export const removeQuery = (storeQueries: NgrxJsonApiStoreQueries,
  queryId: string): NgrxJsonApiStoreQueries => {

  let newState: NgrxJsonApiStoreQueries = Object.assign({}, storeQueries);
  delete newState[queryId];
  return newState;
};

/**
 * Given a resource, it will return an object containing the resource id and type.
 */
export const toResourceIdentifier = (resource: Resource): ResourceIdentifier => {
  return {type: resource.type, id: resource.id};
};

/**
 * Get the value for the last field in a given fitering path.
 *
 * @param path
 * @param baseStoreResource
 * @param storeData
 * @param resourceDefinitions
 * @param pathSepartor
 * @returns the value of the last field in the path.
 */
export const getResourceFieldValueFromPath = (path: string,
  baseStoreResource: StoreResource, storeData: NgrxJsonApiStoreData,
  resourceDefinitions: Array<ResourceDefinition>, pathSeparator?: string) => {
  if (_.isUndefined(pathSeparator)) {
    pathSeparator = '.';
  }
  let fields: Array<string> = path.split(pathSeparator);
  let currentStoreResource = baseStoreResource;
  for (let i = 0; i < fields.length; i++) {
    let definition = _.find(resourceDefinitions, {type: currentStoreResource.type});

    if (_.isUndefined(definition)) {
      throw new Error('Definition not found');
    }
    // if both attributes and relationships are missing, raise an error
    if (_.isUndefined(definition.attributes) && _.isUndefined(definition.relationships)) {
      throw new Error('Attributes or Relationships must be provided');
    }
    if (definition.attributes.hasOwnProperty(fields[i])) {
      return _.get(currentStoreResource, 'attributes.' + fields[i], null);
    } else if (definition.relationships.hasOwnProperty(fields[i])) {
      if (i === (fields.length - 1)) {
        throw new Error('The last field in the filtering path cannot be a relation');
      }
      let resourceRelation = definition.relationships[fields[i]];
      if (resourceRelation.relationType === 'hasMany') {
        throw new Error('Cannot filter past a hasMany relation');
      } else {
        let relation = _.get(currentStoreResource, 'relationships.' + fields[i], null);
        if (!relation || !relation.data) {
          return null;
        } else {
          let relatedPath = [
            resourceRelation.type,
            relation.data.id
          ];
          currentStoreResource = <StoreResource>_.get(storeData, relatedPath);
        }
      }
    } else {
      throw new Error('Cannot find field in attributes or relationships');
    }
    if (_.isUndefined(currentStoreResource)) {
      return null;
    }
  }
};

export const filterResources = (resources: NgrxJsonApiStoreResources,
  storeData: NgrxJsonApiStoreData, query: Query,
  resourceDefinitions: Array<ResourceDefinition>,
  filteringConfig?: NgrxJsonApiFilteringConfig) => {
  return _.filter(resources, (resource) => {
    if (query.hasOwnProperty('params') && query.params.hasOwnProperty('filtering')) {
      return query.params.filtering.every(element => {
        let pathSeparator;
        let filteringOperators;

        if (!_.isUndefined(filteringConfig)) {
          pathSeparator = <string>_.get(filteringConfig, 'pathSeparator');
          filteringOperators = <Array<FilteringOperator>>_.get(
            filteringConfig, 'filteringOperators');
        }
        // resource type and attribute
        let resourceFieldValue = getResourceFieldValueFromPath(
          element.path,
          resource,
          storeData,
          resourceDefinitions,
          pathSeparator
        );
        if (!resourceFieldValue) {
          return false;
        }

        let operator = <FilteringOperator>_.find(filteringOperators, {name: element.operator});

        if (operator) {
          return operator.comparison(element.value, resourceFieldValue);
        }

        element.operator = element.hasOwnProperty('operator') ? element.operator : 'iexact';

        switch (element.operator) {
          case 'iexact':
            if (_.isString(element.value) && _.isString(resourceFieldValue)) {
              return element.value.toLowerCase() === resourceFieldValue.toLowerCase();
            } else {
              return element.value === resourceFieldValue;
            }

          case 'exact':
            return element.value === resourceFieldValue;

          case 'contains':
            return _.includes(resourceFieldValue, element.value);

          case 'icontains':
            return _.includes(resourceFieldValue.toLowerCase(),
              element.value.toLowerCase());

          case 'in':
            if (_.isArray(element.value)) {
              return _.includes(element.value, resourceFieldValue);
            } else {
              return _.includes([element.value], resourceFieldValue);
            }
          case 'gt':
            return element.value > resourceFieldValue;

          case 'gte':
            return element.value >= resourceFieldValue;

          case 'lt':
            return element.value < resourceFieldValue;

          case 'lte':
            return element.value <= resourceFieldValue;

          case 'startswith':
            return _.startsWith(resourceFieldValue, element.value);

          case 'istartswith':
            return _.startsWith(resourceFieldValue.toLowerCase(),
              element.value.toLowerCase());

          case 'endswith':
            return _.endsWith(resourceFieldValue, element.value);

          case 'iendswith':
            return _.endsWith(resourceFieldValue.toLowerCase(),
              element.value.toLowerCase());

          default:
            return true;
        }
      });
    } else {
      return true;
    }
  });
};


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
    throw new Error(`Action type '${label}' is not unqiue'`);
  }

  typeCache[<string>label] = true;

  return <T>label;
}

export const generateIncludedQueryParams = (included: Array<string>): string => {
  if (_.isEmpty(included)) {
    return '';
  }

  return 'include=' + included.join();

};

export const generateFieldsQueryParams = (fields: Array<string>): string => {
  if (_.isEmpty(fields)) {
    return '';
  }

  return 'fields=' + fields.join();

};

export const generateFilteringQueryParams = (filtering: Array<FilteringParam>): string => {
  if (_.isEmpty(filtering)) {
    return '';
  }
  let filteringParams = filtering
    .map(f => {
      return 'filter[' + f.path + ']' +
        (f.operator ? '[' + f.operator + ']' : '') +
        '=' + encodeURIComponent(f.value);
    });
  return filteringParams.join('&');
};

export const generateSortingQueryParams = (sorting: Array<SortingParam>): string => {
  if (_.isEmpty(sorting)) {
    return '';
  }
  return 'sort=' + sorting.map(f => (f.direction === Direction.ASC ? '' : '-') + f.api).join(',');

};

export const generateQueryParams = (...params: Array<string>) => {
  let newParams = params.filter(p => p !== '');
  if (newParams.length !== 0) {
    return '?' + newParams.join('&');
  } else {
    return '';
  }
};

export const generatePayload = (resource: Resource, operation: OperationType): Payload => {
  let payload: Payload = {
    query: {
      type: resource.type,
    }
  };

  // the data to be updated or created
  if (operation === 'POST' || operation === 'PATCH') {
    payload.jsonApiData = {
      data: {
        id: resource.id,
        type: resource.type,
        attributes: resource.attributes,
        relationships: resource.relationships
      }
    };
  }

  // 'DELETE' only needs a query and it also needs an id in its query
  // 'PATCH' also needs an id in its query
  if (operation === 'PATCH' || operation === 'DELETE') {
    payload.query.id = resource.id;
  }

  return payload;
};

/* tslint:disable */
export const uuid = () => {
  let lut = [];
  for (let i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
  }
  let d0 = Math.random() * 0xffffffff | 0;
  let d1 = Math.random() * 0xffffffff | 0;
  let d2 = Math.random() * 0xffffffff | 0;
  let d3 = Math.random() * 0xffffffff | 0;
  return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
    lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
    lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
    lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
};
/* tslint:enable */


const toKey = (id: ResourceIdentifier) => {
  return id.id + '@' + id.type;
};


const collectQueryResults = (state: NgrxJsonApiStore, usedResources: any) => {
  for (let queryName in state.queries) {
    if (state.queries.hasOwnProperty(queryName)) {
      let query = state.queries[queryName];
      if (query.resultIds) {
        for (let resultId of query.resultIds) {
          usedResources[toKey(resultId)] = true;
        }
      }
    }
  }
};

const collectPendingChanges = (state: NgrxJsonApiStore, usedResources: any) => {
  for (let type in state.data) {
    if (state.data.hasOwnProperty(type)) {
      let resources = state.data[type];
      for (let id in resources) {
        if (resources.hasOwnProperty(id)) {
          let resource = resources[id];
          if (resource.state !== 'IN_SYNC') {
            usedResources[toKey(resource)] = true;
          }
        }
      }
    }
  }
};

const collectReferencesForResource = (state: NgrxJsonApiStore, usedResources: any,
    resource: Resource) => {
  let hasChanges: boolean;
  for (let relationshipName in resource.relationships) {
    if (resource.relationships.hasOwnProperty(relationshipName)) {
      let data = resource.relationships[relationshipName].data;
      if (data) {
        let dependencyIds: Array<ResourceIdentifier> = data instanceof Array ? data : [data];
        for (let dependencyId of dependencyIds) {
          let dependencyKey = toKey(dependencyId);
          if (!usedResources[dependencyKey]) {
            // change found, an other iteration will be necssary to detect
            // transitive dependencies
            hasChanges = true;
            usedResources[dependencyKey] = true;
          }
        }
      }
    }
  }
  return hasChanges;
};

const collectReferences = (state: NgrxJsonApiStore, usedResources: any) => {
  while (true) {
    let hasChanges = false;
    for (let type in state.data) {
      if (state.data.hasOwnProperty(type)) {
        let resources = state.data[type];
        for (let id in resources) {
          if (resources.hasOwnProperty(id)) {
            let resource = resources[id];
            if (usedResources[toKey(resource)]) {
              // in use, do not collect its relations
              hasChanges = hasChanges
                || collectReferencesForResource(state, usedResources, resource);
            }
          }
        }
      }
    }
    if (!hasChanges) {
      break;
    }
  }
};

const sweepUnusedResources = (state: NgrxJsonApiStore, usedResources: any) => {
  let hasDeletions = false;
  let newState = _.cloneDeep(state);
  for (let type in newState.data) {
    if (newState.data.hasOwnProperty(type)) {
      let resources = newState.data[type];
      for (let id in resources) {
        if (resources.hasOwnProperty(id)) {
          let resource = resources[id];
          if (!usedResources[toKey(resource)]) {
            hasDeletions = true;
            delete resources[id];
          }
        }
      }

      if (_.isEmpty(resources)) {
        delete newState.data[type];
      }
    }
  }
  return hasDeletions ? newState : state;
};

export const compactStore = (state: NgrxJsonApiStore) => {
  let usedResources = {};

  // query results can not be collected
  collectQueryResults(state, usedResources);

  // pending changes cannot be collected
  collectPendingChanges(state, usedResources);

  // references from non-collected objects cannot be collected as well
  collectReferences(state, usedResources);

  // remove everything that is not collected
  return sweepUnusedResources(state, usedResources);
};
