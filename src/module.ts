import { ModuleWithProviders, NgModule, OpaqueToken } from '@angular/core';

import {
  Http, HttpModule
} from '@angular/http';

import { Store } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { NgrxJsonApi } from './api';
import { NgrxJsonApiEffects } from './effects';
import { NgrxJsonApiSelectors } from './selectors';
import { NgrxJsonApiService } from './services';
import {
  DenormaliseStoreResourcePipe,
  GetDenormalisedValuePipe,
  SelectStoreResourcePipe,
} from './pipes';

import { NgrxJsonApiConfig } from './interfaces';

export const NGRX_JSON_API_CONFIG = new OpaqueToken('NGRX_JSON_API_CONFIG');

export const NGRX_JSON_API_HTTP = new OpaqueToken('NGRX_JSON_API_HTTP');

export function apiFactory(http: Http, config: NgrxJsonApiConfig) {
  return new NgrxJsonApi(http, config);
};

export function selectorsFactory(config: NgrxJsonApiConfig) {
  return new NgrxJsonApiSelectors<any>(config);
};

export function serviceFactory(store: Store<any>, selectors: NgrxJsonApiSelectors<any>) {
  return new NgrxJsonApiService(store, selectors);
};

export function configure(config: NgrxJsonApiConfig): Array<any> {

  return [
    {
      provide: NgrxJsonApi,
      useFactory: apiFactory,
      deps: [NGRX_JSON_API_HTTP, NGRX_JSON_API_CONFIG]
    },
    {
      provide: NgrxJsonApiSelectors,
      useFactory: selectorsFactory,
      deps: [NGRX_JSON_API_CONFIG]
    },
    {
      provide: NgrxJsonApiService,
      useFactory: serviceFactory,
      deps: [Store, NgrxJsonApiSelectors]
    },
    {
      provide: NGRX_JSON_API_CONFIG,
      useValue: config
    },
    {
      provide: NGRX_JSON_API_HTTP,
      useExisting: Http
    }
  ];
};

@NgModule({
  declarations: [
    DenormaliseStoreResourcePipe,
    GetDenormalisedValuePipe,
    SelectStoreResourcePipe,
  ],
  imports: [
    HttpModule,
    EffectsModule.run(NgrxJsonApiEffects)
  ],
  exports: [
    DenormaliseStoreResourcePipe,
    GetDenormalisedValuePipe,
    SelectStoreResourcePipe
  ]
})
export class NgrxJsonApiModule {
  static configure(config: NgrxJsonApiConfig): ModuleWithProviders {
    return {
      ngModule: NgrxJsonApiModule,
      providers: configure(config)
    };
  }
};
