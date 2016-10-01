import {
    async,
    inject,
    fakeAsync,
    TestBed
} from '@angular/core/testing';

import {
    NgrxJsonApiActionTypes,
    ApiCreateInitAction,
    ApiCreateSuccessAction,
    ApiCreateFailAction,
    ApiUpdateInitAction,
    ApiUpdateSuccessAction,
    ApiUpdateFailAction,
    ApiReadInitAction,
    ApiReadSuccessAction,
    ApiReadFailAction,
    ApiDeleteInitAction,
    ApiDeleteSuccessAction,
    ApiDeleteFailAction,
    DeleteFromStateAction
} from '../src/actions';

describe('Json Api Actions', () => {

    let actions;

    it('should have a create init action', () => {
        expect(NgrxJsonApiActionTypes.API_CREATE_INIT).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_CREATE_INIT).toBe('API_CREATE_INIT');
    });

    it('should have a create sueccess action', () => {
        expect(NgrxJsonApiActionTypes.API_CREATE_SUCCESS).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_CREATE_SUCCESS).toBe('API_CREATE_SUCCESS');
    });

    it('should have a create fail action', () => {
        expect(NgrxJsonApiActionTypes.API_CREATE_FAIL).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_CREATE_FAIL).toBe('API_CREATE_FAIL');
    });

    it('should have a read init action', () => {
        expect(NgrxJsonApiActionTypes.API_READ_INIT).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_READ_INIT).toBe('API_READ_INIT');
    });

    it('should have a read sueccess action', () => {
        expect(NgrxJsonApiActionTypes.API_READ_SUCCESS).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_READ_SUCCESS).toBe('API_READ_SUCCESS');
    });

    it('should have a read fail action', () => {
        expect(NgrxJsonApiActionTypes.API_READ_FAIL).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_READ_FAIL).toBe('API_READ_FAIL');
    });

    it('should have a update init action', () => {
        expect(NgrxJsonApiActionTypes.API_UPDATE_INIT).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_UPDATE_INIT).toBe('API_UPDATE_INIT');
    });

    it('should have a update success action', () => {
        expect(NgrxJsonApiActionTypes.API_UPDATE_SUCCESS).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_UPDATE_SUCCESS).toBe('API_UPDATE_SUCCESS');
    });

    it('should have a update fail action', () => {
        expect(NgrxJsonApiActionTypes.API_UPDATE_FAIL).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_UPDATE_FAIL).toBe('API_UPDATE_FAIL');
    });

    it('should have a delete init action', () => {
        expect(NgrxJsonApiActionTypes.API_DELETE_INIT).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_DELETE_INIT).toBe('API_DELETE_INIT');
    });

    it('should have a delete sueccess action', () => {
        expect(NgrxJsonApiActionTypes.API_DELETE_SUCCESS).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_DELETE_SUCCESS).toBe('API_DELETE_SUCCESS');
    });

    it('should have a delete fail action', () => {
        expect(NgrxJsonApiActionTypes.API_DELETE_FAIL).toBeDefined();
        expect(NgrxJsonApiActionTypes.API_DELETE_FAIL).toBe('API_DELETE_FAIL');
    });

    it('should have a delete from state action', () => {
        expect(NgrxJsonApiActionTypes.DELETE_FROM_STATE).toBeDefined();
        expect(NgrxJsonApiActionTypes.DELETE_FROM_STATE).toBe('DELETE_FROM_STATE');
    });

    it('should generate a create init action using apiCreateInit', () => {
      let action = new ApiCreateInitAction({})
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_CREATE_INIT);
        expect(action.payload).toEqual({});
    });

    it('should generate a create sueccess action using apiCreateSuccess', () => {
      let action = new ApiCreateSuccessAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_CREATE_SUCCESS);
        expect(action.payload).toEqual({});
    });

    it('should generate a create fail action using apiCreateFail', () => {
      let action = new ApiCreateFailAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_CREATE_FAIL)
        expect(action.payload).toEqual({});
    });

    it('should generate a read init action using apiReadInit', () => {
      let action = new ApiReadInitAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_READ_INIT)
        expect(action.payload).toEqual({});
    });

    it('should generate a read success action using apiReadSuccess', () => {
      let action = new ApiReadSuccessAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_READ_SUCCESS);
        expect(action.payload).toEqual({});
    });

    it('should generate a read fail action using apiReadFail', () => {
      let action = new ApiReadFailAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_READ_FAIL);
        expect(action.payload).toEqual({});
    });

    it('should generate an update init action using apiUpdateInit', () => {
      let action = new ApiUpdateInitAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_UPDATE_INIT);
        expect(action.payload).toEqual({});
    });

    it('should generate an update success action using apiUpdateSuccess', () => {
      let action = new ApiUpdateSuccessAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_UPDATE_SUCCESS);
        expect(action.payload).toEqual({});
    });

    it('should generate an update fail action using apiUpdateFail', () => {
      let action = new ApiUpdateFailAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_UPDATE_FAIL);
        expect(action.payload).toEqual({});
    });

    it('should generate a delete init action using apiDeleteInit', () => {
      let action = new ApiDeleteInitAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_DELETE_INIT);
        expect(action.payload).toEqual({});
    });

    it('should generate a delete success action using apiDeleteSuccess', () => {
      let action = new ApiDeleteSuccessAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_DELETE_SUCCESS);
        expect(action.payload).toEqual({});
    });

    it('should generate a delete fail action using apiDeleteFail', () => {
      let action = new ApiDeleteFailAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.API_DELETE_FAIL)
        expect(action.payload).toEqual({});
    });

    it('should generate a delete from state action using deleteFromState', () => {
      let action = new DeleteFromStateAction({});
        expect(action.type).toEqual(NgrxJsonApiActionTypes.DELETE_FROM_STATE);
        expect(action.payload).toEqual({});
    });

});
