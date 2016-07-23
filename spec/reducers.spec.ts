import {
    addProviders,
    async,
    inject,
    fakeAsync,
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');

import _ = require('lodash');

import { JsonApiReducer, updateJsonApiStoreReducer } from '../lib/reducers';
import { JsonApiActions } from '../lib/actions';
import { initialiseJsonApiStore } from '../lib/utils';
import { JsonApiStore } from '../lib/interfaces';

describe('updateJsonApiStoreReducer', () => {

    let resourcesDefinition = [
        {
            path: 'article',
            type: 'Article',
            collectionPath: 'articles',
            attributes: ['title', 'subtitle'],
            relationships: {
                'author': { 'type': 'People', 'relationType': 'hasOne' },
                'tags': { 'type': 'Tag', 'relationType': 'hasMany' }
            }
        },
        {
            path: 'person',
            type: 'Person',
            collectionPath: 'people',
            attributes: ['name'],
            relationships: {}
        }
    ];

    let state = initialiseJsonApiStore(resourcesDefinition);

    deepFreeze(state);

    it('should update the store given a JsonApiDocument', () => {
        let expectedState: JsonApiStore = initialiseJsonApiStore(resourcesDefinition);

        expectedState.data.article.data.push(
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
        expectedState.data.person.data.push(
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
            'data': [
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
            'included': [
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
        let newState = updateJsonApiStoreReducer(state, payload);
        expect(newState).toEqual(expectedState);
    });
});

describe('Json Api Reducer', () => {
    let actions;

    let resourcesDefinition = [
        {
            path: 'article',
            type: 'Article',
            collectionPath: 'articles',
            attributes: ['title', 'subtitle'],
            relationships: {
                'author': { 'type': 'People', 'relationType': 'hasOne' },
                'tags': { 'type': 'Tag', 'relationType': 'hasMany' }
            }
        },
        {
            path: 'person',
            type: 'Person',
            collectionPath: 'people',
            attributes: ['name'],
            relationships: {}
        }
    ];

    let state = initialiseJsonApiStore(resourcesDefinition);

    deepFreeze(state);

    beforeEach(() => {
        addProviders([JsonApiActions])
    });
    beforeEach(inject([JsonApiActions], (api) => {
        actions = api;
    }));
    //
    it('should change isCreating status according to CREATE actions', () => {
        let newState = JsonApiReducer(state, actions.apiCreateInit('x'));
        expect(newState.isCreating).toBe(true);
        let newnewState = JsonApiReducer(newState, actions.apiCreateSuccess('x'));
        expect(newnewState.isCreating).toBe(false);
        let newnewnewState = JsonApiReducer(newState, actions.apiCreateFail('x'));
        expect(newnewnewState.isCreating).toBe(false);
    });

    it('should change isReading status according to READ actions', () => {
        let newState = JsonApiReducer(state, actions.apiReadInit('x'));
        expect(newState.isReading).toBe(true);
        let newnewState = JsonApiReducer(newState, actions.apiReadSuccess('x'));
        expect(newnewState.isReading).toBe(false);
        let newnewnewState = JsonApiReducer(newState, actions.apiReadFail('x'));
        expect(newnewnewState.isReading).toBe(false);
    });

    it('should change isUpdating status when UPDATE actions', () => {
        let newState = JsonApiReducer(state, actions.apiUpdateInit('x'));
        expect(newState.isUpdating).toBe(true);
        let newnewState = JsonApiReducer(newState, actions.apiUpdateSuccess('x'));
        expect(newnewState.isUpdating).toBe(false);
        let newnewnewState = JsonApiReducer(newState, actions.apiUpdateFail('x'));
        expect(newnewnewState.isUpdating).toBe(false);
    });

    it('should change isDeleting status DELETE actions', () => {
        let newState = JsonApiReducer(state, actions.apiDeleteInit('x'));
        expect(newState.isDeleting).toBe(true);
        let newnewState = JsonApiReducer(newState, actions.apiDeleteSuccess('x'));
        expect(newnewState.isDeleting).toBe(false);
        let newnewnewState = JsonApiReducer(newState, actions.apiDeleteFail('x'));
        expect(newnewnewState.isDeleting).toBe(false);
    });

    it('should update store data upson successfull CREATE/UPDATE/READ', () => {

        let expectedState: JsonApiStore = initialiseJsonApiStore(resourcesDefinition);

        expectedState.data.article.data.push(
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
        expectedState.data.person.data.push(
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
        let newState = JsonApiReducer(state, actions.apiCreateSuccess(payload));
        expect(newState).toEqual(expectedState);
    });
});
