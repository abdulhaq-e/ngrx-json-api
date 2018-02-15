import _ = require('lodash');
//
import {
  deleteStoreResources,
  denormaliseStoreResource,
  filterResources,
  generateFieldsQueryParams,
  generateIncludedQueryParams,
  generatePayload,
  generateQueryParams,
  generateSortingQueryParams,
  getDenormalisedPath,
  getDenormalisedValue,
  getPendingChanges,
  getResourceFieldValueFromPath,
  insertStoreResource,
  isEqualResource,
  removeQuery,
  rollbackStoreResources,
  setIn,
  sortPendingChanges,
  toResourceIdentifier,
  updateQueryErrors,
  updateQueryParams,
  updateQueryResults,
  updateResourceErrors,
  updateResourceErrorsForQuery,
  updateResourceObject,
  updateResourceState,
  updateStoreDataFromPayload,
  updateStoreDataFromResource,
  updateStoreResource,
} from '../src/utils';
//
import {
  initialNgrxJsonApiState,
  initialNgrxJsonApiZone,
} from '../src/reducers';
//
import {
  NgrxJsonApiStoreData,
  Resource,
  StoreResource,
} from '../src/interfaces';

import {
  documentPayload,
  resourceDefinitions,
  testPayload,
} from './test_utils';

let deepFreeze = require('deep-freeze');

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
// });

describe('setIn', () => {
  it('should do nothing if value not changed', () => {
    let a = {
      x: 1,
      y: 2,
    };
    let result = setIn(a, 'x', 1);
    expect(result === a).toBeTruthy();
  });

  it('should change value', () => {
    let a = {
      x: 1,
      y: 2,
    };
    let result = setIn(a, 'x', 3);
    expect(result === a).toBeFalsy();
    expect(result.x).toEqual(3);
    expect(result.y).toEqual(2);
  });

  it('should change value', () => {
    let a = {
      x: 1,
      y: 2,
    };
    let result = setIn(a, 'x', 3);
    expect(result === a).toBeFalsy();
    expect(result.x).toEqual(3);
    expect(result.y).toEqual(2);
  });

  it('should change nested value', () => {
    let a = {
      x: {
        a: '1',
      },
      y: {
        b: '2',
      },
    };
    let result = setIn(a, 'x.a', 3);
    expect(result === a).toBeFalsy();
    expect(result.x === a.x).toBeFalsy();
    expect(result.y === a.y).toBeTruthy();
    expect(result.x.a).toEqual(3);
  });
});

describe('denormalise and denormaliseObject', () => {
  let storeData = updateStoreDataFromPayload(
    initialNgrxJsonApiZone.data,
    testPayload
  );
  deepFreeze(storeData);

  it('should do nothing given a resource with attributes only', () => {
    let dR1 = denormaliseStoreResource(storeData['Person']['2'], storeData, {});
    expect(dR1.type).toEqual('Person');
    expect(dR1.attributes.name).toEqual('Person 2');
    let dR2 = denormaliseStoreResource(storeData['Blog']['2'], storeData, {});
    expect(dR2.type).toEqual('Blog');
    expect(dR2.id).toEqual('2');
  });

  it('should denormalise a resource with relations', () => {
    let dR = denormaliseStoreResource(storeData['Blog']['1'], storeData, {});
    expect(dR.attributes.name).toEqual('Blog 1');
    expect(dR.id).toEqual('1');
    expect(dR.relationships.author.reference).toBeDefined();
    expect(dR.relationships.author.reference.attributes.name).toEqual(
      'Person 2'
    );
  });

  it('should denormalise a resource with deep relations', () => {
    let dR = denormaliseStoreResource(storeData['Person']['1'], storeData, {});
    expect(
      _.isArray(_.get(dR, ['relationships', 'blogs', 'reference']))
    ).toBeTruthy();
    expect(
      _.get(dR, ['relationships', 'blogs', 'reference', '0', 'type'])
    ).toEqual('Blog');
    expect(
      _.get(dR, ['relationships', 'blogs', 'reference', '0', 'id'])
    ).toEqual('1');
    expect(
      _.get(dR, ['relationships', 'blogs', 'reference', '1', 'type'])
    ).toEqual('Blog');
    expect(
      _.get(dR, ['relationships', 'blogs', 'reference', '1', 'id'])
    ).toEqual('3');
    expect(
      _.get(dR, [
        'relationships',
        'blogs',
        'reference',
        '0',
        'relationships',
        'author',
        'reference',
        'attributes',
        'name',
      ])
    ).toEqual('Person 2');
  });

  it('should denormalise a resource with very deep relations (circular dependency)', () => {
    let dR = denormaliseStoreResource(storeData['Article']['1'], storeData, {});
    expect(_.get(dR, ['relationships', 'author', 'reference'])).toEqual(
      _.get(dR, [
        'relationships',
        'author',
        'reference',
        'relationships',
        'blogs',
        'reference',
        '1',
        'relationships',
        'author',
        'reference',
      ])
    );
  });
});

