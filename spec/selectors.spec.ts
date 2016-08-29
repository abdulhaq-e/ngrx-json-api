import { Observable } from 'rxjs/Rx';
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
    NgrxJsonApiSelectors,
} from '../src/selectors';
import { NGRX_JSON_API_STORE_LOCATION, _selectorsFactory } from '../src/module';

import { initialiseStore } from '../src/utils';

import { updateStoreReducer } from '../src/reducers';

describe('Json Api Selectors', () => {
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

    let payload = {
        data: [
            {
                type: "Article",
                id: "1",
                attributes: {
                    "title": "JSON API paints my bikeshed!"
                },
                relationships: {
                    'author': {
                        data: { type: 'Person', id: "1" }
                    },
                    'comments': {
                        data: [
                            { type: 'Comment', id: '1' },
                        ]
                    }
                }
            },
            {
                type: "Article",
                id: "2",
                attributes: {
                    "title": "Untitled"
                },
            },
            {
                type: "Person",
                id: "1",
                attributes: {
                    "name": "Usain Bolt"
                },
                relationships: {
                    'blog': {
                        data: { type: 'Blog', id: '1' }
                    }
                }
            },
            {
                type: "Person",
                id: "2",
                attributes: {
                    "name": "Michael Phelps"
                },
            },
            {
                type: "Comment",
                id: "1",
                attributes: {
                    "text": "Uncommented"
                }
            },
            {
                type: "Comment",
                id: "2",
                attributes: {
                    "text": "No comment"
                }
            },
            {
                type: "Blog",
                id: "1",
                attributes: {
                    name: "Random Blog!"
                }
            }
        ]
    };

    let resourcesDefinitions = [
        {
            type: 'Article',
            collectionPath: 'articles',
            attributes: ['title', 'subtitle'],
            relationships: {
                'author': { 'type': 'Person', 'relationType': 'hasOne' },
                'comments': { 'type': 'Comment', 'relationType': 'hasMany' },
            }
        },
        {
          type: 'Person',
          collectionPath: 'people',
          attributes: ['name'],
          relationships: {
            'blog': { 'type': 'Blog', 'relationType': 'hasOne' }
          }
        },
        {
            type: 'Comment',
            collectionPath: 'comments',
            attributes: ['text'],
            relationships: {}
        },
        {
            type: 'Blog',
            collectionPath: 'blogs',
            attributes: ['name'],
            relationships: {}
        }
    ];

    let rawStore = initialiseStore(resourcesDefinitions);
    let store = updateStoreReducer(rawStore, payload);
    let obs = Observable.of(store)

    describe('_getResourcesDefinitions', () => {
        it('should get all resources definitons', fakeAsync(() => {
            let sub = obs
                .let(selectors._getResourcesDefinitions())
                .subscribe(d => {
                    expect(d).toEqual(resourcesDefinitions);
                    expect(d.length).toEqual(4);
                });
            tick();
        }));
    });

    describe('_getResourceDefinition', () => {
        it('should get a single resource definiton', fakeAsync(() => {
            let sub = obs
                .let(selectors._getResourceDefinition('Person'))
                .subscribe(d => {
                    expect(d).toEqual(resourcesDefinitions[1]);
                    expect(d.collectionPath).toEqual('people');
                    expect(d.type).toEqual('Person');
                });
            tick();
        }));
    });

    describe('_getRelationDefinition', () => {
        it('should get a relation definition given a resource type and relation',
            fakeAsync(() => {
                let sub = obs
                    .let(selectors._getRelationDefinition('Article', 'author'))
                    .subscribe(d => {
                        expect(d).toEqual({
                            type: 'Person',
                            relationType: 'hasOne'
                        });
                    });
                tick();
            }));
    });

    describe('_find', () => {

        it('should get ALL resources given a type only', fakeAsync(() => {
            let res;
            let sub = obs
                .let(selectors._find({ type: 'Article' }))
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
                .let(selectors._find({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
            expect(res.attributes.author).not.toBeDefined();
            expect(res.id).toEqual('1');
        }));
    });

    describe('_findAll and _findOne', () => {

        it('_findAll should get ALL resources given a type', fakeAsync(() => {
            let res;
            let sub = obs
                .let(selectors._findAll({ type: 'Article' }))
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

        it('_findOne should get a single resource given a type and id', fakeAsync(() => {
            let res;
            let sub = obs
                .let(selectors._findOne({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
            expect(res.attributes.author).not.toBeDefined();
            expect(res.id).toEqual('1');
        }));
    });

    describe('_getHasOneRelation', () => {
        it('should find a single resource given its identifier', fakeAsync(() => {
            let res;
            let sub = obs
                .let(selectors._getHasOneRelation({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
            expect(res.attributes.author).not.toBeDefined();
            expect(res.id).toEqual('1');
        }));
    });

    describe('_getHasManyRelation', () => {
        it('should find multiple resources given their identifiers',
            fakeAsync(() => {
                let res;
                let sub = obs
                    .let(selectors._getHasManyRelation([
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

    describe('_getRelatedResources', () => {
        it('should handle hasOne relations', fakeAsync(() => {
            let res;
            let sub = obs
                .let(selectors._getRelatedResources(
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
                .let(selectors._getRelatedResources(
                    { type: 'Article', id: '1' }, 'comments'))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.length).toBe(1);
            expect(res[0].id).toEqual('1');
            expect(res[0].attributes.text).toEqual('Uncommented');
        }));

    });

    describe('_findRelated', () => {
        it('should handle hasOne relations', fakeAsync(() => {
            let res;
            let sub = obs
                .let(selectors._findRelated(
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
                .let(selectors._findRelated(
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
                .let(selectors._findRelated(
                    { type: 'Article', id: '1' }, 'author.blog'))
                .subscribe(d => res = d);
            tick();
            expect(res.type).toEqual('Blog');
            expect(res.id).toEqual('1');
            expect(res.attributes.name).toEqual('Random Blog!');
        }));
    });

    describe('findRelated public', () => {
        it('should handle hasOne relations', fakeAsync(() => {
            let res;
            let store2 = { api: store }
            let sub = Observable.of(store2)
                .let(selectors.findRelated(
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
                .let(selectors.findRelated(
                    { type: 'Article', id: '1' }, 'comments'))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.length).toBe(1);
            expect(res[0].id).toEqual('1');
            expect(res[0].attributes.text).toEqual('Uncommented');
        }));
    });

    describe('find public', () => {

        it('find should get ALL resources given a type only', fakeAsync(() => {
            let res;
            let store2 = { api: store }
            let sub = Observable.of(store2)
                .let(selectors.find({ type: 'Article' }))
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

        it('find should get a single resource given a type and id', fakeAsync(() => {
            let res;
            let store2 = { api: store }
            let sub = Observable.of(store2)
                .let(selectors.find({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
            expect(res.attributes.author).not.toBeDefined();
            expect(res.id).toEqual('1');
        }));
    });


});
