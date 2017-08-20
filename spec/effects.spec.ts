import { async, inject, fakeAsync, tick, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { hot, cold } from 'jasmine-marbles';

// import { Store, StoreModule } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';

import { NgrxJsonApi } from '../src/api';
// import { NgrxJsonApiService } from '../src/services';
// import { NgrxJsonApiSelectors } from '../src/selectors';
import { NgrxJsonApiEffects } from '../src/effects';
//
// import {
//   NGRX_JSON_API_CONFIG,
//   apiFactory,
//   selectorsFactory,
// } from '../src/module';
//
// import {
//   initialNgrxJsonApiState,
//   NgrxJsonApiStoreReducer,
// } from '../src/reducers';
//
import {
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
  LocalQueryInitAction,
  LocalQuerySuccessAction,
  LocalQueryFailAction,
} from '../src/actions';
import { generatePayload } from '../src/utils';

// import {
//   testPayload,
//   resourceDefinitions
// } from './test_utils';

// import { updateStoreDataFromPayload } from '../src/utils';

import {
  //   MOCK_JSON_API_PROVIDERS,
  //   MOCK_NGRX_EFFECTS_PROVIDERS,
  TestingModule,
} from './testing.module';

describe('NgrxJsonApiEffects', () => {
  let effects: NgrxJsonApiEffects;
  let actions: Observable<any>;
  let api;

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
            // 'query',
            // 'insert',
            // 'executeWrite',
          ]),
        },
        provideMockActions(() => actions),
      ],
    });
    api = TestBed.get(NgrxJsonApi);
    effects = TestBed.get(NgrxJsonApiEffects);
  });

  let resource = {
    type: 'Person',
    id: '1',
  };
  //   let successPayload = {
  //     jsonApiData: {
  //       data: {
  //         type: 'SUCCESS'
  //       }
  //     },
  //     query: {
  //       type: 'SUCCESS'
  //     }
  //   };
  //   let failPayload = {
  //     jsonApiData: {
  //       data: {
  //         type: 'FAIL'
  //       }
  //     },
  //     query: {
  //       type: 'FAIL'
  //     }
  //   };
  //   let successQuery = {
  //     query: {
  //       type: 'SUCCESS'
  //     }
  //   };
  //   let failQuery = {
  //     query: {
  //       type: 'FAIL'
  //     }
  //   };
  //
  it('should respond to successfull CREATE_INIT action', () => {
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

  it('should respond to failed CREATE_INIT action', () => {
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

  it('should respond to successfull UPDATE_INIT action', () => {
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

  it('should respond to failed UPDATE_INIT action', () => {
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

  // fit('should respond to successfull READ_INIT action', () => {
  //   let query = { type: 'Person', id: '1'}
  //   let getinitAction = new ApiGetInitAction(query);
  //   let completed = new ApiGetSuccessAction({
  //     jsonApiData: {data: query},
  //     query: query
  //   });
  //   actions = hot('-a', {a: getinitAction});
  //   let response = cold('--a|', {a: new HttpResponse({body: JSON.stringify({data: query}),
  //     status: 200})});
  //   let expected = cold('---b', { b: completed });
  //   api.find.and.returnValue(response);
  //   expect(effects.readResource$).toBeObservable(expected);
  //
  // });

  //   it('should respond to failed READ_INIT action', () => {
  //     let res;
  //     runner.queue(new ApiGetInitAction(failQuery.query));
  //     effects.readResource$.subscribe(result => {
  //       res = result;
  //       expect(result).toEqual(
  //         new ApiGetFailAction(failQuery));
  //     });
  //     expect(res).toBeDefined();
  //   });
  //
  //   it('should respond to successfull DELETE_INIT action', () => {
  //     let res;
  //     runner.queue(new ApiDeleteInitAction(successQuery));
  //     effects.deleteResource$.subscribe(result => {
  //       res = result;
  //       expect(result).toEqual(
  //         new ApiDeleteSuccessAction(Object.assign({}, successQuery, { jsonApiData: null }));
  //     });
  //     expect(res).toBeDefined();
  //   });
  //
  //   it('should respond to failed DELETE_INIT action', () => {
  //     let res;
  //     runner.queue(new ApiDeleteInitAction(failQuery));
  //     effects.deleteResource$.subscribe(result => {
  //       res = result;
  //       expect(result).toEqual(
  //         new ApiDeleteFailAction(failQuery));
  //     });
  //     expect(res).toBeDefined();
  //   });
  //
  //   it('should respond to successfull LOCAL_QUERY_INIT action', () => {
  //     let res;
  //     let query = {
  //       type: 'Article',
  //       id: '1',
  //       queryId: '11'
  //     }
  //     runner.queue(new LocalQueryInitAction(query));
  //     effects.queryStore$.subscribe(result => {
  //       res = result;
  //       expect(result).toEqual(
  //         new LocalQuerySuccessAction({
  //           jsonApiData: { data: result.payload.jsonApiData.data },
  //           query: query,
  //         }));
  //     });
  //     expect(res).toBeDefined();
  //   });
  //
  //   // it('should respond to failed LOCAL_QUERY_INIT action', () => {
  //   //   let res;
  //   //   runner.queue(new LocalQueryInitAction(failQuery));
  //   //   effects.queryStore$.subscribe(result => {
  //   //     res = result;
  //   //     expect(result).toEqual(
  //   //       new LocalQueryFailAction(failQuery));
  //   //   });
  //   //   expect(res).toBeDefined();
  //   // });
});
