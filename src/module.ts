import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { NgrxJsonApi } from './api';
import { NgrxJsonApiEffects } from './effects';
import { NgrxJsonApiService } from './services';
import { reducer } from './reducers';
import {
  DenormaliseStoreResourcePipe,
  GetDenormalisedValuePipe,
  SelectStoreResourcePipe,
  SelectStoreResourcesPipe,
} from './pipes';

import { NgrxJsonApiConfig } from './interfaces';
import { NgrxJsonApiSelectors } from './selectors';

export const NGRX_JSON_API_CONFIG = new InjectionToken<NgrxJsonApiConfig>(
  'NGRX_JSON_API_CONFIG'
);

export function apiFactory(http: HttpClient, config: NgrxJsonApiConfig) {
  return new NgrxJsonApi(http, config);
}

/**
 * Deprecated, do not use any longer
 */
export function selectorsFactory() {
  return new NgrxJsonApiSelectors();
}

export function serviceFactory(store: Store<any>, config: NgrxJsonApiConfig) {
  return new NgrxJsonApiService(store, config);
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
    },
    {
      provide: NgrxJsonApiService,
      useFactory: serviceFactory,
      deps: [Store, NGRX_JSON_API_CONFIG],
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
    SelectStoreResourcesPipe,
  ],
  imports: [
    EffectsModule.forFeature([NgrxJsonApiEffects]),
    StoreModule.forFeature('NgrxJsonApi', reducer, {}),
  ],
  exports: [
    DenormaliseStoreResourcePipe,
    GetDenormalisedValuePipe,
    SelectStoreResourcePipe,
    SelectStoreResourcesPipe,
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
