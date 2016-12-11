// import * as _.find from 'lodash/map';
// import * as _.includes from 'lodash/includes';
// import * as _.reduce from 'lodash/reduce';
import * as _ from 'lodash';


import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';

import '@ngrx/core/add/operator/select';

import { compose } from '@ngrx/core/compose';
import { Store } from '@ngrx/store';

import {
    ResourceIdentifier,
    Resource,
    ResourceQuery,
    NgrxJsonApiStore,
    NgrxJsonApiStoreResources,
    QueryType,
} from './interfaces';
import {
    denormaliseResource,
    transformStoreData,
    transformStoreResources,
    filterResources
} from './utils';

export const getAllRaw$ = () => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$
            .select(s => s.data);
    }
}

export const getAll$ = () => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getAllRaw$())
            .map(resources => transformStoreData(resources))
    }
}

export const getSingleTypeResourcesRaw$ = (query: ResourceQuery) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getAllRaw$())
            .map(resources => resources[query.type]);
    }
}

export const getSingleTypeResources$ = (query: ResourceQuery) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getSingleTypeResourcesRaw$(query))
            .map(resources => transformStoreResources(resources))
            .combineLatest(state$.let(getAllRaw$()),
            (singleTypeResources, resources) => {
                return singleTypeResources.map(resource => denormaliseResource(resource, resources));
            });
    }
}

export const getOneRaw$ = (query: ResourceQuery) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getSingleTypeResourcesRaw$(query))
            .map(resources => {
                if (typeof resources === 'undefined' || !query.hasOwnProperty('id')) {
                    return undefined;
                }
                return resources[query.id].resource;
            });
        // .mergeMap(resource => state$.let(getAllRaw$())
        //     .map(resources => denormaliseResource(resource, resources))
        // );

    }
}

export const getOne$ = (query: ResourceQuery) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getOneRaw$(query))
            .combineLatest(state$.let(getAllRaw$()),
            (resource, resources) => {
                return denormaliseResource(resource, resources);
            });
    }
}

export const get$ = (queryType: QueryType, query: ResourceQuery) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        let selected$;
        switch (queryType) {
            case 'getOne':
                selected$ = state$.let(getOne$(query));
                return selected$.distinctUntilChanged();
            case 'getMany':
                selected$ = state$.let(getSingleTypeResources$(query))
                    .map(resources => filterResources(resources, query));
                return selected$.distinctUntilChanged();
            case 'getAll':
                selected$ = state$.let(getAll$())
                    .map(resources => filterResources(resources, query));
                return selected$.distinctUntilChanged();
            default:
                return state$
        }
    }
};

export class NgrxJsonApiSelectors<T> {

    constructor(public storeLocation: string) {
        this.storeLocation = storeLocation;
    }

    private getNgrxJsonApiStore(storeLocation: string) {
        return (state$: Observable<T>) => {
            return state$.select(s => s[storeLocation]);
        }
    }

    public get$(queryType: QueryType, query: ResourceQuery) {
        return compose(
            get$(queryType, query),
            this.getNgrxJsonApiStore(this.storeLocation)
        );
    }

    public getQuery$(store : Store<T>, queryId: string) {
        let selection : Observable<NgrxJsonApiStore> = store.select(this.storeLocation);

        return selection.filter(it => it.queries[queryId] != null && it.queries[queryId].resultIds != null)
        .map(it => {
            let resources : Array<Resource> = [];
            let resourceIds : Array<ResourceIdentifier> = it.queries[queryId].resultIds;
            for(let resourceId of resourceIds){
                let storeResources : NgrxJsonApiStoreResources = it.data[resourceId.type];
                let storeResource = storeResources ? storeResources[resourceId.id] : null;
                if(storeResource){
                    resources.push(storeResource.resource);
                }else{
                    throw new Error("unable to resolve resource: " + resourceId);
                }
            }
            return resources;
        });

    }

}
