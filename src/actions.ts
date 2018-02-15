import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';

import {
  Payload,
  Resource,
  ResourceIdentifier,
  Query,
  ModifyStoreResourceErrorsPayload,
} from './interfaces';

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

export interface ApiApplyInitPayload {
  /**
   * optional list of resource identifiers to perform apply. If not specified all change will be applied
   * to the backend.
   */
  ids?: Array<ResourceIdentifier>;

  /**
   * if the apply action is restricted to a set of resources with the ids parameter. The include flag allows to
   * specify which relationships to apply as well. Nested relationships are separated by a dot.
   */
  include?: Array<string>;
}

export interface ApiApplyRollbackPayload extends ApiApplyInitPayload {}

export abstract class NgrxJsonApiAction implements Action {
  abstract zoneId?: string;
  abstract type: string;
  constructor() {}
}

export class ApiApplyInitAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_APPLY_INIT;
  constructor(public payload: ApiApplyInitPayload, public zoneId: string) {
    super();
  }
}

export class ApiApplySuccessAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_APPLY_SUCCESS;
  constructor(public payload: Array<Action>, public zoneId: string) {
    super();
  }
}

export class ApiApplyFailAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_APPLY_FAIL;
  constructor(public payload: Array<Action>, public zoneId: string) {
    super();
  }
}

export class ApiPostInitAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_POST_INIT;
  constructor(public payload: Resource, public zoneId: string) {
    super();
  }
}

export class ApiPostSuccessAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_POST_SUCCESS;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class ApiPostFailAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_POST_FAIL;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class ApiDeleteInitAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_DELETE_INIT;
  constructor(public payload: ResourceIdentifier, public zoneId: string) {
    super();
  }
}

export class ApiDeleteSuccessAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_DELETE_SUCCESS;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class ApiDeleteFailAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_DELETE_FAIL;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class ApiGetInitAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_GET_INIT;
  constructor(public payload: Query, public zoneId: string) {
    super();
  }
}

export class ApiGetSuccessAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_GET_SUCCESS;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class ApiGetFailAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_GET_FAIL;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class ApiRollbackAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_ROLLBACK;
  constructor(public payload: ApiApplyRollbackPayload, public zoneId: string) {
    super();
  }
}

export class ApiPatchInitAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_PATCH_INIT;
  constructor(public payload: Resource, public zoneId: string) {
    super();
  }
}

export class ApiPatchSuccessAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_PATCH_SUCCESS;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class ApiPatchFailAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_PATCH_FAIL;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class DeleteStoreResourceAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.DELETE_STORE_RESOURCE;
  constructor(public payload: ResourceIdentifier, public zoneId: string) {
    super();
  }
}

export class PatchStoreResourceAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.PATCH_STORE_RESOURCE;
  constructor(public payload: Resource, public zoneId: string) {
    super();
  }
}

export class NewStoreResourceAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.NEW_STORE_RESOURCE;
  constructor(public payload: Resource, public zoneId: string) {
    super();
  }
}

export class PostStoreResourceAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.POST_STORE_RESOURCE;
  constructor(public payload: Resource, public zoneId: string) {
    super();
  }
}

export class RemoveQueryAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.REMOVE_QUERY;
  constructor(public payload: string, public zoneId: string) {
    super();
  }
}

export class LocalQueryInitAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.LOCAL_QUERY_INIT;
  constructor(public payload: Query, public zoneId: string) {
    super();
  }
}

export class LocalQuerySuccessAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.LOCAL_QUERY_SUCCESS;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class LocalQueryFailAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.LOCAL_QUERY_FAIL;
  constructor(public payload: Payload, public zoneId: string) {
    super();
  }
}

export class CompactStoreAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.COMPACT_STORE;
  constructor(public zoneId: string) {
    super();
  }
}

export class ClearStoreAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.CLEAR_STORE;
  constructor(public zoneId: string) {
    super();
  }
}

export class ApiQueryRefreshAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.API_QUERY_REFRESH;
  constructor(public payload: string, public zoneId: string) {
    super();
    if (!payload) {
      throw new Error('no query id provided for ApiQueryRefreshAction');
    }
  }
}

export class ModifyStoreResourceErrorsAction extends NgrxJsonApiAction {
  readonly type = NgrxJsonApiActionTypes.MODIFY_STORE_RESOURCE_ERRORS;
  constructor(
    public payload: ModifyStoreResourceErrorsPayload,
    public zoneId: string
  ) {
    super();
  }
}

export type NgrxJsonApiActions =
  | ApiApplyInitAction
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
