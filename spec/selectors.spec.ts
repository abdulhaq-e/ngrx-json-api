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
    NGRX_JSON_API_STORE_LOCATION,
    selectorsFactory
} from '../src/module';

import { updateStoreResources } from '../src/utils';

import { testPayload } from './test_utils';

describe('NgrxJsonApiSelectors', () => {
    let selectors;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: NgrxJsonApiSelectors,
                    useFactory: selectorsFactory,
                    deps: [NGRX_JSON_API_STORE_LOCATION]
                },
                {
                    provide: NGRX_JSON_API_STORE_LOCATION,
                    useValue: 'api'
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
            data: updateStoreResources({}, testPayload),
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

    describe('getResourceStoreOfType$', () => {
        it('should get all resources of a given type', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.getResourceStoreOfType$('Article'))
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
                .let(selectors.getResourceStoreOfType$({}))
                .subscribe(d => res = d);
            tick();
            expect(res).not.toBeDefined();
        }));
    });

    describe('getResourceStore$', () => {
        it('should get a single resource given a type and id', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.getResourceStore$({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            tick();
            expect(res.resource.attributes.title).toEqual('Article 1');
            expect(res.resource.type).toEqual('Article');
            expect(res.resource.id).toEqual('1');
        }));


        describe('getManyResourceStore$', () => {
            it('should get the a single query given a queryId', fakeAsync(() => {
                let res;
                let sub = obs
                    .select('api')
                    .let(selectors.getManyResourceStore$(
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
        //         .let(selectors.getOneResourceStore$({ type: 'Tag', id: '1' }))
        //         .subscribe(d => res = d);
        //     tick();
        //     expect(res).toBeNull();
        // }));
        //
        // it('should return null if the id is not given', fakeAsync(() => {
        //     let res;
        //     let sub = obs
        //         .select('api')
        //         .let(selectors.getOneResourceStore$({ type: 'Article' }))
        //         .subscribe(d => res = d);
        //     tick();
        //     expect(res).toBeNull();
        // }));
    });

    describe('queryStore$', () => {

        it('should use getResourceStore$ given a query of type getOne', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.queryStore$({
                    type: 'Article',
                    id: '1',
                    queryType: 'getOne'
                }))
                .subscribe(d => res = d);
            obs.select('api').let(selectors.getResourceStore$({ type: 'Article', id: '1' }))
                .subscribe(r => expect(r).toEqual(res));
            tick();
        }));

        it('should use getResourceStoreOfType$ given a query of type getMany', fakeAsync(() => {
            let res;
            let sub = obs
                .select('api')
                .let(selectors.queryStore$({
                    type: 'Article',
                    queryType: 'getMany'
                }))
                .subscribe(d => res = d);
            obs.select('api').let(selectors.getResourceStoreOfType$('Article'))
                .subscribe(r => expect(r).toEqual(res));
            tick();
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
      it('should get the actual resources that are the results of a query', fakeAsync(() => {
        let res;
        let sub = obs
        .select('api')
        .let(selectors.getResults$('1'))
        .subscribe(d => res = d);
        tick();
        expect(res[0].id).toEqual('1');
        expect(res[1].id).toEqual('2');
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
