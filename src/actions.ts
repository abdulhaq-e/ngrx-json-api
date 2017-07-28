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
  API_POST_INIT: '[NgrxJsonApi] API_POST_INIT',
  API_POST_SUCCESS: '[NgrxJsonApi] API_POST_SUCCESS',
  API_POST_FAIL: '[NgrxJsonApi] API_POST_FAIL',
  API_GET_INIT: '[NgrxJsonApi] API_GET_INIT',
  API_GET_SUCCESS: '[NgrxJsonApi] API_GET_SUCCESS',
  API_GET_FAIL: '[NgrxJsonApi] API_GET_FAIL',
  API_PATCH_INIT: '[NgrxJsonApi] API_PATCH_INIT',
  API_PATCH_SUCCESS: '[NgrxJsonApi] API_PATCH_SUCCESS',
  API_PATCH_FAIL: '[NgrxJsonApi] API_PATCH_FAIL',
  API_DELETE_INIT: '[NgrxJsonApi] API_DELETE_INIT',
  API_DELETE_SUCCESS: '[NgrxJsonApi] API_DELETE_SUCCESS',
  API_DELETE_FAIL: '[NgrxJsonApi] API_DELETE_FAIL',
  API_APPLY_INIT: '[NgrxJsonApi] API_APPLY_INIT',
  API_APPLY_SUCCESS: '[NgrxJsonApi] API_APPLY_SUCCESS',
  API_APPLY_FAIL: '[NgrxJsonApi] API_APPLY_FAIL',
  API_ROLLBACK: '[NgrxJsonApi] API_ROLLBACK',
  API_QUERY_REFRESH: '[NgrxJsonApi] API_QUERY_REFRESH',
  LOCAL_QUERY_INIT: '[NgrxJsonApi] LOCAL_QUERY_INIT',
  LOCAL_QUERY_SUCCESS: '[NgrxJsonApi] LOCAL_QUERY_SUCCESS',
  LOCAL_QUERY_FAIL: '[NgrxJsonApi] LOCAL_QUERY_FAIL',
  DELETE_STORE_RESOURCE: '[NgrxJsonApi] DELETE_STORE_RESOURCE',
  PATCH_STORE_RESOURCE: '[NgrxJsonApi] PATCH_STORE_RESOURCE',
  NEW_STORE_RESOURCE: '[NgrxJsonApi] NEW_STORE_RESOURCE',
  POST_STORE_RESOURCE: '[NgrxJsonApi] POST_STORE_RESOURCE',
  MODIFY_STORE_RESOURCE_ERRORS: '[NgrxJsonApi] MODIFY_STORE_RESOURCE_ERRORS',
  REMOVE_QUERY: '[NgrxJsonApi] REMOVE_QUERY',
  COMPACT_STORE: '[NgrxJsonApi] COMPACT_STORE',
  CLEAR_STORE: '[NgrxJsonApi] CLEAR_STORE',
};

export class ApiApplyInitAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_APPLY_INIT;
}

export class ApiApplySuccessAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_APPLY_SUCCESS;
  constructor(public payload: Array<Action>) { }
}

export class ApiApplyFailAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_APPLY_FAIL;
  constructor(public payload: Array<Action>) { }
}

export class ApiPostInitAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_POST_INIT;
  constructor(public payload: Resource) { }
}

export class ApiPostSuccessAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_POST_SUCCESS;
  constructor(public payload: Payload) { }
}

export class ApiPostFailAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_POST_FAIL;
  constructor(public payload: Payload) { }
}

export class ApiDeleteInitAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_DELETE_INIT;
  constructor(public payload: ResourceIdentifier) { }
}

export class ApiDeleteSuccessAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_DELETE_SUCCESS;
  constructor(public payload: Payload) { }
}

export class ApiDeleteFailAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_DELETE_FAIL;
  constructor(public payload: Payload) { }
}

export class ApiGetInitAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_GET_INIT;
  constructor(public payload: Query) { }
}

