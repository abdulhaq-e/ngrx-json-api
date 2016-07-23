import { addProviders,
  async,
  inject,
  fakeAsync,
} from '@angular/core/testing';

import { JsonApiActions } from '../lib/actions';

describe('Json Api Actions', () => {

  let actions;

  beforeEach(() => {
    addProviders([JsonApiActions]);
  });

  beforeEach(inject([JsonApiActions], (api) => {
    actions = api;
  }));


  it('should have a create init action', () => {
    expect(JsonApiActions.API_CREATE_INIT).toBeDefined();
    expect(JsonApiActions.API_CREATE_INIT).toBe('API_CREATE_INIT');
  });

  it('should have a create sueccess action', () => {
    expect(JsonApiActions.API_CREATE_SUCCESS).toBeDefined();
    expect(JsonApiActions.API_CREATE_SUCCESS).toBe('API_CREATE_SUCCESS');
  });

  it('should have a create fail action', () => {
    expect(JsonApiActions.API_CREATE_FAIL).toBeDefined();
    expect(JsonApiActions.API_CREATE_FAIL).toBe('API_CREATE_FAIL');
  });

  it('should have a read init action', () => {
    expect(JsonApiActions.API_READ_INIT).toBeDefined();
    expect(JsonApiActions.API_READ_INIT).toBe('API_READ_INIT');
  });

  it('should have a read sueccess action', () => {
    expect(JsonApiActions.API_READ_SUCCESS).toBeDefined();
    expect(JsonApiActions.API_READ_SUCCESS).toBe('API_READ_SUCCESS');
  });

  it('should have a read fail action', () => {
    expect(JsonApiActions.API_READ_FAIL).toBeDefined();
    expect(JsonApiActions.API_READ_FAIL).toBe('API_READ_FAIL');
  });

  it('should have a update init action', () => {
    expect(JsonApiActions.API_UPDATE_INIT).toBeDefined();
    expect(JsonApiActions.API_UPDATE_INIT).toBe('API_UPDATE_INIT');
  });

  it('should have a update sueccess action', () => {
    expect(JsonApiActions.API_UPDATE_SUCCESS).toBeDefined();
    expect(JsonApiActions.API_UPDATE_SUCCESS).toBe('API_UPDATE_SUCCESS');
  });

  it('should have a update fail action', () => {
    expect(JsonApiActions.API_UPDATE_FAIL).toBeDefined();
    expect(JsonApiActions.API_UPDATE_FAIL).toBe('API_UPDATE_FAIL');
  });

  it('should have a delete init action', () => {
    expect(JsonApiActions.API_DELETE_INIT).toBeDefined();
    expect(JsonApiActions.API_DELETE_INIT).toBe('API_DELETE_INIT');
  });

  it('should have a delete sueccess action', () => {
    expect(JsonApiActions.API_DELETE_SUCCESS).toBeDefined();
    expect(JsonApiActions.API_DELETE_SUCCESS).toBe('API_DELETE_SUCCESS');
  });

  it('should have a delete fail action', () => {
    expect(JsonApiActions.API_DELETE_FAIL).toBeDefined();
    expect(JsonApiActions.API_DELETE_FAIL).toBe('API_DELETE_FAIL');
  });

  it('should create a create init action using apiCreateInit', () => {
    expect(actions.apiCreateInit('test')).toEqual({
      type: JsonApiActions.API_CREATE_INIT,
      payload: 'test'
    });
  });

  it('should create a create sueccess action using apiCreateSuccess', () => {
    expect(actions.apiCreateSuccess('test')).toEqual({
      type: JsonApiActions.API_CREATE_SUCCESS,
      payload: 'test'
    });
  });

  it('should create a create fail action using apiCreateFail', () => {
    expect(actions.apiCreateFail('test')).toEqual({
      type: JsonApiActions.API_CREATE_FAIL,
      payload: 'test'
    });
  });

  it('should create a read init action using apiReadInit', () => {
    expect(actions.apiReadInit('test')).toEqual({
      type: JsonApiActions.API_READ_INIT,
      payload: 'test'
    });
  });

  it('should create a read success action using apiReadSuccess', () => {
    expect(actions.apiReadSuccess('test')).toEqual({
      type: JsonApiActions.API_READ_SUCCESS,
      payload: 'test'
    });
  });

  it('should create a read fail action using apiReadFail', () => {
    expect(actions.apiReadFail('test')).toEqual({
      type: JsonApiActions.API_READ_FAIL,
      payload: 'test'
    });
  });

  it('should create an update init action using apiUpdateInit', () => {
    expect(actions.apiUpdateInit('test')).toEqual({
      type: JsonApiActions.API_UPDATE_INIT,
      payload: 'test'
    });
  });

  it('should create an update success action using apiUpdateSuccess', () => {
    expect(actions.apiUpdateSuccess('test')).toEqual({
      type: JsonApiActions.API_UPDATE_SUCCESS,
      payload: 'test'
    });
  });

  it('should create an update fail action using apiUpdateFail', () => {
    expect(actions.apiUpdateFail('test')).toEqual({
      type: JsonApiActions.API_UPDATE_FAIL,
      payload: 'test'
    });

  });

  it('should create a delete init action using apiDeleteInit', () => {
    expect(actions.apiDeleteInit('test')).toEqual({
      type: JsonApiActions.API_DELETE_INIT,
      payload: 'test'
    });
  });

  it('should create a delete success action using apiDeleteSuccess', () => {
    expect(actions.apiDeleteSuccess('test')).toEqual({
      type: JsonApiActions.API_DELETE_SUCCESS,
      payload: 'test'
    });
  });

  it('should create an delete fail action using apiDeleteFail', () => {
    expect(actions.apiDeleteFail('test')).toEqual({
      type: JsonApiActions.API_DELETE_FAIL,
      payload: 'test'
    });
  });


});
