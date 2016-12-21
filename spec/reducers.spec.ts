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
    ApiCommitInitAction,
    ApiCommitSuccessAction,
    ApiCommitFailAction,
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
    NgrxJsonApiStore
} from '../src/interfaces';

import { testPayload } from './test_utils';

describe('NgrxJsonApiReducer', () => {

    let state = initialNgrxJsonApiState;

    deepFreeze(state);

    describe('API_CREATE_INIT action', () => {
        it('should change isCreating status', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiCreateInitAction({}));
            expect(newState.isCreating).toBe(true);
        });
    });

    describe('API_READ_INIT action', () => {
        it('should update the storeQueries', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiReadInitAction({
                query: {
                    id: '1',
                    type: 'Article',
                    queryId: '111'
                }
            }));
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
        it('should set isUpdating status to true', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiUpdateInitAction({}));
            expect(newState.isUpdating).toBe(true);
        });
    });

    describe('API_DELETE_INIT action', () => {
        it('should set isDeleting status to true', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiDeleteInitAction({}));
            expect(newState.isDeleting).toBe(true);
        });
    });

    describe('API_CREATE_SUCCESS action', () => {
        it('should set isCreating status to false', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiCreateSuccessAction({}));
            expect(newState.isCreating).toBe(false);
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
        it('should set isReading status to false', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiReadSuccessAction({
                jsonApiData: testPayload,
                query: query
            }));
            expect(newState.isReading).toBe(false);
        });

        it('should add data to the store', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiReadSuccessAction({
                jsonApiData: testPayload,
                query: query
            }));
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
            expect(newState.queries['111'].resultIds.length).toEqual(9);
            expect(newState.queries['111'].resultIds[8]).toEqual({ type: 'Blog', id: '3' });
        });
    });

    describe('API_UPDATE_SUCCESS action', () => {
        let query = {
            queryId: '111',
            type: 'Article',
            id: '1'
        }
        it('should set isUpdating status to false', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiUpdateSuccessAction({
                jsonApiData: testPayload,
            }));
            expect(newState.isUpdating).toBe(false);
        });

        it('should add data to the store', () => {
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
            expect(newState.data['Article']['1'].resource.attributes.title).toEqual('bla bla bla');
        })
    });

    describe('API_DELETE_SUCCESS', () => {
        it('should set isDeleting status to false', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiDeleteSuccessAction({
                query: {
                    type: 'Article'
                }
            }));
            expect(newState.isDeleting).toBe(false);
        });

        it('should remove resources from the store', () => {
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
            expect(newState.data['Article']).toEqual({});
        });
    });

    describe('API_CREATE_FAIL', () => {
        it('should add the errors to the resource', () => {
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
            expect(newState.data['Article']['1'].errors[0]).toEqual('permission denied');
        });
    });

    describe('API_READ_FAIL', () => {
        it('should add the errors to the resource', () => {
            let tempState = NgrxJsonApiStoreReducer(state, new ApiReadInitAction({
                query: {
                    id: '1',
                    type: 'Article',
                    queryId: '111'
                }
            }));
            let newState = NgrxJsonApiStoreReducer(tempState, new ApiReadFailAction({
                jsonApiData: {
                    errors: ['permission denied']
                },
                query: {
                    queryId: '111',
                    id: '1',
                    type: 'Article',
                }));
            expect(newState.queries['111'].errors[0]).toEqual('permission denied');
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
        it('should set isUpdating status to false', () => {
            expect(newState.isUpdating).toBe(false);
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
        it('should set isDeleting status to false', () => {
            expect(newState.isDeleting).toBe(false);
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
            expect(newState.queries['111'].resultIds.length).toEqual(9);
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
    });

    describe('API_COMMIT_INIT action', () => {
        it('should change isCommitting to true', () => {
            let newState = NgrxJsonApiStoreReducer(state, new ApiCommitInitAction());
            expect(newState.isCommitting).toBe(true);
        });
    });

    describe('API_COMMIT/SUCCESS_FAIL actions', () => {

    });

    describe('ALL OTHER ACTIONS', () => {
      it('should return the state', () => {
        let newState = NgrxJsonApiStoreReducer(state, {type: 'RANDOM_ACTION'});
        expect(newState).toEqual(state);
      });
    });

});
