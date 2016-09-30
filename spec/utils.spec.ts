import _ = require('lodash');

import {
    async,
    inject,
    fakeAsync,
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');

import {
    deleteFromState,
    denormaliseObject,
    denormaliseResource,
    filterResources,
    getSingleResource,
    getMultipleResources,
    getSingleTypeResources,
    insertResource,
    // transformResource,
    updateOrInsertResource,
    updateResourceObject,
    updateResource,
    updateStoreResources
} from '../src/utils';

import {
    initialState
} from '../src/reducers';

import { Resource, ResourceDefinition, NgrxJsonApiStore } from '../src/interfaces';

import {
    resourcesDefinitions, documentPayload, selectorsPayload
} from './test_utils';

describe('selectors utils', () => {
    let resources = [
        {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'JSON API paints my bikeshed!'
            },
            relationships: {
                author: {
                    data: { type: 'Person', id: '3' }
                },
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
            },
            relationships: {
                blogs: {
                    data: [
                        { type: 'Blog', id: '1' },
                        { type: 'Blog', id: '2' }
                    ]
                }
            }
        },
        {
            type: 'Person',
            id: '2',
            attributes: {
                'name': 'Person 2'
            }
        },
        {
            type: 'Blog',
            id: '1',
            relationships: {
                author: {
                    data: { type: 'Person', id: '2' }
                }
            }
        },
        {
            type: 'Blog',
            id: '2',
        },
        {
            type: 'Blog',
            id: '3',
            relationships: {
                author: {
                    data: { type: 'Person', id: '3' }
                }
            }
        },
        {
            type: 'Person',
            id: '3',
            attributes: {
                name: 'Person 3'
            },
            relationships: {
                blogs: {
                    data: [
                        { type: 'Blog', id: '3' }
                    ]
                }
            }
        }
    ];
    describe('getSingleResource', () => {
        it('should get a single resource given a ResourceQuery', () => {
            expect(getSingleResource({ type: 'Person', id: '2' }, resources))
                .toEqual({
                    type: 'Person',
                    id: '2',
                    attributes: {
                        'name': 'Person 2'
                    }
                });
        });

        it('should return undefined if the resource was not found', () => {
            expect(getSingleResource({ type: 'Person', id: '10' }, resources))
                .toBe(undefined);
        });
    });

    describe('getMultipleResources', () => {
        it('should get multiple resources given an array of ResourceQuery', () => {
            expect(getMultipleResources([
                { type: 'Person', id: '1' },
                { type: 'Person', id: '2' }
            ], resources))
                .toEqual([
                    {
                        type: 'Person',
                        id: '1',
                        attributes: {
                            'name': 'Person 1'
                        },
                        relationships: {
                            blogs: {
                                data: [
                                    { type: 'Blog', id: '1' },
                                    { type: 'Blog', id: '2' }
                                ]
                            }
                        }
                    },
                    {
                        type: 'Person',
                        id: '2',
                        attributes: {
                            'name': 'Person 2'
                        }
                    }
                ]);
        });
    });

    describe('getSingleTypeResources', () => {
        it('should get an array of resources of a given type', () => {
            expect(getSingleTypeResources({ type: 'Blog' }, resources)).toEqual(
                [{
                    type: 'Blog',
                    id: '1',
                    relationships: {
                        author: {
                            data: { type: 'Person', id: '2' }
                        }
                    }
                },
                    {
                        type: 'Blog',
                        id: '2',
                    },
                    {
                        type: 'Blog',
                        id: '3',
                        relationships: {
                            author: {
                                data: { type: 'Person', id: '3' }
                            }
                        }
                    }]
            );
        });
    });

    describe('denormaliseResource and denormaliseObject', () => {
        it('should denormalise a resource with no relatios', () => {
            expect(denormaliseResource(resources[3], resources)).toEqual({
                type: 'Person',
                id: '2',
                name: 'Person 2'
            });
            expect(denormaliseResource(resources[5], resources)).toEqual({
                type: 'Blog',
                id: '2',
            });
        });

        it('should denormalise a resource with relations', () => {
            expect(denormaliseResource(resources[4], resources)).toEqual({
                type: 'Blog',
                id: '1',
                author: {
                    type: 'Person',
                    id: '2',
                    name: 'Person 2'
                }
            });
        });

        it('should denormalise a resource with deep relations', () => {
            expect(denormaliseResource(resources[2], resources)).toEqual({
                type: 'Person',
                id: '1',
                name: 'Person 1',
                blogs: [
                    {
                        type: 'Blog',
                        id: '1',
                        author: {
                            type: 'Person',
                            id: '2',
                            name: 'Person 2'
                        }
                    },
                    {
                        type: 'Blog',
                        id: '2'
                    }
                ]
            });
        });

        it('should denormalise a resource with very deep relations (circular dependency)',
            () => {
                let denormalisedResource = denormaliseResource(resources[0], resources);
                expect(denormalisedResource.author).toEqual(
                    denormalisedResource.author.blogs[0].author);
            });

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

        let rawStore = initialState;
        let newState = updateStoreResources(rawStore.data, documentPayload);
        expect(newState).toEqual(expectedState);
    });
});

