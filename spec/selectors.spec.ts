import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/operator/do';
// import 'rxjs/add/operator/filter';
// import 'rxjs/add/operator/let';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/mapTo';
// import 'rxjs/add/operator/merge';
// import 'rxjs/add/operator/mergeMap';
// import 'rxjs/add/operator/reduce';
// import 'rxjs/add/operator/switchMap';
// import 'rxjs/add/operator/switchMapTo';
//
// import '@ngrx/core/add/operator/select';
//
import {
    async,
    inject,
    fakeAsync,
    tick,
    TestBed
} from '@angular/core/testing';
//
// import _ = require('lodash');
//
//
import { NgrxJsonApiSelectors } from '../src/selectors';
//
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
                resultIds: [{ type: 'Blog', id: '1' }]
            }
        }
    }
    let store = {
        api: Object.assign({}, initialNgrxJsonApiState, {
            data: updateStoreDataFromPayload({}, testPayload),
            queries: queries;
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
            expect(res['1'].resource.attributes.title).toEqual('Article 1');
            expect(res['1'].resource.id).toEqual('1');
            expect(res['2'].resource.attributes.title).toEqual('Article 2');
            expect(res['2'].resource.id).toEqual('2');
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
    });

    describe('getStoreResource$', () => {
        it('should get a single resource given a type and id', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.getStoreResource$({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            tick();
            expect(res.resource.attributes.title).toEqual('Article 1');
            expect(res.resource.type).toEqual('Article');
            expect(res.resource.id).toEqual('1');
        }));


        describe('getManyStoreResource$', () => {
            it('should get the a single query given a queryId', fakeAsync(() => {
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
                expect(res[0].resource.id).toEqual('1');
                expect(res[1].resource.id).toEqual('2');
            }));
        });


        // it('should return null if the type does not exist', fakeAsync(() => {
        //     let res;
        //     let sub = obs
        //         .select('api')
        //         .let(selectors.getOneStoreResource$({ type: 'Tag', id: '1' }))
        //         .subscribe(d => res = d);
        //     tick();
        //     expect(res).toBeNull();
        // }));
        //
        // it('should return null if the id is not given', fakeAsync(() => {
        //     let res;
        //     let sub = obs
        //         .select('api')
        //         .let(selectors.getOneStoreResource$({ type: 'Article' }))
        //         .subscribe(d => res = d);
        //     tick();
        //     expect(res).toBeNull();
        // }));
    });

    describe('queryStore$', () => {

        it('should return a single resource given a getOne query with id and type', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.queryStore$({
                    type: 'Article',
                    id: '1',
                    queryType: 'getOne'
                }))
                .subscribe(d => res = d);
            obs.select('api').let(selectors.getStoreResource$({ type: 'Article', id: '1' }))
                .subscribe(r => expect(r.resource).toEqual(res));
            tick();
        }));

        it('should return a single resource using filters given a getOne query with type only', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.queryStore$({
                    type: 'Article',
                    queryType: 'getOne',
                    params: {
                      filtering: [
                        { path: 'author.profile.id', value: 'firstProfile'}
                      ]
                  }
                }))
                .subscribe(d => res = d);
            tick();
            expect(res.id).toEqual('1');
            expect(res.type).toEqual('Article');
        }));

        it('should return an empty object for getOne queries that are not found', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.queryStore$({
                    type: 'Article',
                    queryType: 'getOne',
                    params: {
                      filtering: [
                        { path: 'author.profile.id', value: 'blablabla'}
                      ]
                  }
                }))
                .subscribe(d => res = d);
            tick();
            expect(res).toEqual({});
        }));

        // it doesn't work, don't know why
        // fit('should throw an error for getOne queries that return more than one StoreResource', fakeAsync(() => {
        //     let res;
        //     let sub = obs
        //         .select('api')
        //         .let(selectors.queryStore$({
        //             type: 'Article',
        //             queryType: 'getOne',
        //         }))
        //         .subscribe(d => res = d);
        //     expect(() => {
        //       tick();
        //     }).toThrow();
        // }));

        it('should return an array of resources given a getMany query', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.queryStore$({
                    type: 'Article',
                    queryType: 'getMany'
                }))
                .subscribe(d => res = d);
            tick();
            expect(_.isArray(res)).toBeTruthy();
            expect(res.length).toBe(2);
        }));

        it('should return an array of filtered StoreResource given a getMany query', fakeAsync(() => {
              let res;
              let sub = obs
                  .select('api')
                  .let(selectors.queryStore$({
                      type: 'Article',
                      queryType: 'getMany',
                      params: {
                        filtering: [
                          { path: 'author.profile.id', value: 'firstProfile'}
                        ]
                    }
                  }))
                  .subscribe(d => res = d);
              tick();
              expect(_.isArray(res)).toBeTruthy();
              expect(res.length).toBe(1);
              expect(res[0].type).toEqual('Article');
              expect(res[0].id).toEqual('1');
          }));

          it('should return an empty array of filtered StoreResource given a getMany query that return nothing', fakeAsync(() => {
                let res;
                let sub = obs
                    .select('api')
                    .let(selectors.queryStore$({
                        type: 'Article',
                        queryType: 'getMany',
                        params: {
                          filtering: [
                            { path: 'author.profile.id', value: 'blablabla'}
                          ]
                      }
                    }))
                    .subscribe(d => res = d);
                tick();
                expect(_.isArray(res)).toBeTruthy();
                expect(res.length).toBe(0);
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
        expect(res[0].resource.id).toEqual('1');
        expect(res[1].resource.id).toEqual('2');
      }));
    });

    describe('getResource$', () => {
        it('should get the actual resource given an identifier', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.getResource$({type: 'Article', id: '1'}))
                .subscribe(d => res = d);
            tick();
            expect(res.id).toEqual('1');
        }));
    });

    describe('getManyResource$', () => {
        it('should get the actual resource given an identifier', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.getManyResource$([
                  {type: 'Article', id: '1'},
                  {type: 'Article', id: '2'}
                ))
                .subscribe(d => res = d);
            tick();
            expect(res[0].id).toEqual('1');
            expect(res[1].id).toEqual('2');
        }));
    });
});
