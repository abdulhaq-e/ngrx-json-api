import _ = require('lodash');

import {
    async,
    inject,
    fakeAsync,
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');
//
import {
    deleteStoreResources,
    //     denormaliseObject,
    //     denormaliseResource,
    filterResources,
    //     getSingleResource,
    //     getMultipleResources,
    //     getSingleTypeResources,
    generateFieldsQueryParams,
    generateIncludedQueryParams,
    generateFilteringQueryParams,
    generateQueryParams,
    generateSortingQueryParams,
    getFieldFromPath,
    //     transformStoreData,
    //     transformStoreResources,
    removeQuery,
    rollbackStoreResources,
    toResourceIdentifier,
    updateOrInsertResource,
    updateQueryErrors,
    updateQueryParams,
    updateQueryResults,
    updateResourceObject,
    updateStoreResource,
    updateStoreResources,
    updateResourceState,
    updateResourceErrors,
} from '../src/utils';
//
import {
    initialNgrxJsonApiState
} from '../src/reducers';
//
import {
    NgrxJsonApiStore,
    Resource,
    ResourceDefinition,
    ResourceState,
} from '../src/interfaces';

import {
    resourceDefinitions,
    documentPayload,
    testPayload,
} from './test_utils';

deepFreeze(initialNgrxJsonApiState);

// describe('selectors utils', () => {
//     let resources = updateStoreResources(initialNgrxJsonApiState.data, testPayload)
//     describe('getSingleResource', () => {
//         it('should get a single resource given a ResourceQuery', () => {
//             let obtainedResource = getSingleResource(
//                 { type: 'Person', id: '2' }, resources)
//             expect(obtainedResource)
//                 .toEqual({
//                     type: 'Person',
//                     id: '2',
//                     attributes: {
//                         'name': 'Person 2'
//                     }
//                 });
//         });
//
//         it('should return undefined if the resource was not found', () => {
//             expect(getSingleResource({ type: 'Person', id: '10' }, resources))
//                 .toBe(undefined);
//         });
//
//         it('should return undefined if the resource type does not exist', () => {
//             expect(getSingleResource({ type: 'Tag' }, resources))
//                 .toBe(undefined);
//         });
//
//     });
//
//     describe('getMultipleResources', () => {
//         it('should get multiple resources given an array of ResourceQuery', () => {
//             let obtainedResources = getMultipleResources([
//                 { type: 'Person', id: '1' },
//                 { type: 'Person', id: '2' }
//             ], resources);
//             expect(obtainedResources[0].attributes.name)
//                 .toEqual('Person 1');
//             expect(obtainedResources[1].attributes.name)
//                 .toEqual('Person 2');
//         });
//     });
//
//     describe('getSingleTypeResources', () => {
//         it('should get an NgrxJsonApiStoreResources given a type', () => {
//             let obtainedResources = getSingleTypeResources(
//                 { type: 'Blog' }, resources);
//             expect(obtainedResources['1'].id).toEqual('1');
//             expect(obtainedResources['1'].attributes.name).toEqual('Blog 1');
//             expect(obtainedResources['2'].id).toEqual('2');
//             expect(obtainedResources['3'].id).toEqual('3');
//         });
//     });
//
//     describe('transformStoreResources', () => {
//         it('should provide an array of all resources given a NgrxJsonApiStoreResources', () => {
//             let allResources = transformStoreResources(
//                 getSingleTypeResources({ type: 'Article' }, resources));
//             expect(allResources.length).toEqual(2);
//             expect(allResources[0].type).toEqual("Article");
//             expect(allResources[0].id).toEqual("1");
//         });
//     });
//
//     describe('transformStoreData', () => {
//         it('should provide an array of all resources given a NgrxJsonApiStoreData', () => {
//             let allResources = transformStoreData(resources);
//             expect(allResources.length).toEqual(9);
//             expect(allResources[0].type).toEqual("Person");
//             expect(allResources[0].id).toEqual("1");
//         });
//     });
//
//
//     describe('denormaliseResource and denormaliseObject', () => {
//         it('should denormalise a resource with no relatios', () => {
//             expect(denormaliseResource(resources['Person']['2'], resources)).toEqual({
//                 type: 'Person',
//                 id: '2',
//                 name: 'Person 2'
//             });
//             expect(denormaliseResource(resources['Blog']['2'], resources)).toEqual({
//                 type: 'Blog',
//                 id: '2',
//             });
//         });
//
//         it('should denormalise a resource with relations', () => {
//             let dR = denormaliseResource(resources['Blog']['1'], resources);
//             expect(dR.name).toEqual('Blog 1');
//             expect(dR.id).toEqual('1');
//             expect(dR.author).toBeDefined();
//             expect(dR.author.name).toEqual('Person 2');
//
//         });
//
//         it('should denormalise a resource with deep relations', () => {
//             let dR = denormaliseResource(resources['Person']['1'], resources);
//             expect(_.isArray(dR.blogs)).toBeTruthy();
//             expect(dR.blogs[0].type).toEqual('Blog');
//             expect(dR.blogs[0].id).toEqual('1');
//             expect(dR.blogs[1].type).toEqual('Blog');
//             expect(dR.blogs[1].id).toEqual('3');
//             expect(dR.blogs[0].author.name).toEqual('Person 2');
//         });
//
//         it('should denormalise a resource with very deep relations (circular dependency)',
//             () => {
//                 let denormalisedResource = denormaliseResource(
//                     resources['Article']['1'], resources);
//                 expect(denormalisedResource.author).toEqual(
//                     denormalisedResource.author.blogs[1].author);
//             });
//     });
// });

describe('deleteStoreResources', () => {
    let storeData = {
        'Article': {
            '1': {},
            '2': {}
        },
        'Comment': {
            '1': {},
            '2': {},
        }
    };
    it('should delete a single resource given a type and id', () => {
        let newStoreData = deleteStoreResources(storeData, { type: 'Article', id: '1' });
        expect(newStoreData['Article']['1']).not.toBeDefined();
        expect(newStoreData['Article']['2']).toBeDefined();
    });

    it('should delete all resources given a type only', () => {
        let newStoreData = deleteStoreResources(storeData, { type: 'Article' });
        expect(newStoreData['Article']).toEqual({});
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
            relationships: {
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

describe('updateStoreResource', () => {

    let state = {
        '1': {
            resource: {
                type: 'Article',
                id: '1',
                attributes: {
                    'title': 'JSON API paints my bikeshed!'
                }
            },
            persistedResource: {
                type: 'Article',
                id: '1',
                attributes: {
                    'title': 'JSON API paints my bikeshed!'
                }
            }
        },
        '2': {
            resource: {
                type: 'Article',
                id: '2',
                attributes: {
                    'title': 'Second article'
                }
            },
            persistedResource: {
                type: 'Article',
                id: '2',
                attributes: {
                    'title': 'Second article'
                }
            }
        },
        '3': {
            resource: {
                type: 'Article',
                id: '2',
                attributes: {
                    'title': 'Third article'
                }
            },
            persistedResource: null
        }
    };
    deepFreeze(state);

    it('should override the store resource if the store came from the server', () => {

        let resource: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'Untitled'
            }
        };
        deepFreeze(resource);
        let newState = updateStoreResource(state, resource, true);
        expect(newState['1'].resource.attributes.title).toEqual('Untitled');
        expect(newState['1'].persistedResource.attributes.title).toEqual('Untitled');
    });

    it('should do nothing for an equal resource not from server', () => {
        let resource: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'JSON API paints my bikeshed!'
            }
        };
        deepFreeze(resource);
        let newState = updateStoreResource(state, resource, false);
        expect(newState['1'].resource.attributes.title).toEqual('JSON API paints my bikeshed!');
        expect(newState['1'].persistedResource.attributes.title).toEqual('JSON API paints my bikeshed!');
    });

    it('should merge a new resource not from server and add UPDATED state if a persistedResource exists', () => {
        let resource: Resource = {
            type: 'Article',
            id: '2',
            attributes: {
                'title': 'Untitled'
            }
        };
        deepFreeze(resource);
        let newState = updateStoreResource(state, resource, false);
        expect(newState['2'].resource.attributes.title).toEqual('Untitled');
        expect(newState['2'].persistedResource.attributes.title).toEqual('Second article');
        expect(newState['2'].state).toEqual(ResourceState.UPDATED);
    });

    it('should merge a new resource not from server and add CREATED state if a persistedResource does not exists', () => {
        let resource: Resource = {
            type: 'Article',
            id: '3',
            attributes: {
                'title': 'Untitled'
            }
        };
        deepFreeze(resource);
        let newState = updateStoreResource(state, resource, false);
        expect(newState['3'].resource.attributes.title).toEqual('Untitled');
        expect(newState['3'].persistedResource).toBeNull();
        expect(newState['3'].state).toEqual(ResourceState.CREATED);
    });

});

describe('updateQueryErrors', () => {
    it('should return the state if the queryId is not given or query not found', () => {
        let queriesStore = {}
        expect(updateQueryErrors(queriesStore)).toEqual({});
    });

    it('should add any errors in the JsonApiDocument to the query erros', () => {

        let queriesStore = {
            '1': {
                query: {},
                loading: false,
                errors: []
            }
        };
        deepFreeze(queriesStore);
        let document = {
            errors: ['permission denied', 'i said permission denied']
        };
        let newQueriesStore = updateQueryErrors(queriesStore, '1', document);
        expect(newQueriesStore['1'].errors.length).toEqual(2);
        expect(newQueriesStore['1'].errors).toEqual(document['errors']);
    });
});

describe('updateResourceErrors', () => {
    // it('should throw error if the query type and id is not defined', () => {
    //   expect(updateResourceErrors({}, {}, {})).toThrow('invalid parameters');
    // });

    it('should update resource errors given a query and a JsonApiDocument', () => {
        let storeData = {
            'Article': {
                '1': {
                    resource: {
                        type: 'Article',
                        id: '1'
                    },
                    errors: []
                }
            }
        };
        let query = {
            type: 'Article',
            id: '1'
        }
        deepFreeze(storeData);
        let document = {
            errors: ['permission denied', 'i said permission denied']
        };
        let newStoreData = updateResourceErrors(storeData, query, document);
        expect(newStoreData['Article']['1']['errors']).toEqual(document['errors']);
    });
});

describe('rollbackStoreResources', () => {
    let storeData = {
        'Article': {
            '1': {
                resource: { type: 'Article', id: '1' },
                state: ResourceState.CREATED
            },
        },
        'Comment': {
            '1': {
                resource: { type: 'Comment', id: '1', attributes: { title: 'C1' } },
                state: ResourceState.UPDATED,
                persistedResource: { type: 'Comment', id: '1', attributes: { title: 'C11' } },
            }
        }
    };
    it('should delete the resource if a persistedResource does not exist', () => {
        let newState = rollbackStoreResources(storeData);
        // console.log(newState);
        expect(newState['Article']['1']).not.toBeDefined();
        expect(newState['Comment']['1']).toBeDefined();
        expect(newState['Comment']['1'].resource.attributes.title).toEqual('C11');
        expect(newState['Comment']['1'].state).toEqual(ResourceState.IN_SYNC);
    });
});

describe('updateOrInsertResource', () => {

    it(`should insert a resource if it was not found`, () => {
        let state = {
            'Article': {
                '1': {
                    resource: {
                        type: 'Article',
                        id: '1',
                        attributes: {
                            'title': 'JSON API paints my bikeshed!'
                        }
                    },
                }
            }
        }
        deepFreeze(state);

        let newResource: Resource = {
            type: 'Article',
            id: '3'
        };
        let newState = updateOrInsertResource(state, newResource, true, true);
        expect(newState['Article']['3']).toBeDefined();
        expect(newState['Article']['3'].resource.id).toEqual('3')
        expect(newState['Article']['1']).toBeDefined();
    });

    it('should update a resource if found', () => {
        let state = {
            'Article': {
                '1': {
                    resource: {
                        type: 'Article',
                        id: '1',
                        attributes: {
                            title: 'JSON API paints my bikeshed!',
                            body: 'Test'
                        }
                    },
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
        let newState = updateOrInsertResource(state, newResource, true, true);
        expect(newState['Article']['1']).toBeDefined();
        expect(newState['Article']['1'].resource.attributes.tag).toEqual('Whatever');
    });

    it('should insert resource type and resource if none were found', () => {
        let state = {}
        deepFreeze(state);

        let newResource: Resource = {
            type: 'Article',
            id: '3'
        };
        let newState = updateOrInsertResource(state, newResource, true, true);
        expect(newState['Article']).toBeDefined();
        expect(newState['Article']['3']).toBeDefined();
    });

    //
    // it(`should insert related resources even if they were not included`, () => {
    //     let state = {}
    //     deepFreeze(state);
    //
    //     let newResource: Resource = {
    //         type: 'Article',
    //         id: '3',
    //         relationships: {
    //             author: {
    //                 data: { type: 'Person', id: '1' }
    //             },
    //             comments: {
    //                 data: [
    //                     { type: 'Comment', id: '1' },
    //                     { type: 'Comment', id: '2' }
    //                 ]
    //             }
    //         }
    //     };
    //     let newState = updateOrInsertResource(state, newResource);
    //     expect(newState['Comment']['1']).toBeDefined();
    //     expect(newState['Comment']['1'].id).toEqual('1');
    //     expect(newState['Comment']['2']).toBeDefined();
    //     expect(newState['Comment']['2'].id).toEqual('2');
    //     expect(newState['Person']['1']).toBeDefined();
    //     expect(newState['Person']['1'].id).toEqual('1');
    //     expect(newState['Article']['3']).toBeDefined();
    // });

});
//
describe('updateResourceState', () => {
    it('should return the state if the resource or its type were not found', () => {
        let state = {};
        let newState = updateResourceState(state, { type: 'Article', id: '1' })
        expect(newState).toEqual({});
    });

    it('should update the resourceState and loading state', () => {
        let state = {
            'Article': {
                '1': {
                    state: ResourceState.CREATED,
                    loading: true
                }
            }
        };
        let newState = updateResourceState(state, { type: 'Article', id: '1' },
            ResourceState.IN_SYNC, false);
        expect(newState['Article']['1'].state).toEqual(ResourceState.IN_SYNC);
        expect(newState['Article']['1'].loading).toEqual(false);
    });
});

describe('updateQueryParams', () => {
    let storeQueries = {
        '1': {
            query: {},
            loading: false
        },
        '2': {
            query: {},
            loading: false
        },
        '3': {
            query: {},
            loading: false,
        }
    }
    it('should update query params given a query store and a query', () => {
        let newQuery = {
            queryId: '1',
            type: 'getOne'
        }
        let newStoreQueries = updateQueryParams(storeQueries, newQuery);
        expect(newStoreQueries['1'].query.type).toEqual('getOne');
    });

    it('should create a new query if the query was not found in the storeQueries', () => {
        let newQuery = {
            queryId: '4',
            type: 'getOne'
        }
        let newStoreQueries = updateQueryParams(storeQueries, newQuery);
        expect(newStoreQueries['4']).toBeDefined();
        expect(newStoreQueries['4'].query.type).toEqual('getOne');
    });

    // it('should create a random query id if the query has no id', () => {
    //   let newQuery = {
    //     type: 'getOne'
    //   }
    //   let newStoreQueries = updateQueryParams(storeQueries, newQuery);
    //   expect(newStoreQueries['4']).toBeDefined();
    //   expect(newStoreQueries['4'].query.type).toEqual('getOne');
    // });

});

describe('removeQuery', () => {
    it('should remove a query given its id', () => {
        let storeQueries = {
            '1': {},
            '2': {},
            '3': {}
        }
        let newStoreQueries = removeQuery(storeQueries, '2');
        expect(newStoreQueries['2']).not.toBeDefined();
        expect(storeQueries['2']).toBeDefined();
    });
});

describe('toResourceIdentifier', () => {
    it('should map a resource to a resource identifier', () => {
        let resource = {
            type: 'Article',
            id: '1',
            attributes: {
                title: 'Untitled'
            }
        };
        expect(toResourceIdentifier(resource)).toEqual({ type: 'Article', id: '1' });
    });
});

describe('updateQueryResults', () => {
    it('should update the query results given a storeQueries and a queryId', () => {
        let storeQueries = {
            'a1': {
                query: {
                    queryId: 'a1',
                    type: 'Article'
                },
                loading: true
            }
        };
        let document = {
            data: [
                {
                    type: "Article",
                    id: "1",
                    attributes: {
                        "title": "Article 1"
                    },
                },
                {
                    type: "Article",
                    id: "2",
                    attributes: {
                        "title": "Article 2"
                    },
                },
            ]
        }
        let newStoreQueries = updateQueryResults(storeQueries, 'a1', document);
        expect(newStoreQueries['a1'].resultIds.length).toEqual(2);
        expect(newStoreQueries['a1'].resultIds[0]).toEqual({ type: 'Article', id: '1' });
        expect(newStoreQueries['a1'].loading).toBe(false);
    })
});

describe('updateStoreResources', () => {
    it('should update the store data given a JsonApiDocument', () => {
        let newState = updateStoreResources(initialNgrxJsonApiState.data, documentPayload);
        expect(newState['Article']).toBeDefined();
        expect(newState['Person']).toBeDefined();
        expect(newState['Article']['1']).toBeDefined();
        expect(newState['Article']['2']).toBeDefined();
        expect(newState['Person']['1']).toBeDefined();
        expect(newState['Person']['2']).toBeDefined();
        expect(newState['Article']['2'].resource.attributes.title).toEqual('Untitled');
    });
});


describe('filterResources (TODO: test remaining types)', () => {

    let storeData = updateStoreResources(initialNgrxJsonApiState.data, testPayload);

    let resources = storeData['Article'];
    it('should filter resources using an iexact filter if no type is given', () => {
        let query = {
            type: 'Article',
            params: {
                filtering: [{ path: 'title', value: 'article 2' }]
            }
        }
        let filtered = filterResources(resources, storeData, query, resourceDefinitions);
        expect(filtered.length).toBe(1);
        expect(filtered[0].resource.id).toBe('2');
        expect(filtered[0].resource.type).toBe('Article');
    });

    it('should filter resources using iexact filter', () => {
        let query = {
            type: 'Article',
            params: {
                filtering: [
                    { path: 'title', value: 'article 2', type: 'iexact' }
                ]
            }
        }
        let filtered = filterResources(resources, storeData, query, resourceDefinitions);
        expect(filtered.length).toBe(1);
        expect(filtered[0].resource.id).toBe('2');
        expect(filtered[0].resource.type).toBe('Article');
    });

    it('should filter resources using in filter', () => {
        let query = {
            type: 'Article',
            params: {
                filtering: [
                    {
                        path: 'title',
                        value: ['Article 2', 'Article 1'],
                        type: 'in'
                    }
                ]
            }
        }
        let filtered = filterResources(resources, storeData, query, resourceDefinitions);
        expect(filtered.length).toBe(2);
        expect(filtered[0].resource.id).toBe('1');
        expect(filtered[0].resource.type).toBe('Article');
        expect(filtered[1].resource.id).toBe('2');
    });

    it('should filter based on related resources using iexact filter', () => {
        let query = {
            type: 'Article',
            params: {
                filtering: [
                    { path: 'author.name', value: 'person 1', type: 'iexact', }
                ]
            }
        }
        let filtered = filterResources(resources, storeData, query, resourceDefinitions);
        expect(filtered.length).toBe(1);
        expect(filtered[0].resource.id).toBe('1');
        expect(filtered[0].resource.type).toBe('Article');
    });

    it('should return no results if the fieldValue is null', () => {
        let query = {
            type: 'Article',
            params: {
                filtering: [
                    { path: 'body', value: 'person 1', type: 'iexact', }
                ]
            }
        }
        let filtered = filterResources(resources, storeData, query, resourceDefinitions);
        expect(filtered.length).toBe(0);
    });

    // it('should filter hasMany related resources using iexact filter', () => {
    //     let query = {
    //         type: 'Article',
    //         params: {
    //             filtering: [
    //                 { path: 'text', value: 'uncommented', type: 'iexact', path: 'comments' }
    //             ]
    //         }
    //     }
    //     let filtered = filterResources(resources, storeData, query, resourceDefinitions);
    //     expect(filtered.length).toBe(1);
    //     expect(filtered[0].resource.id).toBe('1');
    //     expect(filtered[0].resource.type).toBe('Article');
    // });

});

describe('getFieldFromPath', () => {
    let storeData = updateStoreResources(initialNgrxJsonApiState.data, testPayload);

    it('should throw an error if the definition was not found', () => {
      let baseResource = storeData['Whatever']['1'];
        expect(() => getFieldFromPath('whatever', baseResource, storeData, resourceDefinitions)
        ).toThrow();
    });

    it('should throw an error if definition has no attributes or relations', () => {
      let baseResource = storeData['Comment']['1'];
      expect(() => getFieldFromPath('whatever', baseResource, storeData, resourceDefinitions)
    ).toThrow();
    });

    it('should return the attribute if the path is made of a single field', () => {
        let baseResource = storeData['Article']['1'];
        let typeAttrib = getFieldFromPath('title', baseResource, storeData, resourceDefinitions);
        expect(typeAttrib).toEqual('Article 1');
    });

    it('should return null if the field is found in attributes definition but not in resource', () => {
        let baseResource = storeData['Article']['1'];
        let value = getFieldFromPath('body', baseResource, storeData, resourceDefinitions);
        expect(value).toBeNull();
    });

    it('should throw an error if the last field in the path is a relationship', () => {
      let baseResource = storeData['Article']['1'];
      expect(() => getFieldFromPath('blog', baseResource, storeData, resourceDefinitions)
    ).toThrow();
    });

    it('should throw an error if the path contains a hasMany relationship', () => {
      let baseResource = storeData['Article']['1'];
      expect(() => getFieldFromPath('author.comments.text', baseResource, storeData, resourceDefinitions)
    ).toThrow();
    });

    it('should return null if the field is found in relationships definition but not in resource', () => {
        let baseResource = storeData['Article']['1'];
        let value = getFieldFromPath('blog.name', baseResource, storeData, resourceDefinitions);
        expect(value).toBeNull();
    });

    it('should return the attribute for a complex path', () => {
      let baseResource = storeData['Article']['1'];
      let value = getFieldFromPath('author.name', baseResource, storeData, resourceDefinitions);
      expect(value).toEqual('Person 1');
    });

    it('should throw an error if the field is not found in attributes or relationships', () => {
      let baseResource = storeData['Article']['1'];
        expect(() => getFieldFromPath('whatever', baseResource, storeData, resourceDefinitions)
        ).toThrow();
    });

    it('should return null if a related resource was not found', () => {
        let baseResource = storeData['Article']['2'];
        let value = getFieldFromPath('author.name', baseResource, storeData, resourceDefinitions);
        expect(value).toBeNull();
    });

    it('should return the attribute for a very complex path', () => {
      let baseResource = storeData['Article']['1'];
      let value = getFieldFromPath('author.profile.id', baseResource, storeData, resourceDefinitions);
      expect(value).toEqual('firstProfile');
    });

});

describe('generateIncludedQueryParams', () => {
    it('should generate an included query param given an array of resources to be included', () => {
        let params = generateIncludedQueryParams(['comments', 'comments.author'])
        expect(params).toEqual('include=comments,comments.author');
    })

    it('should return an empty string if the array is empty', () => {
        let params = generateIncludedQueryParams([])
        expect(params).toEqual('');
    })
});

describe('generateFieldsQueryParams', () => {
    it('should generate fields query param given an array of resources to be included', () => {
        let params = generateFieldsQueryParams(['comments', 'author'])
        expect(params).toEqual('fields=comments,author');
    })

    it('should return an empty string if the array is empty', () => {
        let params = generateFieldsQueryParams([])
        expect(params).toEqual('');
    })
});
//
describe('generateFilteringParams', () => {
    // it('should generate filter params given an array of filters', () => {
    //
    //     let params = generateFilteringParams([
    //         {
    //             api: 'person__name', value: 'Smith'
    //         },
    //         {
    //             api: 'person__age', value: 20
    //         }
    //     ]);
    //     expect(params).toEqual('filter[person__name]=Smith&filter[person__age]=20')
    // });
    //
    // it('should return an empty string given an empty array of filters', () => {
    //
    //     let params = generateFilteringParams([]);
    //
    //     expect(params).toEqual('');
    // });
});

describe('generateSortingQueryParams', () => {

});

describe('generateQueryParams', () => {
    it('should generate query params', () => {
        expect(generateQueryParams('a', 'b', 'c')).toEqual('?a&b&c');
    });

    it('should return an empty string given no params', () => {
        expect(generateQueryParams()).toEqual('');
    });
})