describe('getDenormalisedPath', () => {
  it('should get the denormalised path for a simple', () => {
    let path = 'title';
    let resolvedPath = getDenormalisedPath(
      path,
      'Article',
      resourceDefinitions
    );
    expect(resolvedPath).toEqual('attributes.title');
  });

  it('should get the denormalised path for an attribute in a related resource', () => {
    let path = 'author.firstName';
    let resolvedPath = getDenormalisedPath(
      path,
      'Article',
      resourceDefinitions
    );
    expect(resolvedPath).toEqual(
      'relationships.author.reference.attributes.firstName'
    );
  });

  it('should get the denormalised path for an attribute in a deeply related resource', () => {
    let path = 'author.profile.id';
    let resolvedPath = getDenormalisedPath(
      path,
      'Article',
      resourceDefinitions
    );
    expect(resolvedPath).toEqual(
      'relationships.author.reference.relationships.profile.reference.attributes.id'
    );
  });

  it('should get the denormalised path for a hasOne related resource', () => {
    let path = 'author';
    let resolvedPath = getDenormalisedPath(
      path,
      'Article',
      resourceDefinitions
    );
    expect(resolvedPath).toEqual('relationships.author.reference');
  });

  it('should get the denormalised path for a deeply hasOne related resource', () => {
    let path = 'author.profile';
    let resolvedPath = getDenormalisedPath(
      path,
      'Article',
      resourceDefinitions
    );
    expect(resolvedPath).toEqual(
      'relationships.author.reference.relationships.profile.reference'
    );
  });

  it('should get the denormalised path for a hasMany related resource', () => {
    let path = 'comments';
    let resolvedPath = getDenormalisedPath(
      path,
      'Article',
      resourceDefinitions
    );
    expect(resolvedPath).toEqual('relationships.comments.reference');
  });
});

describe('getDenormalisedValue', () => {
  let storeData = updateStoreDataFromPayload(
    initialNgrxJsonApiZone.data,
    testPayload
  );
  let denormalisedR = denormaliseStoreResource(
    storeData['Article']['1'],
    storeData
  );
  it('should get the value from a DenormalisedStoreResource given a simple path: attribute', () => {
    let value = getDenormalisedValue(
      'title',
      denormalisedR,
      resourceDefinitions
    );
    expect(value).toEqual('Article 1');
  });

  it('should get the value from a DenormalisedStoreResource given a simple path: related attribute', () => {
    let value = getDenormalisedValue(
      'author.name',
      denormalisedR,
      resourceDefinitions
    );
    expect(value).toEqual('Person 1');
  });

  it('should get a hasOne related resource from a DenormalisedStoreResource given a simple path', () => {
    let relatedR = getDenormalisedValue(
      'author',
      denormalisedR,
      resourceDefinitions
    );
    expect(relatedR).toBeDefined();
    expect(relatedR.type).toEqual('Person');
  });

  it('should get a hasMany related resource from a DenormalisedStoreResource given a simple path', () => {
    let relatedR = getDenormalisedValue(
      'comments',
      denormalisedR,
      resourceDefinitions
    );
    expect(relatedR).toBeDefined();
    expect(relatedR[0].type).toEqual('Comment');
    expect(relatedR[0].id).toEqual('1');
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
          data: { type: 'Person', id: '1' },
        },
      },
    };
    let source: Resource = {
      type: 'Article',
      id: '1',
      attributes: {
        title: 'Untitled',
      },
      relationships: {
        author: {
          data: { type: 'Person', id: '2' },
        },
      },
    };
    deepFreeze(original);
    deepFreeze(source);

    expect(updateResourceObject(original, source).attributes.title).toEqual(
      'Untitled'
    );
    expect(updateResourceObject(original, source).attributes.body).toEqual(
      'Testing JSON API'
    );
    expect(
      updateResourceObject(original, source).relationships.author.data
    ).toEqual({ type: 'Person', id: '2' });
  });
});

describe('insertStoreResource', () => {
  it('should insert StoreResource with IN_SYNC state if from server', () => {
    let resource: Resource = {
      type: 'Article',
      id: '1',
      attributes: {
        body: 'Testing JSON API',
        title: 'JSON API paints my bikeshed!',
      },
      relationships: {
        author: {
          data: { type: 'Person', id: '1' },
        },
      },
    };
    deepFreeze(resource);
    let storeResources = {};
    let newStoreResources = insertStoreResource(storeResources, resource, true);
    expect(newStoreResources['1']).toBeDefined();
    expect(newStoreResources['1']['type']).toEqual('Article');
    expect(newStoreResources['1'].attributes).toEqual(resource.attributes);
    expect(newStoreResources['1'].relationships).toEqual(
      resource.relationships
    );
    expect(newStoreResources['1'].persistedResource).toEqual(resource);
    expect(newStoreResources['1'].state).toEqual('IN_SYNC');
  });

  it('should insert StoreResource with CREATED state if from server', () => {
    let resource: Resource = {
      type: 'Article',
      id: '1',
      attributes: {
        body: 'Testing JSON API',
        title: 'JSON API paints my bikeshed!',
      },
      relationships: {
        author: {
          data: { type: 'Person', id: '1' },
        },
      },
    };
    deepFreeze(resource);
    let storeResources = {};
    let newStoreResources = insertStoreResource(
      storeResources,
      resource,
      false
    );
    expect(newStoreResources['1']).toBeDefined();
    expect(newStoreResources['1']['type']).toEqual('Article');
    expect(newStoreResources['1'].attributes).toEqual(resource.attributes);
    expect(newStoreResources['1'].relationships).toEqual(
      resource.relationships
    );
    expect(newStoreResources['1'].persistedResource).toBeNull();
    expect(newStoreResources['1'].state).toEqual('CREATED');
  });
});

