import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';

@Injectable()
export class JsonApiActions {

  static API_CREATE_INIT = 'API_CREATE_INIT';
  static API_CREATE_SUCCESS = 'API_CREATE_SUCCESS';
  static API_CREATE_FAIL = 'API_CREATE_FAIL';

  static API_READ_INIT = 'API_READ_INIT';
  static API_READ_SUCCESS = 'API_READ_SUCCESS';
  static API_READ_FAIL = 'API_READ_FAIL';

  static API_UPDATE_INIT = 'API_UPDATE_INIT';
  static API_UPDATE_SUCCESS = 'API_UPDATE_SUCCESS';
  static API_UPDATE_FAIL = 'API_UPDATE_FAIL';

  static API_DELETE_INIT = 'API_DELETE_INIT';
  static API_DELETE_SUCCESS = 'API_DELETE_SUCCESS';
  static API_DELETE_FAIL = 'API_DELETE_FAIL';

  apiCreateInit(payload: any): Action {
    return {
      type: JsonApiActions.API_CREATE_INIT,
      payload: payload
    };
  }

  apiCreateSuccess(payload: any) {
    return {
      type: JsonApiActions.API_CREATE_SUCCESS,
      payload: payload
    };
  }

  apiCreateFail(payload: any) {
    return {
      type: JsonApiActions.API_CREATE_FAIL,
      payload: payload
    };
  }

  apiReadInit(payload: any): Action {
    return {
      type: JsonApiActions.API_READ_INIT,
      payload: payload
    };
  }

  apiReadSuccess(payload: any) {
    return {
      type: JsonApiActions.API_READ_SUCCESS,
      payload: payload
    };
  }

  apiReadFail(payload: any) {
    return {
      type: JsonApiActions.API_READ_FAIL,
      payload: payload
    };
  }

  apiUpdateInit(payload: any): Action {
    return {
      type: JsonApiActions.API_UPDATE_INIT,
      payload: payload
    };
  }

  apiUpdateSuccess(payload: any) {
    return {
      type: JsonApiActions.API_UPDATE_SUCCESS,
      payload: payload
    };
  }

  apiUpdateFail(payload: any) {
    return {
      type: JsonApiActions.API_UPDATE_FAIL,
      payload: payload
    };
  }

  apiDeleteInit(payload: any): Action {
    return {
      type: JsonApiActions.API_DELETE_INIT,
      payload: payload
    };
  }

  apiDeleteSuccess(payload: any) {
    return {
      type: JsonApiActions.API_DELETE_SUCCESS,
      payload: payload
    };
  }

  apiDeleteFail(payload: any) {
    return {
      type: JsonApiActions.API_DELETE_FAIL,
      payload: payload
    };
  }

}
