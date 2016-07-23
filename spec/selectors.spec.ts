// import {
//   addProviders,
//   async,
//   inject,
//   fakeAsync,
//   tick
// } from '@angular/core/testing';
//
// import _ = require('lodash');
//
// import { Observable } from 'rxjs/Observable';
//
// import { getEntities, getEntity } from '../lib/selectors';
//
// import { updateOrCreateReducer } from '../lib/utils';
//
// import { initialiseJsonApiStore, getEntityPath } from '../lib/store';
//
// describe('Json Api Selectors', () => {
//   let entities = {
//     "data": [
//       {
//         "type": "Article",
//         "id": "1",
//         "attributes": {
//           "title": "JSON API paints my bikeshed!"
//         }
//       },
//       {
//         "type": "Article",
//         "id": "2",
//         "attributes": {
//           "title": "Untitled"
//         },
//       },
//       {
//         "type": "Comment",
//         "id": "1",
//         "attributes": {
//           "text": "Uncommented"
//         }
//       },
//       {
//         "type": "Comment",
//         "id": "2",
//         "attributes": {
//           "text": "No comment"
//         }
//       }
//     ]
//   };
//
//   let entitiesDefinition = [
//     {
//       entityPath: 'article',
//       entityType: 'Article',
//       collectionPath: 'articles',
//       attributes: ['title', 'subtitle'],
//       relationships: {
//         'author': { 'type': 'People', 'relationType': 'hasOne' },
//         'tags': { 'type': 'Tag', 'relationType': 'hasMany' }
//       }
//     },
//     {
//       entityPath: 'person',
//       entityType: 'Person',
//       collectionPath: 'people',
//       attributes: ['name'],
//       relationships: {}
//     },
//     {
//       entityPath: 'comment',
//       entityType: 'Comment',
//       collectionPath: 'comments',
//       attributes: ['text'],
//       relationships: {}
//     },
//   ];
//
//   let store = initialiseJsonApiStore(entitiesDefinition);
//   store = updateOrCreateReducer(store, entities);
//
//   it('getEntities should get ALL entities given a type', fakeAsync(() => {
//     let res;
//     let obs = Observable.of(store)
//       .let(getEntities('Article'))
//       .subscribe(d => res = d);
//     // // console.log(getEntity('article', '1'));
//
//     tick();
//     expect(res[0]).toBeDefined();
//     expect(res[1]).toBeDefined();
//     expect(res[0].attributes.title).toEqual('JSON API paints my bikeshed!');
//     expect(res[0].attributes.author).not.toBeDefined();
//     expect(res[0].id).toEqual('1');
//     expect(res[1].attributes.title).toEqual('Untitled');
//     expect(res[1].attributes.author).not.toBeDefined();
//     expect(res[1].id).toEqual('2');
//   }));
//
//   it('getEntity should get a single entity given its type and id', fakeAsync(() => {
//     let res;
//     let obs = Observable.of(store)
//       .let(getEntity('Article', '1'))
//       .subscribe(d => res = d);
//     // // console.log(getEntity('article', '1'));
//
//     tick();
//     expect(res.attributes.title).toBeDefined();
//     expect(res.attributes.title).toEqual('JSON API paints my bikeshed!');
//     expect(res.attributes.author).not.toBeDefined();
//     expect(res.id).toEqual('1');
//
//   }));
//
//
// });
