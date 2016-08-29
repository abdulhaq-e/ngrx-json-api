import _ = require('lodash');

import {
    async,
    inject,
    fakeAsync,
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');

import {
    initialiseStore,
    insertResource,
    transformResource,
    updateOrInsertResource,
    updateResourceObject,
    updateResource,
} from '../src/utils';

import { Resource, ResourceDefinition, NgrxJsonApiStore } from '../src/interfaces';

describe('initialiseStore', () => {

    let resourcesDefinition: Array<ResourceDefinition> = [
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

    it('should init the store given resourcesDefinition', () => {
        let store = initialiseStore(resourcesDefinition);
        let expectedStore = {
            isCreating: false,
            isReading: false,
            isUpdating: false,
            isDeleting: false,
            resourcesDefinitions: resourcesDefinition,
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
        let expectedState: Array<Resource> = [
            {
                type: 'Article',
                id: '1',
                attributes: {
                    'title': 'JSON API paints my bikeshed!'
                }
            },
            {
                type: 'Article',
                id: '3'
            }
        ];
        expect(insertResource(state, newResource)).toEqual(expectedState);
    });

    it(`should insert a resource regardless if it's repeated or not`, () => {
        let newResource: Resource = {
            type: 'Article',
            id: '1'
        };
        let expectedState: Array<Resource> = [
            {
                type: 'Article',
                id: '1',
                attributes: {
                    'title': 'JSON API paints my bikeshed!'
                }
            },
            {
                type: 'Article',
                id: '1'
            }
        ];
        expect(insertResource(state, newResource)).toEqual(expectedState);
    });
});

describe('transformResource', () => {

    it('should transform a basic resource with no attributes and no relations', () => {
        let resource = {
            id: '1',
            type: 'Article'
        };
        let expected = {
            id: '1',
            type: 'Article'
        };
        expect(transformResource(resource)).toEqual(expected);
    });

    it('should transform a resource with attributes', () => {
        let resource = {
            id: '1',
            type: 'Article',
            attributes: {
                title: 'Hello World!'
            }
        };
        let expected = {
            id: '1',
            type: 'Article',
            title: 'Hello World!'
        };
        // console.log(transformResource(resource));
        expect(transformResource(resource)).toEqual(expected);
    });

});

describe('updateResourceObject', () => {

    it('should update attributes', () => {

        let original: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'JSON API paints my bikeshed!',
            }
        };
        let source: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'Untitled'
            }
        };
        deepFreeze(original);
        deepFreeze(source)

        expect(updateResourceObject(original, source).attributes.title)
            .toEqual('Untitled');
    });

    it('should leave un-updated attributes', () => {

        let original: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                title: 'JSON API paints my bikeshed!',
                body: 'Testing JSON API'
            }
        };
        let source: Resource = {
            type: 'Article',
            id: '1',
            attributes: {
                'title': 'Untitled'
            }
        };
        deepFreeze(original);
        deepFreeze(source)

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

        let expectedState: Array<Resource> = [
            {
                type: 'Article',
                id: '1',
                attributes: {
                    'title': 'JSON API paints my bikeshed!'
                }
            },
            {
                type: 'Article',
                id: '3'
            }
        ];
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

//   it('should handle included entities', () => {
//     state = _.assign(state, {
//       'data': _.assign(state.data, {
//         'article': {
//           'data': [
//             {
//               'type': 'Article',
//               'id': '1',
//               'attributes': {
//                 'title': 'JSON API paints my bikeshed!'
//               }
//             },
//             {
//               'type': 'Article',
//               'id': '2',
//               'attributes': {
//                 'title': 'Untitled'
//               }
//             }]
//         },
//         'comment': {
//           'data': [
//             {
//               'type': 'Comment',
//               'id': '1',
//               'attributes': {
//                 'text': 'Uncommented'
//               }
//             },
//             {
//               'type': 'Comment',
//               'id': '2',
//               'attributes': {
//                 'text': 'No comment'
//               }
//             }
//           ]
//         }
//       })
//     });
//     // console.log(state);
//     deepFreeze(state);
//     let entities = {
//       'data': [],
//       'included': [
//         {
//           'type': 'Person',
//           'id': '1',
//           'attributes': {
//             'name': 'Euler'
//           }
//         },
//         {
//           'type': 'Person',
//           'id': '2',
//           'attributes': {
//             'name': 'Lagrange'
//           }
//         }
//       ]
//     };
//     let newState = updateOrCreateReducer(state, entities);
//     // console.log(newState);
//     expect(newState.data.person.data[0].attributes.name).toEqual('Euler');
//     expect(newState.data.person.data[1].attributes.name).toEqual('Lagrange');
//   });
// });
