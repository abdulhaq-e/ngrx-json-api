import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';

import { Payload, Resource, ResourceIdentifier } from './interfaces';
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
    API_POST_STORE_RESOURCE: type('API_POST_STORE_RESOURCE'),
    API_PATCH_STORE_RESOURCE: type('API_PATCH_STORE_RESOURCE'),
    API_DELETE_STORE_RESOURCE: type('API_DELETE_STORE_RESOURCE'),
    API_COMMIT_INIT: type('API_COMMIT_INIT'),
    API_COMMIT_SUCCESS: type('API_COMMIT_SUCCESS'),
    API_COMMIT_FAIL: type('API_COMMIT_FAIL'),
    API_ROLLBACK: type('API_ROLLBACK'),
    DELETE_FROM_STATE: type('DELETE_FROM_STATE')
}

export class ApiCreateInitAction implements Action {
    type = NgrxJsonApiActionTypes.API_CREATE_INIT;
    constructor(public payload: Payload) { }
}

export class ApiCreateSuccessAction implements Action {
    type = NgrxJsonApiActionTypes.API_CREATE_SUCCESS;
    constructor(public payload: Payload) { }
}

export class ApiCreateFailAction implements Action {
    type = NgrxJsonApiActionTypes.API_CREATE_FAIL;
    constructor(public payload: Payload) { }
}

export class ApiReadInitAction implements Action {
    type = NgrxJsonApiActionTypes.API_READ_INIT;
    constructor(public payload: Payload) { }
}

export class ApiReadSuccessAction implements Action {
    type = NgrxJsonApiActionTypes.API_READ_SUCCESS;
    constructor(public payload: Payload) { }
}

export class ApiReadFailAction implements Action {
    type = NgrxJsonApiActionTypes.API_READ_FAIL;
    constructor(public payload: Payload) { }
}

export class ApiUpdateInitAction implements Action {
    type = NgrxJsonApiActionTypes.API_UPDATE_INIT;
    constructor(public payload: Payload) { }
}

export class ApiUpdateSuccessAction implements Action {
    type = NgrxJsonApiActionTypes.API_UPDATE_SUCCESS;
    constructor(public payload: Payload) {console.log("update success", payload); }
}

export class ApiUpdateFailAction implements Action {
    type = NgrxJsonApiActionTypes.API_UPDATE_FAIL;
    constructor(public payload: Payload) {console.log("update failed", payload); }
}

export class ApiDeleteInitAction implements Action {
    type = NgrxJsonApiActionTypes.API_DELETE_INIT;
    constructor(public payload: Payload) { }
}

export class ApiDeleteSuccessAction implements Action {
    type = NgrxJsonApiActionTypes.API_DELETE_SUCCESS;
    constructor(public payload: Payload) { }
}

export class ApiDeleteFailAction implements Action {
    type = NgrxJsonApiActionTypes.API_DELETE_FAIL;
    constructor(public payload: Payload) { }
}

export class DeleteFromStateAction implements Action {
    type = NgrxJsonApiActionTypes.DELETE_FROM_STATE;
    constructor(public payload: Payload) { }
}

export class ApiPostStoreResourceAction implements Action {
    type = NgrxJsonApiActionTypes.API_POST_STORE_RESOURCE;
    constructor(public payload: Resource) { }
}

export class ApiPatchStoreResourceAction implements Action {
    type = NgrxJsonApiActionTypes.API_PATCH_STORE_RESOURCE;
    constructor(public payload: Resource) { }
}

export class ApiDeleteStoreResourceAction implements Action {
    type = NgrxJsonApiActionTypes.API_DELETE_STORE_RESOURCE;
    constructor(public payload: ResourceIdentifier) { }
}

export class ApiCommitInitAction implements Action {
    type = NgrxJsonApiActionTypes.API_COMMIT_INIT;
    constructor(public payload : String) { }
}

export class ApiCommitSuccessAction implements Action {
    type = NgrxJsonApiActionTypes.API_COMMIT_SUCCESS;
    constructor(public payload : Array<Action>) {}
}

export class ApiCommitFailAction implements Action {
    type = NgrxJsonApiActionTypes.API_COMMIT_FAIL;
    constructor(public payload : Array<Action>) { }
}

export class ApiRollbackAction implements Action {
    type = NgrxJsonApiActionTypes.API_ROLLBACK;
    constructor() { }
}

export type NgrxJsonApiActions
    = ApiCreateInitAction
    | ApiCreateSuccessAction
    | ApiCreateFailAction
    | ApiUpdateInitAction
    | ApiUpdateSuccessAction
    | ApiUpdateFailAction
    | ApiReadInitAction
    | ApiReadSuccessAction
    | ApiReadFailAction
    | ApiDeleteInitAction
    | ApiDeleteSuccessAction
    | ApiDeleteFailAction
    | DeleteFromStateAction
    | ApiPatchStoreResourceAction
    | ApiDeleteStoreResourceAction
    | ApiPostStoreResourceAction
    | ApiCommitInitAction
    | ApiCommitSuccessAction
    | ApiCommitFailAction
    | ApiRollbackAction