describe('updateResourceState', () => {
  it('should return the state if the resource or its type were not found', () => {
    let state = {};
    let newState = updateResourceState(state, { type: 'Article', id: '1' });
    expect(newState).toEqual({});
  });

  it('should update the resourceState and loading state', () => {
    let state = {
      Article: {
        '1': {
          state: 'CREATED',
          loading: true,
        },
      },
    };
    let newState = updateResourceState(
      state,
      { type: 'Article', id: '1' },
      'IN_SYNC',
      false
    );
    expect(newState['Article']['1'].state).toEqual('IN_SYNC');
    expect(newState['Article']['1'].loading).toEqual(false);
  });
});

describe('updateStoreResource', () => {
  let state = {
    '1': {
      type: 'Article',
      id: '1',
      attributes: {
        title: 'JSON API paints my bikeshed!',
      },
      persistedResource: {
        type: 'Article',
        id: '1',
        attributes: {
          title: 'JSON API paints my bikeshed!',
        },
      },
    },
    '2': {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Second article',
      },
      persistedResource: {
        type: 'Article',
        id: '2',
        attributes: {
          title: 'Second article',
        },
      },
    },
    '3': {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Third article',
      },
      persistedResource: null,
    },
  };
  deepFreeze(state);

  it('should override the store resource if the store came from the server', () => {
    let resource: Resource = {
      type: 'Article',
      id: '1',
      attributes: {
        title: 'Untitled',
      },
    };
    deepFreeze(resource);
    let newState = updateStoreResource(state, resource, true);
    expect(newState['1'].attributes.title).toEqual('Untitled');
    expect(newState['1'].persistedResource.attributes.title).toEqual(
      'Untitled'
    );
  });

  it('should do nothing for an equal resource not from server', () => {
    let resource: Resource = {
      type: 'Article',
      id: '1',
      attributes: {
        title: 'JSON API paints my bikeshed!',
      },
    };
    deepFreeze(resource);
    let newState = updateStoreResource(state, resource, false);
    expect(newState['1'].attributes.title).toEqual(
      'JSON API paints my bikeshed!'
    );
    expect(newState['1'].persistedResource.attributes.title).toEqual(
      'JSON API paints my bikeshed!'
    );
  });

  it('should merge a new resource not from server and add UPDATED state if a persistedResource exists', () => {
    let resource: Resource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
      },
    };
    deepFreeze(resource);
    let newState = updateStoreResource(state, resource, false);
    expect(newState['2'].attributes.title).toEqual('Untitled');
    expect(newState['2'].persistedResource.attributes.title).toEqual(
      'Second article'
    );
    expect(newState['2'].state).toEqual('UPDATED');
  });

  it('should not concat arrays when merging resource', () => {
    let resource1: Resource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
    };
    let resource2: Resource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['b', 'c'],
      },
    };
    deepFreeze(resource1);
    deepFreeze(resource2);
    let newState1 = updateStoreResource(state, resource1, false);
    let newState2 = updateStoreResource(newState1, resource2, false);
    expect(newState2['2'].attributes['keywords']).toEqual(['b', 'c']);
    expect(newState2['2'].state).toEqual('UPDATED');
  });

  it('should merge a new resource not from server and add CREATED state if a persistedResource does not exists', () => {
    let resource: Resource = {
      type: 'Article',
      id: '3',
      attributes: {
        title: 'Untitled',
      },
    };
    deepFreeze(resource);
    let newState = updateStoreResource(state, resource, false);
    expect(newState['3'].attributes.title).toEqual('Untitled');
    expect(newState['3'].persistedResource).toBeNull();
    expect(newState['3'].state).toEqual('CREATED');
  });
});

