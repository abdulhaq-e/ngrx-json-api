export const NGRX_JSON_API_DEFAULT_ZONE = 'default';

export enum Direction {
  ASC,
  DESC,
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

/**
 * Used by code generators to navigate relationships in a type-safe manner.
 * See crnk.io for a first such generator.
 */
export interface TypedManyResourceRelationship<T extends StoreResource>
  extends ManyResourceRelationship {
  reference?: Array<T>;
}

/**
 * Used by code generators to navigate relationships in a type-safe manner.
 * See crnk.io for a first such generator.
 */
export interface TypedOneResourceRelationship<T extends StoreResource>
  extends OneResourceRelationship {
  reference?: T;
}

export interface NgrxJsonApiConfig {
  apiUrl: string;
  initialState?: any;
  resourceDefinitions?: Array<ResourceDefinition>;
  urlBuilder?: NgrxJsonApiUrlBuilder;
  filteringConfig?: NgrxJsonApiFilteringConfig;

  /**
   * Custom request headers.
   */
  requestHeaders?: { [name: string]: any };

  /**
   * Allows to disable the apply action and replace it with a custom one. For example
   * have a look at www.crnk.io that makes use of JSON PATCH to perform bulk updates.
   */
  applyEnabled?: boolean;
}

export interface NgrxJsonApiState {
  zones: NgrxJsonApiZones;
}

export interface NgrxJsonApiZones {
  [id: string]: NgrxJsonApiZone;
}

/**
 * deprecated, mae use of NgrxJsonApiZone instead
 */
export interface NgrxJsonApiStore {
  data: NgrxJsonApiStoreData;
  queries: NgrxJsonApiStoreQueries;
  isCreating: number;
  isReading: number;
  isUpdating: number;
  isDeleting: number;
  isApplying: number;
}

export interface NgrxJsonApiZone extends NgrxJsonApiStore {}

export interface NgrxJsonApiStoreData {
  [id: string]: NgrxJsonApiStoreResources;
}

export interface NgrxJsonApiStoreQueries {
  [id: string]: StoreQuery;
}

export interface NgrxJsonApiStoreResources {
  [id: string]: StoreResource;
}

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

export type OperationType = 'GET' | 'DELETE' | 'PATCH' | 'POST' | false;

export interface OneResourceRelationship {
  data?: ResourceIdentifier;
  reference?: StoreResource;
}

export type ErrorModificationType = 'ADD' | 'REMOVE' | 'SET';

export interface ModifyStoreResourceErrorsPayload {
  resourceId: ResourceIdentifier;
  errors: Array<ResourceError>;
  modificationType: ErrorModificationType;
}

export interface Payload {
  jsonApiData?: Document;
  query?: Query;
}

export interface Query {
  queryId?: string;
  type?: string;
  id?: string;
  params?: QueryParams;
}

export interface QueryParams {
  filtering?: Array<FilteringParam>;
  sorting?: Array<SortingParam>;
  include?: Array<string>;
  fields?: Array<string>;
  offset?: number;
  limit?: number;
  page?: QueryPageParams;
}

export interface QueryPageParams {
  [id: string]: string | number;
  offset?: number;
  limit?: number;
  number?: number;
  size?: number;
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
}

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

export type ResourceRelationType = 'hasOne' | 'hasMany';

export type ResourceState =
  | 'NEW'
  | 'IN_SYNC'
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'NOT_LOADED';

export interface SortingParam {
  api: string;
  direction: Direction;
}

export interface QueryResult extends StoreQuery {
  data?: StoreResource | Array<StoreResource>;
}

export interface ManyQueryResult extends QueryResult {
  data?: Array<StoreResource>;
}

export interface OneQueryResult extends QueryResult {
  data?: StoreResource;
}

export interface StoreQuery {
  query: Query;
  loading: boolean;
  resultIds?: Array<ResourceIdentifier>;
  meta?: any;
  links?: any;

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
  persistedResource?: Resource;
  /**
   * One of the operation types: reading, creating, updating or deleting.
   */
  loading?: OperationType;
  /**
   * Errors received from the server after attempting to store the resource.
   */
  errors?: Array<ResourceError>;

  /**
   * new resources may only obtain an id when posted to the server. Till that point
   * a StoreResource can assign make use of a temporary id and signal this by setting
   * this flag to true. The id will not be transmitted to the server and the resource
   * is removed from its temporary location (given by its id) as soon as it is posted
   * to the server.
   */
  hasTemporaryId?: boolean;
}
