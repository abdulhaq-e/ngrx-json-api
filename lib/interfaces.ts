export interface RelationDefinition {
  type: string;
  relationType: string;
}

export interface ResourceDefinition {
  type: string;
  collectionPath: string;
  attributes: Array<string>;
  relationships: { [key: string]: RelationDefinition };
};


export interface Query {
  type: string;
  id?: string;
  params?: string;
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
  options?: Query;
}

export interface Store {
  data: Array<Resource>;
  resourcesDefinitions: Array<ResourceDefinition>;
  isCreating: boolean;
  isReading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}
