// import _ = require('lodash');
//
// import { JsonApiStore,
//   JsonApiResourceDefinition,
//   JsonApiQuery
// } from './interfaces';
//
// export const JsonApiStore: JsonApiStore = {
//   isCreating: false,
//   isReading: false,
//   isUpdating: false,
//   isDeleting: false,
//   resourcesDefinition: [],
//   data: {}
// };

//   constructor (public resourcesDefinition: JsonApiResourcesDefinition) {
//     this.resourcesDefinition = resourcesDefinition;
//
//   }
//
//
//   find(query: JsonApiQuery) {
//     if (typeof query.id === 'undefined') {
//       return this.findAll(query);
//     }
//     return this.findOne(query);
//   }
//
//   findOne(query) {
//     let resourcePath: string = this.getResourcePath(query.resourceType);
//
//   }
//
//   findAll(query) {
//
//   }
// }
