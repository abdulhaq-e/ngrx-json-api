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

export class NgrxJsonApiSelectors {

    constructor(private _storeLocation: string) {
        this._storeLocation = _storeLocation;
    }

    private _getNgrxJsonApiStore(storeLocation: string) {
        return (state$: Observable<any>) => {
            return state$.select(s => s[storeLocation]);
        }
    }

    private _getResourcesDefinitions() {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$.select(s => s.resourcesDefinitions);
        };
    };

    private _getResourceDefinition(type: string) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$.let(this._getResourcesDefinitions())
                .map(definitions => {
                  return <ResourceDefinition>definitions.find(d => d.type === type);
                });
        };
    };

    private _getRelationDefinition(type: string, relation: string) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$.let(this._getResourceDefinition(type))
                .map(definition => {
                    let relationship = definition.relationships[relation];
                    return ({
                        type: relationship.type,
                        relationType: relationship.relationType
                    });
                });
        };
    };

    private _find(query: Query) {
        if (typeof query.id === 'undefined') {
            return this._findAll({ type: query.type });
        }
        return this._findOne({ type: query.type, id: query.id });
    };

    private _findAll(query: Query) {
        return (state$: Observable<any>) => {
            return state$.select(s => s.data)
                .map(data => data.filter(
                    d => d.type === query.type));
        };
    };

    private _findOne(query: Query) {
        return (state$: Observable<any>) => {
            return state$.let(this._find({ type: query.type }))
                .map((data: Array<any>) => _.find(data, { id: query.id }));
            // data.filter(d => d.id === query.id)).map(a => a[0]);
        };
    };

    private _getHasOneRelation(resourceIdentifier: ResourceIdentifier) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$.let(this._findOne(resourceIdentifier));
        };
    };

    private _getHasManyRelation(
        resourceIdentifiers: Array<ResourceIdentifier>) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$.let(this._findAll({ type: resourceIdentifiers[0].type }))
                .map(resources => resources.filter(
                    resource => _.includes(resourceIdentifiers
                        .map(r => r.id), resource.id)))
        };
    };

    private _getRelatedResources(resourceIdentifier: ResourceIdentifier,
        relation: string) {
        return (state$: Observable<NgrxJsonApiStore>) => {

            return state$.let(this._getRelationDefinition(resourceIdentifier.type, relation))
                .mergeMap(relationDefinition => state$
                    .let(this._findOne({
                        type: resourceIdentifier.type,
                        id: resourceIdentifier.id
                    }))
                    .mergeMap((foundResource: Resource) => {
                        if (relationDefinition.relationType === 'hasOne') {
                            return state$.let(this._getHasOneRelation(
                                foundResource.relationships[relation].data
                            ));
                        } else if (relationDefinition.relationType === 'hasMany') {
                            return state$.let(this._getHasManyRelation(
                                foundResource.relationships[relation].data
                            ));
                        }
                    }));
        };
    };

    private _findRelated(resourceIdentifier: ResourceIdentifier,
        relation: string) {
        let relations: Array<string> = relation.split('.');
        return (state$: Observable<NgrxJsonApiStore>) => {
            let obs = state$.let(
                this._getRelatedResources(resourceIdentifier, relations[0])
            );
            if (relations.length === 1) {
                return obs
            } else {
                let slicedRelations: Array<string> = relations.slice(1);
                return _.reduce(slicedRelations, (acc, value) => {
                    return acc.mergeMap((resource: Resource) => {
                        return state$.let(
                            this._getRelatedResources(
                                { type: resource.type, id: resource.id }, value)
                        );
                    })
                }, obs)
            }
        }
    };

    public find(query: Query) {
        return compose(
            this._find(query),
            this._getNgrxJsonApiStore(this._storeLocation)
        );
    }

    public findRelated(resourceIdentifier: ResourceIdentifier,
        relation: string) {
        return compose(
            this._findRelated(resourceIdentifier, relation),
            this._getNgrxJsonApiStore(this._storeLocation)
        );
    }

}
