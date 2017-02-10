import {
  async,
  inject,
  fakeAsync,
  tick,
  TestBed
} from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';

import { NgrxJsonApiSelectors } from '../src/selectors';
import {
  initialNgrxJsonApiState
} from '../src/reducers';
import {
  NGRX_JSON_API_CONFIG,
  selectorsFactory
} from '../src/module';
import { updateStoreDataFromPayload } from '../src/utils';
import {
  testPayload,
  resourceDefinitions
} from './test_utils';

describe('NgrxJsonApiSelectors', () => {
  let selectors;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
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
        },
      ]
    })
  });

  beforeEach(inject([NgrxJsonApiSelectors], (s) => {
    selectors = s;
  }));
  let queries = {
    '1': {
      query: {
        queryId: '1',
      },
      resultIds: [{ type: 'Article', id: '1' }, { type: 'Article', id: '2' }]
    },
    '2': {
      query: {
        queryId: '2',
      },
      resultIds: [{ type: 'Blog', id: '1' }]
    },
    '55': {
      query: {
        queryId: '55',
      },
      resultIds: []
    },
    '56': {
      query: {
        queryId: '1',
      },
      resultIds: [{ type: 'Article', id: '10' }, { type: 'Article', id: '20' }]
    },

  }
  let store = {
    api: Object.assign({}, initialNgrxJsonApiState, {
      data: updateStoreDataFromPayload({}, testPayload),
      queries: queries
    }, )
  };
  let obs = Observable.of(store);

  describe('getStoreData$', () => {
    it('should get the store data given a store observable', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getStoreData$())
        .subscribe(d => res = d);
      tick();
      expect(res['Article']).toBeDefined();
      expect(res['Person']).toBeDefined();
    }));
  })

  describe('getStoreResourceOfType$', () => {
    it('should get all resources of a given type', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getStoreResourceOfType$('Article'))
        .subscribe(d => res = d);
      tick();
      expect(res['1']).toBeDefined();
      expect(res['2']).toBeDefined();
      expect(res['1'].attributes.title).toEqual('Article 1');
      expect(res['1'].id).toEqual('1');
      expect(res['2'].attributes.title).toEqual('Article 2');
      expect(res['2'].id).toEqual('2');
      expect(res['3']).not.toBeDefined();
    }));

    it('should return undefined if the resource type is not given', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getStoreResourceOfType$({}))
        .subscribe(d => res = d);
      tick();
      expect(res).not.toBeDefined();
    }));

    it('should return undefined if the resource type is not found', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getStoreResourceOfType$('random'))
        .subscribe(d => res = d);
      tick();
      expect(res).not.toBeDefined();
    }));

  });

  describe('queryStore$', () => {

    it('should return a single resource given a query with id and type only', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.queryStore$({
          type: 'Article',
          id: '1',
        }))
        .subscribe(d => res = d);
      obs.select('api').let(selectors.getStoreResource$({ type: 'Article', id: '1' }))
        .subscribe(r => expect(r).toEqual(res));
      tick();
    }));

    it('should return resources in an Array when using filters and omitting the id', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.queryStore$({
          type: 'Article',
          params: {
            filtering: [
              { path: 'author.profile.id', value: 'firstProfile' }
            ]
          }
        }))
        .subscribe(d => res = d);
      tick();
      expect(res[0].id).toEqual('1');
      expect(res[0].type).toEqual('Article');
    }));

    it('should return an empty array for queries that return nothing', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.queryStore$({
          type: 'Article',
          params: {
            filtering: [
              { path: 'author.profile.id', value: 'blablabla' }
            ]
          }
        }))
        .subscribe(d => res = d);
      tick();
      expect(res).toEqual([]);
    }));

    it('should return an array of multiple resources using filters', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.queryStore$({
          type: 'Article',
        }))
        .subscribe(d => res = d);
      tick();
      expect(_.isArray(res)).toBeTruthy();
      expect(res.length).toBe(2);
    }));

    it('should throw an error for queries with no type', fakeAsync(() => {
        let res;
        let sub = obs
            .select('api')
            .let(selectors.queryStore$({
            }))
            .subscribe(d => res = d);
        expect(res.error).toEqual('Unknown query');
    }));

  });

  describe('getStoreQueries$', () => {
    it('should get the store queries given a store observable', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getStoreQueries$())
        .subscribe(d => res = d);
      tick();
      expect(res['1']).toBeDefined();
      expect(res['2']).toBeDefined();
      expect(res['3']).not.toBeDefined();
    }));
  });

  describe('getResourceQuery$', () => {
    it('should get the a single query given a queryId', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getResourceQuery$('1'))
        .subscribe(d => res = d);
      tick();
      expect(res.query).toBeDefined();
      expect(res.resultIds).toBeDefined();
      expect(res.resultIds.length).toEqual(2);
    }));

    it('should return undefined for unavailable queries', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getResourceQuery$('10'))
        .subscribe(d => res = d);
      tick();
      expect(res).not.toBeDefined();
    }));

  });

  describe('getManyResults$', () => {
    it('should get the StoreResource(s) that are the data of a query', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getManyResults$('1'))
        .subscribe(d => res = d);
      tick();
      expect(res.data[0].id).toEqual('1');
      expect(res.data[1].id).toEqual('2');
    }));

    it('should get return an empty array if there are no data', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getManyResults$('55'))
        .subscribe(d => res = d);
      tick();
      expect(res.data).toEqual([]);
    }));


    it('should return undefined if the resources are not defined', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getManyResults$('56'))
        .subscribe(d => res = d);
      tick();
      expect(res.data[0]).toBeUndefined();
      expect(res.data[1]).toBeUndefined();
    }));

  });

  describe('getOneResults$', () => {
    it('should get the StoreResource that are the data of a query', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getOneResult$('2'))
        .subscribe(d => res = d);
      tick();
      expect(res.data.id).toEqual('1');
    }));

    it('should throw error if not a unique result is returned', fakeAsync(() => {
      let res;
      let err;
      let sub = obs
        .select('api')
        .let(selectors.getOneResult$('1'))
        .subscribe(d => res = d, e => err = e);
      tick();
      expect(res).toBeUndefined();
      expect(err).toBeDefined();
      expect(err.message).toBe('expected single result for query 1');
    }));

    it('should return null for no query result', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getOneResult$('55'))
        .subscribe(d => res = d);
      tick();
      expect(res.data).toBeNull();
    }));
  });

  describe('getStoreResource$', () => {
    it('should get a single resource given a type and id', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getStoreResource$({ type: 'Article', id: '1' }))
        .subscribe(d => res = d);
      tick();
      expect(res.attributes.title).toEqual('Article 1');
      expect(res.type).toEqual('Article');
      expect(res.id).toEqual('1');
    }));

    it('should return undefined if the resources are not found', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getStoreResource$({ type: 'Article', id: '100' }))
        .subscribe(d => res = d);
      tick();
      expect(res).not.toBeDefined();
    }));

  });

});
