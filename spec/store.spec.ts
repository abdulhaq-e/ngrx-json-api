// import {
//   async,
//   inject,
//   fakeAsync,
//   tick
// } from '@angular/core/testing';
//
// import { JsonApiStore } from '../lib/store';
//
// let resourcesDefinition = [
//   {
//     path: 'article',
//     type: 'Article',
//     collectionPath: 'articles',
//     attributes: ['title', 'subtitle'],
//     relationships: {
//       'author': { 'type': 'People', 'relationType': 'hasOne' },
//       'tags': { 'type': 'Tag', 'relationType': 'hasMany' }
//     }
//   },
//   {
//     path: 'person',
//     type: 'Person',
//     collectionPath: 'people',
//     attributes: ['name'],
//     relationships: {}
//   }
// ];
//
// describe('Json Api Store', () => {
//
//   let store = new JsonApiStore(resourcesDefinition);
//
//   it('should initialise the store based on the store definition', () => {
//
//     // console.log(store);
//     expect(store.data['article']).toBeDefined();
//     expect(store.data['person']).toBeDefined();
//     expect(store.data['article'].data).toEqual([]);
//     expect(store.data['person'].data).toEqual([]);
//     expect(store.resourcesDefinition).toEqual(resourcesDefinition);
//   });
//
//
//   it('should use find to find a single resource', () => {
//
//   });
//
//
// });
