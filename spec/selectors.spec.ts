import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/switchMapTo';

import '@ngrx/core/add/operator/select';

import {
    async,
    inject,
    fakeAsync,
    tick,
    TestBed
} from '@angular/core/testing';

import _ = require('lodash');


import {
  getResourcesDefinitions,
  getResourceDefinition,
  getRelationDefinition,
  getAll,
  getOne,
  get,
  getHasOneRelation,
  getHasManyRelation,
  getRelatedResources,
  getRelated
  NgrxJsonApiSelectors,
} from '../src/selectors';

import { NGRX_JSON_API_STORE_LOCATION, _selectorsFactory } from '../src/module';

import { initNgrxStore, updateStoreResources } from '../src/utils';

import { resourcesDefinitions, selectorsPayload } from './test_utils';

describe('individual selectors', () => {

  let rawStore = initNgrxStore(resourcesDefinitions);
  let store = Object.assign({}, rawStore, {
    data: updateStoreResources(rawStore.data, selectorsPayload)
  });
  let obs = Observable.of(store)


  describe('getResourcesDefinitions', () => {
      it('should get all resources definitons', fakeAsync(() => {
          let sub = obs
              .let(getResourcesDefinitions())
              .subscribe(d => {
                  expect(d).toEqual(resourcesDefinitions);
                  expect(d.length).toEqual(4);
              });
          tick();
      }));
  });

  describe('getResourceDefinition', () => {
      it('should get a single resource definiton', fakeAsync(() => {
          let sub = obs
              .let(getResourceDefinition('Person'))
              .subscribe(d => {
                  expect(d).toEqual(resourcesDefinitions[1]);
                  expect(d.collectionPath).toEqual('people');
                  expect(d.type).toEqual('Person');
              });
          tick();
      }));
  });

  describe('getRelationDefinition', () => {
      it('should get a relation definition given a resource type and relation',
          fakeAsync(() => {
              let sub = obs
                  .let(getRelationDefinition('Article', 'author'))
                  .subscribe(d => {
                      expect(d).toEqual({
                          type: 'Person',
                          relationType: 'hasOne'
                      });
                  });
              tick();
          }));
  });

  describe('get', () => {

      it('should get ALL resources given a type only', fakeAsync(() => {
          let res;
          let sub = obs
              .let(get({ type: 'Article' }))
              .subscribe(d => res = d);
          tick();
          expect(res[0]).toBeDefined();
          expect(res[1]).toBeDefined();
          expect(res[0].attributes.title).toEqual('JSON API paints my bikeshed!');
          expect(res[0].attributes.author).not.toBeDefined();
          expect(res[0].id).toEqual('1');
          expect(res[1].attributes.title).toEqual('Untitled');
          expect(res[1].attributes.author).not.toBeDefined();
          expect(res[1].id).toEqual('2');
          expect(res[2]).not.toBeDefined();
      }));

      it('should get a single resource given a type and id', fakeAsync(() => {
          let res;
          let sub = obs
              .let(get({ type: 'Article', id: '1' }))
              .subscribe(d => res = d);
          tick();
          expect(res).toBeDefined();
          expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
          expect(res.attributes.author).not.toBeDefined();
          expect(res.id).toEqual('1');
      }));
  });

  describe('getAll and getOne', () => {

      it('getAll should get ALL resources given a type', fakeAsync(() => {
          let res;
          let sub = obs
              .let(getAll({ type: 'Article' }))
              .subscribe(d => res = d);
          tick();
          expect(res[0]).toBeDefined();
          expect(res[1]).toBeDefined();
          expect(res[0].attributes.title).toEqual('JSON API paints my bikeshed!');
          expect(res[0].attributes.author).not.toBeDefined();
          expect(res[0].id).toEqual('1');
          expect(res[1].attributes.title).toEqual('Untitled');
          expect(res[1].attributes.author).not.toBeDefined();
          expect(res[1].id).toEqual('2');
          expect(res[2]).not.toBeDefined();
      }));

      it('getOne should get a single resource given a type and id', fakeAsync(() => {
          let res;
          let sub = obs
              .let(getOne({ type: 'Article', id: '1' }))
              .subscribe(d => res = d);
          tick();
          expect(res).toBeDefined();
          expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
          expect(res.attributes.author).not.toBeDefined();
          expect(res.id).toEqual('1');
      }));
  });

  describe('getHasOneRelation', () => {
      it('should get a single resource given its identifier', fakeAsync(() => {
          let res;
          let sub = obs
              .let(getHasOneRelation({ type: 'Article', id: '1' }))
              .subscribe(d => res = d);
          tick();
          expect(res).toBeDefined();
          expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
          expect(res.attributes.author).not.toBeDefined();
          expect(res.id).toEqual('1');
      }));
  });

  describe('getHasManyRelation', () => {
      it('should get multiple resources given their identifiers',
          fakeAsync(() => {
              let res;
              let sub = obs
                  .let(getHasManyRelation([
                      { type: 'Comment', id: '1' },
                      { type: 'Comment', id: '2' }
                  ]))
                  .subscribe(d => res = d);
              tick();
              expect(res).toBeDefined();
              expect(res[0].id).toEqual('1');
              expect(res[1].id).toEqual('2');
              expect(res[0].attributes.text).toEqual('Uncommented');
              expect(res[1].attributes.text).toEqual('No comment');
          }));
  });

  describe('getRelatedResources', () => {
      it('should handle hasOne relations', fakeAsync(() => {
          let res;
          let sub = obs
              .let(getRelatedResources(
                  { type: 'Article', id: '1' }, 'author'))
              .subscribe(d => res = d);
          tick();
          expect(res).toBeDefined();
          expect(res.attributes.name).toEqual('Usain Bolt');
          expect(res.type).toEqual('Person');
          expect(res.id).toEqual('1');

      }));

      it('should handle hasMany relations', fakeAsync(() => {
          let res;
          let sub = obs
              .let(getRelatedResources(
                  { type: 'Article', id: '1' }, 'comments'))
              .subscribe(d => res = d);
          tick();
          expect(res).toBeDefined();
          expect(res.length).toBe(1);
          expect(res[0].id).toEqual('1');
          expect(res[0].attributes.text).toEqual('Uncommented');
      }));

  });

  describe('getRelated', () => {
      it('should handle hasOne relations', fakeAsync(() => {
          let res;
          let sub = obs
              .let(getRelated(
                  { type: 'Article', id: '1' }, 'author'))
              .subscribe(d => res = d);
          tick();
          expect(res).toBeDefined();
          expect(res.attributes.name).toEqual('Usain Bolt');
          expect(res.type).toEqual('Person');
          expect(res.id).toEqual('1');

      }));

      it('should handle hasMany relations', fakeAsync(() => {
          let res;
          let sub = obs
              .let(getRelated(
                  { type: 'Article', id: '1' }, 'comments'))
              .subscribe(d => res = d);
          tick();
          expect(res).toBeDefined();
          expect(res.length).toBe(1);
          expect(res[0].id).toEqual('1');
          expect(res[0].attributes.text).toEqual('Uncommented');
      }));

      it('should handle deep relations', fakeAsync(() => {
          let res;
          let sub = obs
              .let(getRelated(
                  { type: 'Article', id: '1' }, 'author.blog'))
              .subscribe(d => res = d);
          tick();
          expect(res.type).toEqual('Blog');
          expect(res.id).toEqual('1');
          expect(res.attributes.name).toEqual('Random Blog!');
      }));
  });

});


