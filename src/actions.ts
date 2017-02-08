import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';

import {
  Payload,
  Resource,
  ResourceIdentifier,
  Query,
  ModifyStoreResourceErrorsPayload
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
  API_QUERY_REFRESH: type('API_QUERY_REFRESH'),
  LOCAL_QUERY_INIT: type('LOCAL_QUERY_INIT'),
  LOCAL_QUERY_SUCCESS: type('LOCAL_QUERY_SUCCESS'),
  LOCAL_QUERY_FAIL: type('LOCAL_QUERY_FAIL'),
  DELETE_STORE_RESOURCE: type('DELETE_STORE_RESOURCE'),
  PATCH_STORE_RESOURCE: type('PATCH_STORE_RESOURCE'),
  POST_STORE_RESOURCE: type('POST_STORE_RESOURCE'),
  MODIFY_STORE_RESOURCE_ERRORS: type('MODIFY_STORE_RESOURCE_ERRORS'),
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

export class LocalQueryInitAction implements Action {
  type = NgrxJsonApiActionTypes.LOCAL_QUERY_INIT;
  constructor(public payload: Query) { }
}

export class LocalQuerySuccessAction implements Action {
  type = NgrxJsonApiActionTypes.LOCAL_QUERY_SUCCESS;
  constructor(public payload: Payload) { }
}

export class LocalQueryFailAction implements Action {
  type = NgrxJsonApiActionTypes.LOCAL_QUERY_FAIL;
  constructor(public payload: Payload) { }
}

export class CompactStoreAction implements Action {
  type = NgrxJsonApiActionTypes.COMPACT_STORE;
  constructor() { }
}

export class ClearStoreAction implements Action {
  type = NgrxJsonApiActionTypes.CLEAR_STORE;
  constructor() { }
}

export class ApiQueryRefreshAction implements Action {
  type = NgrxJsonApiActionTypes.API_QUERY_REFRESH;
  constructor(public payload: string) {
    if (!payload) {
      throw new Error('no query id provided for ApiQueryRefreshAction');
    }
  }
}

export class ModifyStoreResourceErrorsAction implements Action {
  type = NgrxJsonApiActionTypes.MODIFY_STORE_RESOURCE_ERRORS;
  constructor(public payload: ModifyStoreResourceErrorsPayload) { }
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
  | ApiQueryRefreshAction
  | LocalQueryInitAction
  | LocalQuerySuccessAction
  | LocalQueryFailAction
  | ModifyStoreResourceErrorsAction
  | CompactStoreAction
  | ClearStoreAction;
