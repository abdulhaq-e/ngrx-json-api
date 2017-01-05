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
  DenormaliseResourcePipe,
  GetResourcePipe,
  SelectResourcePipe,
  SelectStoreResourcePipe,
} from './pipes';

import { NgrxJsonApiConfig } from './interfaces';

export const NGRX_JSON_API_CONFIG = new OpaqueToken('NGRX_JSON_API_CONFIG');

export const apiFactory = (http: Http, config: NgrxJsonApiConfig) => {
  return new NgrxJsonApi(http, config);
};

export const selectorsFactory = (config: NgrxJsonApiConfig) => {
  return new NgrxJsonApiSelectors<any>(config);
};

export const serviceFactory = (
  store: Store<any>,
  selectors: NgrxJsonApiSelectors<any>) => {
  return new NgrxJsonApiService(store, selectors);
};

export const configure = (config: NgrxJsonApiConfig): Array<any> => {

  return [
    {
      provide: NgrxJsonApi,
      useFactory: apiFactory,
      deps: [Http, NGRX_JSON_API_CONFIG]
    },
    {
      provide: NgrxJsonApiSelectors,
      useFactory: selectorsFactory,
      deps: [NGRX_JSON_API_CONFIG]
    },
    {
      provide: NGRX_JSON_API_CONFIG,
      useValue: config
    },
    {
      provide: NgrxJsonApiService,
      useFactory: serviceFactory,
      deps: [Store, NgrxJsonApiSelectors]
    }
  ];
};

@NgModule({
  declarations: [
    DenormaliseResourcePipe,
    GetResourcePipe,
    SelectResourcePipe,
    SelectStoreResourcePipe,
  ],
  imports: [
    HttpModule,
    EffectsModule.run(NgrxJsonApiEffects)
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
