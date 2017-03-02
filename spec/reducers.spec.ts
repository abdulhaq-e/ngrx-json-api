import {
  async,
  inject,
  fakeAsync,
  TestBed
} from '@angular/core/testing';

let deepFreeze = require('deep-freeze');

import _ = require('lodash');
//
import {
  NgrxJsonApiStoreReducer,
  initialNgrxJsonApiState
} from '../src/reducers';
import {
  ApiApplyInitAction,
  ApiApplySuccessAction,
  ApiApplyFailAction,
  ApiPostInitAction,
  ApiPostSuccessAction,
  ApiPostFailAction,
  ApiPatchInitAction,
  ApiPatchSuccessAction,
  ApiPatchFailAction,
  ApiGetInitAction,
  ApiGetSuccessAction,
  ApiGetFailAction,
  ApiDeleteInitAction,
  ApiDeleteSuccessAction,
  ApiDeleteFailAction,
  ApiRollbackAction,
  NgrxJsonApiActionTypes,
  PatchStoreResourceAction,
  PostStoreResourceAction,
  ApiQueryRefreshAction,
  RemoveQueryAction,
  ModifyStoreResourceErrorsAction,
  LocalQuerySuccessAction,
} from '../src/actions';
import {
  NgrxJsonApiStore,
  ResourceState,
} from '../src/interfaces';

import { testPayload } from './test_utils';

