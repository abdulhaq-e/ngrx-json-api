import { Observable } from 'rxjs/Observable';
import { AnonymousSubscription } from 'rxjs/Subscription';

export enum Direction {
  ASC,
  DESC
}

export interface Document {
  data?: any;
  included?: any;
  meta?: any;
  links?: any;
  errors?: Array<ResourceError>;
}

export interface FilteringParam {
  path?: string;
  operator?: string;
  value?: any;
}

export interface FilteringOperator {
  name: string;
  apiName?: string;
  comparison: (value: any, resourceFieldValue: any) => boolean;
}

export interface ManyResourceRelationship {
  data?: Array<ResourceIdentifier>;
  reference?: Array<StoreResource>;
}

export interface NgrxJsonApiConfig {
  apiUrl: string;
  resourceDefinitions: Array<ResourceDefinition>;
  storeLocation: string;
  urlBuilder?: NgrxJsonApiUrlBuilder;
  filteringConfig?: NgrxJsonApiFilteringConfig;
}

export interface NgrxJsonApiStore {
  data: NgrxJsonApiStoreData;
  queries: NgrxJsonApiStoreQueries;
  isCreating: number;
  isReading: number;
  isUpdating: number;
  isDeleting: number;
  isApplying: number;
}

export interface NgrxJsonApiStoreData {
  [id: string]: NgrxJsonApiStoreResources;
};

export interface NgrxJsonApiStoreQueries {
  [id: string]: StoreQuery;
};

export interface NgrxJsonApiStoreResources {
  [id: string]: StoreResource;
};


export interface NgrxJsonApiFilteringConfig {
  pathSeparator?: string;
  filteringOperators?: Array<FilteringOperator>;
}

export interface NgrxJsonApiUrlBuilder {
  generateFilteringQueryParams?: (params: Array<FilteringParam>) => string;
  generateFieldsQueryParams?: (params: Array<string>) => string;
  generateIncludedQueryParams?: (params: Array<string>) => string;
  generateSortingQueryParams?: (params: Array<SortingParam>) => string;
  generateQueryParams?: (...params: Array<string>) => string;
}

export type OperationType
  = 'GET'
  | 'DELETE'
  | 'PATCH'
  | 'POST'
  | false;

export interface OneResourceRelationship {
  data?: ResourceIdentifier;
  reference?: StoreResource;
}

export interface Payload {
  jsonApiData?: Document;
  query: Query;
}

export interface Query {
  queryId?: string;
  type?: string;
  id?: string;
  params?: QueryParams;
}

export interface QueryResult {
  meta?: any;
  links?: any;
  data?: StoreResource | Array<StoreResource>;
}

export interface ManyQueryResult extends QueryResult {
  data?: Array<StoreResource>;
}

export interface OneQueryResult extends QueryResult {
  data?: StoreResource;
}

export interface QueryParams {
  filtering?: Array<FilteringParam>;
  sorting?: Array<SortingParam>;
  include?: Array<string>;
  fields?: Array<string>;
  offset?: number;
  limit?: number;
}

export class QueryError extends Error {
  public errors: Array<ResourceError>;
}

export interface Resource extends ResourceIdentifier {
  attributes?: { [key: string]: any };
  relationships?: { [key: string]: ResourceRelationship };
  meta?: any;
  links?: any;
}

export interface ResourceAttributeDefinition {
  apiName?: string;
}

export interface ResourceDefinition {
  type: string;
  collectionPath: string;
  attributes?: { [key: string]: ResourceAttributeDefinition };
  relationships?: { [key: string]: ResourceRelationDefinition };
};

export interface ResourceError {
  id?: string;
  links?: any;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: ResourceErrorSource;
  meta?: any;
}

export interface ResourceErrorSource {
  pointer?: string;
  parameter?: string;
}

export interface ResourceIdentifier {
  type: string;
  id: string;
}

export interface ResourceRelationship {
  data?: any;
  links?: any;
  reference?: any;
}

export interface ResourceRelationDefinition {
  type: string;
  relationType: ResourceRelationType;
}

export type ResourceRelationType
  = 'hasOne'
  | 'hasMany';

export type ResourceState =
  'IN_SYNC',
  'CREATED',
  'UPDATED',
  'DELETED',
  'NOT_LOADED';

export interface SortingParam {
  api: string;
  direction: Direction;
}

export interface StoreQuery {
  query: Query;
  loading: Boolean;
  resultIds: Array<ResourceIdentifier>;
  resultMeta: any;
  resultLinks: any;

  /**
   * Errors received from the server after attempting to perform a GET request.
   */
  errors: Array<ResourceError>;
}

/**
* Container to hold a Resource in the store with state information.
*/
export interface StoreResource extends Resource {
  /**
  * State of the resource to track local changes not yet
  * published to the json api endpoint.
  */
  state?: ResourceState;
  /**
  * The original resource obtained from the server.
  */
  persistedResource: Resource;
  /**
  * One of the operation types: reading, creating, updating or deleting.
  */
  loading?: OperationType;
  /**
  * Errors received from the server after attempting to store the resource.
  */
  errors: Array<ResourceError>;
}
