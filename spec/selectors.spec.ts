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
    }

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


  describe('getResultIdentifiers$', () => {
    it('should get the resultIds of a query given a queryId', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getResultIdentifiers$('1'))
        .subscribe(d => res = d);
      tick();
      expect(res.length).toEqual(2);
      expect(res[0].type).toEqual('Article');
    }));

  });

  describe('getResults$', () => {
    it('should get the StoreResource(s) that are the results of a query', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getResults$('1'))
        .subscribe(d => res = d);
      tick();
      expect(res[0].id).toEqual('1');
      expect(res[1].id).toEqual('2');
    }));

    it('should get return an empty array if there are no results', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getResults$('55'))
        .subscribe(d => res = d);
      tick();
      expect(res).toEqual([]);
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

  describe('getManyStoreResource$', () => {
    it('should get multiple StoreResource given an array of ids', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getManyStoreResource$(
          [
            { type: 'Article', id: '1' },
            { type: 'Article', id: '2' }
          ]
        ))
        .subscribe(d => res = d);
      tick();
      expect(res[0].id).toEqual('1');
      expect(res[1].id).toEqual('2');
    }));

    it('should return undefined if the resources are not defined', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getManyStoreResource$(
          [
            { type: 'Article', id: '10' },
            { type: 'Article', id: '20' }
          ]
        ))
        .subscribe(d => res = d);
      tick();
      expect(res[0]).toBeUndefined();
      expect(res[1]).toBeUndefined();
    }));

    it('should return undefined if the ids are not defined', fakeAsync(() => {
      let res;
      let sub = obs
        .select('api')
        .let(selectors.getManyStoreResource$())
        .subscribe(d => res = d);
      tick();
      expect(res).toBeUndefined();
    }));

  });

});
