import { Observable } from "rxjs/Observable";
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
    errors?: Array<ResourceError>
}

export interface FilteringParam {
    path?: string;
    type?: string;
    value?: any;
}

export interface FilteringType {
  name: string;
  apiName?: string;
  comparison: (value: any, resourceValue: any) => boolean;
}

export interface NgrxJsonApiStore {
    data: NgrxJsonApiStoreData;
    queries: NgrxJsonApiStoreQueries;
    isCreating: number;
    isReading: number;
    isUpdating: number;
    isDeleting: number;
    isCommitting: number;
}

export interface NgrxJsonApiConfig {
    apiUrl: string;
    resourceDefinitions: Array<ResourceDefinition>;
    storeLocation: string;
    urlBuilder?: NgrxJsonApiUrlBuilder;
    filteringConfig?: NgrxJsonApiFilteringConfig;
}

export interface NgrxJsonApiFilteringConfig {
  pathSeparator?: string;
  filteringType?: Array<FilteringType>;
}

export interface NgrxJsonApiUrlBuilder {
  generateFilteringQueryParams?: (params: Array<FilteringParam>) => string;
  generateFieldsQueryParams?: (params: Array<string>) => string;
  generateIncludedQueryParams?: (params: Array<string>) => string;
  generateSortingQueryParams?: (params: Array<SortingParam>) => string;
  generateQueryParams?: (params: Array<string>) => string;
}

export type NgrxJsonApiStoreResources = { [id: string]: ResourceStore };
export type NgrxJsonApiStoreData = { [key: string]: NgrxJsonApiStoreResources };
export type NgrxJsonApiStoreQueries = { [key: string]: ResourceQueryStore };

export type OperationType
        = 'CREATING'
        | 'UPDATING'
        | 'DELETING'
        | 'READING'
        | false

export interface Payload {
    jsonApiData?: Document;
    query: ResourceQuery;
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
    | 'update'
    | 'deleteOne'
    | 'create'

export interface Resource extends ResourceIdentifier {
    attributes?: { [key: string]: any };
    relationships?: { [key: string]: ResourceRelationship };
    meta?: any;
    links?: any;
}

export interface ResourceAttributeDefinition {
  apiName?: string
}

export interface ResourceDefinition {
    type: string;
    collectionPath: string;
    attributes?: { [key: string]: ResourceAttributeDefinition};
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

export interface ResourceQuery {
    /**
     * id to reference the query within the store.
     * Does not have any impact on the actual query.
     */
    queryId?: string;
    type?: string;
    id?: string;
    params?: QueryParams;
    queryType?: QueryType;
}

export interface ResourceQueryStore {
    query: ResourceQuery;
    loading: Boolean;
    resultIds: Array<ResourceIdentifier>
    /**
     * Errors received from the server after attempting to perform a GET request.
     */
    errors: Array<ResourceError>
}

export interface ResourceQueryHandle<T> extends AnonymousSubscription {
    results: Observable<T>;
}

export interface ResourceRelationship {
    data?: any;
    links?: any;
}

export interface ResourceRelationDefinition {
    type: string;
    relationType: ResourceRelationType;
}

export type ResourceRelationType
    = 'hasOne'
    | 'hasMany'

export enum ResourceState {
    IN_SYNC,
    CREATED,
    UPDATED,
    DELETED
}

/**
 * Container to hold a Resource in the store with state information.
 */
export interface ResourceStore {
    /**
     * State of the resource to track local changes not yet
     * published to the json api endpoint.
     */
    state?: ResourceState;
    /**
     * The actual resource. This corresponds to persistedResource
     * if no changes were applied.
     */
    resource: Resource;
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
    errors: Array<ResourceError>
}

export interface SortingParam {
    api: string;
    direction: Direction;
}
