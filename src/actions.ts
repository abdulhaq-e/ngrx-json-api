import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';

import {
  Payload,
  Resource,
  ResourceIdentifier,
  Query,
} from './interfaces';
import { type } from './utils';


export const NgrxJsonApiActionTypes = {
  API_CREATE_INIT: type('API_CREATE_INIT'),
  API_CREATE_SUCCESS: type('API_CREATE_SUCCESS'),
  API_CREATE_FAIL: type('API_CREATE_FAIL'),
  API_READ_INIT: type('API_READ_INIT'),
  API_READ_SUCCESS: type('API_READ_SUCCESS'),
  API_READ_FAIL: type('API_READ_FAIL'),
  API_UPDATE_INIT: type('API_UPDATE_INIT'),
  API_UPDATE_SUCCESS: type('API_UPDATE_SUCCESS'),
  API_UPDATE_FAIL: type('API_UPDATE_FAIL'),
  API_DELETE_INIT: type('API_DELETE_INIT'),
  API_DELETE_SUCCESS: type('API_DELETE_SUCCESS'),
  API_DELETE_FAIL: type('API_DELETE_FAIL'),
  API_APPLY_INIT: type('API_APPLY_INIT'),
  API_APPLY_SUCCESS: type('API_APPLY_SUCCESS'),
  API_APPLY_FAIL: type('API_APPLY_FAIL'),
  API_ROLLBACK: type('API_ROLLBACK'),
  QUERY_STORE_INIT: type('QUERY_STORE_INIT'),
  QUERY_STORE_SUCCESS: type('QUERY_STORE_SUCCESS'),
  QUERY_STORE_FAIL: type('QUERY_STORE_FAIL'),
  DELETE_STORE_RESOURCE: type('DELETE_STORE_RESOURCE'),
  PATCH_STORE_RESOURCE: type('PATCH_STORE_RESOURCE'),
  POST_STORE_RESOURCE: type('POST_STORE_RESOURCE'),
  REMOVE_QUERY: type('REMOVE_QUERY'),
  COMPACT_STORE: type('COMPACT_STORE'),
  CLEAR_STORE: type('CLEAR_STORE'),
};

export class ApiApplyInitAction implements Action {
  type = NgrxJsonApiActionTypes.API_APPLY_INIT;
}

export class ApiApplySuccessAction implements Action {
  type = NgrxJsonApiActionTypes.API_APPLY_SUCCESS;
  constructor(public payload: Array<Action>) { }
}

export class ApiApplyFailAction implements Action {
  type = NgrxJsonApiActionTypes.API_APPLY_FAIL;
  constructor(public payload: Array<Action>) { }
}

export class ApiCreateInitAction implements Action {
  type = NgrxJsonApiActionTypes.API_CREATE_INIT;
  constructor(public payload: Resource) { }
}

export class ApiCreateSuccessAction implements Action {
  type = NgrxJsonApiActionTypes.API_CREATE_SUCCESS;
  constructor(public payload: Payload) { }
}

export class ApiCreateFailAction implements Action {
  type = NgrxJsonApiActionTypes.API_CREATE_FAIL;
  constructor(public payload: Payload) { }
}

export class ApiDeleteInitAction implements Action {
  type = NgrxJsonApiActionTypes.API_DELETE_INIT;
  constructor(public payload: ResourceIdentifier) { }
}

export class ApiDeleteSuccessAction implements Action {
  type = NgrxJsonApiActionTypes.API_DELETE_SUCCESS;
  constructor(public payload: Payload) { }
}

export class ApiDeleteFailAction implements Action {
  type = NgrxJsonApiActionTypes.API_DELETE_FAIL;
  constructor(public payload: Payload) { }
}

export class ApiReadInitAction implements Action {
  type = NgrxJsonApiActionTypes.API_READ_INIT;
  constructor(public payload: Query) { }
}

export class ApiReadSuccessAction implements Action {
  type = NgrxJsonApiActionTypes.API_READ_SUCCESS;
  constructor(public payload: Payload) { }
}

export class ApiReadFailAction implements Action {
  type = NgrxJsonApiActionTypes.API_READ_FAIL;
  constructor(public payload: Payload) { }
}

export class ApiRollbackAction implements Action {
  type = NgrxJsonApiActionTypes.API_ROLLBACK;
  constructor() { }
}

export class ApiUpdateInitAction implements Action {
  type = NgrxJsonApiActionTypes.API_UPDATE_INIT;
  constructor(public payload: Resource) { }
}

export class ApiUpdateSuccessAction implements Action {
  type = NgrxJsonApiActionTypes.API_UPDATE_SUCCESS;
  constructor(public payload: Payload) { }
}

export class ApiUpdateFailAction implements Action {
  type = NgrxJsonApiActionTypes.API_UPDATE_FAIL;
  constructor(public payload: Payload) { }
}

export class DeleteStoreResourceAction implements Action {
  type = NgrxJsonApiActionTypes.DELETE_STORE_RESOURCE;
  constructor(public payload: ResourceIdentifier) { }
}

export class PatchStoreResourceAction implements Action {
  type = NgrxJsonApiActionTypes.PATCH_STORE_RESOURCE;
  constructor(public payload: Resource) { }
}

export class PostStoreResourceAction implements Action {
  type = NgrxJsonApiActionTypes.POST_STORE_RESOURCE;
  constructor(public payload: Resource) { }
}

export class RemoveQueryAction implements Action {
  type = NgrxJsonApiActionTypes.REMOVE_QUERY;
  constructor(public payload: string) { }
}

export class QueryStoreInitAction implements Action {
  type = NgrxJsonApiActionTypes.QUERY_STORE_INIT;
  constructor(public payload: Query) { }
}

export class QueryStoreSuccessAction implements Action {
  type = NgrxJsonApiActionTypes.QUERY_STORE_SUCCESS;
  constructor(public payload: Payload) { }
}

export class QueryStoreFailAction implements Action {
  type = NgrxJsonApiActionTypes.QUERY_STORE_FAIL;
  constructor(public payload: Payload) { }
}

export class CompactStoreAction implements Action {
  type = NgrxJsonApiActionTypes.COMPACT_STORE;
  constructor(public payload: Payload) { }
}

export class ClearStoreAction implements Action {
  type = NgrxJsonApiActionTypes.CLEAR_STORE;
  constructor(public payload: Payload) { }
}

export type NgrxJsonApiActions
  = ApiApplyInitAction
  | ApiApplySuccessAction
  | ApiApplyFailAction
  | ApiCreateInitAction
  | ApiCreateSuccessAction
  | ApiCreateFailAction
  | ApiDeleteInitAction
  | ApiDeleteSuccessAction
  | ApiDeleteFailAction
  | ApiReadInitAction
  | ApiReadSuccessAction
  | ApiReadFailAction
  | ApiRollbackAction
  | ApiUpdateInitAction
  | ApiUpdateSuccessAction
  | ApiUpdateFailAction
  | DeleteStoreResourceAction
  | PatchStoreResourceAction
  | PostStoreResourceAction
  | RemoveQueryAction
  | QueryStoreInitAction
  | QueryStoreSuccessAction
  | QueryStoreFailAction
  | CompactStoreAction
  | ClearStoreAction;
