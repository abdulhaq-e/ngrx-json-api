import {
    async,
    inject,
    fakeAsync,
    TestBed
} from '@angular/core/testing';

import { NgrxJsonApiActions } from '../src/actions';

describe('Json Api Actions', () => {

    let actions;

    it('should have a create init action', () => {
        expect(NgrxJsonApiActions.API_CREATE_INIT).toBeDefined();
        expect(NgrxJsonApiActions.API_CREATE_INIT).toBe('API_CREATE_INIT');
    });

    it('should have a create sueccess action', () => {
        expect(NgrxJsonApiActions.API_CREATE_SUCCESS).toBeDefined();
        expect(NgrxJsonApiActions.API_CREATE_SUCCESS).toBe('API_CREATE_SUCCESS');
    });

    it('should have a create fail action', () => {
        expect(NgrxJsonApiActions.API_CREATE_FAIL).toBeDefined();
        expect(NgrxJsonApiActions.API_CREATE_FAIL).toBe('API_CREATE_FAIL');
    });

    it('should have a read init action', () => {
        expect(NgrxJsonApiActions.API_READ_INIT).toBeDefined();
        expect(NgrxJsonApiActions.API_READ_INIT).toBe('API_READ_INIT');
    });

    it('should have a read sueccess action', () => {
        expect(NgrxJsonApiActions.API_READ_SUCCESS).toBeDefined();
        expect(NgrxJsonApiActions.API_READ_SUCCESS).toBe('API_READ_SUCCESS');
    });

    it('should have a read fail action', () => {
        expect(NgrxJsonApiActions.API_READ_FAIL).toBeDefined();
        expect(NgrxJsonApiActions.API_READ_FAIL).toBe('API_READ_FAIL');
    });

    it('should have a update init action', () => {
        expect(NgrxJsonApiActions.API_UPDATE_INIT).toBeDefined();
        expect(NgrxJsonApiActions.API_UPDATE_INIT).toBe('API_UPDATE_INIT');
    });

    it('should have a update success action', () => {
        expect(NgrxJsonApiActions.API_UPDATE_SUCCESS).toBeDefined();
        expect(NgrxJsonApiActions.API_UPDATE_SUCCESS).toBe('API_UPDATE_SUCCESS');
    });

    it('should have a update fail action', () => {
        expect(NgrxJsonApiActions.API_UPDATE_FAIL).toBeDefined();
        expect(NgrxJsonApiActions.API_UPDATE_FAIL).toBe('API_UPDATE_FAIL');
    });

    it('should have a delete init action', () => {
        expect(NgrxJsonApiActions.API_DELETE_INIT).toBeDefined();
        expect(NgrxJsonApiActions.API_DELETE_INIT).toBe('API_DELETE_INIT');
    });

    it('should have a delete sueccess action', () => {
        expect(NgrxJsonApiActions.API_DELETE_SUCCESS).toBeDefined();
        expect(NgrxJsonApiActions.API_DELETE_SUCCESS).toBe('API_DELETE_SUCCESS');
    });

    it('should have a delete fail action', () => {
        expect(NgrxJsonApiActions.API_DELETE_FAIL).toBeDefined();
        expect(NgrxJsonApiActions.API_DELETE_FAIL).toBe('API_DELETE_FAIL');
    });

    it('should have a delete from state action', () => {
        expect(NgrxJsonApiActions.DELETE_FROM_STATE).toBeDefined();
        expect(NgrxJsonApiActions.DELETE_FROM_STATE).toBe('DELETE_FROM_STATE');
    });

    it('should create a create init action using apiCreateInit', () => {
        expect(NgrxJsonApiActions.apiCreateInit('test')).toEqual({
            type: NgrxJsonApiActions.API_CREATE_INIT,
            payload: 'test'
        });
    });

    it('should create a create sueccess action using apiCreateSuccess', () => {
        expect(NgrxJsonApiActions.apiCreateSuccess('test')).toEqual({
            type: NgrxJsonApiActions.API_CREATE_SUCCESS,
            payload: 'test'
        });
    });

    it('should create a create fail action using apiCreateFail', () => {
        expect(NgrxJsonApiActions.apiCreateFail('test')).toEqual({
            type: NgrxJsonApiActions.API_CREATE_FAIL,
            payload: 'test'
        });
    });

    it('should create a read init action using apiReadInit', () => {
        expect(NgrxJsonApiActions.apiReadInit('test')).toEqual({
            type: NgrxJsonApiActions.API_READ_INIT,
            payload: 'test'
        });
    });

    it('should create a read success action using apiReadSuccess', () => {
        expect(NgrxJsonApiActions.apiReadSuccess('test')).toEqual({
            type: NgrxJsonApiActions.API_READ_SUCCESS,
            payload: 'test'
        });
    });

    it('should create a read fail action using apiReadFail', () => {
        expect(NgrxJsonApiActions.apiReadFail('test')).toEqual({
            type: NgrxJsonApiActions.API_READ_FAIL,
            payload: 'test'
        });
    });

    it('should create an update init action using apiUpdateInit', () => {
        expect(NgrxJsonApiActions.apiUpdateInit('test')).toEqual({
            type: NgrxJsonApiActions.API_UPDATE_INIT,
            payload: 'test'
        });
    });

    it('should create an update success action using apiUpdateSuccess', () => {
        expect(NgrxJsonApiActions.apiUpdateSuccess('test')).toEqual({
            type: NgrxJsonApiActions.API_UPDATE_SUCCESS,
            payload: 'test'
        });
    });

    it('should create an update fail action using apiUpdateFail', () => {
        expect(NgrxJsonApiActions.apiUpdateFail('test')).toEqual({
            type: NgrxJsonApiActions.API_UPDATE_FAIL,
            payload: 'test'
        });

    });

    it('should create a delete init action using apiDeleteInit', () => {
        expect(NgrxJsonApiActions.apiDeleteInit('test')).toEqual({
            type: NgrxJsonApiActions.API_DELETE_INIT,
            payload: 'test'
        });
    });

    it('should create a delete success action using apiDeleteSuccess', () => {
        expect(NgrxJsonApiActions.apiDeleteSuccess('test')).toEqual({
            type: NgrxJsonApiActions.API_DELETE_SUCCESS,
            payload: 'test'
        });
    });

    it('should create an delete fail action using apiDeleteFail', () => {
        expect(NgrxJsonApiActions.apiDeleteFail('test')).toEqual({
            type: NgrxJsonApiActions.API_DELETE_FAIL,
            payload: 'test'
        });
    });

    it('should create an delete from state action using deleteFromState', () => {
        expect(NgrxJsonApiActions.deleteFromState('test')).toEqual({
            type: NgrxJsonApiActions.DELETE_FROM_STATE,
            payload: 'test'
        });
    });

});
