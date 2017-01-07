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
  ApiCreateInitAction,
  ApiCreateSuccessAction,
  ApiCreateFailAction,
  ApiUpdateInitAction,
  ApiUpdateSuccessAction,
  ApiUpdateFailAction,
  ApiReadInitAction,
  ApiReadSuccessAction,
  ApiReadFailAction,
  ApiDeleteInitAction,
  ApiDeleteSuccessAction,
  ApiDeleteFailAction,
  ApiRollbackAction,
  NgrxJsonApiActionTypes,
  PatchStoreResourceAction,
  PostStoreResourceAction,
  RemoveQueryAction,
  QueryStoreSuccessAction,
} from '../src/actions';
import {
  NgrxJsonApiStore,
  ResourceState,
} from '../src/interfaces';

import { testPayload } from './test_utils';

describe('NgrxJsonApiReducer', () => {

  let state = initialNgrxJsonApiState;
  deepFreeze(state);

  describe('API_CREATE_INIT action', () => {
    let action = new ApiCreateInitAction({
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
      expect(newState.data['Article']['1'].resource).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeNull();
      expect(newState.data['Article']['1'].state).toEqual(ResourceState.CREATED);
    });

    it('should keep the ResourceState as CREATED if the new data was also not from the server', () => {
      let action2 =  new ApiUpdateInitAction({
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test 2'
        }
      });
      let newState2 = NgrxJsonApiStoreReducer(state, action2);
      expect(newState.data['Article']['1'].state).toEqual(ResourceState.CREATED);
      expect(newState2.data['Article']['1'].persistedResource).toBeNull();
    });
  });

  describe('API_READ_INIT action', () => {
    let newState = NgrxJsonApiStoreReducer(state, new ApiReadInitAction({
      query: {
        id: '1',
        type: 'Article',
        queryId: '111'
      }
    }));

    it('should change isReading status by adding 1', () => {
      expect(newState.isReading - state.isReading).toBe(1);
    });

    it('should update the storeQueries', () => {
      expect(newState.queries['111'].query.type).toEqual('Article');
      expect(newState.queries['111'].query.id).toEqual('1');
    });
  });

  describe('REMOVE_QUERY action', () => {
    it('should remove query given a queryId', () => {
      let tempState = NgrxJsonApiStoreReducer(state, new ApiReadInitAction({
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

  describe('API_UPDATE_INIT action', () => {
    let action0 = new ApiCreateInitAction({
      id: '1',
      type: 'Article',
      attributes: {
        title: 'Test 0'
      }
    });
    let newState0 = NgrxJsonApiStoreReducer(state, action0);

    let action = new ApiUpdateInitAction({
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
      expect(newState.data['Article']['1'].resource).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeDefined();
      expect(newState.data['Article']['1'].persistedResource).toBeNull();
      expect(newState.data['Article']['1'].state).toEqual(ResourceState.CREATED);
    });

    it('should keep the ResourceState as CREATED if the new data was also no from the server', () => {
      let action2 =  new ApiUpdateInitAction({
        id: '1',
        type: 'Article',
        attributes: {
          title: 'Test 2'
        }
      });
      let newState2 = NgrxJsonApiStoreReducer(state, action2);
      expect(newState.data['Article']['1'].state).toEqual(ResourceState.CREATED);
      expect(newState2.data['Article']['1'].persistedResource).toBeNull();
    });
  });

  describe('API_DELETE_INIT action', () => {
    let action0 = new ApiCreateInitAction({
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
      expect(newState.data['Article']['1'].state).toEqual(ResourceState.DELETED);
    });
  });

  describe('API_CREATE_SUCCESS action', () => {
    it('should subtract 1 from isCreating', () => {
      let newState = NgrxJsonApiStoreReducer(state, new ApiCreateSuccessAction({}));
      expect(state.isCreating - newState.isCreating).toBe(1);
    });

    it('should add data to the store', () => {
      let newState = NgrxJsonApiStoreReducer(state, new ApiCreateSuccessAction({
        jsonApiData: testPayload
      }));
      expect(newState.data['Article']['1']).toBeDefined();
    })
  });

  describe('API_READ_SUCCESS action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1'
    }
    let newState = NgrxJsonApiStoreReducer(state, new ApiReadSuccessAction({
      jsonApiData: testPayload,
      query: query
    }));
    it('should subtract 1 from isReading', () => {
      expect(state.isReading - newState.isReading).toBe(1);
    });

    it('should add data to the store', () => {
      expect(newState.data['Article']['1']).toBeDefined();
    })

    it('should update the query results', () => {
      let tempState = NgrxJsonApiStoreReducer(state, new ApiReadInitAction({
        query: {
          id: '1',
          type: 'Article',
          queryId: '111'
        }
      }));
      let newState = NgrxJsonApiStoreReducer(tempState, new ApiReadSuccessAction({
        jsonApiData: testPayload,
        query: query
      }));
      expect(newState.queries['111'].resultIds.length).toEqual(11);
      expect(newState.queries['111'].resultIds[8]).toEqual({ type: 'Blog', id: '3' });
    });
  });

  describe('API_UPDATE_SUCCESS action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1'
    }
    let tempState = NgrxJsonApiStoreReducer(state, new ApiReadSuccessAction({
      jsonApiData: testPayload,
      query: {
        id: '1',
        type: 'Article',
        queryId: '111'
      }
    }));
    let newState = NgrxJsonApiStoreReducer(tempState, new ApiUpdateSuccessAction({
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
      expect(newState.data['Article']['1'].resource.attributes.title).toEqual('bla bla bla');
    })
  });

  describe('API_DELETE_SUCCESS', () => {

    let tempState = NgrxJsonApiStoreReducer(state, new ApiReadSuccessAction({
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

  describe('API_CREATE_FAIL', () => {
    let tempState = NgrxJsonApiStoreReducer(state, new ApiCreateSuccessAction({
      jsonApiData: testPayload
    }));
    let newState = NgrxJsonApiStoreReducer(tempState, new ApiCreateFailAction({
      jsonApiData: {
        errors: [
          'permission denied'
        ]
      },
      query: {
        id: '1',
        type: 'Article',
      }
    }));
    it('should add the errors to the resource', () => {
      expect(newState.data['Article']['1'].errors[0]).toEqual('permission denied');
    });

    it('should subtract 1 from isCreating', () => {
      expect(tempState.isCreating - newState.isCreating).toBe(1);
    });

  });

  describe('API_READ_FAIL', () => {
    let tempState = NgrxJsonApiStoreReducer(state, new ApiReadInitAction({
      query: {
        id: '1',
        type: 'Article',
        queryId: '111'
      }
    }));
    let newState = NgrxJsonApiStoreReducer(tempState, new ApiReadFailAction(
      {
        jsonApiData: {
          errors: ['permission denied']
        },
        query: {
          queryId: '111',
          id: '1',
          type: 'Article',
        }
      }));

    it('should add the errors to the resource', () => {
      expect(newState.queries['111'].errors[0]).toEqual('permission denied');
    });

    it('should subtract 1 from isReading', () => {
      expect(tempState.isReading - newState.isReading).toBe(1);
    });

  });

  describe('API_UPDATE_FAIL action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1'
    };

    let tempState = NgrxJsonApiStoreReducer(state, new ApiReadSuccessAction({
      jsonApiData: testPayload,
      query: query
    }));
    let tempState2 = NgrxJsonApiStoreReducer(tempState, new ApiUpdateInitAction({}));

    let newState = NgrxJsonApiStoreReducer(tempState2, new ApiUpdateFailAction({
      jsonApiData: {
        errors: ['permission denied']
      },
      query: {
        queryId: '111',
        id: '1',
        type: 'Article',
      }
    }));
    it('should subtract 1 from isUpdating', () => {
      expect(tempState2.isUpdating - newState.isUpdating).toBe(1);
    });

    it('should add errors to the resource', () => {
      expect(newState.data['Article']['1'].errors[0]).toEqual('permission denied');
    });
  });

  describe('API_DELETE_FAIL action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1'
    };

    let tempState = NgrxJsonApiStoreReducer(state, new ApiReadSuccessAction({
      jsonApiData: testPayload,
      query: query
    }));
    let tempState2 = NgrxJsonApiStoreReducer(tempState, new ApiDeleteInitAction({}));

    let newState = NgrxJsonApiStoreReducer(tempState2, new ApiDeleteFailAction({
      jsonApiData: {
        errors: ['permission denied']
      },
      query: {
        queryId: '111',
        id: '1',
        type: 'Article',
      }
    }));
    it('should subtract 1 from isDeleting', () => {
      expect(tempState2.isDeleting - newState.isDeleting).toBe(1);
    });

    it('should add errors to the resource', () => {
      expect(newState.data['Article']['1'].errors[0]).toEqual('permission denied');
    });

  });

  describe('QUERY_STORE_SUCCESS action', () => {
    let query = {
      queryId: '111',
      type: 'Article',
      id: '1'
    }
    it('should update the query results', () => {
      let tempState = NgrxJsonApiStoreReducer(state, new ApiReadInitAction({
        query: {
          id: '1',
          type: 'Article',
          queryId: '111'
        }
      }));
      let newState = NgrxJsonApiStoreReducer(tempState, new QueryStoreSuccessAction({
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
      expect(newState.data['Article']['1'].resource.attributes.title).toEqual("sample title");
      expect(newState.data['Article']['1'].resource.attributes.description).toEqual("sample description");
      expect(newState2.data['Article']['1'].resource.attributes.title).toEqual("sample title");
      expect(newState2.data['Article']['1'].resource.attributes.description).toEqual("sample description");
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
