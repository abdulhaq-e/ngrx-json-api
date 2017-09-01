import {TestBed} from '@angular/core/testing';
import {HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';

import {cold, hot} from 'jasmine-marbles';

import {Store} from '@ngrx/store';
import {provideMockActions} from '@ngrx/effects/testing';

import {NgrxJsonApi} from '../src/api';
import {NgrxJsonApiSelectors} from '../src/selectors';
import {NgrxJsonApiEffects} from '../src/effects';

import {
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
  LocalQueryFailAction,
  LocalQueryInitAction,
  LocalQuerySuccessAction,
  RemoveQueryAction,
} from '../src/actions';
import {generatePayload} from '../src/utils';

import {TestingModule} from './testing.module';
import {Query, Resource} from "../src/interfaces";

describe('NgrxJsonApiEffects', () => {
  let effects: NgrxJsonApiEffects;
  let actions: Observable<any>;
  let api: NgrxJsonApi;
  let store: Store<any>;
  let mockStoreLet: any;
  let selectors: NgrxJsonApiSelectors;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      providers: [
        NgrxJsonApiEffects,
        {
          provide: NgrxJsonApi,
          useValue: jasmine.createSpyObj('database', [
            'create',
            'update',
            'find',
            'delete',
          ]),
        },
        provideMockActions(() => actions),
      ],
    });
    api = TestBed.get(NgrxJsonApi);
    effects = TestBed.get(NgrxJsonApiEffects);
    store = TestBed.get(Store);
    mockStoreLet = {
      let: function() {},
    };
    spyOn(store, 'let');
    spyOn(mockStoreLet, 'let');
  });

  let resource = {
    type: 'Person',
    id: '1',
  };
  //
  it('should respond to successful POST_INIT action', () => {
    let postinitAction = new ApiPostInitAction(resource);
    let payload = generatePayload(resource, 'POST');
    let completed = new ApiPostSuccessAction(payload);
    actions = hot('-a', { a: postinitAction });
    let response = cold('--a|', {
      a: new HttpResponse({
        body: payload.jsonApiData,
        status: 200,
      }),
    });
    let expected = cold('---b', { b: completed });
    api.create.and.returnValue(response);
    expect(effects.createResource$).toBeObservable(expected);
  });

  it('should respond to failed POST_INIT action', () => {
    let postinitAction = new ApiPostInitAction(resource);
    let payload = generatePayload(resource, 'POST');
    let error = new HttpResponse({
      body: payload.jsonApiData,
      status: 400,
    });
    let completed = new ApiPostFailAction(
      effects.toErrorPayload(payload.query, error)
    );
    actions = hot('-a', { a: postinitAction });
    let response = cold('-#', {}, error);
    let expected = cold('--b', { b: completed });
    api.create.and.returnValue(response);
    expect(effects.createResource$).toBeObservable(expected);
  });

  it('should respond to successful PATCH_INIT action', () => {
    let patchinitAction = new ApiPatchInitAction(resource);
    let payload = generatePayload(resource, 'PATCH');
    let completed = new ApiPatchSuccessAction(payload);
    actions = hot('-a', { a: patchinitAction });
    let response = cold('--a|', {
      a: new HttpResponse({
        body: payload.jsonApiData,
        status: 200,
      }),
    });
    let expected = cold('---b', { b: completed });
    api.update.and.returnValue(response);
    expect(effects.updateResource$).toBeObservable(expected);
  });

  it('should respond to failed PATCH_INIT action', () => {
    let patchinitAction = new ApiPatchInitAction(resource);
    let payload = generatePayload(resource, 'PATCH');
    let error = new HttpResponse({
      body: payload.jsonApiData,
      status: 400,
    });
    let completed = new ApiPatchFailAction(
      effects.toErrorPayload(payload.query, error)
    );
    actions = hot('-a', { a: patchinitAction });
    let response = cold('--#', {}, error);
    let expected = cold('---b', { b: completed });
    api.update.and.returnValue(response);
    expect(effects.updateResource$).toBeObservable(expected);
  });

  it('should respond to successfull READ_INIT action', () => {
    let query = { type: 'Person', id: '1' };
    let getinitAction = new ApiGetInitAction(query);
    let completed = new ApiGetSuccessAction({
      jsonApiData: { data: query },
      query: query,
    });
    actions = hot('-a', { a: getinitAction });
    let response = cold('--a|', {
      a: new HttpResponse({ body: { data: query } }),
      status: 200,
    });
    let expected = cold('---b', { b: completed });
    api.find.and.returnValue(response);
    expect(effects.readResource$).toBeObservable(expected);
  });

  it('should respond to failed READ_INIT action', () => {
    let query = { type: 'Person', id: '1' };
    let getinitAction = new ApiGetInitAction(query);
    let error = new HttpResponse({
      body: query,
      status: 400,
    });
    let completed = new ApiGetFailAction(effects.toErrorPayload(query, error));
    actions = hot('-a', { a: getinitAction });
    let response = cold('--#', {}, error);
    let expected = cold('---b', { b: completed });
    api.find.and.returnValue(response);
    expect(effects.readResource$).toBeObservable(expected);
  });

  it('should respond to successfull DELETE_INIT action', () => {
    let deleteinitAction = new ApiDeleteInitAction(resource);
    let payload = generatePayload(resource, 'DELETE');
    let completed = new ApiDeleteSuccessAction({
      jsonApiData: payload.query,
      query: payload.query,
    });
    actions = hot('-a', { a: deleteinitAction });
    let response = cold('--a|', {
      a: new HttpResponse({
        body: payload.query,
        status: 200,
      }),
    });
    let expected = cold('---b', { b: completed });
    api.delete.and.returnValue(response);
    expect(effects.deleteResource$).toBeObservable(expected);
  });

  it('should respond to failed DELETE_INIT action', () => {
    let deletefailAction = new ApiDeleteInitAction(resource);
    let payload = generatePayload(resource, 'DELETE');
    let error = new HttpResponse({
      body: resource,
      status: 400,
    });
    let completed = new ApiDeleteFailAction(
      effects.toErrorPayload(payload.query, error)
    );
    actions = hot('-a', { a: deletefailAction });
    let response = cold('--#', {}, error);
    let expected = cold('---b', { b: completed });
    api.delete.and.returnValue(response);
    expect(effects.deleteResource$).toBeObservable(expected);
  });

  it('should respond to successful LOCAL_QUERY_INIT action', () => {
    let query: Query = {
      type: 'Article',
      id: '1',
      queryId: 'someId'
    };
    let localqueryinitAction = new LocalQueryInitAction(query);
    let completed = new LocalQuerySuccessAction({
      jsonApiData: { data: query },
      query: query,
    });
    actions = hot('-a', { a: localqueryinitAction });
    let response = cold('--a', { a: query });
    let expected = cold('---b', { b: completed });
    store.let.and.returnValue(mockStoreLet);
    mockStoreLet.let.and.returnValue(response);
    expect(effects.queryStore$).toBeObservable(expected);
  });

  it('should switch to new query on repeated LOCAL_QUERY_INIT', () => {
    let query1: Query = {
      type: 'Article',
      id: '1',
      queryId: 'someId'
    };
    let query2: Query = {
      type: 'Article',
      id: '2',
      queryId: 'someId'
    };
    let resource1: Resource = {
      type: 'Article',
      id: '1',
    };
    let resource2: Resource = {
      type: 'Article',
      id: '2',
    };
    let localqueryinitAction1 = new LocalQueryInitAction(query1);
    let localqueryinitAction2 = new LocalQueryInitAction(query2);
    let completed1 = new LocalQuerySuccessAction({
      jsonApiData: { data: resource1 },
      query: query1,
    });
    // note that mock setup is not perfect, second query will get resource1 and resource2
    let completed2 = new LocalQuerySuccessAction({
      jsonApiData: { data: resource1 },
      query: query2,
    });
    let completed3 = new LocalQuerySuccessAction({
      jsonApiData: { data: resource2 },
      query: query2,
    });
    actions = hot('-a--b', { a: localqueryinitAction1, b: localqueryinitAction2 });
    let response = cold('--a--b', { a: resource1, b: resource2 });
    let expected = cold('---a--b--c', { a: completed1, b: completed2, c: completed3 });
    store.let.and.returnValue(mockStoreLet);
    mockStoreLet.let.and.returnValue(response);
    expect(effects.queryStore$).toBeObservable(expected);
  });

  it('should cancel LOCAL_QUERY_INIT with REMOVE_QUERY', () => {
    let query: Query = {
      type: 'Article',
      id: '1',
      queryId: 'someId'
    };
    let resource1: Resource = {
      type: 'Article',
      id: '1',
    };
    let resource2: Resource = {
      type: 'Article',
      id: '2',
    };
    let localqueryinitAction = new LocalQueryInitAction(query);
    let removeQueryAction = new RemoveQueryAction(query.queryId);
    let completed = new LocalQuerySuccessAction({
      jsonApiData: { data: resource1 },
      query: query,
    });
    actions = hot('-a--b', { a: localqueryinitAction, b: removeQueryAction });
    let response = cold('--a----b', { a: resource1, b: resource2 });
    let expected = cold('---a', { a: completed });
    store.let.and.returnValue(mockStoreLet);
    mockStoreLet.let.and.returnValue(response);
    expect(effects.queryStore$).toBeObservable(expected);
  });

  it('should respond to failed LOCAL_QUERY_INIT action', () => {
    let query = {
      type: 'Article',
      id: '1',
    };
    let localqueryfailAction = new LocalQueryInitAction(query);
    let error = 'ERROR';
    let completed = new LocalQueryFailAction(
      effects.toErrorPayload(query, error)
    );
    actions = hot('-a', { a: localqueryfailAction });
    let response = cold('--#', {}, error);
    let expected = cold('---b', { b: completed });
    store.let.and.returnValue(mockStoreLet);
    mockStoreLet.let.and.returnValue(response);
    expect(effects.queryStore$).toBeObservable(expected);
  });

  it('should ignore charset in Content-Type to map errors', () => {
    let payload = generatePayload(resource, 'PATCH');
    let headers = new HttpHeaders().set('Content-Type', 'application/vnd.api+json;charset=utf-8');
    let error = new HttpErrorResponse({
      error: {
        errors: [{
          detail: 'someDetail'
        }]
      },
      headers: headers,
      status: 400
    });
    let payload = effects.toErrorPayload(payload.query, error);
    expect(payload.jsonApiData.errors).toEqual([{
      detail: 'someDetail'
    }]);
  });

  it('should map JSON_API errors to payload', () => {
    let payload = generatePayload(resource, 'PATCH');
    let headers = new HttpHeaders().set('Content-Type', 'application/vnd.api+json');
    let error = new HttpErrorResponse({
      error: {
        errors: [{
          detail: 'someDetail'
        }]
      },
      headers: headers,
      status: 400
    });
    let payload = effects.toErrorPayload(payload.query, error);
    expect(payload.jsonApiData.errors).toEqual([{
      detail: 'someDetail'
    }]);
  });

  it('should map HTTP errors for non-JSON_API errors', () => {
    let payload = generatePayload(resource, 'PATCH');
    let headers = new HttpHeaders().set('Content-Type', 'application/not-json-api');
    let error = new HttpErrorResponse({
      error: {
        errors: [{
          detail: 'someDetail'
        }]
      },
      headers: headers,
      status: 400,
      statusText: 'someErrorText'
    });
    let payload = effects.toErrorPayload(payload.query, error);
    expect(payload.jsonApiData.errors).toEqual([{
      code: 'someErrorText',
      status: '400'
    }]);
  });
});
