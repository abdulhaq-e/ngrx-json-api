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
    updateOrInsertResource,
    updateResourceObject,
    updateResource,
    updateStoreResources
} from '../src/utils';

import {
    initialNgrxJsonApiState
} from '../src/reducers';

import { Resource, ResourceDefinition, NgrxJsonApiStore } from '../src/interfaces';

import {
    resourcesDefinitions, documentPayload, testPayload
} from './test_utils';

deepFreeze(initialNgrxJsonApiState);

describe('selectors utils', () => {
    let resources = updateStoreResources(initialNgrxJsonApiState.data, testPayload)
    describe('getSingleResource', () => {
        it('should get a single resource given a ResourceQuery', () => {
            let obtainedResource = getSingleResource(
                { type: 'Person', id: '2' }, resources)
            expect(obtainedResource)
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
            let obtainedResources = getMultipleResources([
                { type: 'Person', id: '1' },
                { type: 'Person', id: '2' }
            ], resources);
            expect(obtainedResources[0].attributes.name)
                .toEqual('Person 1');
            expect(obtainedResources[1].attributes.name)
                .toEqual('Person 2');
        });
    });

    describe('getSingleTypeResources', () => {
        it('should get an array of resources of a given type', () => {
            let obtainedResources = getSingleTypeResources(
                { type: 'Blog' }, resources);
            expect(obtainedResources[0].id).toEqual('1');
            expect(obtainedResources[0].attributes.name).toEqual('Blog 1');
            expect(obtainedResources[1].id).toEqual('2');
            expect(obtainedResources[2].id).toEqual('3');
        });
    });

    describe('denormaliseResource and denormaliseObject', () => {
        it('should denormalise a resource with no relatios', () => {
            expect(denormaliseResource(resources['Person']['2'], resources)).toEqual({
                type: 'Person',
                id: '2',
                name: 'Person 2'
            });
            expect(denormaliseResource(resources['Blog']['2'], resources)).toEqual({
                type: 'Blog',
                id: '2',
            });
        });

        it('should denormalise a resource with relations', () => {
            let dR = denormaliseResource(resources['Blog']['1'], resources);
            expect(dR.name).toEqual('Blog 1');
            expect(dR.id).toEqual('1');
            expect(dR.author).toBeDefined();
            expect(dR.author.name).toEqual('Person 2');

        });

        it('should denormalise a resource with deep relations', () => {
            let dR = denormaliseResource(resources['Person']['1'], resources);
            expect(_.isArray(dR.blogs)).toBeTruthy();
            expect(dR.blogs[0].type).toEqual('Blog');
            expect(dR.blogs[0].id).toEqual('1');
            expect(dR.blogs[1].type).toEqual('Blog');
            expect(dR.blogs[1].id).toEqual('3');
            expect(dR.blogs[0].author.name).toEqual('Person 2');
        });

        it('should denormalise a resource with very deep relations (circular dependency)',
            () => {
                let denormalisedResource = denormaliseResource(
                    resources['Article']['1'], resources);
                expect(denormalisedResource.author).toEqual(
                    denormalisedResource.author.blogs[1].author);
            });
    });
});

describe('insert resource', () => {

    let state = {
        '1': {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'JSON API paints my bikeshed!'
            }
        },
    };
    deepFreeze(state);

    it(`should insert a resource`, () => {
        let newResource: Resource = {
            type: 'Article',
            id: '2'
        };
        let newState = insertResource(state, newResource);
        expect(newState['1']).toBeDefined();
        expect(newState['2']).toBeDefined();
        expect(newState['2'].id).toEqual('2');
        expect(newState['2'].type).toEqual('Article');
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
            },
            relationshisp: {
                author: {
                    data: { type: 'Person', id: '1' }
                }
            }
        };
        let source: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                title: 'Untitled'
            },
            relationships: {
                author: {
                    data: { type: 'Person', id: '2' }
                }
            }
        };
        deepFreeze(original);
        deepFreeze(source)

        expect(updateResourceObject(original, source).attributes.title)
            .toEqual('Untitled');
        expect(updateResourceObject(original, source).attributes.body)
            .toEqual('Testing JSON API');
        expect(updateResourceObject(original, source).relationships.author.data)
            .toEqual({ type: 'Person', id: '2' });
    });
});

