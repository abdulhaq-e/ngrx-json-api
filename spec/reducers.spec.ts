//
import {
  initialNgrxJsonApiZone,
  NgrxJsonApiStoreReducer,
  NgrxJsonApiZoneReducer,
} from '../src/reducers';
import {
  ApiApplyInitAction,
  ApiDeleteFailAction,
  ApiDeleteInitAction,
  ApiDeleteSuccessAction,
  ApiGetFailAction,
  ApiGetInitAction,
  ApiGetSuccessAction,
  ApiPatchFailAction,
  ApiPatchInitAction,
  ApiPatchSuccessAction,
  ApiPostFailAction,
  ApiPostInitAction,
  ApiPostSuccessAction,
  ApiQueryRefreshAction,
  DeleteStoreResourceAction,
  LocalQuerySuccessAction,
  ModifyStoreResourceErrorsAction,
  NewStoreResourceAction,
  PatchStoreResourceAction,
  PostStoreResourceAction,
  RemoveQueryAction,
} from '../src/actions';

import { testPayload } from './test_utils';

let deepFreeze = require('deep-freeze');

describe('NgrxJsonApiReducer', () => {
  let state = initialNgrxJsonApiZone;
  deepFreeze(state);

  describe('Zone management', () => {
    it('should allocate new zone', () => {
      let action = new PatchStoreResourceAction(
        {
          id: '1',
          type: 'Test',
          attributes: {
            title: 'Test',
          },
        },
        'testZone'
      );

      let rootState = {
        zones: {},
      };

      let newState = NgrxJsonApiStoreReducer(rootState, action);
      expect(newState === rootState).toBeFalsy();
      expect(newState.zones['testZone']).toBeDefined();
      expect(newState.zones['testZone'].data['Test']['1']).toBeDefined();
    });

    it('should not change zone on redudant patch', () => {
      let action = new PatchStoreResourceAction(
        {
          id: '1',
          type: 'Test',
          attributes: {
            title: 'Test',
          },
        },
        'testZone'
      );

      let rootState = {
        zones: {
          testZone: state,
        },
      };

      let newState1 = NgrxJsonApiStoreReducer(rootState, action);
      let newState2 = NgrxJsonApiStoreReducer(newState1, action);
      expect(newState2 === rootState).toBeFalsy();
      expect(newState2 === newState1).toBeTruthy();
    });
  });

  describe('API_POST_INIT action', () => {
    let action = new ApiPostInitAction(
      {
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test',
        },
      },
      'testZone'
    );
    let newState = NgrxJsonApiZoneReducer(state, action);

    it('should add 1 to isCreating', () => {
      expect(newState.isCreating).toBe(1);
    });

    it('all other operation counters should be zero', () => {
      expect(newState.isReading).toBe(0);
      expect(newState.isDeleting).toBe(0);
      expect(newState.isUpdating).toBe(0);
      expect(newState.isApplying).toBe(0);
    });

    it('should add the Resource (and or StoreResource) to the storeData', () => {
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeNull();
      expect(newState.data['Article']['1'].state).toEqual('CREATED');
    });

    it('should keep the ResourceState as CREATED if the new data was also not from the server', () => {
      let action2 = new ApiPatchInitAction(
        {
          id: '1',
          type: 'Article',
          attributes: {
            title: 'Test 2',
          },
        },
        'testZone'
      );
      let newState2 = NgrxJsonApiZoneReducer(state, action2);
      expect(newState.data['Article']['1'].state).toEqual('CREATED');
      expect(newState2.data['Article']['1'].persistedResource).toBeNull();
    });
  });

  describe('API_GET_INIT action', () => {
    let newState = NgrxJsonApiZoneReducer(
      state,
      new ApiGetInitAction(
        {
          id: '1',
          type: 'Article',
          queryId: '111',
        },
        'testZone'
      )
    );

    it('should change isReading status by adding 1', () => {
      expect(newState.isReading - state.isReading).toBe(1);
    });

    it('should update the storeQueries', () => {
      expect(newState.queries['111'].query.type).toEqual('Article');
      expect(newState.queries['111'].query.id).toEqual('1');
    });
  });

  describe('API_PATCH_INIT action', () => {
    let action0 = new ApiPostInitAction(
      {
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test 0',
        },
      },
      'testZone'
    );
    let newState0 = NgrxJsonApiZoneReducer(state, action0);

    let action = new ApiPatchInitAction(
      {
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test',
        },
      },
      'testZone'
    );
    let newState = NgrxJsonApiZoneReducer(newState0, action);
    it('should add 1 to isUpdating', () => {
      expect(newState.isUpdating).toBe(1);
    });

    it('should add the Resource (and or StoreResource) to the storeData', () => {
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeNull();
      expect(newState.data['Article']['1'].state).toEqual('CREATED');
    });

    it('should keep the ResourceState as CREATED if the new data was also no from the server', () => {
      let action2 = new ApiPatchInitAction(
        {
          id: '1',
          type: 'Article',
          attributes: {
            title: 'Test 2',
          },
        },
        'testZone'
      );
      let newState2 = NgrxJsonApiZoneReducer(state, action2);
      expect(newState.data['Article']['1'].state).toEqual('CREATED');
      expect(newState2.data['Article']['1'].persistedResource).toBeNull();
    });
  });

  describe('API_DELETE_INIT action', () => {
    let action0 = new ApiPostInitAction(
      {
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test 0',
        },
      },
      'testZone'
    );
    let newState0 = NgrxJsonApiZoneReducer(state, action0);
    let action = new ApiDeleteInitAction(
      {
        type: 'Article',
        id: '1',
      },
      'testZone'
    );
    let newState = NgrxJsonApiZoneReducer(newState0, action);

    it('should add 1 isDeleting', () => {
      expect(newState.isDeleting).toBe(1);
    });

    it('should mark the StoreResource for deletion', () => {
      expect(newState.data['Article']['1'].state).toEqual('DELETED');
    });

    it('should add StoreResources that are not found and add the errors and NOT_LOADED state', () => {
      let deleteRandomResource = new ApiDeleteInitAction(
        {
          id: '123',
          type: 'Article',
        },
        'testZone'
      );
      let newState = NgrxJsonApiZoneReducer(state, deleteRandomResource);
      expect(newState.data['Article']['123']).toBeDefined();
      expect(newState.data['Article']['123'].type).toEqual('Article');
      expect(newState.data['Article']['123'].id).toEqual('123');
      expect(newState.data['Article']['123'].state).toEqual('NOT_LOADED');
    });
  });

  describe('API_POST_SUCCESS action', () => {
    it('should subtract 1 from isCreating', () => {
      let newState = NgrxJsonApiZoneReducer(
        state,
        new ApiPostSuccessAction({}, 'testZone')
      );
      expect(state.isCreating - newState.isCreating).toBe(1);
    });

    it('should add data to the store', () => {
      let newState = NgrxJsonApiZoneReducer(
        state,
        new ApiPostSuccessAction(
          {
            jsonApiData: testPayload,
          },
          'testZone'
        )
      );
      expect(newState.data['Article']['1']).toBeDefined();
    });
  });

  describe('API_GET_SUCCESS action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1',
    };
    let action = new ApiGetSuccessAction(
      {
        jsonApiData: testPayload,
        query: query,
      },
      'testZone'
    );
    let newState = NgrxJsonApiZoneReducer(state, action);
    it('should subtract 1 from isReading', () => {
      expect(state.isReading - newState.isReading).toBe(1);
    });

    it('should add data to the store', () => {
      expect(newState.data['Article']['1']).toBeDefined();
    });

    it('should update the query data', () => {
      let readInitAction = new ApiGetInitAction(query, 'testZone');
      let tempState = NgrxJsonApiZoneReducer(state, readInitAction);
      let newState = NgrxJsonApiZoneReducer(
        tempState,
        new ApiGetSuccessAction(
          {
            jsonApiData: testPayload,
            query: query,
          },
          'testZone'
        )
      );
      expect(newState.queries['111'].resultIds.length).toEqual(11);
      expect(newState.queries['111'].resultIds[8]).toEqual({
        type: 'Blog',
        id: '3',
      });
      expect(newState.queries['111'].links['someLink']).toEqual(
        'someLinkValue'
      );
      expect(newState.queries['111'].meta['someMeta']).toEqual('someMetaValue');
    });
  });

  describe('API_PATCH_SUCCESS action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1',
    };
    let tempState = NgrxJsonApiZoneReducer(
      state,
      new ApiGetSuccessAction(
        {
          jsonApiData: testPayload,
          query: {
            id: '1',
            type: 'Article',
            queryId: '111',
          },
        },
        'testZone'
      )
    );
    let newState = NgrxJsonApiZoneReducer(
      tempState,
      new ApiPatchSuccessAction(
        {
          jsonApiData: {
            data: {
              type: 'Article',
              id: '1',
              attributes: {
                title: 'bla bla bla',
              },
            },
          },
        },
        'testZone'
      )
    );

    it('should subtract 1 from isUpdating', () => {
      expect(state.isUpdating - newState.isUpdating).toBe(1);
    });

    it('should add data to the store', () => {
      expect(newState.data['Article']['1'].attributes.title).toEqual(
        'bla bla bla'
      );
    });
  });

  describe('API_QUERY_REFRESH action', () => {
    let tempState = NgrxJsonApiZoneReducer(
      state,
      new ApiGetInitAction(
        {
          id: '1',
          type: 'Article',
          queryId: '111',
        },
        'testZone'
      )
    );
    tempState = NgrxJsonApiZoneReducer(
      tempState,
      new ApiGetSuccessAction(
        {
          jsonApiData: testPayload,
          query: {
            id: '1',
            type: 'Article',
            queryId: '111',
          },
        },
        'testZone'
      )
    );

    it('refresh should clear current result until new one is available', () => {
      expect(tempState.queries['111'].resultIds).toBeDefined();
      expect(tempState.queries['111'].meta).toBeDefined();
      expect(tempState.queries['111'].links).toBeDefined();
      let newState = NgrxJsonApiZoneReducer(
        tempState,
        new ApiQueryRefreshAction('111', 'testZone')
      );
      expect(newState.queries['111'].resultIds).toBeUndefined();
      expect(newState.queries['111'].meta).toBeUndefined();
      expect(newState.queries['111'].links).toBeUndefined();
    });
  });

  describe('API_DELETE_SUCCESS', () => {
    let tempState = NgrxJsonApiZoneReducer(
      state,
      new ApiGetSuccessAction(
        {
          jsonApiData: testPayload,
          query: {
            id: '1',
            type: 'Article',
            queryId: '111',
          },
        },
        'testZone'
      )
    );
    let newState = NgrxJsonApiZoneReducer(
      tempState,
      new ApiDeleteSuccessAction(
        {
          query: {
            type: 'Article',
          },
        },
        'testZone'
      )
    );

    it('should subtract 1 from isDeleting', () => {
      expect(state.isDeleting - newState.isDeleting).toBe(1);
    });

    it('should remove resources from the store', () => {
      expect(newState.data['Article']).toEqual({});
    });
  });

  describe('API_POST_FAIL', () => {
    let action0 = new ApiPostInitAction(
      {
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test 0',
        },
      },
      'testZone'
    );
    let newState0 = NgrxJsonApiZoneReducer(state, action0);
    let createFailAction = new ApiPostFailAction(
      {
        jsonApiData: {
          errors: ['permission denied'],
        },
        query: {
          id: '1',
          type: 'Article',
        },
      },
      'testZone'
    );
    let newState = NgrxJsonApiZoneReducer(newState0, createFailAction);
    it('should add the errors to the resource', () => {
      expect(newState.data['Article']['1'].errors[0]).toEqual(
        'permission denied'
      );
    });

    it('should subtract 1 from isCreating', () => {
      expect(newState0.isCreating - newState.isCreating).toBe(1);
    });
  });

  describe('API_GET_FAIL', () => {
    let action0 = new ApiGetInitAction(
      {
        id: '1',
        type: 'Article',
        queryId: '111',
      },
      'testZone'
    );
    let tempState = NgrxJsonApiZoneReducer(state, action0);
    let failAction = new ApiGetFailAction(
      {
        jsonApiData: {
          errors: ['permission denied'],
        },
        query: {
          queryId: '111',
          id: '1',
          type: 'Article',
        },
      },
      'testZone'
    );
    let newState = NgrxJsonApiZoneReducer(tempState, failAction);

    it('should add the errors to the resource', () => {
      expect(newState.queries['111'].errors[0]).toEqual('permission denied');
    });

    it('should subtract 1 from isReading', () => {
      expect(tempState.isReading - newState.isReading).toBe(1);
    });

    it('should update isLoading', () => {
      expect(tempState.queries['111'].loading).toBeTruthy();
      expect(newState.queries['111'].loading).toBeFalsy();
    });
  });

  describe('API_PATCH_FAIL action', () => {
    let action = new ApiPatchInitAction(
      {
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test',
        },
      },
      'testZone'
    );
    let tempState = NgrxJsonApiZoneReducer(state, action);
    let updateFailAction = new ApiPatchFailAction(
      {
        jsonApiData: {
          errors: ['permission denied'],
        },
        query: {
          id: '1',
          type: 'Article',
        },
      },
      'testZone'
    );
    let newState = NgrxJsonApiZoneReducer(tempState, updateFailAction);

    it('should subtract 1 from isUpdating', () => {
      expect(tempState.isUpdating - newState.isUpdating).toBe(1);
    });

    it('should add errors to the resource', () => {
      expect(newState.data['Article']['1'].errors[0]).toEqual(
        'permission denied'
      );
    });
  });

  describe('API_DELETE_FAIL action', () => {
    let action0 = new ApiPostInitAction(
      {
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test 0',
        },
      },
      'testZone'
    );
    let newState0 = NgrxJsonApiZoneReducer(state, action0);

    let newState = NgrxJsonApiZoneReducer(
      newState0,
      new ApiDeleteFailAction(
        {
          jsonApiData: {
            errors: ['permission denied'],
          },
          query: {
            id: '1',
            type: 'Article',
          },
        },
        'testZone'
      )
    );
    it('should subtract 1 from isDeleting', () => {
      expect(newState0.isDeleting - newState.isDeleting).toBe(1);
    });

    it('should add errors to the resource', () => {
      expect(newState.data['Article']['1'].errors[0]).toEqual(
        'permission denied'
      );
    });
  });

  describe('ModifyStoreResourceErrorsAction action', () => {
    let newState0 = NgrxJsonApiZoneReducer(
      state,
      new PatchStoreResourceAction({ type: 'Article', id: '1' }, 'testZone')
    );

    let newState = NgrxJsonApiZoneReducer(
      newState0,
      new ModifyStoreResourceErrorsAction(
        {
          resourceId: { type: 'Article', id: '1' },
          modificationType: 'SET',
          errors: [{ code: '0' }],
        },
        'testZone'
      )
    );

    it('should add error to resource', () => {
      expect(newState.data['Article']['1'].errors.length).toBe(1);
      expect(newState.data['Article']['1'].errors[0].code).toBe('0');
    });
  });

  describe('REMOVE_QUERY action', () => {
    it('should remove query given a queryId', () => {
      let tempState = NgrxJsonApiZoneReducer(
        state,
        new ApiGetInitAction(
          {
            query: {
              id: '1',
              type: 'Article',
              queryId: '111',
            },
          },
          'testZone'
        )
      );
      let newState = NgrxJsonApiZoneReducer(
        tempState,
        new RemoveQueryAction('111', 'testZone')
      );
      expect(newState['111']).not.toBeDefined();
    });
  });

  describe('LOCAL_QUERY_SUCCESS action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1',
    };
    it('should update the query data', () => {
      let readInitAction = new ApiGetInitAction(
        {
          id: '1',
          type: 'Article',
          queryId: '111',
        },
        'testZone'
      );
      let tempState = NgrxJsonApiZoneReducer(state, readInitAction);
      let newState = NgrxJsonApiZoneReducer(
        tempState,
        new LocalQuerySuccessAction(
          {
            jsonApiData: testPayload,
            query: query,
          },
          'testZone'
        )
      );
      expect(newState.queries['111'].resultIds.length).toEqual(11);
      expect(newState.queries['111'].resultIds[8]).toEqual({
        type: 'Blog',
        id: '3',
      });
    });
  });

  describe('PATCH/POST_STORE_RESOURCE action', () => {
    it('should patch/post the resource', () => {
      let newState = NgrxJsonApiZoneReducer(
        state,
        new PatchStoreResourceAction({ type: 'Article', id: '1' }, 'testZone')
      );
      let newState2 = NgrxJsonApiZoneReducer(
        state,
        new PostStoreResourceAction({ type: 'Article', id: '1' }, 'testZone')
      );
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState2.data['Article']['1']).toBeDefined();
    });

    it('should create new resource', () => {
      let newState = NgrxJsonApiZoneReducer(
        state,
        new NewStoreResourceAction({ type: 'Article', id: '1' }, 'testZone')
      );
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState.data['Article']['1'].state).toEqual('NEW');
    });

    it('should delete new resource', () => {
      let newState1 = NgrxJsonApiZoneReducer(
        state,
        new NewStoreResourceAction({ type: 'Article', id: '1' }, 'testZone')
      );
      expect(newState1.data['Article']['1']).toBeDefined();
      expect(newState1.data['Article']['1'].state).toEqual('NEW');
      let newState2 = NgrxJsonApiZoneReducer(
        newState1,
        new DeleteStoreResourceAction({ type: 'Article', id: '1' }, 'testZone')
      );
      expect(newState2.data['Article']['1']).toBeUndefined();
    });

    it('patch should maintain NEW state', () => {
      let newState1 = NgrxJsonApiZoneReducer(
        state,
        new NewStoreResourceAction({ type: 'Article', id: '1' }, 'testZone')
      );
      expect(newState1.data['Article']['1']).toBeDefined();
      expect(newState1.data['Article']['1'].state).toEqual('NEW');
      let newState2 = NgrxJsonApiZoneReducer(
        newState1,
        new PatchStoreResourceAction({ type: 'Article', id: '1' }, 'testZone')
      );
      expect(newState2.data['Article']['1']).toBeDefined();
      expect(newState2.data['Article']['1'].state).toEqual('NEW');
    });

    it('should not update state on second identical post', () => {
      let action = new PostStoreResourceAction(
        {
          type: 'Article',
          id: '1',
          attributes: { title: 'sample title' },
        },
        'testZone'
      );
      let newState = NgrxJsonApiZoneReducer(state, action);
      let newState2 = NgrxJsonApiZoneReducer(newState, action);
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState2.data['Article']['1']).toBeDefined();
      expect(newState).toBe(newState2);
      // expect(newState2 === newState).toBeTruthy();
    });

    it('should not update state on second identical patch', () => {
      let action = new PatchStoreResourceAction(
        {
          type: 'Article',
          id: '1',
          attributes: {
            title: 'sample title',
            description: 'test description',
          },
        },
        'testZone'
      );
      let newState = NgrxJsonApiZoneReducer(state, action);
      let newState2 = NgrxJsonApiZoneReducer(newState, action);
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState2.data['Article']['1']).toBeDefined();
      expect(newState2 === newState).toBeTruthy();
    });

    it('should not update state on second partial patch', () => {
      let newState = NgrxJsonApiZoneReducer(
        state,
        new PatchStoreResourceAction(
          {
            type: 'Article',
            id: '1',
            attributes: {
              title: 'sample title',
              description: 'sample description',
            },
          },
          'testZone'
        )
      );
      let newState2 = NgrxJsonApiZoneReducer(
        newState,
        new PatchStoreResourceAction(
          {
            type: 'Article',
            id: '1',
            attributes: { title: 'sample title' },
          },
          'testZone'
        )
      );
      expect(newState.data['Article']['1'].attributes.title).toEqual(
        'sample title'
      );
      expect(newState.data['Article']['1'].attributes.description).toEqual(
        'sample description'
      );
      expect(newState2.data['Article']['1'].attributes.title).toEqual(
        'sample title'
      );
      expect(newState2.data['Article']['1'].attributes.description).toEqual(
        'sample description'
      );
      expect(newState2 === newState).toBeTruthy();
    });

    it('should update relationship on partial patch', () => {
      let newState1 = NgrxJsonApiZoneReducer(
        state,
        new PatchStoreResourceAction(
          {
            type: 'Article',
            id: '1',
            attributes: {
              title: 'sample title',
              description: 'sample description',
            },
            relationships: {
              author: {
                data: [{ type: 'Person', id: 'john' }],
              },
              publisher: {
                data: [{ type: 'Person', id: 'doe' }],
              },
            },
          },
          'testZone'
        )
      );
      let newState2 = NgrxJsonApiZoneReducer(
        newState1,
        new PatchStoreResourceAction(
          {
            type: 'Article',
            id: '1',
            relationships: {
              publisher: {
                data: [{ type: 'Person', id: 'jane' }],
              },
            },
          },
          'testZone'
        )
      );
      expect(newState1.data['Article']['1'].attributes.title).toEqual(
        'sample title'
      );
      expect(newState1.data['Article']['1'].attributes.description).toEqual(
        'sample description'
      );
      expect(
        newState1.data['Article']['1'].relationships.author.data[0].id
      ).toEqual('john');
      expect(
        newState1.data['Article']['1'].relationships.publisher.data[0].id
      ).toEqual('doe');
      expect(newState2.data['Article']['1'].attributes.title).toEqual(
        'sample title'
      );
      expect(newState2.data['Article']['1'].attributes.description).toEqual(
        'sample description'
      );
      expect(
        newState2.data['Article']['1'].relationships.author.data[0].id
      ).toEqual('john');
      expect(
        newState2.data['Article']['1'].relationships.publisher.data[0].id
      ).toEqual('jane');
    });
  });

  describe('API_APPLY_INIT action for POST', () => {
    it('should add 1 to isApplying', () => {
      let action = new PatchStoreResourceAction(
        {
          type: 'Article',
          id: '1',
          attributes: {
            title: 'sample title',
            description: 'test description',
          },
        },
        'testZone'
      );
      let newState1 = NgrxJsonApiZoneReducer(state, action);
      let newState2 = NgrxJsonApiZoneReducer(
        newState1,
        new ApiApplyInitAction({}, 'testZone')
      );
      expect(newState2.isApplying - newState1.isApplying).toBe(1);
      expect(newState2.isCreating - newState1.isCreating).toBe(1);
      expect(newState2.isUpdating - newState1.isUpdating).toBe(0);
      expect(newState2.isDeleting - newState1.isDeleting).toBe(0);
    });
  });

  describe('API_APPLY_INIT action for PATCH', () => {
    it('should add 1 to isApplying', () => {
      let action = new PatchStoreResourceAction(
        {
          type: 'Article',
          id: '1',
          attributes: { title: 'new title', description: 'sample description' },
        },
        'testZone'
      );
      let newState1 = NgrxJsonApiZoneReducer(state, action);
      newState1.data['Article']['1'].state = 'UPDATED';
      let newState2 = NgrxJsonApiZoneReducer(
        newState1,
        new ApiApplyInitAction({}, 'testZone')
      );
      expect(newState2.isApplying - newState1.isApplying).toBe(1);
      expect(newState2.isCreating - newState1.isCreating).toBe(0);
      expect(newState2.isUpdating - newState1.isUpdating).toBe(1);
      expect(newState2.isDeleting - newState1.isDeleting).toBe(0);
    });
  });

  describe('API_APPLY_INIT action for DELETE', () => {
    it('should add 1 to isApplying', () => {
      let newState1 = NgrxJsonApiZoneReducer(
        state,
        new PatchStoreResourceAction(
          {
            type: 'Article',
            id: '1',
            attributes: {
              title: 'new title',
              description: 'sample description',
            },
          },
          'testZone'
        )
      );
      newState1.data['Article']['1'].state = 'IN_SYNC';

      let newState2 = NgrxJsonApiZoneReducer(
        newState1,
        new DeleteStoreResourceAction({ type: 'Article', id: '1' }, 'testZone')
      );
      let newState3 = NgrxJsonApiZoneReducer(
        newState2,
        new ApiApplyInitAction({}, 'testZone')
      );
      expect(newState3.isApplying - newState2.isApplying).toBe(1);
      expect(newState3.isCreating - newState2.isCreating).toBe(0);
      expect(newState3.isUpdating - newState2.isUpdating).toBe(0);
      expect(newState3.isDeleting - newState2.isDeleting).toBe(1);
    });
  });

  describe('API_APPLY/SUCCESS_FAIL actions', () => {});

  describe('ALL OTHER ACTIONS', () => {
    it('should return the state', () => {
      let newState = NgrxJsonApiZoneReducer(state, { type: 'RANDOM_ACTION' });
      expect(newState).toEqual(state);
    });
  });
});
