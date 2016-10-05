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
    // getRelationsDefinitions,
    // getRelationDefinition,
    get$,
    getOne$,
    getOneRaw$,
    getAllRaw$,
    getSingleTypeResources$,
    getSingleTypeResourcesRaw$,
    // getHasManyRelation,
    // getRelatedResources,
    // getRelated,
    NgrxJsonApiSelectors,
} from '../src/selectors';

import {
    initialNgrxJsonApiState
} from '../src/reducers';

import {
    NGRX_JSON_API_STORE_LOCATION,
    selectorsFactory
} from '../src/module';

import { updateStoreResources } from '../src/utils';

import { testPayload } from './test_utils';

describe('individual selectors', () => {

    let store = Object.assign({}, initialNgrxJsonApiState, {
        data: updateStoreResources({}, testPayload)
    });
    let obs = Observable.of(store);

    describe('getOneRaw$', () => {
        it('should get a single resource given a type and id', fakeAsync(() => {
            let res;
            let sub = obs.
                let(getOneRaw$({type: 'Article', id: '1'}))
                .subscribe(d => res = d);
            tick();
            expect(res.title).not.toBeDefined();
            expect(res.attributes.title).toEqual('Article 1');
            expect(res.type).toEqual('Article');
            expect(res.id).toEqual('1');
        }));
    });

    describe('getOne$', () => {
        it('should get a single resource given a type and id', fakeAsync(() => {
            let res;
            let sub = obs.
                let(getOne$({type: 'Article', id: '1'}))
                .subscribe(d => res = d);
            tick();
            expect(res.title).toEqual('Article 1');
            expect(res.type).toEqual('Article');
            expect(res.id).toEqual('1');
        }));
    });

    describe('getSingleTypeResourcesRaw$', () => {
        it('should get all denormalised resources of a given type', fakeAsync(() => {
            let res;
            let sub = obs.
                let(getSingleTypeResourcesRaw$({type: 'Article'}))
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
    });

    describe('getSingleTypeResources$', () => {
        it('should get all denormalised resources of a given type', fakeAsync(() => {
            let res;
            let sub = obs.
                let(getSingleTypeResources$({type: 'Article'}))
                .subscribe(d => res = d);
            tick();
            expect(res[0]).toBeDefined();
            expect(res[1]).toBeDefined();
            expect(res[0].title).toEqual('Article 1');
            expect(res[0].author).toBeDefined();
            expect(res[0].comments).toBeDefined();
            expect(res[0].id).toEqual('1');
            expect(res[1].title).toEqual('Article 2');
            expect(res[1].author).toEqual(null);
            expect(res[1].id).toEqual('2');
            expect(res[2]).not.toBeDefined();
        }));
    });

    describe('get$', () => {

        it('should use getOne$ given a type and id', fakeAsync(() => {
            let res;
            let sub = obs
                .let(get$({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            obs.let(getOne$({type: 'Article', id: '1'}))
            .subscribe(r => expect(r).toEqual(res));
            tick();
        }));

        it('should use getSingleTypeResources$ given a type only', fakeAsync(() => {
            let res;
            let sub = obs
                .let(get$({ type: 'Article'}))
                .subscribe(d => res = d);
            obs.let(getSingleTypeResources$({type: 'Article'}))
            .subscribe(r => expect(r).toEqual(res));
            tick();
        }));

        it('should filter resources (TODO)', () => {

        });
    });

});


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
    let store = Object.assign({}, initialNgrxJsonApiState, {
        data: updateStoreResources({}, testPayload)
    });
    let obs = Observable.of(store)

    describe('get public', () => {

        it('get should get ALL resources given a type only', fakeAsync(() => {
            let res;
            let store2 = { api: store }
            let sub = Observable.of(store2)
                .let(selectors.get$({ type: 'Article' }))
                .subscribe(d => res = d);
            tick();
            expect(res[0]).toBeDefined();
            expect(res[1]).toBeDefined();
            expect(res[0].title).toEqual('Article 1');
            expect(res[0].author).toBeDefined();
            expect(res[0].id).toEqual('1');
            expect(res[1].title).toEqual('Article 2');
            expect(res[1].author).toBeDefined();
            expect(res[1].id).toEqual('2');
            expect(res[2]).not.toBeDefined();
        }));

        it('get should get a single resource given a type and id', fakeAsync(() => {
            let res;
            let store2 = { api: store }
            let sub = Observable.of(store2)
                .let(selectors.get$({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.title).toEqual('Article 1');
            expect(res.author).toBeDefined();
            expect(res.id).toEqual('1');
        }));
    });


});
