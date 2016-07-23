import _ = require('lodash');

import { Observable } from 'rxjs/Observable';

import { getEntityPath } from './store';


export const getEntities = (entityType: string) => {
  return (state$: Observable<any>) => {
    let entityPath = getEntityPath(state$.select('entitiesDefinition'), entityType);
    return state$.select(s => s.data[entityPath].data);
  };
}


export const getEntity = (entityType: string, id: string) => {
  return (state$: Observable<any>) => {
    console.log(state$.entitiesDefinition);
    let entityPath = getEntityPath(state$.select('entitiesDefinition'), entityType);
    return state$.select(s => s.data[entityPath].data)
    .map(d => _.find(d, {'id': id}));
  };
}
