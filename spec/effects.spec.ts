import {
  async,
  inject,
  fakeAsync,
  tick,
  TestBed
} from '@angular/core/testing';

import { Store, StoreModule } from '@ngrx/store';

import {
  EffectsTestingModule,
  EffectsRunner
} from '@ngrx/effects/testing';

import { NgrxJsonApi } from '../src/api';
import { NgrxJsonApiService } from '../src/services';
import { NgrxJsonApiSelectors } from '../src/selectors';
import { NgrxJsonApiEffects } from '../src/effects';

import {
  NGRX_JSON_API_CONFIG,
  apiFactory,
  selectorsFactory,
} from '../src/module';

import {
  initialNgrxJsonApiState,
  NgrxJsonApiStoreReducer,
} from '../src/reducers';

import {
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
  LocalQueryInitAction,
  LocalQuerySuccessAction,
  LocalQueryFailAction
} from '../src/actions';

import {
  testPayload,
  resourceDefinitions
} from './test_utils';

import { updateStoreDataFromPayload } from '../src/utils';


import {
  MOCK_JSON_API_PROVIDERS,
  MOCK_NGRX_EFFECTS_PROVIDERS
} from './testing';

describe('NgrxJsonApiEffects', () => {
  let runner: EffectsRunner;
  let effects;

  beforeEach(() => {
    let store = {
      api: Object.assign({}, initialNgrxJsonApiState, {
        data: updateStoreDataFromPayload({}, testPayload),
      }, )
    };
    TestBed.configureTestingModule({
      imports: [
        EffectsTestingModule,
        StoreModule.provideStore({ api: NgrxJsonApiStoreReducer }, store),
      ],
      providers: [
        ...MOCK_JSON_API_PROVIDERS,
        ...MOCK_NGRX_EFFECTS_PROVIDERS,
        {
          provide: NgrxJsonApiSelectors,
          useFactory: selectorsFactory,
          deps: [NGRX_JSON_API_CONFIG]
        },
        {
          provide: NGRX_JSON_API_CONFIG,
          useValue: {
            storeLocation: 'api',
            resourceDefinitions: resourceDefinitions
          }
        }
      ]
    })
  });

  beforeEach(inject([EffectsRunner, NgrxJsonApiEffects],
    (_runner, _effects) => {
      runner = _runner;
      effects = _effects;
    }
  ));

  let successPayload = {
    jsonApiData: {
      data: {
        type: 'SUCCESS'
      }
    },
    query: {
      type: 'SUCCESS'
    }
  };
  let failPayload = {
    jsonApiData: {
      data: {
        type: 'FAIL'
      }
    },
    query: {
      type: 'FAIL'
    }
  };
  let successQuery = {
    query: {
      type: 'SUCCESS'
    }
  };
  let failQuery = {
    query: {
      type: 'FAIL'
    }
  };

  it('should respond to successfull CREATE_INIT action', () => {
    let res;
    runner.queue(new ApiCreateInitAction(successPayload));
    effects.createResource$.subscribe(result => {
      res = result;
      expect(result).toEqual(
        new ApiCreateSuccessAction(successPayload));
    });
    expect(res).toBeDefined();
  });

  it('should respond to failed CREATE_INIT action', () => {
    let res;
    runner.queue(new ApiCreateInitAction(failPayload));
    effects.createResource$.subscribe(result => {
      res = result;
      expect(result).toEqual(
        new ApiCreateFailAction(failPayload));
    });
    expect(res).toBeDefined();
  });

  it('should respond to successfull UPDATE_INIT action', () => {
    let res;
    runner.queue(new ApiUpdateInitAction(successPayload));
    effects.updateResource$.subscribe(result => {
      res = result;
      expect(result).toEqual(
        new ApiUpdateSuccessAction(successPayload));
    });
    expect(res).toBeDefined();
  });

  it('should respond to failed UPDATE_INIT action', () => {
    let res;
    runner.queue(new ApiUpdateInitAction(failPayload));
    effects.updateResource$.subscribe(result => {
      res = result;
      expect(result).toEqual(
        new ApiUpdateFailAction(failPayload));
    });
    expect(res).toBeDefined();
  });

  it('should respond to successfull READ_INIT action', () => {
    let res;
    runner.queue(new ApiReadInitAction(successQuery.query));
    effects.readResource$.subscribe(result => {
      res = result;
      expect(result).toEqual(
        new ApiReadSuccessAction({
          jsonApiData: result.payload.jsonApiData,
          query: successQuery.query
        }));
    });
    expect(res).toBeDefined();
  });

  it('should respond to failed READ_INIT action', () => {
    let res;
    runner.queue(new ApiReadInitAction(failQuery.query));
    effects.readResource$.subscribe(result => {
      res = result;
      expect(result).toEqual(
        new ApiReadFailAction(failQuery));
    });
    expect(res).toBeDefined();
  });

  it('should respond to successfull DELETE_INIT action', () => {
    let res;
    runner.queue(new ApiDeleteInitAction(successQuery));
    effects.deleteResource$.subscribe(result => {
      res = result;
      expect(result).toEqual(
        new ApiDeleteSuccessAction(Object.assign({}, successQuery, { jsonApiData: null }));
    });
    expect(res).toBeDefined();
  });

  it('should respond to failed DELETE_INIT action', () => {
    let res;
    runner.queue(new ApiDeleteInitAction(failQuery));
    effects.deleteResource$.subscribe(result => {
      res = result;
      expect(result).toEqual(
        new ApiDeleteFailAction(failQuery));
    });
    expect(res).toBeDefined();
  });

  it('should respond to successfull LOCAL_QUERY_INIT action', () => {
    let res;
    let query = {
      type: 'Article',
      id: '1',
      queryId: '11'
    }
    runner.queue(new LocalQueryInitAction(query));
    effects.queryStore$.subscribe(result => {
      res = result;
      expect(result).toEqual(
        new LocalQuerySuccessAction({
          jsonApiData: { data: result.payload.jsonApiData.data },
          query: query,
        }));
    });
    expect(res).toBeDefined();
  });

  // it('should respond to failed LOCAL_QUERY_INIT action', () => {
  //   let res;
  //   runner.queue(new LocalQueryInitAction(failQuery));
  //   effects.queryStore$.subscribe(result => {
  //     res = result;
  //     expect(result).toEqual(
  //       new LocalQueryFailAction(failQuery));
  //   });
  //   expect(res).toBeDefined();
  // });
});
