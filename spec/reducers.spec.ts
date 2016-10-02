import {
    async,
    inject,
    fakeAsync,
    TestBed
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');

import _ = require('lodash');

import { NgrxJsonApiStoreReducer, initialNgrxJsonApiState} from '../src/reducers';
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
        let newState = NgrxJsonApiStoreReducer(state, new ApiCreateInitAction({}));
        expect(newState.isCreating).toBe(true);
        let newnewState = NgrxJsonApiStoreReducer(newState, new ApiCreateSuccessAction({}));
        expect(newnewState.isCreating).toBe(false);
        let newnewnewState = NgrxJsonApiStoreReducer(newState, new ApiCreateFailAction({}));
        expect(newnewnewState.isCreating).toBe(false);
    });

    it('should change isReading status according to READ actions', () => {
        let newState = NgrxJsonApiStoreReducer(state, new ApiReadInitAction({}));
        expect(newState.isReading).toBe(true);
        let newnewState = NgrxJsonApiStoreReducer(newState, new ApiReadSuccessAction({}));
        expect(newnewState.isReading).toBe(false);
        let newnewnewState = NgrxJsonApiStoreReducer(newState, new ApiReadFailAction({}));
        expect(newnewnewState.isReading).toBe(false);
    });

    it('should change isUpdating status when UPDATE actions', () => {
        let newState = NgrxJsonApiStoreReducer(state, new ApiUpdateInitAction({}));
        expect(newState.isUpdating).toBe(true);
        let newnewState = NgrxJsonApiStoreReducer(newState, new ApiUpdateSuccessAction({}));
        expect(newnewState.isUpdating).toBe(false);
        let newnewnewState = NgrxJsonApiStoreReducer(newState, new ApiUpdateFailAction({}));
        expect(newnewnewState.isUpdating).toBe(false);
    });

    it('should change isDeleting status DELETE actions', () => {
        let newState = NgrxJsonApiStoreReducer(state, new ApiDeleteInitAction(
            { query: { type: 'Article' } }));
        expect(newState.isDeleting).toBe(true);
        let newnewState = NgrxJsonApiStoreReducer(newState,
            new ApiDeleteSuccessAction({ query: { type: 'Article' } }));
        expect(newnewState.isDeleting).toBe(false);
        let newnewnewState = NgrxJsonApiStoreReducer(newState,
            new ApiDeleteFailAction({ query: { type: 'Article' } }));
        expect(newnewnewState.isDeleting).toBe(false);
        let newestState = NgrxJsonApiStoreReducer(newState,
            new DeleteFromStateAction({ query: { type: 'Article' } }));
        expect(newestState.isDeleting).toBe(false);
    });

    it('should update store data upson successfull CREATE/UPDATE/READ', () => {
        let newState = NgrxJsonApiStoreReducer(state,
            new ApiCreateSuccessAction({ jsonApiData: testPayload }));
        expect(newState.data['Article']).toBeDefined();
        expect(newState.data['Blog']).toBeDefined();
        expect(newState.data['Person']).toBeDefined();
        expect(newState.data['Comment']).toBeDefined();
    });
});
