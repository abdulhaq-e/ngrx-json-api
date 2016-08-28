import { ModuleWithProviders, NgModule, OpaqueToken } from '@angular/core';

import {
    Http
} from '@angular/http';

import { EffectsModule } from '@ngrx/effects';

import { JsonApi } from '../lib/api';
import { JsonApiEffects } from '../lib/effects';
import { JsonApiActions } from '../lib/actions';
import { ResourceDefinition } from '../lib/interfaces';

export const API_URL = new OpaqueToken('API_URL');

export const RESOURCES_DEFINITIONS = new OpaqueToken('RESOURCES_DEFINTIONS');

export const _apiFactory = (
    http: Http,
    apiUrl: string,
    resourcesDefinitions: Array<ResourceDefinition>) => {
    return new JsonApi(http, apiUrl, resourcesDefinitions);
};

export const configure = (
    apiUrl: string,
    resourcesDefinitions: Array<ResourceDefinition>): Array<any> => {
    return [
        {
            provide: JsonApi,
            useFactory: _apiFactory,
            deps: [Http, API_URL, RESOURCES_DEFINITIONS]
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
        resourcesDefinitions: Array<ResourceDefinition>): ModuleWithProviders {
        return {
            ngModule: NgrxJsonApiModule,
            providers: configure(apiUrl, resourcesDefinitions)
        };
    }
};