describe('isEqualResource', () => {
  it('should ignore different states', () => {
    let resource1: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
      state: 'CREATED',
    };
    let resource2: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
      state: 'IN_SYNC',
    };
    let equal = isEqualResource(resource1, resource2);
    expect(equal).toBeTruthy();
  });

  it('should be equal for same contents', () => {
    let resource1: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
    };
    let resource2: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
    };
    let equal = isEqualResource(resource1, resource2);
    expect(equal).toBeTruthy();
  });

  it('should not be equal for different id', () => {
    let resource1: StoreResource = {
      type: 'Article',
      id: '1',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
    };
    let resource2: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
    };
    let equal = isEqualResource(resource1, resource2);
    expect(equal).toBeFalsy();
  });

  it('should not be equal for different type', () => {
    let resource1: StoreResource = {
      type: 'different',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
    };
    let resource2: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
    };
    let equal = isEqualResource(resource1, resource2);
    expect(equal).toBeFalsy();
  });

  it('should not be equal for different attributes', () => {
    let resource1: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'different',
        keywords: ['a', 'b'],
      },
    };
    let resource2: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
    };
    let equal = isEqualResource(resource1, resource2);
    expect(equal).toBeFalsy();
  });

  it('should not be equal for different relationships', () => {
    let resource1: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
    };
    let resource2: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
      relationships: {
        test: {
          data: {
            type: 'test',
            id: '1',
          },
        },
      },
    };
    let equal = isEqualResource(resource1, resource2);
    expect(equal).toBeFalsy();
  });

  it('should be equal for same object', () => {
    let resource1: StoreResource = {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
        keywords: ['a', 'b'],
      },
      state: 'CREATED',
    };
    let equal = isEqualResource(resource1, resource1);
    expect(equal).toBeTruthy();
  });
});

describe('updateResourceErrorsForQuery', () => {
  // it('should throw error if the query type and id is not defined', () => {
  //   expect(updateResourceErrorsForQuery({}, {}, {})).toThrow('invalid parameters');
  // });

  it('should update resource errors given a query and a JsonApiDocument', () => {
    let storeData = {
      Article: {
        '1': {
          resource: {
            type: 'Article',
            id: '1',
          },
          errors: [],
        },
      },
    };
    let query = {
      type: 'Article',
      id: '1',
    };
    deepFreeze(storeData);
    let document = {
      errors: ['permission denied', 'i said permission denied'],
    };
    let newStoreData = updateResourceErrorsForQuery(storeData, query, document);
    expect(newStoreData['Article']['1']['errors']).toEqual(document['errors']);
  });
});

describe('sortPendingChanges', () => {
  it('should POST resource before updating a reference to it', () => {
    let resource1: StoreResource = {
      type: 'Article',
      id: '1',
      state: 'UPDATED',
      relationships: {
        previous: {
          data: {
            type: 'Article',
            id: '2',
          },
        },
      },
    };

    let resource2: StoreResource = {
      type: 'Article',
      id: '2',
      state: 'CREATED',
    };

    let order = sortPendingChanges([resource1, resource2]);
    expect(order[0].id).toEqual('1');
    expect(order[1].id).toEqual('2');

    order = sortPendingChanges([resource2, resource1]);
    expect(order[0].id).toEqual('1');
    expect(order[1].id).toEqual('2');
  });
});

describe('updateResourceErrors', () => {
  it('should add resource errors', () => {
    let storeData = {
      Article: {
        '1': {
          resource: {
            type: 'Article',
            id: '1',
          },
          errors: [{ code: '0' }],
        },
      },
    };
    deepFreeze(storeData);

    let newErrors = [{ code: '1' }, { code: '2' }];
    let newStoreData = updateResourceErrors(
      storeData,
      { id: '1', type: 'Article' },
      newErrors,
      'ADD'
    );
    expect(newStoreData['Article']['1']['errors']).toEqual([
      { code: '0' },
      { code: '1' },
      { code: '2' },
    ]);
  });

  it('should set resource errors', () => {
    let storeData = {
      Article: {
        '1': {
          resource: {
            type: 'Article',
            id: '1',
          },
          errors: [{ code: '0' }],
        },
      },
    };
    deepFreeze(storeData);

    let newErrors = [{ code: '1' }, { code: '2' }];
    let newStoreData = updateResourceErrors(
      storeData,
      { id: '1', type: 'Article' },
      newErrors,
      'SET'
    );
    expect(newStoreData['Article']['1']['errors']).toEqual([
      { code: '1' },
      { code: '2' },
    ]);
  });

  it('should empty resource errors on set with no errors', () => {
    let storeData = {
      Article: {
        '1': {
          resource: {
            type: 'Article',
            id: '1',
          },
          errors: [{ code: '0' }],
        },
      },
    };
    deepFreeze(storeData);

    let newErrors = [];
    let newStoreData = updateResourceErrors(
      storeData,
      { id: '1', type: 'Article' },
      newErrors,
      'SET'
    );
    expect(newStoreData['Article']['1']['errors']).toEqual([]);
  });

  it('should empty resource errors on set with undefined errors', () => {
    let storeData = {
      Article: {
        '1': {
          resource: {
            type: 'Article',
            id: '1',
          },
          errors: [{ code: '0' }],
        },
      },
    };
    deepFreeze(storeData);

    let newErrors = undefined;
    let newStoreData = updateResourceErrors(
      storeData,
      { id: '1', type: 'Article' },
      newErrors,
      'SET'
    );
    expect(newStoreData['Article']['1']['errors']).toEqual([]);
  });

  it('should remove resource errors', () => {
    let storeData = {
      Article: {
        '1': {
          resource: {
            type: 'Article',
            id: '1',
          },
          errors: [{ code: '0' }, { code: '2' }],
        },
      },
    };
    deepFreeze(storeData);

    let removedErrors = [{ code: '0' }, { code: '1' }];
    let newStoreData = updateResourceErrors(
      storeData,
      { id: '1', type: 'Article' },
      removedErrors,
      'REMOVE'
    );
    expect(newStoreData['Article']['1']['errors']).toEqual([{ code: '2' }]);
  });
});