export class ApiGetSuccessAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_GET_SUCCESS;
  constructor(public payload: Payload) { }
}

export class ApiGetFailAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_GET_FAIL;
  constructor(public payload: Payload) { }
}

export class ApiRollbackAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_ROLLBACK;
  constructor() { }
}

export class ApiPatchInitAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_PATCH_INIT;
  constructor(public payload: Resource) { }
}

export class ApiPatchSuccessAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_PATCH_SUCCESS;
  constructor(public payload: Payload) { }
}

export class ApiPatchFailAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_PATCH_FAIL;
  constructor(public payload: Payload) { }
}

export class DeleteStoreResourceAction implements Action {
  readonly type = NgrxJsonApiActionTypes.DELETE_STORE_RESOURCE;
  constructor(public payload: ResourceIdentifier) { }
}

export class PatchStoreResourceAction implements Action {
  readonly type = NgrxJsonApiActionTypes.PATCH_STORE_RESOURCE;
  constructor(public payload: Resource) { }
}

export class NewStoreResourceAction implements Action {
  readonly type = NgrxJsonApiActionTypes.NEW_STORE_RESOURCE;
  constructor(public payload: Resource) { }
}

export class PostStoreResourceAction implements Action {
  readonly type = NgrxJsonApiActionTypes.POST_STORE_RESOURCE;
  constructor(public payload: Resource) { }
}

export class RemoveQueryAction implements Action {
  readonly type = NgrxJsonApiActionTypes.REMOVE_QUERY;
  constructor(public payload: string) { }
}

export class LocalQueryInitAction implements Action {
  readonly type = NgrxJsonApiActionTypes.LOCAL_QUERY_INIT;
  constructor(public payload: Query) { }
}

export class LocalQuerySuccessAction implements Action {
  readonly type = NgrxJsonApiActionTypes.LOCAL_QUERY_SUCCESS;
  constructor(public payload: Payload) { }
}

export class LocalQueryFailAction implements Action {
  readonly type = NgrxJsonApiActionTypes.LOCAL_QUERY_FAIL;
  constructor(public payload: Payload) { }
}

export class CompactStoreAction implements Action {
  readonly type = NgrxJsonApiActionTypes.COMPACT_STORE;
  constructor() { }
}

export class ClearStoreAction implements Action {
  readonly type = NgrxJsonApiActionTypes.CLEAR_STORE;
  constructor() { }
}

export class ApiQueryRefreshAction implements Action {
  readonly type = NgrxJsonApiActionTypes.API_QUERY_REFRESH;
  constructor(public payload: string) {
    if (!payload) {
      throw new Error('no query id provided for ApiQueryRefreshAction');
    }
  }
}

export class ModifyStoreResourceErrorsAction implements Action {
  readonly type = NgrxJsonApiActionTypes.MODIFY_STORE_RESOURCE_ERRORS;
  constructor(public payload: ModifyStoreResourceErrorsPayload) { }
}

export type NgrxJsonApiActions
  = ApiApplyInitAction
  | ApiApplySuccessAction
  | ApiApplyFailAction
  | ApiPostInitAction
  | ApiPostSuccessAction
  | ApiPostFailAction
  | ApiDeleteInitAction
  | ApiDeleteSuccessAction
  | ApiDeleteFailAction
  | ApiGetInitAction
  | ApiGetSuccessAction
  | ApiGetFailAction
  | ApiRollbackAction
  | ApiPatchInitAction
  | ApiPatchSuccessAction
  | ApiPatchFailAction
  | DeleteStoreResourceAction
  | PatchStoreResourceAction
  | PostStoreResourceAction
  | NewStoreResourceAction
  | RemoveQueryAction
  | ApiQueryRefreshAction
  | LocalQueryInitAction
  | LocalQuerySuccessAction
  | LocalQueryFailAction
  | ModifyStoreResourceErrorsAction
  | CompactStoreAction
  | ClearStoreAction;
