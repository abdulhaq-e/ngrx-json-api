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
    find,
    findRelated,
    _findAll,
    _findOne,
    _getHasOneRelation,
    _getHasManyRelation,
    _getResourcesDefinitions,
    _getResourceDefinition,
    _getRelationDefinition,
    _getRelatedResources
} from '../lib/selectors';

import { initialiseStore } from '../lib/utils';

import { updateStoreReducer } from '../lib/reducers';

describe('Json Api Selectors', () => {

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
                        { type: 'Comment', id: '1'},
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
                'comments': { 'type': 'Comment', 'relationType': 'hasMany' }
            }
        },
        {
            type: 'Person',
            collectionPath: 'people',
            attributes: ['name'],
            relationships: {}
        },
        {
            path: 'comment',
            type: 'Comment',
            collectionPath: 'comments',
            attributes: ['text'],
            relationships: {}
        },
    ];

    let rawStore = initialiseStore(resourcesDefinitions);
    let store = updateStoreReducer(rawStore, payload);
    let obs = Observable.of(store)

    describe('getResourcesDefinitions', () => {
        it('should get all resources definitons', fakeAsync(() => {
            let sub = obs
                .let(_getResourcesDefinitions())
                .subscribe(d => {
                    expect(d).toEqual(resourcesDefinitions);
                    expect(d.length).toEqual(3);
                });
            tick();
        }));
    });

    describe('getResourceDefinition', () => {
        it('should get a single resource definiton', fakeAsync(() => {
            let sub = obs
                .let(_getResourceDefinition('Person'))
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
                    .let(_getRelationDefinition('Article', 'author'))
                    .subscribe(d => {
                        expect(d).toEqual({
                            type: 'Person',
                            relationType: 'hasOne'
                        });
                    });
                tick();
            }));
    });

    describe('find', () => {

        it('find should get ALL resources given a type only', fakeAsync(() => {
            let res;
            let sub = obs
                .let(find({ type: 'Article' }))
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
            let sub = obs
                .let(find({ type: 'Article', id: '1' }))
                .subscribe(d => res = d);
            tick();
            expect(res).toBeDefined();
            expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
            expect(res.attributes.author).not.toBeDefined();
            expect(res.id).toEqual('1');
        }));
    });

    describe('findAll and findOne', () => {

        it('findAll get ALL resources given a type', fakeAsync(() => {
            let res;
            let sub = obs
                .let(_findAll({ type: 'Article' }))
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

        it('findOne should get a single resource given a type and id', fakeAsync(() => {
            let res;
            let sub = obs
                .let(_findOne({ type: 'Article', id: '1' }))
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
                .let(_getHasOneRelation({ type: 'Article', id: '1' }))
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
                .let(_getHasManyRelation([
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
              .let(_getRelatedResources(
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
              .let(_getRelatedResources(
                { type: 'Article', id: '1' }, 'comments'))
              .subscribe(d => res = d);
          tick();
          expect(res).toBeDefined();
          expect(res.length).toBe(1);
          expect(res[0].id).toEqual('1');
          expect(res[0].attributes.text).toEqual('Uncommented');
        }));

    });

    describe('findRelated', () => {
        it('should handle hasOne relations', fakeAsync(() => {
          let res;
          let sub = obs
              .let(findRelated(
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
              .let(findRelated(
                { type: 'Article', id: '1' }, 'comments'))
              .subscribe(d => res = d);
          tick();
          expect(res).toBeDefined();
          expect(res.length).toBe(1);
          expect(res[0].id).toEqual('1');
          expect(res[0].attributes.text).toEqual('Uncommented');
        }));

    });

});
