import {
    async,
    inject,
    fakeAsync,
    TestBed
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');

import _ = require('lodash');

import { StoreReducer, updateStoreReducer } from '../src/reducers';
import { JsonApiActions } from '../src/actions';
import { initialiseStore } from '../src/utils';
import { NgrxJsonApiStore } from '../src/interfaces';

describe('JsonApi Reducers', () => {
    let resourcesDefinition = [
        {
            type: 'Article',
            collectionPath: 'articles',
            attributes: ['title', 'subtitle'],
            relationships: {
                'author': { 'type': 'People', 'relationType': 'hasOne' },
                'tags': { 'type': 'Tag', 'relationType': 'hasMany' }
            }
        },
        {
            type: 'Person',
            collectionPath: 'people',
            attributes: ['name'],
            relationships: {}
        }
    ];

    let state = initialiseStore(resourcesDefinition);

    deepFreeze(state);

    describe('updateJsonApiStoreReducer', () => {
        it('should update the store given a JsonApiDocument', () => {
            let expectedState: NgrxJsonApiStore = initialiseStore(resourcesDefinition);

            expectedState.data.push(
                {
                    type: 'Article',
                    id: '1',
                    attributes: {
                        'title': 'JSON API paints my bikeshed!'
                    }
                },
                {
                    type: 'Article',
                    id: '2',
                    attributes: {
                        'title': 'Untitled'
                    }
                });
            expectedState.data.push(
                {
                    type: 'Person',
                    id: '1',
                    attributes: {
                        'name': 'Person 1'
                    }
                },
                {
                    type: 'Person',
                    id: '2',
                    attributes: {
                        'name': 'Person 2'
                    }
                });

            let payload = {
                data: [
                    {
                        type: 'Article',
                        id: '1',
                        attributes: {
                            'title': 'JSON API paints my bikeshed!'
                        }
                    },
                    {
                        type: 'Article',
                        id: '2',
                        attributes: {
                            'title': 'Untitled'
                        }
                    }
                ],
                included: [
                    {
                        type: 'Person',
                        id: '1',
                        attributes: {
                            'name': 'Person 1'
                        }
                    },
                    {
                        type: 'Person',
                        id: '2',
                        attributes: {
                            'name': 'Person 2'
                        }
                    }
                ]
            };
            let newState = updateStoreReducer(state, payload);
            expect(newState).toEqual(expectedState);
        });
    });

    describe('Json Api Reducer', () => {
        let actions;

        it('should change isCreating status according to CREATE actions', () => {
            let newState = StoreReducer(state, JsonApiActions.apiCreateInit('x'));
            expect(newState.isCreating).toBe(true);
            let newnewState = StoreReducer(newState, JsonApiActions.apiCreateSuccess('x'));
            expect(newnewState.isCreating).toBe(false);
            let newnewnewState = StoreReducer(newState, JsonApiActions.apiCreateFail('x'));
            expect(newnewnewState.isCreating).toBe(false);
        });

        it('should change isReading status according to READ actions', () => {
            let newState = StoreReducer(state, JsonApiActions.apiReadInit('x'));
            expect(newState.isReading).toBe(true);
            let newnewState = StoreReducer(newState, JsonApiActions.apiReadSuccess('x'));
            expect(newnewState.isReading).toBe(false);
            let newnewnewState = StoreReducer(newState, JsonApiActions.apiReadFail('x'));
            expect(newnewnewState.isReading).toBe(false);
        });

        it('should change isUpdating status when UPDATE actions', () => {
            let newState = StoreReducer(state, JsonApiActions.apiUpdateInit('x'));
            expect(newState.isUpdating).toBe(true);
            let newnewState = StoreReducer(newState, JsonApiActions.apiUpdateSuccess('x'));
            expect(newnewState.isUpdating).toBe(false);
            let newnewnewState = StoreReducer(newState, JsonApiActions.apiUpdateFail('x'));
            expect(newnewnewState.isUpdating).toBe(false);
        });

        it('should change isDeleting status DELETE actions', () => {
            let newState = StoreReducer(state, JsonApiActions.apiDeleteInit('x'));
            expect(newState.isDeleting).toBe(true);
            let newnewState = StoreReducer(newState, JsonApiActions.apiDeleteSuccess('x'));
            expect(newnewState.isDeleting).toBe(false);
            let newnewnewState = StoreReducer(newState, JsonApiActions.apiDeleteFail('x'));
            expect(newnewnewState.isDeleting).toBe(false);
        });

        it('should update store data upson successfull CREATE/UPDATE/READ', () => {

            let expectedState: NgrxJsonApiStore = initialiseStore(resourcesDefinition);

            expectedState.data.push(
                {
                    type: 'Article',
                    id: '1',
                    attributes: {
                        'title': 'JSON API paints my bikeshed!'
                    }
                },
                {
                    type: 'Article',
                    id: '2',
                    attributes: {
                        'title': 'Untitled'
                    }
                });
            expectedState.data.push(
                {
                    type: 'Person',
                    id: '1',
                    attributes: {
                        'name': 'Person 1'
                    }
                },
                {
                    type: 'Person',
                    id: '2',
                    attributes: {
                        'name': 'Person 2'
                    }
                });

            let payload = {
                data: {
                    data: [
                        {
                            type: 'Article',
                            id: '1',
                            attributes: {
                                'title': 'JSON API paints my bikeshed!'
                            }
                        },
                        {
                            type: 'Article',
                            id: '2',
                            attributes: {
                                'title': 'Untitled'
                            }
                        }
                    ],
                    included: [
                        {
                            type: 'Person',
                            id: '1',
                            attributes: {
                                'name': 'Person 1'
                            }
                        },
                        {
                            type: 'Person',
                            id: '2',
                            attributes: {
                                'name': 'Person 2'
                            }
                        }
                    ]
                }
            };
            let newState = StoreReducer(state, JsonApiActions.apiCreateSuccess(payload));
            expect(newState).toEqual(expectedState);
        });
    });
});
