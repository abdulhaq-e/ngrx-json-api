export interface JsonApiResourceDefinition {
  type: string;
  path: string;
  collectionPath: string;
  attributes: Array<string>;
  relationships: { [key: string]: { type: string, relationType: string } };
};

// export type JsonApiResourcesDefinition = Array<JsonApiResourceDefinition>;


export interface JsonApiStore {
  data: {[key: string]: any};
  resourcesDefinition: Array<JsonApiResourceDefinition>;
  isCreating: boolean;
  isReading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  // getResourcePath(resourceType: string): string;
}

export interface JsonApiQuery {
  resourceType: string;
  id?: string;
  params?: string;
}

export interface JsonApiResourceIdentifier {
  type: string;
  id: string;
}

export interface JsonApiResource extends JsonApiResourceIdentifier {
  attributes?: {[key: string]: any};
  relationships? : {[key: string]: any};
}

export interface JsonApiDocument {
  data: any;
  included: any;
}

export interface JsonApiPayload {
  data: {[key: string]: any};
  options?: JsonApiQuery;
}
