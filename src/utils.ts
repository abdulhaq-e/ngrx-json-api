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
  ErrorModificationType,
} from './interfaces';

export function setIn(state: any, path: string, value: any) {
  let currentValue = _.get(state, path);
  if (value === currentValue) {
    return state;
  }
  return _.setWith(
    _.clone(state),
    path,
    value,
    (nsValue: any, key: string, nsObject: any) => {
      const newObject = _.clone(nsObject);
      newObject[key] = nsValue;
      return newObject;
    }
  );
}

export const denormaliseObject = (
  resource: Resource,
  storeData: NgrxJsonApiStoreData,
  bag: NgrxJsonApiStoreData,
  denormalizePersisted: boolean = false
): any => {
  // this function MUST MUTATE resource
  if (resource.hasOwnProperty('relationships')) {
    Object.keys(resource.relationships).forEach(relationshipName => {
      const orginalRelationship = resource.relationships[relationshipName];

      let data: ResourceIdentifier | Array<ResourceIdentifier> =
        orginalRelationship.data;
      if (!_.isUndefined(data)) {
        let denormalizedRelation;
        if (data === null) {
          denormalizedRelation = data;
        } else if (!_.isArray(data)) {
          // one relation
          let relatedRS = getSingleStoreResource(
            <ResourceIdentifier>data,
            storeData
          );
          denormalizedRelation = denormaliseStoreResource(
            relatedRS,
            storeData,
            bag,
            denormalizePersisted
          );
        } else if ((data as Array<ResourceIdentifier>).length == 0) {
          denormalizedRelation = data;
        } else {
          // many relation
          let relatedRSs: Array<StoreResource> = getMultipleStoreResource(
            <ResourceIdentifier[]>data,
            storeData
          );
          denormalizedRelation = relatedRSs.map(r =>
            denormaliseStoreResource(r, storeData, bag, denormalizePersisted)
          );
        }

        const relationship = { ...orginalRelationship };
        relationship['reference'] = denormalizedRelation;
        resource.relationships[relationshipName] = relationship;
      }
    });
  }
  return resource;
};

export const denormaliseStoreResources = (
  items: Array<StoreResource>,
  storeData: NgrxJsonApiStoreData,
  bag: any = {},
  denormalizePersisted: boolean = false
): Array<StoreResource> => {
  let results: Array<StoreResource> = [];
  for (let item of items) {
    results.push(
      denormaliseStoreResource(item, storeData, bag, denormalizePersisted)
    );
  }
  return results;
};

export const denormaliseStoreResource = (
  item: StoreResource,
  storeData: NgrxJsonApiStoreData,
  bag: any = {},
  denormalizePersisted: boolean = false
): any => {
  if (!item) {
    return null;
  }
  if (_.isUndefined(bag[item.type])) {
    bag[item.type] = {};
  }
  if (_.isUndefined(bag[item.type][item.id])) {
    let storeResource: StoreResource = { ...item };
    if (item.relationships) {
      storeResource.relationships = { ...item.relationships };
    }

    bag[storeResource.type][storeResource.id] = storeResource;
    storeResource = denormaliseObject(
      storeResource,
      storeData,
      bag,
      denormalizePersisted
    );
    if (storeResource.persistedResource && denormalizePersisted) {
      storeResource.persistedResource = denormaliseObject(
        storeResource.persistedResource,
        storeData,
        bag,
        denormalizePersisted
      );
    }
  }

  return bag[item.type][item.id];
};

export const getSingleStoreResource = (
  resourceId: ResourceIdentifier,
  storeData: NgrxJsonApiStoreData
): StoreResource => {
  return _.get(storeData, [resourceId.type, resourceId.id], null);
};

export const getMultipleStoreResource = (
  resourceIds: Array<ResourceIdentifier>,
  resources: NgrxJsonApiStoreData
): Array<StoreResource> => {
  return resourceIds.map(id => getSingleStoreResource(id, resources));
};

