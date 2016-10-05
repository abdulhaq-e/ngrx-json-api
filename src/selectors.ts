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

import '@ngrx/core/add/operator/select';

import { compose } from '@ngrx/core/compose';

import {
    RelationDefinition,
    ResourceDefinition,
    ResourceIdentifier,
    Resource,
    ResourceQuery,
    NgrxJsonApiStore,
    NgrxJsonApiStoreData,
    NgrxJsonApiStoreResources,
} from './interfaces';
import {
    denormaliseResource,
    getSingleResource,
    getMultipleResources,
    getSingleTypeResources,
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
            .map(resources => resources[query.id]);
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




export const get$ = (query: ResourceQuery) => {
    return (state$: Observable<NgrxJsonApiStore>) => {
        if (!_.isUndefined(query.id) && !_.isUndefined(query.type)) {
            // Only get a single resource given 'id' and 'type'
            return state$.let(getOne$(query));
        } else if (!_.isUndefined(query.type)) {
            // Only get resources of a given 'type' then filter
            return state$.let(getSingleTypeResources$(query))
                .map(resources => filterResources(resources, query));
        } else {
            // Neither 'id' nor 'type' are given so get all resources and filter
            return state$.let(getAll$())
                .map(resources => filterResources(resources, query));
        }
    };
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

    public get$(query: ResourceQuery) {
        return (state$: Observable<any>) => {
            return state$.select(s => s[this.storeLocation])
                .let(get$(query)).distinctUntilChanged();
        }
        // return compose(
        //     get$(query),
        //     this.getNgrxJsonApiStore(this.storeLocation)
        // );
    }

}