describe('NgrxJsonApiSelectors', () => {
    let selectors;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: NgrxJsonApiSelectors,
                    useFactory: _selectorsFactory,
                    deps: [NGRX_JSON_API_STORE_LOCATION]
                },
                {
                    provide: NGRX_JSON_API_STORE_LOCATION,
                    useValue: 'api'
                }
            ]
        })
    });

    beforeEach(inject([NgrxJsonApiSelectors], (s) => {
        selectors = s;
    }));
    let rawStore = initNgrxStore(resourcesDefinitions);
    let store = Object.assign({}, rawStore, {
      data: updateStoreResources(rawStore.data, selectorsPayload)
    });
    let obs = Observable.of(store)

    describe('getRelated public', () => {
        it('should handle hasOne relations', fakeAsync(() => {
            let res;
            let store2 = { api: store }
            let sub = Observable.of(store2)
                .let(selectors.getRelated(
                    { type: 'Article', id: '1' }, 'author'))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.attributes.name).toEqual('Usain Bolt');
            expect(res.type).toEqual('Person');
            expect(res.id).toEqual('1');

        }));

        it('should handle hasMany relations', fakeAsync(() => {
            let res;
            let store2 = { api: store }
            let sub = Observable.of(store2)
                .let(selectors.getRelated(
                    { type: 'Article', id: '1' }, 'comments'))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.length).toBe(1);
            expect(res[0].id).toEqual('1');
            expect(res[0].attributes.text).toEqual('Uncommented');
        }));
    });

    describe('get public', () => {

        it('get should get ALL resources given a type only', fakeAsync(() => {
            let res;
            let store2 = { api: store }
            let sub = Observable.of(store2)
                .let(selectors.get({ type: 'Article' }))
                .subscribe(d => res = d);
            tick();
            expect(res[0]).toBeDefined();
            expect(res[1]).toBeDefined();
            expect(res[0].attributes.title).toEqual('JSON API paints my bikeshed!');
            expect(res[0].attributes.author).not.toBeDefined();
            expect(res[0].id).toEqual('1');
            expect(res[1].attributes.title).toEqual('Untitled');
            expect(res[1].attributes.author).not.toBeDefined();
            expect(res[1].id).toEqual('2');
            expect(res[2]).not.toBeDefined();
        }));

        it('get should get a single resource given a type and id', fakeAsync(() => {
            let res;
            let store2 = { api: store }
            let sub = Observable.of(store2)
                .let(selectors.get({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
            expect(res.attributes.author).not.toBeDefined();
            expect(res.id).toEqual('1');
        }));
    });


});
