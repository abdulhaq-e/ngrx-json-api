import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';

export class NgrxJsonApiActions {

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

  static DELETE_FROM_STATE = 'DELETE_FROM_STATE';

  static apiCreateInit(payload: any): Action {
    return {
      type: NgrxJsonApiActions.API_CREATE_INIT,
      payload: payload
    };
  }

  static apiCreateSuccess(payload: any) {
    return {
      type: NgrxJsonApiActions.API_CREATE_SUCCESS,
      payload: payload
    };
  }

  static apiCreateFail(payload: any) {
    return {
      type: NgrxJsonApiActions.API_CREATE_FAIL,
      payload: payload
    };
  }

  static apiReadInit(payload: any): Action {
    return {
      type: NgrxJsonApiActions.API_READ_INIT,
      payload: payload
    };
  }

  static apiReadSuccess(payload: any) {
    return {
      type: NgrxJsonApiActions.API_READ_SUCCESS,
      payload: payload
    };
  }

  static apiReadFail(payload: any) {
    return {
      type: NgrxJsonApiActions.API_READ_FAIL,
      payload: payload
    };
  }

  static apiUpdateInit(payload: any): Action {
    return {
      type: NgrxJsonApiActions.API_UPDATE_INIT,
      payload: payload
    };
  }

  static apiUpdateSuccess(payload: any) {
    return {
      type: NgrxJsonApiActions.API_UPDATE_SUCCESS,
      payload: payload
    };
  }

  static apiUpdateFail(payload: any) {
    return {
      type: NgrxJsonApiActions.API_UPDATE_FAIL,
      payload: payload
    };
  }

  static apiDeleteInit(payload: any): Action {
    return {
      type: NgrxJsonApiActions.API_DELETE_INIT,
      payload: payload
    };
  }

  static apiDeleteSuccess(payload: any) {
    return {
      type: NgrxJsonApiActions.API_DELETE_SUCCESS,
      payload: payload
    };
  }

  static apiDeleteFail(payload: any) {
    return {
      type: NgrxJsonApiActions.API_DELETE_FAIL,
      payload: payload
    };
  }

  static deleteFromState(payload: any) {
    return {
      type: NgrxJsonApiActions.DELETE_FROM_STATE,
      payload: payload
    }
  }

}