describe('rollbackStoreResources', () => {
  let storeData = {
    Article: {
      '1': {
        resource: { type: 'Article', id: '1' },
        state: 'CREATED',
      },
    },
    Comment: {
      '1': {
        resource: { type: 'Comment', id: '1', attributes: { title: 'C1' } },
        state: 'UPDATED',
        persistedResource: {
          type: 'Comment',
          id: '1',
          attributes: { title: 'C11' },
        },
      },
    },
  };
  it('should delete the resource if a persistedResource does not exist', () => {
    let newState = rollbackStoreResources(storeData);
    expect(newState['Article']['1']).not.toBeDefined();
    expect(newState['Comment']['1']).toBeDefined();
    expect(newState['Comment']['1'].resource.attributes.title).toEqual('C11');
    expect(newState['Comment']['1'].state).toEqual('IN_SYNC');
  });
});

describe('deleteStoreResources', () => {
  let storeData = {
    Article: {
      '1': {},
      '2': {},
    },
    Comment: {
      '1': {},
      '2': {},
    },
  };
  it('should delete a single resource given a type and id', () => {
    let newStoreData = deleteStoreResources(storeData, {
      type: 'Article',
      id: '1',
    });
    expect(newStoreData['Article']['1']).not.toBeDefined();
    expect(newStoreData['Article']['2']).toBeDefined();
  });

  it('should delete all resources given a type only', () => {
    let newStoreData = deleteStoreResources(storeData, { type: 'Article' });
    expect(newStoreData['Article']).toEqual({});
  });
});

describe('updateStoreDataFromResource', () => {
  it(`should insert a resource if it was not found`, () => {
    let state = {
      Article: {
        '1': {
          resource: {
            type: 'Article',
            id: '1',
            attributes: {
              title: 'JSON API paints my bikeshed!',
            },
          },
        },
      },
    };
    deepFreeze(state);

    let newResource: Resource = {
      type: 'Article',
      id: '3',
    };
    let newState = updateStoreDataFromResource(state, newResource, true, true);
    expect(newState['Article']['3']).toBeDefined();
    expect(newState['Article']['3'].id).toEqual('3');
    expect(newState['Article']['1']).toBeDefined();
  });

  it('should update a resource if found', () => {
    let state = {
      Article: {
        '1': {
          resource: {
            type: 'Article',
            id: '1',
            attributes: {
              title: 'JSON API paints my bikeshed!',
              body: 'Test',
            },
          },
        },
      },
    };
    deepFreeze(state);

    let newResource: Resource = {
      type: 'Article',
      id: '1',
      attributes: {
        tag: 'Whatever',
      },
    };
    let newState = updateStoreDataFromResource(state, newResource, true, true);
    expect(newState['Article']['1']).toBeDefined();
    expect(newState['Article']['1'].attributes.tag).toEqual('Whatever');
  });

  it('should insert resource type and resource if none were found', () => {
    let state = {};
    deepFreeze(state);

    let newResource: Resource = {
      type: 'Article',
      id: '3',
    };
    let newState = updateStoreDataFromResource(state, newResource, true, true);
    expect(newState['Article']).toBeDefined();
    expect(newState['Article']['3']).toBeDefined();
  });
});

describe('updateStoreDataFromPayload', () => {
  it('should update the store data given a JsonApiDocument', () => {
    let newState = updateStoreDataFromPayload(
      initialNgrxJsonApiZone.data,
      documentPayload
    );
    expect(newState['Article']).toBeDefined();
    expect(newState['Person']).toBeDefined();
    expect(newState['Article']['1']).toBeDefined();
    expect(newState['Article']['2']).toBeDefined();
    expect(newState['Person']['1']).toBeDefined();
    expect(newState['Person']['2']).toBeDefined();
    expect(newState['Article']['2'].attributes.title).toEqual('Untitled');
  });
});

describe('updateQueryParams', () => {
  let storeQueries = {
    '1': {
      query: {},
      loading: false,
    },
    '2': {
      query: {},
      loading: false,
    },
    '3': {
      query: {},
      loading: false,
    },
  };
  it('should update query params given a query store and a query', () => {
    let newQuery = {
      queryId: '1',
      type: 'getOne',
    };
    let newStoreQueries = updateQueryParams(storeQueries, newQuery);
    expect(newStoreQueries['1'].query.type).toEqual('getOne');
  });

  it('should create a new query if the query was not found in the storeQueries', () => {
    let newQuery = {
      queryId: '4',
      type: 'getOne',
    };
    let newStoreQueries = updateQueryParams(storeQueries, newQuery);
    expect(newStoreQueries['4']).toBeDefined();
    expect(newStoreQueries['4'].query.type).toEqual('getOne');
  });
});

