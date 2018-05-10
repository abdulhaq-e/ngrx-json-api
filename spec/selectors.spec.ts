import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';

import { TestingModule } from './testing.module';
import { Store } from '@ngrx/store';
import {
  selectManyQueryResult,
  selectNgrxJsonApiDefaultZone,
  selectOneQueryResult,
  selectStoreQuery,
  selectStoreResource,
  selectStoreResources,
  selectStoreResourcesOfType,
} from '../src/selectors';
import { NgrxJsonApiZone } from '../src/interfaces';

describe('NgrxJsonApiSelectors', () => {
  let store: Observable<NgrxJsonApiZone>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
    });
  });

  beforeEach(
    inject([Store], s => {
      store = s;
    })
  );

  beforeEach(() => {
    store = store.let(selectNgrxJsonApiDefaultZone());
  });

  describe('selectStoreResourcesOfType', () => {
    it(
      'should get all resources of a given type',
      fakeAsync(() => {
        let res;
        let sub = store
          .let(selectStoreResourcesOfType('Article'))
          .subscribe(d => (res = d));
        tick();
        expect(res['1']).toBeDefined();
        expect(res['2']).toBeDefined();
        expect(res['1'].attributes.title).toEqual('Article 1');
        expect(res['1'].id).toEqual('1');
        expect(res['2'].attributes.title).toEqual('Article 2');
        expect(res['2'].id).toEqual('2');
        expect(res['3']).not.toBeDefined();
      })
    );

    describe('selectStoreQuery', () => {
      it(
        'should get the a single query given a queryId',
        fakeAsync(() => {
          let res;
          let sub = store.let(selectStoreQuery('1')).subscribe(d => (res = d));
          tick();
          expect(res.query).toBeDefined();
          expect(res.resultIds).toBeDefined();
          expect(res.resultIds.length).toEqual(2);
        })
      );

      it(
        'should return undefined for unavailable queries',
        fakeAsync(() => {
          let res;
          let sub = store.let(selectStoreQuery('10')).subscribe(d => (res = d));
          tick();
          expect(res).not.toBeDefined();
        })
      );
    });

    describe('selectManyQueryResult', () => {
      it(
        'should get the StoreResource(s) that are the data of a query',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectManyQueryResult('1'))
            .subscribe(d => (res = d));
          tick();
          expect(res.data[0].id).toEqual('1');
          expect(res.data[1].id).toEqual('2');
        })
      );

      it(
        'should get undefined for non-existing query',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectManyQueryResult('doesNotExist'))
            .subscribe(d => (res = d));
          tick();
          expect(res).toBeUndefined();
        })
      );

      it(
        'should get return an empty array if there are no data',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectManyQueryResult('55'))
            .subscribe(d => (res = d));
          tick();
          expect(res.data).toEqual([]);
        })
      );

      it(
        'should return undefined if the resources are not defined',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectManyQueryResult('56'))
            .subscribe(d => (res = d));
          tick();
          expect(res.data[0]).toBeUndefined();
          expect(res.data[1]).toBeUndefined();
        })
      );
    });

    describe('selectOneQueryResult', () => {
      it(
        'should get the StoreResource that are the data of a query',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectOneQueryResult('2'))
            .subscribe(d => (res = d));
          tick();
          expect(res.data.id).toEqual('1');
        })
      );

      it(
        'should get undefined for non-existing query',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectOneQueryResult('doesNotExist'))
            .subscribe(d => (res = d));
          tick();
          expect(res).toBeUndefined();
        })
      );

      it(
        'should throw error if not a unique result is returned',
        fakeAsync(() => {
          let res;
          let err;
          let sub = store
            .let(selectOneQueryResult('1'))
            .subscribe(d => (res = d), e => (err = e));
          tick();
          expect(res).toBeUndefined();
          expect(err).toBeDefined();
          expect(err.message).toBe('expected single result for query 1');
        })
      );

      it(
        'should return null for no query result',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectOneQueryResult('55'))
            .subscribe(d => (res = d));
          tick();
          expect(res.data).toBeNull();
        })
      );
    });

    describe('selectStoreResource', () => {
      it(
        'should get a single resource given a type and id',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectStoreResource({ type: 'Article', id: '1' }))
            .subscribe(d => (res = d));
          tick();
          expect(res.attributes.title).toEqual('Article 1');
          expect(res.type).toEqual('Article');
          expect(res.id).toEqual('1');
        })
      );

      it(
        'should return undefined if the resources are not found',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectStoreResource({ type: 'Article', id: '100' }))
            .subscribe(d => (res = d));
          tick();
          expect(res).not.toBeDefined();
        })
      );
    });

    describe('selectStoreResources', () => {
      it(
        'should get resources given types and ids',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectStoreResources([{ type: 'Article', id: '1' }, { type: 'Article', id: '2'}]))
            .subscribe(d => (res = d));
          tick();
          expect(res[0].attributes.title).toEqual('Article 1');
          expect(res[0].type).toEqual('Article');
          expect(res[0].id).toEqual('1');
          expect(res[1].attributes.title).toEqual('Article 2');
          expect(res[1].type).toEqual('Article');
          expect(res[1].id).toEqual('2');
        })
      );

      it(
        'should return undefined if the resources are not found',
        fakeAsync(() => {
          let res;
          let sub = store
            .let(selectStoreResources([{ type: 'Article', id: '100' }, { type: 'Article', id: '1'}, {type: 'Unknown', id: '1'}]))
            .subscribe(d => (res = d));
          tick();
          expect(res[0]).not.toBeDefined();
          expect(res[1]).toBeDefined();
          expect(res[2]).not.toBeDefined();
        })
      );
    });
  });
});
