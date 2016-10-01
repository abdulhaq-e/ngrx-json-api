import {
    async,
    inject,
    fakeAsync,
    TestBed
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');

import _ = require('lodash');

import { NgrxStoreReducer, initialNgrxJsonApiState} from '../src/reducers';
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
import { NgrxJsonApiStore } from '../src/interfaces';

import { testPayload } from './test_utils';

describe('NgrxJsonApiReducer', () => {

    let state = initialNgrxJsonApiState;

    deepFreeze(state);

    it('should change isCreating status according to CREATE actions', () => {
        let newState = NgrxStoreReducer(state, new ApiCreateInitAction({}));
        expect(newState.isCreating).toBe(true);
        let newnewState = NgrxStoreReducer(newState, new ApiCreateSuccessAction({}));
        expect(newnewState.isCreating).toBe(false);
        let newnewnewState = NgrxStoreReducer(newState, new ApiCreateFailAction({}));
        expect(newnewnewState.isCreating).toBe(false);
    });

    it('should change isReading status according to READ actions', () => {
        let newState = NgrxStoreReducer(state, new ApiReadInitAction({}));
        expect(newState.isReading).toBe(true);
        let newnewState = NgrxStoreReducer(newState, new ApiReadSuccessAction({}));
        expect(newnewState.isReading).toBe(false);
        let newnewnewState = NgrxStoreReducer(newState, new ApiReadFailAction({}));
        expect(newnewnewState.isReading).toBe(false);
    });

    it('should change isUpdating status when UPDATE actions', () => {
        let newState = NgrxStoreReducer(state, new ApiUpdateInitAction({}));
        expect(newState.isUpdating).toBe(true);
        let newnewState = NgrxStoreReducer(newState, new ApiUpdateSuccessAction({}));
        expect(newnewState.isUpdating).toBe(false);
        let newnewnewState = NgrxStoreReducer(newState, new ApiUpdateFailAction({}));
        expect(newnewnewState.isUpdating).toBe(false);
    });

    it('should change isDeleting status DELETE actions', () => {
        let newState = NgrxStoreReducer(state, new ApiDeleteInitAction(
            { query: { type: 'Article' } }));
        expect(newState.isDeleting).toBe(true);
        let newnewState = NgrxStoreReducer(newState,
            new ApiDeleteSuccessAction({ query: { type: 'Article' } }));
        expect(newnewState.isDeleting).toBe(false);
        let newnewnewState = NgrxStoreReducer(newState,
            new ApiDeleteFailAction({ query: { type: 'Article' } }));
        expect(newnewnewState.isDeleting).toBe(false);
        let newestState = NgrxStoreReducer(newState,
            new DeleteFromStateAction({ query: { type: 'Article' } }));
        expect(newestState.isDeleting).toBe(false);
    });

    it('should update store data upson successfull CREATE/UPDATE/READ', () => {
        let newState = NgrxStoreReducer(state,
            new ApiCreateSuccessAction({ jsonApiData: testPayload }));
        expect(newState.data['Article']).toBeDefined();
        expect(newState.data['Blog']).toBeDefined();
        expect(newState.data['Person']).toBeDefined();
        expect(newState.data['Comment']).toBeDefined();
    });
});
