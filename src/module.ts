import { ModuleWithProviders, NgModule, OpaqueToken } from '@angular/core';

import {
    Http, HttpModule
} from '@angular/http';

import { Store } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { NgrxJsonApi } from './api';
import { NgrxJsonApiEffects } from './effects';
import { NgrxJsonApiActions } from './actions';
import { NgrxJsonApiSelectors } from './selectors';
import { NgrxJsonApiService, NgrxJsonApiServiceV2 } from './services';

import { ResourceDefinition, NgrxJsonApiModuleConfig } from './interfaces';

export const API_URL = new OpaqueToken('API_URL');

export const RESOURCE_DEFINITIONS = new OpaqueToken('RESOURCE_DEFINTIONS');

export const NGRX_JSON_API_STORE_LOCATION = new OpaqueToken(
    'NGRX_JSON_API_STORE_LOCATION')

export const apiFactory = (
    http: Http,
    apiUrl: string,
    resourceDefinitions: Array<ResourceDefinition>) => {
    return new NgrxJsonApi(http, apiUrl, resourceDefinitions);
};

export const selectorsFactory = (storeLocation: string) => {
    return new NgrxJsonApiSelectors<any>(storeLocation);
}

export const serviceFactory = (
    store: Store<any>,
    selectors: NgrxJsonApiSelectors<any>) => {
    return new NgrxJsonApiService<any>(store, selectors);
}

export const serviceFactoryV2 = (
    store: Store<any>,
    selectors: NgrxJsonApiSelectors<any>) => {
    return new NgrxJsonApiServiceV2<any>(store, selectors);
}

export const configure = (config: NgrxJsonApiModuleConfig): Array<any> => {

    return [
        {
            provide: NgrxJsonApi,
            useFactory: apiFactory,
            deps: [Http, API_URL, RESOURCE_DEFINITIONS]
        },
        {
            provide: NgrxJsonApiSelectors,
            useFactory: selectorsFactory,
            deps: [NGRX_JSON_API_STORE_LOCATION]
        },
        {
            provide: NGRX_JSON_API_STORE_LOCATION, useValue: config.storeLocation
        },
        {
            provide: API_URL, useValue: config.apiUrl
        },
        {
            provide: RESOURCE_DEFINITIONS, useValue: config.resourceDefinitions
        },
        {
            provide: NgrxJsonApiService,
            useFactory: serviceFactory,
            deps: [Store, NgrxJsonApiSelectors]
        },
        {
            provide: NgrxJsonApiServiceV2,
            useFactory: serviceFactoryV2,
            deps: [Store, NgrxJsonApiSelectors]
        }
    ]
}

@NgModule({
    imports: [
        HttpModule,
        EffectsModule.run(NgrxJsonApiEffects)
    ]
})
export class NgrxJsonApiModule {
    static configure(config: NgrxJsonApiModuleConfig): ModuleWithProviders {
        return {
            ngModule: NgrxJsonApiModule,
            providers: configure(config)
        };
    }
};
