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
  DenormaliseOneStoreResourcePipe,
  DenormaliseManyStoreResourcePipe,
  GetResourcePipe,
  SelectResourcePipe,
  SelectStoreResourcePipe,
} from '../src/pipes';

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

import { updateStoreDataFromPayload } from '../src/utils';

import {
  testPayload,
  resourceDefinitions
} from './test_utils';

describe('NgrxJsonApiService', () => {
  let pipe;

  beforeEach(() => {
    let store = {
      api: Object.assign({}, initialNgrxJsonApiState, {
        data: updateStoreDataFromPayload({}, testPayload),
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
        DenormaliseOneStoreResourcePipe,
        DenormaliseManyStoreResourcePipe,
        GetResourcePipe,
        SelectResourcePipe,
        SelectStoreResourcePipe,
      ],
    })
  });


  describe('GetResourcePipe', () => {
    beforeEach(inject([GetResourcePipe], (p) => {
      pipe = p;
    }));

  });

  describe('SelectResourcePipe', () => {
    beforeEach(inject([SelectResourcePipe], (p) => {
      pipe = p;
    }));

  });

  describe('SelectStoreResourcePipe', () => {
    beforeEach(inject([SelectStoreResourcePipe], (p) => {
      pipe = p;
    }));

  });

  describe('DenormaliseOneResourcePipe', () => {

    beforeEach(inject([DenormaliseOneStoreResourcePipe], (p) => {
      pipe = p;
    }));

    it('should denormalise a Resource', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryType: 'getOne',
        queryId: '22'
      }
      let storeResource = pipe.service.findOne(query, false);
      let denormalised = pipe.transform(storeResource);
      denormalised.subscribe(it => {
        expect(_.get(it, 'resource.relationships.author.reference')).toBeDefined();
      });
    });
  });

  describe('DenormaliseManyResourcePipe', () => {

    beforeEach(inject([DenormaliseManyStoreResourcePipe], (p) => {
      pipe = p;
    }));

    it('should denormalise multiple StoreResource', () => {
      let query = {
        type: 'Article',
      }
      let storeResource = pipe.service.findMany(query, false);
      let denormalised = pipe.transform(storeResource);
      denormalised.subscribe(it => {
        expect(_.get(it[0], 'resource.relationships.author.reference')).toBeDefined();
      });
    });
  });

});
