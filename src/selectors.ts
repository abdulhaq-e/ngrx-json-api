// import * as _.find from 'lodash/map';
// import * as _.includes from 'lodash/includes';
// import * as _.reduce from 'lodash/reduce';
import * as _ from 'lodash';


import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';

import '@ngrx/core/add/operator/select';

import { compose } from '@ngrx/core/compose';
import { Store } from '@ngrx/store';

import {
    NgrxJsonApiStore,
    NgrxJsonApiStoreData,
    NgrxJsonApiStoreResources,
    QueryType,
    ResourceIdentifier,
    Resource,
    ResourceQuery,
    ResourceStore,
} from './interfaces';
import {
    denormaliseResource,
    transformStoreData,
    transformStoreResources,
    filterResources
} from './utils';


export class NgrxJsonApiSelectors<T> {

    constructor(public storeLocation: string) {
        this.storeLocation = storeLocation;
    }

    private getStoreData$() {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$.select('data');
        }
    }

    private getResourceStoreOfType$(type: string) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$.let(this.getStoreData$())
                .map(resources => resources[type]);
        }
    }

    private queryStore$(query: ResourceQuery) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            let selected$;
            switch (query.queryType) {
                case 'getOne':
                    selected$ = state$.let(this.getResourceStore$(
                        { id: query.id, type: query.type }));
                    return selected$.distinctUntilChanged();
                case 'getMany':
                    selected$ = state$.let(this.getResourceStoreOfType$(query.type));
                    // .map(resources => filterResources(resources, query));
                    return selected$.distinctUntilChanged();
                default:
                    return state$;
            }
        }
    }

    private getStoreQueries$() {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$.select('queries');
        }
    }

    private getResourceQuery$(queryId: string) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$
                .let(this.getStoreQueries$())
                .map(it => it[queryId]);
        }
    }

    public getResultIdentifiers$(queryId: string) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$
                .let(this.getResourceQuery$(queryId))
                .map(it => it.resultIds);
        }
    }

    public getResults$(queryId: string) {

        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$
                .let(this.getResultIdentifiers$(queryId))
                .mergeMap(ids => state$.let(this.getManyResource$(ids)))
        }
    }

    public getResourceStore$(identifier: ResourceIdentifier) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$
                .let(this.getResourceStoreOfType$(identifier.type))
                .map(resources => resources[identifier.id]);
        }
    }

    public getManyResourceStore$(identifiers: Array<ResourceIdentifier>) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            let obs = identifiers.map(id => state$.let(this.getResourceStore$(id)));
            return <Array<ResourceStore>>Observable.zip(...obs);
        }
    }

    public getResource$(identifier: ResourceIdentifier) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$
                .let(this.getResourceStore$(identifier))
                .map(it => it ? it.resource : null);
        }
    }

    public getManyResource$(identifiers: Array<ResourceIdentifier>) {
      return (state$: Observable<NgrxJsonApiStore>) => {
        let obs = identifiers.map(id => state$.let(this.getResource$(id)));
        return <Array<Resource>>Observable.zip(...obs)
      }
    }

    public getPersistedResource$(store: Store<T>, identifier: ResourceIdentifier) {
        return (state$: Observable<NgrxJsonApiStore>) => {
            return state$
                .let(this.getResourceStore$(identifier))
                .map(it => it ? it.persistedResource : null);
        }
    }
}
