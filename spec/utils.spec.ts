import _ = require('lodash');

import {
    async,
    inject,
    fakeAsync,
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');

import {
    deleteFromState,
    initNgrxStore,
    insertResource,
    // transformResource,
    updateOrInsertResource,
    updateResourceObject,
    updateResource,
    updateStoreResources
} from '../src/utils';

import { Resource, ResourceDefinition, NgrxJsonApiStore } from '../src/interfaces';

import {
    resourcesDefinitions, documentPayload
} from './test_utils';

describe('initialiseStore', () => {

    it('should init the store given resourcesDefinition', () => {
        let store = initNgrxStore(resourcesDefinitions);
        let expectedStore = {
            isCreating: false,
            isReading: false,
            isUpdating: false,
            isDeleting: false,
            resourcesDefinitions: resourcesDefinitions,
            data: []
        };
        expect(store).toEqual(expectedStore);
    });
});

describe('insert resource', () => {

    let state: Array<Resource> = [
        {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'JSON API paints my bikeshed!'
            }
        },
    ];
    deepFreeze(state);

    it(`should insert a resource`, () => {
        let newResource: Resource = {
            type: 'Article',
            id: '3'
        };
        let expectedState: Array<Resource> = [...state, newResource];
        expect(insertResource(state, newResource)).toEqual(expectedState);
    });

    it(`should insert a resource regardless if it's repeated or not`, () => {
        let newResource: Resource = {
            type: 'Article',
            id: '1'
        };
        let expectedState: Array<Resource> = [...state, newResource];
        expect(insertResource(state, newResource)).toEqual(expectedState);
    });
});

// describe('transformResource', () => {
//
//     it('should transform a basic resource with no attributes and no relations', () => {
//         let resource = {
//             id: '1',
//             type: 'Article'
//         };
//         let expected = {
//             id: '1',
//             type: 'Article'
//         };
//         expect(transformResource(resource)).toEqual(expected);
//     });
//
//     it('should transform a resource with attributes', () => {
//         let resource = {
//             id: '1',
//             type: 'Article',
//             attributes: {
//                 title: 'Hello World!'
//             }
//         };
//         let expected = {
//             id: '1',
//             type: 'Article',
//             title: 'Hello World!'
//         };
//         // console.log(transformResource(resource));
//         expect(transformResource(resource)).toEqual(expected);
//     });
//
// });

describe('updateResourceObject', () => {

    it('should update attributes', () => {

        let original: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                body: 'Testing JSON API',
                title: 'JSON API paints my bikeshed!',
            }
        };
        let source: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                title: 'Untitled'
            }
        };
        deepFreeze(original);
        deepFreeze(source)

        expect(updateResourceObject(original, source).attributes.title)
            .toEqual('Untitled');
        expect(updateResourceObject(original, source).attributes.body)
            .toEqual('Testing JSON API');
    });
});

describe('updateResource', () => {

    let state: Array<Resource> = [
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
                'title': 'Second article'
            }
        }
    ];

    deepFreeze(state);

    it('should update the resource given a foundResource', () => {

        let foundResource: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'JSON API paints my bikeshed!',
            }
        };
        let resource: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'Untitled'
            }
        };
        deepFreeze(foundResource);
        deepFreeze(resource);

        let newState = updateResource(state, resource, foundResource);
        expect(_.findIndex(newState, { id: '1' })).toEqual(1);
        expect(newState[1].attributes.title).toEqual('Untitled');
    });
});

describe('updateOrInsertResource', () => {


    it(`should insert a resource if it was not found`, () => {
        let state: Array<Resource> = [
            {
                type: 'Article',
                id: '1',
                attributes: {
                    'title': 'JSON API paints my bikeshed!'
                }
            },
        ];

        deepFreeze(state);

        let newResource: Resource = {
            type: 'Article',
            id: '3'
        };

        let expectedState: Array<Resource> = [...state, newResource];
        expect(updateOrInsertResource(state, newResource)).toEqual(expectedState);
    });

    it('should update a resource if found', () => {
        let state: Array<Resource> = [
            {
                type: 'Article',
                id: '1',
                attributes: {
                    title: 'JSON API paints my bikeshed!',
                    body: 'Test'
                }
            },
            {
                type: 'Article',
                id: '2'
            }
        ];

        deepFreeze(state);

        let newResource: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                tag: 'Whatever'
            }
        };

        let expectedState: Array<Resource> = [
            {
                type: 'Article',
                id: '1',
                attributes: {
                    title: 'JSON API paints my bikeshed!',
                    body: 'Test',
                    tag: 'Whatever'
                }
            },
            {
                type: 'Article',
                id: '2'
            }
        ];
        expect(updateOrInsertResource(state, newResource)[1])
            .toEqual(expectedState[0]);
        expect(updateOrInsertResource(state, newResource)[0])
            .toEqual(expectedState[1]);

    })
});

describe('updateStoreResources', () => {
    it('should update the store resources given a JsonApiDocument', () => {
        let expectedState = [];
        expectedState.push(
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
            },
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

        let rawStore = initNgrxStore(resourcesDefinitions);
        let newState = updateStoreResources(rawStore.data, documentPayload);
        expect(newState).toEqual(expectedState);
    });
});

describe('deleteFromState', () => {

    it('should delete a single resource given a type and id', () => {
        let rawStore = initNgrxStore(resourcesDefinitions);
        let state = updateStoreResources(rawStore.data, documentPayload);
        let expectedState = state.slice(1);
        // expectedState.reverse();
        expect(deleteFromState(state, { type: 'Article', id: '1' }))
            .toEqual(expectedState);
    });

    it('should delete all resources given a type only', () => {
        let rawStore = initNgrxStore(resourcesDefinitions);
        let state = updateStoreResources(rawStore.data, documentPayload);
        let expectedState = state.slice(2);
        // expectedState.reverse();
        expect(deleteFromState(state, { type: 'Article' }))
            .toEqual(expectedState);
    });

});
