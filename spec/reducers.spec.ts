import {
    async,
    inject,
    fakeAsync,
    TestBed
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');

import _ = require('lodash');

import { NgrxStoreReducer, initialNgrxJsonApiState} from '../src/reducers';
import { NgrxJsonApiActions } from '../src/actions';
import { NgrxJsonApiStore } from '../src/interfaces';

import { testPayload } from './test_utils';

describe('NgrxJsonApiReducer', () => {

    let state = initialNgrxJsonApiState;

    deepFreeze(state);

    it('should change isCreating status according to CREATE actions', () => {
        let newState = NgrxStoreReducer(state, NgrxJsonApiActions.apiCreateInit('x'));
        expect(newState.isCreating).toBe(true);
        let newnewState = NgrxStoreReducer(newState, NgrxJsonApiActions.apiCreateSuccess('x'));
        expect(newnewState.isCreating).toBe(false);
        let newnewnewState = NgrxStoreReducer(newState, NgrxJsonApiActions.apiCreateFail('x'));
        expect(newnewnewState.isCreating).toBe(false);
    });

    it('should change isReading status according to READ actions', () => {
        let newState = NgrxStoreReducer(state, NgrxJsonApiActions.apiReadInit('x'));
        expect(newState.isReading).toBe(true);
        let newnewState = NgrxStoreReducer(newState, NgrxJsonApiActions.apiReadSuccess('x'));
        expect(newnewState.isReading).toBe(false);
        let newnewnewState = NgrxStoreReducer(newState, NgrxJsonApiActions.apiReadFail('x'));
        expect(newnewnewState.isReading).toBe(false);
    });

    it('should change isUpdating status when UPDATE actions', () => {
        let newState = NgrxStoreReducer(state, NgrxJsonApiActions.apiUpdateInit('x'));
        expect(newState.isUpdating).toBe(true);
        let newnewState = NgrxStoreReducer(newState, NgrxJsonApiActions.apiUpdateSuccess('x'));
        expect(newnewState.isUpdating).toBe(false);
        let newnewnewState = NgrxStoreReducer(newState, NgrxJsonApiActions.apiUpdateFail('x'));
        expect(newnewnewState.isUpdating).toBe(false);
    });

    it('should change isDeleting status DELETE actions', () => {
        let newState = NgrxStoreReducer(state, NgrxJsonApiActions.apiDeleteInit(
            { query: { type: 'Article' } }));
        expect(newState.isDeleting).toBe(true);
        let newnewState = NgrxStoreReducer(newState,
            NgrxJsonApiActions.apiDeleteSuccess({ query: { type: 'Article' } }));
        expect(newnewState.isDeleting).toBe(false);
        let newnewnewState = NgrxStoreReducer(newState,
            NgrxJsonApiActions.apiDeleteFail({ query: { type: 'Article' } }));
        expect(newnewnewState.isDeleting).toBe(false);
        let newestState = NgrxStoreReducer(newState,
            NgrxJsonApiActions.deleteFromState({ query: { type: 'Article' } }));
        expect(newestState.isDeleting).toBe(false);
    });

    it('should update store data upson successfull CREATE/UPDATE/READ', () => {
        let newState = NgrxStoreReducer(state,
            NgrxJsonApiActions.apiCreateSuccess({ jsonApiData: testPayload }));
        expect(newState.data['Article']).toBeDefined();
        expect(newState.data['Blog']).toBeDefined();
        expect(newState.data['Person']).toBeDefined();
        expect(newState.data['Comment']).toBeDefined();
    });
});