describe('NgrxJsonApiReducer', () => {

  let state = initialNgrxJsonApiState;
  deepFreeze(state);

  describe('API_POST_INIT action', () => {
    let action = new ApiPostInitAction({
      id: '1',
      type: 'Article',
      attributes: {
        title: 'Test'
      }
    });
    let newState = NgrxJsonApiStoreReducer(state, action);

    it('should add 1 to isCreating', () => {
      expect(newState.isCreating).toBe(1);
    });

    it('should add the Resource (and or StoreResource) to the storeData', () => {
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeNull();
      expect(newState.data['Article']['1'].state).toEqual("CREATED");
    });

    it('should keep the ResourceState as CREATED if the new data was also not from the server', () => {
      let action2 = new ApiPatchInitAction({
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test 2'
        }
      });
      let newState2 = NgrxJsonApiStoreReducer(state, action2);
      expect(newState.data['Article']['1'].state).toEqual("CREATED");
      expect(newState2.data['Article']['1'].persistedResource).toBeNull();
    });
  });

  describe('API_GET_INIT action', () => {
    let newState = NgrxJsonApiStoreReducer(state, new ApiGetInitAction({
      id: '1',
      type: 'Article',
      queryId: '111'
    }));

    it('should change isReading status by adding 1', () => {
      expect(newState.isReading - state.isReading).toBe(1);
    });

    it('should update the storeQueries', () => {
      expect(newState.queries['111'].query.type).toEqual('Article');
      expect(newState.queries['111'].query.id).toEqual('1');
    });
  });

  describe('API_PATCH_INIT action', () => {
    let action0 = new ApiPostInitAction({
      id: '1',
      type: 'Article',
      attributes: {
        title: 'Test 0'
      }
    });
    let newState0 = NgrxJsonApiStoreReducer(state, action0);

    let action = new ApiPatchInitAction({
      id: '1',
      type: 'Article',
      attributes: {
        title: 'Test'
      }
    });
    let newState = NgrxJsonApiStoreReducer(newState0, action);
    it('should add 1 to isUpdating', () => {
      expect(newState.isUpdating).toBe(1);
    });

    it('should add the Resource (and or StoreResource) to the storeData', () => {
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeNull();
      expect(newState.data['Article']['1'].state).toEqual("CREATED");
    });

    it('should keep the ResourceState as CREATED if the new data was also no from the server', () => {
      let action2 = new ApiPatchInitAction({
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test 2'
        }
      });
      let newState2 = NgrxJsonApiStoreReducer(state, action2);
      expect(newState.data['Article']['1'].state).toEqual("CREATED");
      expect(newState2.data['Article']['1'].persistedResource).toBeNull();
    });
  });

  describe('API_DELETE_INIT action', () => {
    let action0 = new ApiPostInitAction({
      id: '1',
      type: 'Article',
      attributes: {
        title: 'Test 0'
      }
    });
    let newState0 = NgrxJsonApiStoreReducer(state, action0);
    let action = new ApiDeleteInitAction({
      type: 'Article',
      id: '1'
    })
    let newState = NgrxJsonApiStoreReducer(newState0, action);

    it('should add 1 isDeleting', () => {
      expect(newState.isDeleting).toBe(1);
    });

    it('should mark the StoreResource for deletion', () => {
      expect(newState.data['Article']['1'].state).toEqual("DELETED");
    });

    it('should add StoreResources that are not found and add the errors and NOT_LOADED state', () => {
      let deleteRandomResource = new ApiDeleteInitAction({
        id: '123',
        type: 'Article',
      });
      let newState = NgrxJsonApiStoreReducer(state, deleteRandomResource);
      expect(newState.data['Article']['123']).toBeDefined();
      expect(newState.data['Article']['123'].type).toEqual('Article');
      expect(newState.data['Article']['123'].id).toEqual('123');
      expect(newState.data['Article']['123'].state).toEqual("NOT_LOADED");
    });

  });

  describe('API_POST_SUCCESS action', () => {
    it('should subtract 1 from isCreating', () => {
      let newState = NgrxJsonApiStoreReducer(state, new ApiPostSuccessAction({}));
      expect(state.isCreating - newState.isCreating).toBe(1);
    });

    it('should add data to the store', () => {
      let newState = NgrxJsonApiStoreReducer(state, new ApiPostSuccessAction({
        jsonApiData: testPayload
      }));
      expect(newState.data['Article']['1']).toBeDefined();
    })
  });

  describe('API_GET_SUCCESS action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1'
    }
    let action = new ApiGetSuccessAction({
      jsonApiData: testPayload,
      query: query
    });
    let newState = NgrxJsonApiStoreReducer(state, action);
    it('should subtract 1 from isReading', () => {
      expect(state.isReading - newState.isReading).toBe(1);
    });

    it('should add data to the store', () => {
      expect(newState.data['Article']['1']).toBeDefined();
    })

    it('should update the query data', () => {
      let readInitAction = new ApiGetInitAction(query);
      let tempState = NgrxJsonApiStoreReducer(state, readInitAction);
      let newState = NgrxJsonApiStoreReducer(tempState, new ApiGetSuccessAction({
        jsonApiData: testPayload,
        query: query
      }));
      expect(newState.queries['111'].resultIds.length).toEqual(11);
      expect(newState.queries['111'].resultIds[8]).toEqual({ type: 'Blog', id: '3' });
      expect(newState.queries['111'].links['someLink']).toEqual('someLinkValue');
      expect(newState.queries['111'].meta['someMeta']).toEqual('someMetaValue');
    });
  });

  describe('API_PATCH_SUCCESS action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1'
    }
    let tempState = NgrxJsonApiStoreReducer(state, new ApiGetSuccessAction({
      jsonApiData: testPayload,
      query: {
        id: '1',
        type: 'Article',
        queryId: '111'
      }
    }));
    let newState = NgrxJsonApiStoreReducer(tempState, new ApiPatchSuccessAction({
      jsonApiData: {
        data: {
          type: 'Article',
          id: '1',
          attributes: {
            title: 'bla bla bla'
          }
        }
      },
    }));

    it('should subtract 1 from isUpdating', () => {
      expect(state.isUpdating - newState.isUpdating).toBe(1);
    });

    it('should add data to the store', () => {
      expect(newState.data['Article']['1'].attributes.title).toEqual('bla bla bla');
    })
  });

  describe('API_QUERY_REFRESH action', () => {

    let tempState = NgrxJsonApiStoreReducer(state, new ApiGetInitAction({
      id: '1',
      type: 'Article',
      queryId: '111'
    }));
    tempState = NgrxJsonApiStoreReducer(tempState, new ApiGetSuccessAction({
      jsonApiData: testPayload,
      query: {
        id: '1',
        type: 'Article',
        queryId: '111'
      }
    }));

    it('refresh should clear current result until new one is available', () => {
      expect(tempState.queries['111'].resultIds).toBeDefined();
      expect(tempState.queries['111'].meta).toBeDefined();
      expect(tempState.queries['111'].links).toBeDefined();
      let newState = NgrxJsonApiStoreReducer(tempState, new ApiQueryRefreshAction('111'));
      expect(newState.queries['111'].resultIds).toBeUndefined();
      expect(newState.queries['111'].meta).toBeUndefined();
      expect(newState.queries['111'].links).toBeUndefined();
    });

  });

  describe('API_DELETE_SUCCESS', () => {

    let tempState = NgrxJsonApiStoreReducer(state, new ApiGetSuccessAction({
      jsonApiData: testPayload,
      query: {
        id: '1',
        type: 'Article',
        queryId: '111'
      }
    }));
    let newState = NgrxJsonApiStoreReducer(tempState, new ApiDeleteSuccessAction({
      query: {
        type: 'Article'
      }
    }));

    it('should subtract 1 from isDeleting', () => {
      expect(state.isDeleting - newState.isDeleting).toBe(1);
    });

    it('should remove resources from the store', () => {
      expect(newState.data['Article']).toEqual({});
    });
  });

  describe('API_POST_FAIL', () => {
    let action0 = new ApiPostInitAction({
      id: '1',
      type: 'Article',
      attributes: {
        title: 'Test 0'
      }
    });
    let newState0 = NgrxJsonApiStoreReducer(state, action0);
    let createFailAction = new ApiPostFailAction({
      jsonApiData: {
        errors: [
          'permission denied'
        ]
      },
      query: {
        id: '1',
        type: 'Article',
      }
    });
    let newState = NgrxJsonApiStoreReducer(newState0, createFailAction);
    it('should add the errors to the resource', () => {
      expect(newState.data['Article']['1'].errors[0]).toEqual('permission denied');
    });

    it('should subtract 1 from isCreating', () => {
      expect(newState0.isCreating - newState.isCreating).toBe(1);
    });

  });

  describe('API_GET_FAIL', () => {
    let action0 = new ApiGetInitAction({
        id: '1',
        type: 'Article',
        queryId: '111'
    });
    let tempState = NgrxJsonApiStoreReducer(state, action0);
    let failAction = new ApiGetFailAction(
      {
        jsonApiData: {
          errors: ['permission denied']
        },
        query: {
          queryId: '111',
          id: '1',
          type: 'Article',
        }
      });
    let newState = NgrxJsonApiStoreReducer(tempState, failAction);

    it('should add the errors to the resource', () => {
      expect(newState.queries['111'].errors[0]).toEqual('permission denied');
    });

    it('should subtract 1 from isReading', () => {
      expect(tempState.isReading - newState.isReading).toBe(1);
    });

  });

  describe('API_PATCH_FAIL action', () => {
    let action = new ApiPatchInitAction({
      id: '1',
      type: 'Article',
      attributes: {
        title: 'Test'
      }
    });
    let tempState = NgrxJsonApiStoreReducer(state, action);
    let updateFailAction = new ApiPatchFailAction({
      jsonApiData: {
        errors: ['permission denied']
      },
      query: {
        id: '1',
        type: 'Article',
      }
    });
    let newState = NgrxJsonApiStoreReducer(tempState, updateFailAction);

    it('should subtract 1 from isUpdating', () => {
      expect(tempState.isUpdating - newState.isUpdating).toBe(1);
    });

    it('should add errors to the resource', () => {
      expect(newState.data['Article']['1'].errors[0]).toEqual('permission denied');
    });
  });

  describe('API_DELETE_FAIL action', () => {
    let action0 = new ApiPostInitAction({
      id: '1',
      type: 'Article',
      attributes: {
        title: 'Test 0'
      }
    });
    let newState0 = NgrxJsonApiStoreReducer(state, action0);

    let newState = NgrxJsonApiStoreReducer(newState0, new ApiDeleteFailAction({
      jsonApiData: {
        errors: ['permission denied']
      },
      query: {
        id: '1',
        type: 'Article',
      }
    }));
    it('should subtract 1 from isDeleting', () => {
      expect(newState0.isDeleting - newState.isDeleting).toBe(1);
    });

    it('should add errors to the resource', () => {
      expect(newState.data['Article']['1'].errors[0]).toEqual('permission denied');
    });
  });

  describe('ModifyStoreResourceErrorsAction action', () => {
    let newState0 = NgrxJsonApiStoreReducer(state, new PatchStoreResourceAction(
      { type: 'Article', id: '1' }
    ));

    let newState = NgrxJsonApiStoreReducer(newState0, new ModifyStoreResourceErrorsAction({
      resourceId: {type: 'Article', id: '1'},
      modificationType: 'SET',
      errors: [{code: '0'}]
    }));

    it('should add error to resource', () => {
      expect(newState.data['Article']['1'].errors.length).toBe(1);
      expect(newState.data['Article']['1'].errors[0].code).toBe('0');
    });
  });


  describe('REMOVE_QUERY action', () => {
    it('should remove query given a queryId', () => {
      let tempState = NgrxJsonApiStoreReducer(state, new ApiGetInitAction({
        query: {
          id: '1',
          type: 'Article',
          queryId: '111'
        }
      }));
      let newState = NgrxJsonApiStoreReducer(tempState, new RemoveQueryAction('111'));
      expect(newState['111']).not.toBeDefined();
    });
  });

  describe('LOCAL_QUERY_SUCCESS action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1'
    }
    it('should update the query data', () => {
      let readInitAction = new ApiGetInitAction({
          id: '1',
          type: 'Article',
          queryId: '111'
      });
      let tempState = NgrxJsonApiStoreReducer(state, readInitAction);
      let newState = NgrxJsonApiStoreReducer(tempState, new LocalQuerySuccessAction({
        jsonApiData: testPayload,
        query: query
      }));
      expect(newState.queries['111'].resultIds.length).toEqual(11);
      expect(newState.queries['111'].resultIds[8]).toEqual({ type: 'Blog', id: '3' });
    });
  });

  describe('PATCH/POST_STORE_RESOURCE action', () => {

    it('should patch/post the resource', () => {
      let newState = NgrxJsonApiStoreReducer(state, new PatchStoreResourceAction(
        { type: 'Article', id: '1' }
      ));
      let newState2 = NgrxJsonApiStoreReducer(state, new PostStoreResourceAction(
        { type: 'Article', id: '1' }
      ));
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState2.data['Article']['1']).toBeDefined();
    });

    it('should not update state on second identical post', () => {
      let action = new PostStoreResourceAction(
        { type: 'Article', id: '1', attributes: { title: 'sample title' } }
      );
      let newState = NgrxJsonApiStoreReducer(state, action);
      let newState2 = NgrxJsonApiStoreReducer(newState, action);
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState2.data['Article']['1']).toBeDefined();
      expect(newState).toBe(newState2);
      // expect(newState2 === newState).toBeTruthy();
    });

    it('should not update state on second identical patch', () => {
      let action = new PatchStoreResourceAction(
        { type: 'Article', id: '1', attributes: { title: 'sample title', description: 'test description' } }
      );
      let newState = NgrxJsonApiStoreReducer(state, action);
      let newState2 = NgrxJsonApiStoreReducer(newState, action);
      expect(newState.data['Article']['1']).toBeDefined();
      expect(newState2.data['Article']['1']).toBeDefined();
      expect(newState2 === newState).toBeTruthy();
    });

    it('should not update state on second partial patch', () => {
       let newState = NgrxJsonApiStoreReducer(state, new PatchStoreResourceAction(
         { type: 'Article', id: '1', attributes: { title: 'sample title', description: 'sample description' } }
       ));
       let newState2 = NgrxJsonApiStoreReducer(newState, new PatchStoreResourceAction(
         { type: 'Article', id: '1', attributes: { title: 'sample title' } }
       ));
       expect(newState.data['Article']['1'].attributes.title).toEqual("sample title");
       expect(newState.data['Article']['1'].attributes.description).toEqual("sample description");
       expect(newState2.data['Article']['1'].attributes.title).toEqual("sample title");
       expect(newState2.data['Article']['1'].attributes.description).toEqual("sample description");
       expect(newState2 === newState).toBeTruthy();
    });
  });

  describe('API_APPLY_INIT action', () => {
    it('should add 1 to isApplying', () => {
      let newState = NgrxJsonApiStoreReducer(state, new ApiApplyInitAction());
      expect(newState.isApplying - state.isApplying).toBe(1);
    });
  });

  describe('API_APPLY/SUCCESS_FAIL actions', () => {

  });

  describe('ALL OTHER ACTIONS', () => {
    it('should return the state', () => {
      let newState = NgrxJsonApiStoreReducer(state, { type: 'RANDOM_ACTION' });
      expect(newState).toEqual(state);
    });
  });

});