describe('updateQueryResults', () => {
  it('should update the query data given a storeQueries and a queryId', () => {
    let storeQueries = {
      a1: {
        query: {
          queryId: 'a1',
          type: 'Article',
        },
        loading: true,
      },
    };
    let document = {
      data: [
        {
          type: 'Article',
          id: '1',
          attributes: {
            title: 'Article 1',
          },
        },
        {
          type: 'Article',
          id: '2',
          attributes: {
            title: 'Article 2',
          },
        },
      ],
    };
    let newStoreQueries = updateQueryResults(storeQueries, 'a1', document);
    expect(newStoreQueries['a1'].resultIds.length).toEqual(2);
    expect(newStoreQueries['a1'].resultIds[0]).toEqual({
      type: 'Article',
      id: '1',
    });
    expect(newStoreQueries['a1'].loading).toBe(false);
  });
});

describe('updateQueryErrors', () => {
  it('should return the state if the queryId is not given or query not found', () => {
    let queriesStore = {};
    expect(updateQueryErrors(queriesStore)).toEqual({});
  });

  it('should add any errors in the JsonApiDocument to the query erros', () => {
    let queriesStore = {
      '1': {
        query: {},
        loading: false,
        errors: [],
      },
    };
    deepFreeze(queriesStore);
    let document = {
      errors: ['permission denied', 'i said permission denied'],
    };
    let newQueriesStore = updateQueryErrors(queriesStore, '1', document);
    expect(newQueriesStore['1'].errors.length).toEqual(2);
    expect(newQueriesStore['1'].errors).toEqual(document['errors']);
  });
});

describe('removeQuery', () => {
  it('should remove a query given its id', () => {
    let storeQueries = {
      '1': {},
      '2': {},
      '3': {},
    };
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
        title: 'Untitled',
      },
    };
    expect(toResourceIdentifier(resource)).toEqual({
      type: 'Article',
      id: '1',
    });
  });
});

describe('getResourceFieldValueFromPath', () => {
  let storeData = updateStoreDataFromPayload(
    initialNgrxJsonApiZone.data,
    testPayload
  );

  it('should throw an error if the definition was not found', () => {
    let baseResource = storeData['Whatever']['1'];
    expect(() =>
      getResourceFieldValueFromPath(
        'whatever',
        baseResource,
        storeData,
        resourceDefinitions
      )
    ).toThrow();
  });

  it('should throw an error if definition has no attributes or relations', () => {
    let baseResource = storeData['Comment']['1'];
    expect(() =>
      getResourceFieldValueFromPath(
        'whatever',
        baseResource,
        storeData,
        resourceDefinitions
      )
    ).toThrow();
  });

  it('should return the attribute if the path is made of a single field', () => {
    let baseResource = storeData['Article']['1'];
    let typeAttrib = getResourceFieldValueFromPath(
      'title',
      baseResource,
      storeData,
      resourceDefinitions
    );
    expect(typeAttrib).toEqual('Article 1');
  });

  it('should return null if the field is found in attributes definition but not in resource', () => {
    let baseResource = storeData['Article']['1'];
    let value = getResourceFieldValueFromPath(
      'body',
      baseResource,
      storeData,
      resourceDefinitions
    );
    expect(value).toBeNull();
  });

  it('should throw an error if the last field in the path is a relationship', () => {
    let baseResource = storeData['Article']['1'];
    expect(() =>
      getResourceFieldValueFromPath(
        'blog',
        baseResource,
        storeData,
        resourceDefinitions
      )
    ).toThrow();
  });

  it('should throw an error if the path contains a hasMany relationship', () => {
    let baseResource = storeData['Article']['1'];
    expect(() =>
      getResourceFieldValueFromPath(
        'author.comments.text',
        baseResource,
        storeData,
        resourceDefinitions
      )
    ).toThrow();
  });

  it('should return null if the field is found in relationships definition but not in resource', () => {
    let baseResource = storeData['Article']['1'];
    let value = getResourceFieldValueFromPath(
      'blog.name',
      baseResource,
      storeData,
      resourceDefinitions
    );
    expect(value).toBeNull();
  });

  it('should return the attribute for a complex path', () => {
    let baseResource = storeData['Article']['1'];
    let value = getResourceFieldValueFromPath(
      'author.name',
      baseResource,
      storeData,
      resourceDefinitions
    );
    expect(value).toEqual('Person 1');
  });

  it('should throw an error if the field is not found in attributes or relationships', () => {
    let baseResource = storeData['Article']['1'];
    expect(() =>
      getResourceFieldValueFromPath(
        'whatever',
        baseResource,
        storeData,
        resourceDefinitions
      )
    ).toThrow();
  });

  it('should return null if a related resource was not found', () => {
    let baseResource = storeData['Article']['2'];
    let value = getResourceFieldValueFromPath(
      'author.name',
      baseResource,
      storeData,
      resourceDefinitions
    );
    expect(value).toBeNull();
  });

  it('should return the attribute for a very complex path', () => {
    let baseResource = storeData['Article']['1'];
    let value = getResourceFieldValueFromPath(
      'author.profile.id',
      baseResource,
      storeData,
      resourceDefinitions
    );
    expect(value).toEqual('1');
  });
});

