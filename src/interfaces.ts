export interface RelationDefinition {
  relation: string;
  type: string;
  relationType: string;
}

export interface ResourceDefinition {
  type: string;
  collectionPath: string;
};

export interface QueryParams {
  filtering?: Array<{
    field: string,
    value: any,
    type?: string,
    path?: string
  }>
  include?: Array<string>
}

export interface ResourceQuery {
  type?: string;
  id?: string;
  params?: QueryParams;
}

export interface ResourceIdentifier {
  type: string;
  id: string;
}

export interface Resource extends ResourceIdentifier {
  attributes?: {[key: string]: any};
  relationships? : {[key: string]: any};
}

export interface Document {
  data?: any;
  included?: any;
}

export interface Payload {
  data: {[key: string]: any};
  query?: ResourceQuery;
}

export interface NgrxJsonApiStore {
  data: Array<Resource>;
  isCreating: boolean;
  isReading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface NgrxJsonApiModuleConfig {
  apiUrl: string;
  resourcesDefinitions: Array<ResourceDefinition>;
  storeLocation: string;
}
