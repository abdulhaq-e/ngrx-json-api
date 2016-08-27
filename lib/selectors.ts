import _ = require('lodash');

import { Observable } from 'rxjs/Observable';

import {
    RelationDefinition,
    ResourceDefinition,
    ResourceIdentifier,
    Resource,
    Query,
    Store,
} from './interfaces';

export const _getResourcesDefinitions = () => {
    return (state$: Observable<Store>) => {
        return state$.select(s => s.resourcesDefinitions);
    };
};

export const _getResourceDefinition = (type: string) => {

    return (state$: Observable<Store>) => {
        return state$.let(_getResourcesDefinitions())
            .map(definitions => <ResourceDefinition>_.find(
                definitions, { type: type }));
    };
};

export const _getRelationDefinition = (type: string, relation: string) => {

    return (state$: Observable<Store>) => {
        return state$.let(_getResourceDefinition(type))
            .map(definition => {
                let relationship = definition.relationships[relation];
                return {
                    type: relationship.type,
                    relationType: relationship.relationType
                };
            });
    };
};

export const find = (query: Query) => {
    if (typeof query.id === 'undefined') {
        return this._findAll({ type: query.type });
    }
    return this._findOne({ type: query.type, id: query.id });
};

export const _findAll = (query: Query) => {
    return (state$: Observable<any>) => {
        return state$.select(s => s.data)
            .map(data => data.filter(
              d => d.type === query.type));
    };
};

export const _findOne = (query: Query) => {
    return (state$: Observable<any>) => {
        return state$.let(find({ type: query.type }))
            .map((data: Array<any>) => _.find(data, { id: query.id }));
        // data.filter(d => d.id === query.id)).map(a => a[0]);
    };
};

export const _getHasOneRelation = (resourceIdentifier: ResourceIdentifier) => {
    return (state$: Observable<Store>) => {
        return state$.let(_findOne(resourceIdentifier));
    };
};

export const _getHasManyRelation = (
    resourceIdentifiers: Array<ResourceIdentifier>) => {
    return (state$: Observable<Store>) => {
        return state$.let(_findAll({ type: resourceIdentifiers[0].type }))
            .map(resources => resources.filter(
                resource => _.includes(resourceIdentifiers
                    .map(r => r.id), resource.id)))
    };
};

export const _getRelatedResources = (resourceIdentifier: ResourceIdentifier,
    relation: string) => {
    return (state$: Observable<Store>) => {
        return state$.let(_getRelationDefinition(resourceIdentifier.type, relation))
            .mergeMap(relationDefinition => state$
                .let(_findOne({
                    type: resourceIdentifier.type,
                    id: resourceIdentifier.id
                }))
                .mergeMap(foundResource => {
                    if (relationDefinition.relationType === 'hasOne') {
                        return state$.let(_getHasOneRelation(
                            foundResource.relationships[relation].data
                        ));
                    } else if (relationDefinition.relationType === 'hasMany') {
                        return state$.let(_getHasManyRelation(
                            foundResource.relationships[relation].data
                        ));
                    }
                }));
    };
};

export const findRelated = (resourceIdentifier: ResourceIdentifier,
    relation: string) => {
    return (state$: Observable<Store>) => {
        return state$.let(_getRelatedResources(resourceIdentifier, relation))
    };
};