describe('filterResources (TODO: test remaining types)', () => {
  let storeData = updateStoreDataFromPayload(
    initialNgrxJsonApiZone.data,
    testPayload
  );

  let resources = storeData['Article'];
  it('should filter resources using an iexact filter if no type is given', () => {
    let query = {
      type: 'Article',
      params: {
        filtering: [{ path: 'title', value: 'article 2' }],
      },
    };
    let filtered = filterResources(
      resources,
      storeData,
      query,
      resourceDefinitions
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('2');
    expect(filtered[0].type).toBe('Article');
  });

  it('should filter resources using iexact filter', () => {
    let query = {
      type: 'Article',
      params: {
        filtering: [{ path: 'title', value: 'article 2', operator: 'iexact' }],
      },
    };
    let filtered = filterResources(
      resources,
      storeData,
      query,
      resourceDefinitions
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('2');
    expect(filtered[0].type).toBe('Article');
  });

  it('should filter resources using in filter', () => {
    let query = {
      type: 'Article',
      params: {
        filtering: [
          {
            path: 'title',
            value: ['Article 2', 'Article 1'],
            operator: 'in',
          },
        ],
      },
    };
    let filtered = filterResources(
      resources,
      storeData,
      query,
      resourceDefinitions
    );
    expect(filtered.length).toBe(2);
    expect(filtered[0].id).toBe('1');
    expect(filtered[0].type).toBe('Article');
    expect(filtered[1].id).toBe('2');
  });

  it('should filter based on related resources using iexact filter', () => {
    let query = {
      type: 'Article',
      params: {
        filtering: [
          { path: 'author.name', value: 'person 1', operator: 'iexact' },
        ],
      },
    };
    let filtered = filterResources(
      resources,
      storeData,
      query,
      resourceDefinitions
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
    expect(filtered[0].type).toBe('Article');
  });

  it('should return no data if the resourceFieldValue is null', () => {
    let query = {
      type: 'Article',
      params: {
        filtering: [{ path: 'body', value: 'person 1', operator: 'iexact' }],
      },
    };
    let filtered = filterResources(
      resources,
      storeData,
      query,
      resourceDefinitions
    );
    expect(filtered.length).toBe(0);
  });

  it('should correctly use custom filter operators', () => {
    let query = {
      type: 'Article',
      params: {
        filtering: [
          { path: 'title', value: 'Article', operator: 'firstLetterEqual' },
        ],
      },
    };
    let filteringConfig = {
      filteringOperators: [
        {
          name: 'firstLetterEqual',
          comparison: (value, fieldValue) => value[0] == fieldValue[0],
        },
      ],
    };
    let filtered = filterResources(
      resources,
      storeData,
      query,
      resourceDefinitions,
      filteringConfig
    );
    expect(filtered.length).toBe(2);
    expect(filtered[0].id).toBe('1');
    expect(filtered[0].type).toBe('Article');
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

describe('getPendingChanges', () => {
  let state: NgrxJsonApiStoreData;

  beforeEach(() => {
    state = {
      Country: {
        ch: {
          type: 'Country',
          id: 'ch',
          state: 'IN_SYNC',
          attributes: {
            name: 'CH',
          },
          relationships: {
            country: {
              data: { type: 'Country', id: 'ch' },
            },
          },
        },
        de: {
          type: 'Person',
          id: 'de',
          state: 'IN_SYNC',
          attributes: {
            name: 'DE',
          },
          relationships: {
            country: {
              data: { type: 'Country', id: 'de' },
            },
          },
        },
      },
      Person: {
        '3': {
          type: 'Person',
          id: '3',
          state: 'IN_SYNC',
          attributes: {
            name: 'Person 3',
          },
          relationships: {
            country: {
              data: { type: 'Country', id: 'ch' },
            },
          },
        },
        '4': {
          type: 'Person',
          id: '4',
          state: 'IN_SYNC',
          attributes: {
            name: 'Person 4',
          },
          relationships: {
            country: {
              data: { type: 'Country', id: 'de' },
            },
          },
        },
      },
      Article: {
        '1': {
          type: 'Article',
          id: '1',
          state: 'IN_SYNC',
          attributes: {
            title: 'Article 1',
          },
          relationships: {
            author: {
              data: { type: 'Person', id: '3' },
            },
          },
        },
        '2': {
          type: 'Article',
          id: '2',
          state: 'IN_SYNC',
          attributes: {
            title: 'Article 2',
          },
          relationships: {
            author: {
              data: { type: 'Person', id: '4' },
            },
          },
        },
      },
    };
  });

  it('should return empty array if store in sync', () => {
    let changes = getPendingChanges(state, undefined, undefined, undefined);
    expect(changes.length).toEqual(0);
  });

  it('should return empty array if store in sync', () => {
    let changes = getPendingChanges(state, undefined, undefined, true);
    expect(changes.length).toEqual(0);
  });

  it('should not return new resources by default', () => {
    state['Article']['1'].state = 'NEW';
    let changes = getPendingChanges(state, undefined, undefined, undefined);
    expect(changes.length).toEqual(0);
  });

  it('should return new resources by requested', () => {
    state['Article']['1'].state = 'NEW';
    let changes = getPendingChanges(state, undefined, undefined, true);
    expect(changes.length).toEqual(1);
    expect(changes[0].id).toEqual('1');
  });

  it('should return updated resource', () => {
    state['Article']['2'].state = 'UPDATED';
    let changes = getPendingChanges(state, undefined, undefined, true);
    expect(changes.length).toEqual(1);
    expect(changes[0].id).toEqual('2');
  });

  it('should return changed resource', () => {
    state['Article']['1'].state = 'CREATED';
    state['Article']['2'].state = 'UPDATED';
    state['Country']['de'].state = 'DELETED';
    let changes = getPendingChanges(state, undefined, undefined, true);
    expect(changes.length).toEqual(3);
  });

  it('should return only request changes', () => {
    state['Article']['1'].state = 'CREATED';
    state['Article']['2'].state = 'UPDATED';
    state['Country']['de'].state = 'DELETED';
    let changes = getPendingChanges(
      state,
      [{ type: 'Article', id: '1' }],
      undefined,
      true
    );
    expect(changes.length).toEqual(1);
    expect(changes[0].id).toEqual('1');

    changes = getPendingChanges(
      state,
      [{ type: 'Article', id: '2' }],
      undefined,
      true
    );
    expect(changes.length).toEqual(1);
    expect(changes[0].id).toEqual('2');
  });

  it('should return only request changes and relationships', () => {
    state['Person']['3'].state = 'UPDATED';
    state['Country']['de'].state = 'DELETED';
    state['Country']['ch'].state = 'DELETED';
    let changes = getPendingChanges(
      state,
      [{ type: 'Article', id: '1' }],
      ['author'],
      true
    );
    expect(changes.length).toEqual(1);
    expect(changes[0].id).toEqual('3');

    let changes = getPendingChanges(
      state,
      [{ type: 'Article', id: '2' }],
      ['author'],
      true
    );
    expect(changes.length).toEqual(0);
  });

  it('should return nested relationships', () => {
    state['Country']['de'].state = 'DELETED';
    state['Country']['ch'].state = 'DELETED';
    let changes = getPendingChanges(
      state,
      [{ type: 'Article', id: '1' }],
      ['author.country'],
      true
    );
    expect(changes.length).toEqual(1);
    expect(changes[0].id).toEqual('ch');

    changes = getPendingChanges(
      state,
      [{ type: 'Article', id: '2' }],
      ['author.country'],
      true
    );
    expect(changes.length).toEqual(1);
    expect(changes[0].id).toEqual('de');

    changes = getPendingChanges(
      state,
      [{ type: 'Article', id: '1' }],
      ['author.country.someOther'],
      true
    );
    expect(changes.length).toEqual(1);
    expect(changes[0].id).toEqual('ch');

    changes = getPendingChanges(
      state,
      [{ type: 'Article', id: '1' }],
      ['author.notCountry'],
      true
    );
    expect(changes.length).toEqual(0);
  });
});

describe('generateIncludedQueryParams', () => {
  it('should generate an included query param given an array of resources to be included', () => {
    let params = generateIncludedQueryParams(['comments', 'comments.author']);
    expect(params).toEqual('include=comments,comments.author');
  });

  it('should return an empty string if the array is empty', () => {
    let params = generateIncludedQueryParams([]);
    expect(params).toEqual('');
  });
});

describe('generateFieldsQueryParams', () => {
  it('should generate fields query param given an array of resources to be included', () => {
    let params = generateFieldsQueryParams(['comments', 'author']);
    expect(params).toEqual('fields=comments,author');
  });

  it('should return an empty string if the array is empty', () => {
    let params = generateFieldsQueryParams([]);
    expect(params).toEqual('');
  });
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

describe('generateSortingQueryParams', () => {});

describe('generateQueryParams', () => {
  it('should generate query params', () => {
    expect(generateQueryParams('a', 'b', 'c')).toEqual('?a&b&c');
  });

  it('should return an empty string given no params', () => {
    expect(generateQueryParams()).toEqual('');
  });
});

describe('generatePayload', () => {
  it('should generate a payload for a "create" request given a resource', () => {
    let resource = {
      id: '10',
      type: 'Article',
    };
    let payload = generatePayload(resource, 'POST');
    expect(payload.query.type).toEqual('Article');
    expect(payload.jsonApiData.data.id).toEqual('10');
    expect(payload.jsonApiData.data.type).toEqual('Article');
  });

  it('should generate a payload for a "update" request given a resource', () => {
    let resource = {
      id: '10',
      type: 'Article',
    };
    let payload = generatePayload(resource, 'PATCH');
    expect(payload.query.id).toEqual('10');
    expect(payload.query.type).toEqual('Article');
    expect(payload.jsonApiData.data.id).toEqual('10');
    expect(payload.jsonApiData.data.type).toEqual('Article');
  });

  it('should generate a payload for a "delete" request given a resource', () => {
    let resource = {
      id: '10',
      type: 'Article',
    };
    let payload = generatePayload(resource, 'DELETE');
    expect(payload.query.id).toEqual('10');
    expect(payload.query.type).toEqual('Article');
    expect(payload.jsonApiData).not.toBeDefined();
  });
});
