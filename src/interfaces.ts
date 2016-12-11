export interface RelationDefinition {
    relation: string;
    type: string;
    relationType: string;
}

export interface ResourceDefinition {
    type: string;
    collectionPath: string;
};

export interface FilteringParam {
    field?: string;
    value?: any;
    type?: string;
    path?: string;
    api?: string;
}

export enum Direction {
  ASC,
  DESC
}

export interface SortingParam {
  api : string;
  direction : Direction;
}

export interface QueryParams {
    filtering?: Array<FilteringParam>
    sorting?: Array<SortingParam>
    include?: Array<string>
    fields?: Array<string>
    offset?: number
    limit?: number
}

export type QueryType
    = 'getOne'
    | 'getMany'
    | 'getAll'
    | 'update'
    | 'deleteOne'
    | 'create'

export interface ResourceQuery {

	/**
	 * id to reference the query within the store. Does not have any impact on the actual query.
     */
    queryId?: string;

	type?: string;
    id?: string;
    params?: QueryParams;
    queryType?: QueryType;
}

export interface ResourceIdentifier {
    type: string;
    id: string;
}

export enum ResourceState{
    IN_SYNC,
    CREATED,
    UPDATED,
    DELETED
}

export interface ResourceError{
    id?: string;
    links?: any;
    status?: string;
    code?: string;
    title?: string;
    detail?: string;
    source?: ResourceErrorSource;
    meta?:any;
}

export interface ResourceErrorSource{
    pointer?: string;
    parameter?: string;
}

/**
 * Container to hold a Resource in the store with state information.
 */
export interface StoreResource {

	/**
	 * State of the resource to track local changes not yet published to the json api endpoint.
     */
    state? : ResourceState;

	/**
	 * The actual resource. This corresponds to originalResource if no changes were applied.
     */
    resource : Resource;

	/**
	 * The original resource obtained from the server.
     */
    originalResource : Resource;

	/**
	 * True if any kind of operation is executed (post, patch, delete).
     */
    loading? : boolean;

	/**
	 * Errors received from the server after attempting to store the resource.
     */
    errors : Array<ResourceError>
}

export interface Resource extends ResourceIdentifier {
    attributes?: { [key: string]: any };
    relationships?: { [key: string]: any };
    meta?: any;
    links?: any;
}

export interface Document {
    data?: any;
    included?: any;
    meta?: any;
    links?: any;
    errors?: Array<ResourceError>
}

export interface Payload {
    jsonApiData?: Document;
    query: ResourceQuery;
}

export interface NgrxJsonApiStoreQuery{
  query : ResourceQuery;
  loading : Boolean;
  resultIds : Array<ResourceIdentifier>

  /**
   * Errors received from the server after attempting to perform a GET request.
   */
  errors : Array<ResourceError>
}

export type NgrxJsonApiStoreResources = { [id: string]: StoreResource };
export type NgrxJsonApiStoreData = { [key: string]: NgrxJsonApiStoreResources };
export type NgrxJsonApiStoreQueries = { [key: string]: NgrxJsonApiStoreQuery };

export interface NgrxJsonApiStore {
    data: NgrxJsonApiStoreData;
    queries: NgrxJsonApiStoreQueries;
    isCreating: boolean;
    isReading: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isCommitting: boolean;
}

export interface NgrxJsonApiModuleConfig {
    apiUrl: string;
    resourceDefinitions: Array<ResourceDefinition>;
    storeLocation: string;
}
