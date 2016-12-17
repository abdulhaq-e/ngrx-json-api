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

export const getAll$ = () => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$
            .select(s => s.data);
    }
}

// export const getAll$ = () => {
//     return (state$: Observable<NgrxJsonApiStore>) => {
//         return state$.let(getAllRaw$())
//             .map(resources => transformStoreData(resources))
//     }
// }

export const getSingleTypeResources$ = (query: ResourceQuery) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getAll$())
            .map(resources => resources[query.type]);
    }
}

// export const getSingleTypeResources$ = (query: ResourceQuery) => {
//     return (state$: Observable<NgrxJsonApiStore>) => {
//         return state$.let(getSingleTypeResourcesRaw$(query))
//             .map(resources => transformStoreResources(resources))
//             .combineLatest(state$.let(getAllRaw$()),
//             (singleTypeResources, resources) => {
//                 return singleTypeResources.map(resource => denormaliseResource(resource, resources));
//             });
//     }
// }

export const getOne$ = (query: ResourceQuery) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        return state$.let(getSingleTypeResources$(query))
            .map(resources => {
                if (typeof resources === 'undefined' || !query.hasOwnProperty('id')) {
                    return undefined;
                }
                if (resources[query.id]) {
                  return resources[query.id].resource;
                } else {
                  return null;
                }
            });
        // .mergeMap(resource => state$.let(getAllRaw$())
        //     .map(resources => denormaliseResource(resource, resources))
        // );

    }
}

// export const getOne$ = (query: ResourceQuery) => {
//     return (state$: Observable<NgrxJsonApiStore>) => {
//         return state$.let(getOneRaw$(query))
//             .combineLatest(state$.let(getAllRaw$()),
//             (resource, resources) => {
//                 return denormaliseResource(resource, resources);
//             });
//     }
// }

export const get$ = (query: ResourceQuery) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        let selected$;
        switch (query.queryType) {
            case 'getOne':
                selected$ = state$.let(getOne$(query));
                return selected$.distinctUntilChanged();
            case 'getMany':
                selected$ = state$.let(getSingleTypeResources$(query));
                    // .map(resources => filterResources(resources, query));
                return selected$.distinctUntilChanged();
            // case 'getAll':
            //     selected$ = state$.let(getAll$())
            //         .map(resources => filterResources(resources, query));
            //     return selected$.distinctUntilChanged();
            default:
                return state$;
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

    public get$(query: ResourceQuery) {
        return compose(
            get$(query),
            this.getNgrxJsonApiStore(this.storeLocation)
        );
    }

    public getResults$(store : Store<T>, queryId: string) {
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

    public getResultIdentifiers$(store : Store<T>, queryId: string) : Observable<Array<ResourceIdentifier>> {
        let selection : Observable<NgrxJsonApiStore> = store.select(this.storeLocation);

        return selection.filter(it => it.queries[queryId] != null && it.queries[queryId].resultIds != null)
			.map(it => it.queries[queryId].resultIds);
    }

    public getResourceStore$(store : Store<T>, identifier: ResourceIdentifier) : Observable<ResourceStore> {
        let selection : Observable<NgrxJsonApiStore> = store.select(this.storeLocation);
        return selection.map(it => it.data[identifier.type] != null && it.data[identifier.type][identifier.id] != null ? it.data[identifier.type][identifier.id] : null);
    }

    public getResource$(store : Store<T>, identifier: ResourceIdentifier) : Observable<Resource> {
        return  this.getResourceStore$(store, identifier).map(it => it ? it.resource : null);
    }

    public getPersistedResource$(store : Store<T>, identifier: ResourceIdentifier) : Observable<Resource> {
        return  this.getResourceStore$(store, identifier).map(it => it ? it.persistedResource : null);
    }

}
