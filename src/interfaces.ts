export interface RelationDefinition {
    relation: string;
    type: string;
    relationType: string;
}

export interface ResourceDefinition {
    type: string;
    collectionPath: string;
};

export interface FilteringParams {
    field?: string;
    value?: any;
    type?: string;
    path?: string;
    api?: string;
}

export interface QueryParams {
    filtering?: Array<FilteringParams>
    include?: Array<string>
}

export type QueryType
    = 'getOne'
    | 'getMany'
    | 'getAll'
    | 'update'
    | 'deleteOne'
    | 'create'

export interface ResourceQuery {
    type?: string;
    id?: string;
    params?: QueryParams;
    queryType?: QueryType;
}

export interface ResourceIdentifier {
    type: string;
    id: string;
}

export interface Resource extends ResourceIdentifier {
    attributes?: { [key: string]: any };
    relationships?: { [key: string]: any };
}

export interface Document {
    data?: any;
    included?: any;
}

export interface Payload {
    jsonApiData?: Document;
    query: ResourceQuery;
}

export type NgrxJsonApiStoreResources = { [id: string]: Resource };
export type NgrxJsonApiStoreData = { [key: string]: NgrxJsonApiStoreResources };

export interface NgrxJsonApiStore {
    data: NgrxJsonApiStoreData;
    isCreating: boolean;
    isReading: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}

export interface NgrxJsonApiModuleConfig {
    apiUrl: string;
    resourceDefinitions: Array<ResourceDefinition>;
    storeLocation: string;
}
