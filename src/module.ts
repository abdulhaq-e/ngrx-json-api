import { ModuleWithProviders, NgModule, OpaqueToken } from '@angular/core';

import {
    Http
} from '@angular/http';

import { EffectsModule } from '@ngrx/effects';

import { JsonApi } from '../src/api';
import { JsonApiEffects } from '../src/effects';
import { JsonApiActions } from '../src/actions';
import { NgrxJsonApiSelectors } from '../src/selectors';
import { ResourceDefinition } from '../src/interfaces';

export const API_URL = new OpaqueToken('API_URL');

export const RESOURCES_DEFINITIONS = new OpaqueToken('RESOURCES_DEFINTIONS');

export const NGRX_JSON_API_STORE_LOCATION = new OpaqueToken(
    'NGRX_JSON_API_STORE_LOCATION')

export const _apiFactory = (
    http: Http,
    apiUrl: string,
    resourcesDefinitions: Array<ResourceDefinition>) => {
    return new JsonApi(http, apiUrl, resourcesDefinitions);
};

export const _selectorsFactory = (storeLocation: string) => {
    return new NgrxJsonApiSelectors(storeLocation);
}

export const configure = (
    apiUrl: string,
    resourcesDefinitions: Array<ResourceDefinition>,
    storeLocation: string): Array<any> => {
    return [
        {
            provide: JsonApi,
            useFactory: _apiFactory,
            deps: [Http, API_URL, RESOURCES_DEFINITIONS]
        },
        {
            provide: NgrxJsonApiSelectors,
            useFactory: _selectorsFactory,
            deps: [NGRX_JSON_API_STORE_LOCATION]
        },
        {
            provide: NGRX_JSON_API_STORE_LOCATION, useValue: storeLocation
        },
        {
            provide: API_URL, useValue: apiUrl
        },
        {
            provide: RESOURCES_DEFINITIONS, useValue: resourcesDefinitions
        }

    ]
}

@NgModule({
    imports: [
        EffectsModule.run(JsonApiEffects)
    ]
})
export class NgrxJsonApiModule {
    static configure(apiUrl: string,
        resourcesDefinitions: Array<ResourceDefinition>,
        storeLocation: string): ModuleWithProviders {
        return {
            ngModule: NgrxJsonApiModule,
            providers: configure(apiUrl, resourcesDefinitions, storeLocation)
        };
    }
};
