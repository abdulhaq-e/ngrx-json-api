// import * as _.find from 'lodash/map';
// import * as _.includes from 'lodash/includes';
// import * as _.reduce from 'lodash/reduce';
import * as _ from 'lodash';


import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';
import '@ngrx/core/add/operator/select';


import { compose } from '@ngrx/core/compose';

import {
    RelationDefinition,
    ResourceDefinition,
    ResourceIdentifier,
    Resource,
    Query,
    NgrxJsonApiStore,
} from './interfaces';

export const getResourcesDefinitions = () => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.select(s => s.resourcesDefinitions);
    };
};

export const getResourceDefinition = (type: string) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getResourcesDefinitions())
            .map(definitions => {
              return <ResourceDefinition>definitions.find(d => d.type === type);
            });
    };
};

export const getRelationDefinition = (type: string, relation: string) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getResourceDefinition(type))
            .map(definition => {
                let relationship = definition.relationships[relation];
                return ({
                    type: relationship.type,
                    relationType: relationship.relationType
                });
            });
    };
};

export const getAll = (query: Query) => {
    return (state$: Observable<any>) => {
        return state$.select(s => s.data)
            .map(data => data.filter(
                d => d.type === query.type));
    };
};

export const getOne = (query: Query) => {
    return (state$: Observable<any>) => {
        return state$.let(getAll({ type: query.type }))
            .map((data: Array<any>) => _.find(data, { id: query.id }));
        // data.filter(d => d.id === query.id)).map(a => a[0]);
    };
};

export const get = (query: Query) => {
    if (typeof query.id === 'undefined') {
        return getAll({ type: query.type });
    }
    return getOne({ type: query.type, id: query.id });
};


export const getHasOneRelation = (resourceIdentifier: ResourceIdentifier) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getOne(resourceIdentifier));
    };
};

export const getHasManyRelation = (
    resourceIdentifiers: Array<ResourceIdentifier>) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getAll({ type: resourceIdentifiers[0].type }))
            .map(resources => resources.filter(
                resource => _.includes(resourceIdentifiers
                    .map(r => r.id), resource.id)))
    };
};

export const getRelatedResources = (resourceIdentifier: ResourceIdentifier,
    relation: string) => {
    return (state$: Observable<NgrxJsonApiStore>) => {

        return state$.let(getRelationDefinition(resourceIdentifier.type, relation))
            .mergeMap(relationDefinition => state$
                .let(getOne({
                    type: resourceIdentifier.type,
                    id: resourceIdentifier.id
                }))
                .mergeMap((foundResource: Resource) => {
                    if (relationDefinition.relationType === 'hasOne') {
                        return state$.let(getHasOneRelation(
                            foundResource.relationships[relation].data
                        ));
                    } else if (relationDefinition.relationType === 'hasMany') {
                        return state$.let(getHasManyRelation(
                            foundResource.relationships[relation].data
                        ));
                    }
                }));
    };
};

export const getRelated = (resourceIdentifier: ResourceIdentifier,
    relation: string) => {
    let relations: Array<string> = relation.split('.');
    return (state$: Observable<NgrxJsonApiStore>) => {
        let obs = state$.let(
            getRelatedResources(resourceIdentifier, relations[0])
        );
        if (relations.length === 1) {
            return obs
        } else {
            let slicedRelations: Array<string> = relations.slice(1);
            return _.reduce(slicedRelations, (acc, value) => {
                return acc.mergeMap((resource: Resource) => {
                    return state$.let(
                        getRelatedResources(
                            { type: resource.type, id: resource.id }, value)
                    );
                })
            }, obs)
        }
    }
};


export class NgrxJsonApiSelectors {

    constructor(private storeLocation: string) {
        this.storeLocation = storeLocation;
    }

    private getNgrxJsonApiStore(storeLocation: string) {
        return (state$: Observable<any>) => {
            return state$.select(s => s[storeLocation]);
        }
    }


    public get(query: Query) {
        return compose(
            get(query),
            this.getNgrxJsonApiStore(this.storeLocation)
        );
    }

    public getRelated(resourceIdentifier: ResourceIdentifier,
        relation: string) {
        return compose(
            getRelated(resourceIdentifier, relation),
            this.getNgrxJsonApiStore(this.storeLocation)
        );
    }

}