export const getDenormalisedPath = (
  path: string,
  baseResourceType: string,
  resourceDefinitions: Array<ResourceDefinition>,
  pathSeparator?: string
): string => {
  let denormPath: string[] = [];
  if (_.isUndefined(pathSeparator)) {
    pathSeparator = '.';
  }
  let fields: Array<string> = path.split(pathSeparator);
  let currentResourceType = baseResourceType;
  for (let i = 0; i < fields.length; i++) {
    let definition = _.find(resourceDefinitions, { type: currentResourceType });

    if (_.isUndefined(definition)) {
      throw new Error('Definition not found');
    }
    // if both attributes and relationships are missing, raise an error
    if (
      _.isUndefined(definition.attributes) &&
      _.isUndefined(definition.relationships)
    ) {
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

export const getDenormalisedValue = (
  path: string,
  storeResource: StoreResource,
  resourceDefinitions: Array<ResourceDefinition>,
  pathSeparator?: string
) => {
  let denormalisedPath = getDenormalisedPath(
    path,
    storeResource.type,
    resourceDefinitions,
    pathSeparator
  );
  return _.get(storeResource, denormalisedPath);
};

/**
 * Given two objects, it will merge the second in the first.
 *
 */
export const updateResourceObject = (
  original: Resource,
  source: Resource
): Resource => {
  // by default arrays would make use of concat.
  function customizer(objValue: any, srcValue: any) {
    if (_.isArray(objValue)) {
      return srcValue;
    }
  }

  return _.mergeWith({}, original, source, customizer);
};

/**
 * Insert a StoreResource given the Resource and the StoreResources
 *
 */
export const insertStoreResource = (
  storeResources: NgrxJsonApiStoreResources,
  resource: Resource,
  fromServer: boolean
): NgrxJsonApiStoreResources => {
  let newStoreResources = { ...storeResources };
  if (fromServer) {
    newStoreResources[resource.id] = {
      ...resource,
      persistedResource: resource,
      state: 'IN_SYNC',
      errors: [],
      loading: false,
    } as StoreResource;
  } else {
    newStoreResources[resource.id] = {
      ...resource,
      persistedResource: null,
      state: 'CREATED',
      errors: [],
      loading: false,
    } as StoreResource;
  }
  return _.isEqual(storeResources, newStoreResources)
    ? storeResources
    : newStoreResources;
};

/**
 * Removes a StoreResource given the Resource and the StoreResources
 *
 */
export const removeStoreResource = (
  storeData: NgrxJsonApiStoreData,
  resourceId: ResourceIdentifier
): NgrxJsonApiStoreData => {
  if (storeData[resourceId.type][resourceId.id]) {
    let newState: NgrxJsonApiStoreData = { ...storeData };
    newState[resourceId.type] = { ...newState[resourceId.type] };
    delete newState[resourceId.type][resourceId.id];
    return newState;
  }
  return storeData;
};

/**
 * Updates the state of a StoreResource in the store.
 *
 * @param storeData
 * @param resourceId
 * @param resourceState
 * @param loading
 * @returns
 */
export const updateResourceState = (
  storeData: NgrxJsonApiStoreData,
  resourceId: ResourceIdentifier,
  resourceState?: ResourceState,
  loading?: OperationType
): NgrxJsonApiStoreData => {
  if (
    _.isUndefined(storeData[resourceId.type]) ||
    _.isUndefined(storeData[resourceId.type][resourceId.id])
  ) {
    if (resourceState === 'DELETED') {
      let newState: NgrxJsonApiStoreData = { ...storeData };
      newState[resourceId.type] = { ...newState[resourceId.type] };
      newState[resourceId.type][resourceId.id] = {
        ...newState[resourceId.type][resourceId.id],
      };
      newState[resourceId.type][resourceId.id] = {
        type: resourceId.type,
        id: resourceId.id,
        persistedResource: null,
      } as StoreResource;
      newState[resourceId.type][resourceId.id].state = 'NOT_LOADED';
      return newState;
    } else {
      return storeData;
    }
  }
  let newState: NgrxJsonApiStoreData = { ...storeData };
  newState[resourceId.type] = { ...newState[resourceId.type] };
  newState[resourceId.type][resourceId.id] = {
    ...newState[resourceId.type][resourceId.id],
  };
  if (resourceState !== null) {
    newState[resourceId.type][resourceId.id].state = resourceState;
  }
  if (loading != null) {
    newState[resourceId.type][resourceId.id].loading = loading;
  }
  return newState;
};

/**
 * Check equality of resource and ignore additional contents used by the
 * store (state, persistedResource, etc.)
 * @param resource0
 * @param resource1
 * @returns
 */
export const isEqualResource = (
  resource0: Resource,
  resource1: Resource
): boolean => {
  if (resource0 === resource1) {
    return true;
  }
  if ((resource0 !== null) !== (resource1 !== null)) {
    return false;
  }

  return (
    _.isEqual(resource0.id, resource1.id) &&
    _.isEqual(resource0.type, resource1.type) &&
    _.isEqual(resource0.attributes, resource1.attributes) &&
    _.isEqual(resource0.meta, resource1.meta) &&
    _.isEqual(resource0.links, resource1.links) &&
    _.isEqual(resource0.relationships, resource1.relationships)
  );
};

export const updateStoreResource = (
  state: NgrxJsonApiStoreResources,
  resource: Resource,
  fromServer: boolean
): NgrxJsonApiStoreResources => {
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
    if (isEqualResource(mergedResource, persistedResource)) {
      // no changes anymore, do nothing
      newResource = persistedResource;
      newResourceState = 'IN_SYNC';
    } else {
      // merge changes and mark as CREATED or UPDATED depending on whether
      // an original version is available
      newResource = mergedResource;
      if (persistedResource !== null) {
        newResourceState = 'UPDATED';
      } else if (foundStoreResource.state === 'NEW') {
        newResourceState = 'NEW';
      } else {
        newResourceState = 'CREATED';
      }
    }
  }

  let newState = { ...state };
  newState[resource.id] = {
    ...newResource,
    persistedResource: persistedResource,
    state: newResourceState,
    errors: [],
    loading: false,
  } as StoreResource;

  return _.isEqual(newState[resource.id], state[resource.id])
    ? state
    : newState;
};

export const updateQueriesForDeletedResource = (
  state: NgrxJsonApiStoreQueries,
  deletedId: ResourceIdentifier
): NgrxJsonApiStoreQueries => {
  let newState: NgrxJsonApiStoreQueries = state;
  for (let queryId in state) {
    if (state.hasOwnProperty(queryId)) {
      let queryState = state[queryId];
      if (
        queryState.query.id === deletedId.id &&
        queryState.query.type === deletedId.type
      ) {
        // found a query for a resource that was deleted => modify to 404
        newState = clearQueryResult(newState, queryState.query.queryId);
        let notFoundError: ResourceError = { code: '404', status: 'Not Found' };
        newState[queryState.query.queryId].errors = [notFoundError];
      }
    }
  }
  return newState;
};

export const updateResourceErrorsForQuery = (
  storeData: NgrxJsonApiStoreData,
  query: Query,
  document: Document
): NgrxJsonApiStoreData => {
  // id can be nullify when queryType is POST
  if (!query.type || query.id === undefined || document.data instanceof Array) {
    throw new Error('invalid parameters');
  }
  return updateResourceErrors(
    storeData,
    { id: query.id, type: query.type },
    document.errors,
    'SET'
  );
};

export const updateResourceErrors = (
  storeData: NgrxJsonApiStoreData,
  id: ResourceIdentifier,
  errors: Array<ResourceError>,
  modificationType: ErrorModificationType
): NgrxJsonApiStoreData => {
  if (!storeData[id.type] || !storeData[id.type][id.id]) {
    return storeData;
  }
  let newState: NgrxJsonApiStoreData = { ...storeData };
  newState[id.type] = { ...newState[id.type] };
  let storeResource = { ...newState[id.type][id.id] };

  if (modificationType === 'SET') {
    storeResource.errors = [];
    if (errors) {
      storeResource.errors.push(...errors);
    }
  } else if (modificationType === 'ADD') {
    let currentErrors = storeResource.errors;
    storeResource.errors = [];
    if (currentErrors) {
      storeResource.errors.push(...currentErrors);
    }
    if (errors) {
      storeResource.errors.push(...errors);
    }
  } else {
    let currentErrors = storeResource.errors;
    storeResource.errors = [];
    if (currentErrors) {
      for (let currentError of currentErrors) {
        let remove =
          errors && errors.filter(it => _.isEqual(it, currentError)).length > 0;
        if (!remove) {
          storeResource.errors.push(currentError);
        }
      }
    }
  }
  newState[id.type][id.id] = storeResource;
  return newState;
};

function rollbackResource(
  newState: NgrxJsonApiStoreData,
  type: string,
  id: string
) {
  let storeResource = newState[type][id];
  if (!storeResource.persistedResource) {
    delete newState[type][id];
  } else if (storeResource.state !== 'IN_SYNC') {
    newState[type][id] = <StoreResource>{
      ...newState[type][id],
      state: 'IN_SYNC',
      resource: newState[type][id].persistedResource,
    };
  }
}

export const rollbackStoreResources = (
  storeData: NgrxJsonApiStoreData,
  ids: Array<ResourceIdentifier>,
  include: Array<string>
): NgrxJsonApiStoreData => {
  let newState: NgrxJsonApiStoreData = { ...storeData };

  if (_.isUndefined(ids)) {
    Object.keys(newState).forEach(type => {
      newState[type] = { ...newState[type] };
      Object.keys(newState[type]).forEach(id => {
        rollbackResource(newState, type, id);
      });
    });
  } else {
    let modifiedResources = getPendingChanges(newState, ids, include, true);
    for (let modifiedResource of modifiedResources) {
      rollbackResource(newState, modifiedResource.type, modifiedResource.id);
    }
  }
  return newState;
};

export const deleteStoreResources = (
  storeData: NgrxJsonApiStoreData,
  query: Query
) => {
  let newState = { ...storeData };
  // if an id is not provided, all resources of the provided type will be deleted
  if (typeof query.id === 'undefined') {
    newState[query.type] = {};
  } else {
    newState[query.type] = _.omit(newState[query.type], [
      query.id,
    ]) as NgrxJsonApiStoreResources;
  }
  return newState;
};

export const clearQueryResult = (
  storeData: NgrxJsonApiStoreQueries,
  queryId: string
) => {
  let newQuery = { ...storeData[queryId] };
  delete newQuery.resultIds;
  delete newQuery.errors;
  delete newQuery.meta;
  delete newQuery.links;

  let newState = { ...storeData };
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
export const updateStoreDataFromResource = (
  storeData: NgrxJsonApiStoreData,
  resource: Resource,
  fromServer: boolean,
  override: boolean
): NgrxJsonApiStoreData => {
  if (_.isUndefined(storeData[resource.type])) {
    let newStoreData: NgrxJsonApiStoreData = { ...storeData };
    newStoreData[resource.type] = {};
    newStoreData[resource.type] = insertStoreResource(
      newStoreData[resource.type],
      resource,
      fromServer
    );
    return newStoreData;
  } else if (_.isUndefined(storeData[resource.type][resource.id]) || override) {
    let updatedStoreResources = insertStoreResource(
      storeData[resource.type],
      resource,
      fromServer
    );

    // check if nothing has changed
    if (updatedStoreResources !== storeData[resource.type]) {
      let newStoreData: NgrxJsonApiStoreData = { ...storeData };
      newStoreData[resource.type] = updatedStoreResources;
      return newStoreData;
    }
    return storeData;
  } else {
    let updatedStoreResources = updateStoreResource(
      storeData[resource.type],
      resource,
      fromServer
    );

    // check if nothing has changed
    if (updatedStoreResources !== storeData[resource.type]) {
      let newStoreData: NgrxJsonApiStoreData = { ...storeData };
      newStoreData[resource.type] = updatedStoreResources;
      return newStoreData;
    }
    return storeData;
  }
};

export const updateStoreDataFromPayload = (
  storeData: NgrxJsonApiStoreData,
  payload: Document
): NgrxJsonApiStoreData => {
  let data = <Array<Resource> | Resource>_.get(payload, 'data');

  if (_.isUndefined(data)) {
    return storeData;
  }

  let resources: Array<Resource> = _.isArray(data)
    ? <Resource[]>data
    : <Resource[]>[data];
  let included = <Array<Resource>>_.get(payload, 'included');
  if (!_.isUndefined(included)) {
    resources = [...resources, ...included];
  }

  let newStoreData: NgrxJsonApiStoreData = { ...storeData };

  let hasChange = false;
  for (const resource of resources) {
    const storeResource = {
      ...resource,
      persistedResource: resource,
      state: 'IN_SYNC',
      errors: [],
      loading: false,
    } as StoreResource;

    if (!_.isEqual(storeResource, resource)) {
      hasChange = true;
      if (!newStoreData[resource.type]) {
        newStoreData[resource.type] = {};
      } else if (newStoreData[resource.type] === storeData[resource.type]) {
        newStoreData[resource.type] = { ...storeData[resource.type] };
      }
      newStoreData[resource.type][resource.id] = storeResource;
    }
  }
  return hasChange ? newStoreData : storeData;
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
export const updateQueryParams = (
  storeQueries: NgrxJsonApiStoreQueries,
  query: Query
): NgrxJsonApiStoreQueries => {
  if (!query.queryId) {
    return storeQueries;
  }

  let newStoreQuery = { ...storeQueries[query.queryId] };
  newStoreQuery.loading = true;
  newStoreQuery.query = _.cloneDeep(query);

  if (_.isUndefined(newStoreQuery.errors)) {
    newStoreQuery.errors = [];
  }

  let newStoreQueries: NgrxJsonApiStoreQueries = { ...storeQueries };
  newStoreQueries[newStoreQuery.query.queryId] = newStoreQuery;
  return newStoreQueries;
};

/**
 * Updates the query results for given a queryId and the results.
 */
export const updateQueryResults = (
  storeQueries: NgrxJsonApiStoreQueries,
  queryId: string,
  document: Document
): NgrxJsonApiStoreQueries => {
  let storeQuery: StoreQuery = storeQueries[queryId];
  if (storeQuery) {
    let data = _.isArray(document.data) ? document.data : [document.data];
    let newQueryStore = {
      ...storeQuery,
      resultIds: data.map(it => (it ? toResourceIdentifier(it) : [])),
      meta: document.meta,
      links: document.links,
      loading: false,
    };

    if (!_.isEqual(newQueryStore, storeQuery)) {
      let newState: NgrxJsonApiStoreQueries = { ...storeQueries };
      newState[queryId] = <StoreQuery>newQueryStore;
      return newState;
    }
  }
  return storeQueries;
};

/**
 * Update the query errors given the queryId and a storeQueries and the
 * document containing the error
 *
 *
 */
export const updateQueryErrors = (
  storeQueries: NgrxJsonApiStoreQueries,
  queryId: string,
  document: Document
): NgrxJsonApiStoreQueries => {
  if (!queryId || !storeQueries[queryId]) {
    return storeQueries;
  }
  let newState = { ...storeQueries };
  let newStoreQuery = { ...newState[queryId] };
  newStoreQuery.errors = [];
  newStoreQuery.loading = false;
  if (document.errors) {
    newStoreQuery.errors.push(...document.errors);
  }
  newState[queryId] = newStoreQuery;
  return newState;
};

/**
 * Removes a query given its queryId from the NgrxJsonApiStoreQueries.
 */
export const removeQuery = (
  storeQueries: NgrxJsonApiStoreQueries,
  queryId: string
): NgrxJsonApiStoreQueries => {
  let newState: NgrxJsonApiStoreQueries = { ...storeQueries };
  delete newState[queryId];
  return newState;
};

/**
 * Given a resource, it will return an object containing the resource id and type.
 */
export const toResourceIdentifier = (
  resource: Resource
): ResourceIdentifier => {
  return { type: resource.type, id: resource.id };
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
export const getResourceFieldValueFromPath = (
  path: string,
  baseStoreResource: StoreResource,
  storeData: NgrxJsonApiStoreData,
  resourceDefinitions: Array<ResourceDefinition>,
  pathSeparator?: string
) => {
  if (_.isUndefined(pathSeparator)) {
    pathSeparator = '.';
  }
  let fields: Array<string> = path.split(pathSeparator);
  let currentStoreResource = baseStoreResource;
  for (let i = 0; i < fields.length; i++) {
    let definition = _.find(resourceDefinitions, {
      type: currentStoreResource.type,
    });

    if (_.isUndefined(definition)) {
      throw new Error('Definition not found');
    }
    // if both attributes and relationships are missing, raise an error
    if (
      _.isUndefined(definition.attributes) &&
      _.isUndefined(definition.relationships)
    ) {
      throw new Error('Attributes or Relationships must be provided');
    }

    if (fields[i] === 'id') {
      return _.get(currentStoreResource, 'id', null);
    } else if (definition.attributes.hasOwnProperty(fields[i])) {
      return _.get(currentStoreResource, 'attributes.' + fields[i], null);
    } else if (definition.relationships.hasOwnProperty(fields[i])) {
      if (i === fields.length - 1) {
        throw new Error(
          'The last field in the filtering path cannot be a relation'
        );
      }
      let resourceRelation = definition.relationships[fields[i]];
      if (resourceRelation.relationType === 'hasMany') {
        throw new Error('Cannot filter past a hasMany relation');
      } else {
        let relation = _.get(
          currentStoreResource,
          'relationships.' + fields[i],
          null
        );
        if (!relation || !relation.data) {
          return null;
        } else {
          let relatedPath = [resourceRelation.type, relation.data.id];
          currentStoreResource = _.get<any, any>(storeData, relatedPath);
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

export const filterResources = (
  resources: NgrxJsonApiStoreResources,
  storeData: NgrxJsonApiStoreData,
  query: Query,
  resourceDefinitions: Array<ResourceDefinition>,
  filteringConfig?: NgrxJsonApiFilteringConfig
) => {
  return _.filter(resources, resource => {
    if (
      query.hasOwnProperty('params') &&
      query.params.hasOwnProperty('filtering')
    ) {
      return query.params.filtering.every(element => {
        let pathSeparator;
        let filteringOperators;

        if (!_.isUndefined(filteringConfig)) {
          pathSeparator = <string>_.get(filteringConfig, 'pathSeparator');
          filteringOperators = <Array<FilteringOperator>>_.get(
            filteringConfig,
            'filteringOperators'
          );
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

        let operator = <FilteringOperator>_.find(filteringOperators, {
          name: element.operator,
        });

        if (operator) {
          return operator.comparison(element.value, resourceFieldValue);
        }

        element.operator = element.hasOwnProperty('operator')
          ? element.operator
          : 'iexact';

        switch (element.operator) {
          case 'iexact':
            if (_.isString(element.value) && _.isString(resourceFieldValue)) {
              return (
                element.value.toLowerCase() === resourceFieldValue.toLowerCase()
              );
            } else {
              return element.value === resourceFieldValue;
            }

          case 'exact':
            return element.value === resourceFieldValue;

          case 'contains':
            return _.includes(resourceFieldValue, element.value);

          case 'icontains':
            return _.includes(
              resourceFieldValue.toLowerCase(),
              element.value.toLowerCase()
            );

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
            return _.startsWith(
              resourceFieldValue.toLowerCase(),
              element.value.toLowerCase()
            );

          case 'endswith':
            return _.endsWith(resourceFieldValue, element.value);

          case 'iendswith':
            return _.endsWith(
              resourceFieldValue.toLowerCase(),
              element.value.toLowerCase()
            );

          default:
            return true;
        }
      });
    } else {
      return true;
    }
  });
};

export const generateIncludedQueryParams = (
  included: Array<string>
): string => {
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

export const generateFilteringQueryParams = (
  filtering: Array<FilteringParam>
): string => {
  if (_.isEmpty(filtering)) {
    return '';
  }
  let filteringParams = filtering.map(f => {
    return (
      'filter[' +
      f.path +
      ']' +
      (f.operator ? '[' + f.operator + ']' : '') +
      '=' +
      encodeURIComponent(f.value)
    );
  });
  return filteringParams.join('&');
};

export const generateSortingQueryParams = (
  sorting: Array<SortingParam>
): string => {
  if (_.isEmpty(sorting)) {
    return '';
  }
  return (
    'sort=' +
    sorting
      .map(f => (f.direction === Direction.ASC ? '' : '-') + f.api)
      .join(',')
  );
};

export const generateQueryParams = (...params: Array<string>) => {
  let newParams = params.filter(p => p !== '');
  if (newParams.length !== 0) {
    return '?' + newParams.join('&');
  } else {
    return '';
  }
};

export const generatePayload = (
  resource: StoreResource,
  operation: OperationType
): Payload => {
  let payload: Payload = {
    query: {
      type: resource.type,
    },
  };

  // the data to be updated or created
  if (operation === 'POST' || operation === 'PATCH') {
    payload.jsonApiData = {
      data: {
        id: resource.id,
        type: resource.type,
        attributes: resource.attributes,
        relationships: resource.relationships,
      },
    };
  }

  if (operation === 'POST' && resource.hasTemporaryId) {
    delete payload.jsonApiData.data.id;
  }

  // 'DELETE' only needs a query and it also needs an id in its query
  // 'PATCH' also needs an id in its query
  // 'POST' needed locally to allow to write back errors to store if id is available
  if (operation === 'PATCH' || operation === 'DELETE' || operation === 'POST') {
    payload.query.id = resource.id;
  }

  return payload;
};

/* tslint:disable */
export const uuid = () => {
  let lut = [];
  for (let i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16);
  }
  let d0 = (Math.random() * 0xffffffff) | 0;
  let d1 = (Math.random() * 0xffffffff) | 0;
  let d2 = (Math.random() * 0xffffffff) | 0;
  let d3 = (Math.random() * 0xffffffff) | 0;
  return (
    lut[d0 & 0xff] +
    lut[(d0 >> 8) & 0xff] +
    lut[(d0 >> 16) & 0xff] +
    lut[(d0 >> 24) & 0xff] +
    '-' +
    lut[d1 & 0xff] +
    lut[(d1 >> 8) & 0xff] +
    '-' +
    lut[((d1 >> 16) & 0x0f) | 0x40] +
    lut[(d1 >> 24) & 0xff] +
    '-' +
    lut[(d2 & 0x3f) | 0x80] +
    lut[(d2 >> 8) & 0xff] +
    '-' +
    lut[(d2 >> 16) & 0xff] +
    lut[(d2 >> 24) & 0xff] +
    lut[d3 & 0xff] +
    lut[(d3 >> 8) & 0xff] +
    lut[(d3 >> 16) & 0xff] +
    lut[(d3 >> 24) & 0xff]
  );
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

const collectReferencesForResource = (
  state: NgrxJsonApiStore,
  usedResources: any,
  resource: Resource
) => {
  let hasChanges: boolean;
  for (let relationshipName in resource.relationships) {
    if (resource.relationships.hasOwnProperty(relationshipName)) {
      let data = resource.relationships[relationshipName].data;
      if (data) {
        let dependencyIds: Array<ResourceIdentifier> =
          data instanceof Array ? data : [data];
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
              hasChanges =
                hasChanges ||
                collectReferencesForResource(state, usedResources, resource);
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

interface TopologySortContext {
  pendingResources: Array<StoreResource>;
  cursor: number;
  sorted: Array<StoreResource>;
  visited: Array<boolean>;
  dependencies: { [id: string]: Array<StoreResource> };
}

export const sortPendingChanges = (
  pendingResources: Array<StoreResource>
): Array<StoreResource> => {
  // allocate dependency
  let dependencies: any = {};
  let pendingMap: any = {};
  for (let pendingResource of pendingResources) {
    let resource = pendingResource;
    let key = toKey(resource);
    dependencies[key] = [];
    pendingMap[key] = pendingResource;
  }

  // extract dependencies
  for (let pendingResource of pendingResources) {
    let resource = pendingResource;
    if (resource.relationships) {
      let key = toKey(resource);
      Object.keys(resource.relationships).forEach(relationshipName => {
        let data = resource.relationships[relationshipName].data;
        if (data) {
          let dependencyIds: Array<ResourceIdentifier> =
            data instanceof Array ? data : [data];
          for (let dependencyId of dependencyIds) {
            let dependencyKey = toKey(dependencyId);
            if (
              pendingMap[dependencyKey] &&
              pendingMap[dependencyKey].state === 'CREATED'
            ) {
              // we have a dependency between two unsaved objects
              dependencies[key].push(pendingMap[dependencyKey]);
            }
          }
        }
      });
    }
  }

  // order
  let context = {
    pendingResources: pendingResources,
    cursor: pendingResources.length,
    sorted: new Array(pendingResources.length),
    dependencies: dependencies,
    visited: <any[]>[],
  };

  let i = context.cursor;
  while (i--) {
    if (!context.visited[i]) {
      visitPending(pendingResources[i], i, [], context);
    }
  }

  return context.sorted;
};

const visitPending = (
  pendingResource: StoreResource,
  i: any,
  predecessors: any,
  context: TopologySortContext
) => {
  let key = toKey(pendingResource);
  if (predecessors.indexOf(key) >= 0) {
    throw new Error(
      'Cyclic dependency: ' + key + ' with ' + JSON.stringify(predecessors)
    );
  }

  if (context.visited[i]) {
    return;
  }
  context.visited[i] = true;

  // outgoing edges
  let outgoing: Array<StoreResource> = context.dependencies[key];

  let preds = predecessors.concat(key);
  for (let child of outgoing) {
    visitPending(
      child,
      context.pendingResources.indexOf(child),
      preds,
      context
    );
  }

  context.sorted[--context.cursor] = pendingResource;
};

function collectPendingChange(
  state: NgrxJsonApiStoreData,
  pending: Array<StoreResource>,
  id: ResourceIdentifier,
  include: Array<Array<string>>,
  includeNew: boolean
) {
  let storeResource = state[id.type][id.id];
  if (
    storeResource.state !== 'IN_SYNC' &&
    (storeResource.state !== 'NEW' || includeNew)
  ) {
    pending.push(storeResource);
  }

  for (let includeElement of include) {
    if (includeElement.length > 0) {
      let relationshipName = includeElement[0];
      if (
        storeResource.relationships &&
        storeResource.relationships[relationshipName]
      ) {
        let data = storeResource.relationships[relationshipName].data;
        if (data) {
          let relationInclude: Array<Array<string>> = [];
          include
            .filter(
              relIncludeElem =>
                relIncludeElem.length >= 2 &&
                relIncludeElem[0] == relationshipName
            )
            .forEach(relIncludeElem =>
              relationInclude.push(relIncludeElem.slice(1))
            );

          if (_.isArray(data)) {
            let relationIds = data as Array<ResourceIdentifier>;
            relationIds.forEach(relationId =>
              collectPendingChange(
                state,
                pending,
                relationId,
                relationInclude,
                includeNew
              )
            );
          } else {
            let relationId = data as ResourceIdentifier;
            collectPendingChange(
              state,
              pending,
              relationId,
              relationInclude,
              includeNew
            );
          }
        }
      }
    }
  }
}

export function getPendingChanges(
  state: NgrxJsonApiStoreData,
  ids: Array<ResourceIdentifier>,
  include: Array<string>,
  includeNew?: boolean
): Array<StoreResource> {
  let pending: Array<StoreResource> = [];

  if (_.isUndefined(ids)) {
    // check all
    Object.keys(state).forEach(type => {
      Object.keys(state[type]).forEach(id => {
        let storeResource = state[type][id];
        if (
          storeResource.state !== 'IN_SYNC' &&
          (storeResource.state !== 'NEW' || includeNew)
        ) {
          pending.push(storeResource);
        }
      });
    });
  } else {
    let relationshipInclusions = [];
    if (include) {
      for (let includeElement of include) {
        relationshipInclusions.push(includeElement.split('.'));
      }
    }
    for (let id of ids) {
      collectPendingChange(
        state,
        pending,
        id,
        relationshipInclusions,
        includeNew
      );
    }
    pending = _.uniqBy(pending, function(e) {
      return e.type + '####' + e.id;
    });
  }

  return pending;
}
