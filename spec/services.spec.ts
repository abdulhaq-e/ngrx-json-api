import {
    async,
    inject,
    fakeAsync,
    tick,
    TestBed
} from '@angular/core/testing';

import { Http, HttpModule } from '@angular/http';

import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { NgrxJsonApi } from '../src/api';
import { NgrxJsonApiService } from '../src/services';
import { NgrxJsonApiSelectors } from '../src/selectors';
import { NgrxJsonApiEffects } from '../src/effects';

import {
    initialNgrxJsonApiState,
    NgrxJsonApiStoreReducer,
} from '../src/reducers';

import {
    NGRX_JSON_API_CONFIG,
    apiFactory,
    selectorsFactory,
    serviceFactory,
} from '../src/module';

import { updateStoreResources } from '../src/utils';

import {
    testPayload,
    resourceDefinitions
} from './test_utils';

describe('NgrxJsonApiService', () => {
    let service;

    beforeEach(() => {
        let store = {
            api: Object.assign({}, initialNgrxJsonApiState, {
                data: updateStoreResources({}, testPayload),
            }, )
        };
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                EffectsModule.run(NgrxJsonApiEffects),
                // EffectsModule.run(NgrxJsonApiEffects),
                StoreModule.provideStore({ api: NgrxJsonApiStoreReducer }, store),
            ],
            providers: [
                {
                    provide: NgrxJsonApi,
                    useFactory: apiFactory,
                    deps: [Http, NGRX_JSON_API_CONFIG]
                },
                {
                    provide: NgrxJsonApiService,
                    useFactory: serviceFactory,
                    deps: [Store, NgrxJsonApiSelectors]
                },
                {
                    provide: NgrxJsonApiSelectors,
                    useFactory: selectorsFactory,
                    deps: [NGRX_JSON_API_CONFIG]
                },
                {
                    provide: NGRX_JSON_API_CONFIG,
                    useValue: {
                        storeLocation: 'api',
                        resourceDefinitions: resourceDefinitions
                    }
                },
            ],
        })
    });

    beforeEach(inject([NgrxJsonApiService], (s) => {
        service = s;
    }));

    describe('findOne', () => {

    });

    describe('findMany', () => {

    });

    describe('findInternal', () => {

    });

    describe('removeQuery', () => {

    });

    describe('getResourceSnapshot', () => {

    });

    describe('getPersistedResourceSnapshot', () => {

    });

    describe('selectResults', () => {

    });

    describe('selectResultIdentifiers', () => {

    });

    describe('selectResource', () => {

    });

    describe('selectResourceStore', () => {

    });

    describe('denormalise', () => {
        it('should denormalise a Resource', () => {
            let query = {
                id: '1',
                type: 'Article',
                queryType: 'getOne',
                queryId: '22'
            }
            let resourceStore = service.findOne(query, false)
                .results
                .let(service.denormalise());
            resourceStore.subscribe(it => {
              expect(_.get(it, 'resource.relationships.author.reference.resource')).toBeDefined();
            });
        });
    });
});