describe('deleteFromState', () => {

    it('should delete a single resource given a type and id', () => {
        let rawStore = initialState;
        let state = updateStoreResources(rawStore.data, documentPayload);
        let expectedState = state.slice(1);
        // expectedState.reverse();
        expect(deleteFromState(state, { type: 'Article', id: '1' }))
            .toEqual(expectedState);
    });

    it('should delete all resources given a type only', () => {
        let rawStore = initialState;
        let state = updateStoreResources(rawStore.data, documentPayload);
        let expectedState = state.slice(2);
        // expectedState.reverse();
        expect(deleteFromState(state, { type: 'Article' }))
            .toEqual(expectedState);
    });
});

describe('filterResources (TODO: test remaining types)', () => {

    let resources = selectorsPayload.data.map(
        r => denormaliseResource(r, selectorsPayload.data));

    it('should filter resources using an iexact filter if no type is given', () => {
        let query = {
            params: {
                filtering: [{ field: 'title', value: 'untitled' }]
            }
        }
        let filtered = filterResources(resources, query);
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('2');
        expect(filtered[0].type).toBe('Article');
    });

    it('should filter resources using iexact filter', () => {
        let query = {
            params: {
                filtering: [
                    { field: 'title', value: 'untitled', type: 'iexact' }
                ]
            }
        }
        let filtered = filterResources(resources, query);
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('2');
        expect(filtered[0].type).toBe('Article');
    });

    it('should filter resources using in filter', () => {
        let query = {
            params: {
                filtering: [
                    {
                      field: 'title',
                      value: ['Untitled', 'JSON API paints my bikeshed!'],
                      type: 'in'
                    }
                ]
            }
        }
        let filtered = filterResources(resources, query);
        expect(filtered.length).toBe(2);
        expect(filtered[0].id).toBe('1');
        expect(filtered[0].type).toBe('Article');
        expect(filtered[1].id).toBe('2');
    });

    it('should filter related resources using iexact filter', () => {
        let query = {
            params: {
                filtering: [
                    { field: 'name', value: 'usain bolt', type: 'iexact', path: 'author' }
                ]
            }
        }
        let filtered = filterResources(resources, query);
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('1');
        expect(filtered[0].type).toBe('Article');
    });

    it('should filter hasMany related resources using iexact filter', () => {
        let query = {
            params: {
                filtering: [
                    { field: 'text', value: 'uncommented', type: 'iexact', path: 'comments' }
                ]
            }
        }
        let filtered = filterResources(resources, query);
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('1');
        expect(filtered[0].type).toBe('Article');
    });



});
