import { ModuleWithProviders, NgModule, OpaqueToken } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { NgrxJsonApi } from './api';
import { NgrxJsonApiEffects } from './effects';
import { NgrxJsonApiSelectors } from './selectors';
import { NgrxJsonApiService } from './services';
import { reducer } from './reducers';
import {
  DenormaliseStoreResourcePipe,
  GetDenormalisedValuePipe,
  SelectStoreResourcePipe,
} from './pipes';

import { NgrxJsonApiConfig } from './interfaces';

export const NGRX_JSON_API_CONFIG = new OpaqueToken('NGRX_JSON_API_CONFIG');

export function apiFactory(http: HttpClient, config: NgrxJsonApiConfig) {
  return new NgrxJsonApi(http, config);
}

export function selectorsFactory(config: NgrxJsonApiConfig) {
  return new NgrxJsonApiSelectors(config);
}

export function serviceFactory(
  store: Store<any>,
  selectors: NgrxJsonApiSelectors
) {
  return new NgrxJsonApiService(store, selectors);
}

export function configure(config: NgrxJsonApiConfig): Array<any> {
  return [
    {
      provide: NgrxJsonApi,
      useFactory: apiFactory,
      deps: [HttpClient, NGRX_JSON_API_CONFIG],
    },
    {
      provide: NgrxJsonApiSelectors,
      useFactory: selectorsFactory,
      deps: [NGRX_JSON_API_CONFIG],
    },
    {
      provide: NgrxJsonApiService,
      useFactory: serviceFactory,
      deps: [Store, NgrxJsonApiSelectors],
    },
    {
      provide: NGRX_JSON_API_CONFIG,
      useValue: config,
    },
  ];
}

@NgModule({
  declarations: [
    DenormaliseStoreResourcePipe,
    GetDenormalisedValuePipe,
    SelectStoreResourcePipe,
  ],
  imports: [
    EffectsModule.forFeature([NgrxJsonApiEffects]),
    StoreModule.forFeature('NgrxJsonApi', reducer, {}),
  ],
  exports: [
    DenormaliseStoreResourcePipe,
    GetDenormalisedValuePipe,
    SelectStoreResourcePipe,
  ],
})
export class NgrxJsonApiModule {
  static configure(config: NgrxJsonApiConfig): ModuleWithProviders {
    return {
      ngModule: NgrxJsonApiModule,
      providers: configure(config),
    };
  }
}