describe('updateResource', () => {

    let state = {
        '1': {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'JSON API paints my bikeshed!'
            }
        },
        '2': {
            type: 'Article',
            id: '2',
            attributes: {
                'title': 'Second article'
            }
        }
    };
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
        expect(newState['1'].attributes.title).toEqual('Untitled');
    });
});

describe('updateOrInsertResource', () => {

    it(`should insert a resource if it was not found`, () => {
        let state = {
            'Article': {
                '1': {
                    type: 'Article',
                    id: '1',
                    attributes: {
                        'title': 'JSON API paints my bikeshed!'
                    }
                },

            }
        }
        deepFreeze(state);

        let newResource: Resource = {
            type: 'Article',
            id: '3'
        };
        let newState = updateOrInsertResource(state, newResource);
        expect(newState['Article']['3']).toBeDefined();
        expect(newState['Article']['1']).toBeDefined();
    });

    it('should update a resource if found', () => {
        let state = {
            'Article': {
                '1': {
                    type: 'Article',
                    id: '1',
                    attributes: {
                        title: 'JSON API paints my bikeshed!',
                        body: 'Test'
                    }
                },
                '2': {
                    type: 'Article',
                    id: '2'
                }

            }
        }
        deepFreeze(state);

        let newResource: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                tag: 'Whatever'
            }
        };
        let newState = updateOrInsertResource(state, newResource);
        expect(newState['Article']['1']).toBeDefined();
        expect(newState['Article']['2']).toBeDefined();
        expect(newState['Article']['1'].attributes.tag).toEqual('Whatever');
    })
});

describe('updateStoreResources', () => {
    it('should update the store resources given a JsonApiDocument', () => {
        let newState = updateStoreResources(initialNgrxJsonApiState.data, documentPayload);
        expect(newState['Article']).toBeDefined();
        expect(newState['Person']).toBeDefined();
        expect(newState['Article']['1']).toBeDefined();
        expect(newState['Article']['2']).toBeDefined();
        expect(newState['Person']['1']).toBeDefined();
        expect(newState['Person']['2']).toBeDefined();

        expect(newState['Article']['2'].attributes.title).toEqual('Untitled');
    });
});

describe('deleteFromState', () => {

    it('should delete a single resource given a type and id', () => {
        let state = updateStoreResources(initialNgrxJsonApiState.data, documentPayload);
        expect(state['Article']['1']).toBeDefined();
        let newState = deleteFromState(state, { type: 'Article', id: '1' });
        expect(newState['Article']['1']).not.toBeDefined();
    });

    it('should delete all resources given a type only', () => {
        let state = updateStoreResources(initialNgrxJsonApiState.data, documentPayload);
        expect(state['Article']['1']).toBeDefined();
        expect(state['Article']['2']).toBeDefined();
        let newState = deleteFromState(state, { type: 'Article' });
        expect(newState['Article']['1']).not.toBeDefined();
        expect(newState['Article']).toEqual({});
    });
});

describe('filterResources (TODO: test remaining types)', () => {

    let state = updateStoreResources(initialNgrxJsonApiState.data, testPayload);

    let resources = testPayload.data.map(
        r => denormaliseResource(r, state));

    it('should filter resources using an iexact filter if no type is given', () => {
        let query = {
            params: {
                filtering: [{ field: 'title', value: 'article 2' }]
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
                    { field: 'title', value: 'article 2', type: 'iexact' }
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
                        value: ['Article 2', 'Article 1'],
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
                    { field: 'name', value: 'person 1', type: 'iexact', path: 'author' }
                ]
            }
        }
        let filtered = filterResources(resources, query);
        expect(filtered.length).toBe(2);
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
