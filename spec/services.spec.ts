import {
  async,
  inject,
  fakeAsync,
  tick,
  TestBed
} from '@angular/core/testing';

import * as _ from 'lodash';

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

import { updateStoreDataFromPayload } from '../src/utils';

import {
  testPayload,
  resourceDefinitions
} from './test_utils';

describe('NgrxJsonApiService', () => {
  let service;

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
    it('find a single StoreResource from the state', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryId: '22'
      }
      let storeResource = service.findOne(query, false);
      storeResource.subscribe(it => {
        expect(_.get(it, 'resource.type')).toEqual('Article');
        expect(_.get(it, 'resource.id')).toEqual('1');
      });
    });

    it('remove the query from the state after unsubscribing', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryId: '22'
      }
      let storeResource = service.findOne(query, false);
      let subs = storeResource.subscribe();
      expect(service.storeSnapshot.queries['22']).toBeDefined()
      subs.unsubscribe();
      expect(service.storeSnapshot.queries['22']).not.toBeDefined()
    });

    it('shoud run without a provided queryId and should remote it properly when done', () => {
      let query = {
        id: '1',
        type: 'Article',
      }
      let storeResource = service.findOne(query, false);
      let subs = storeResource.subscribe();
      expect(Object.keys(service.storeSnapshot.queries).length).toEqual(1)
      subs.unsubscribe();
      expect(Object.keys(service.storeSnapshot.queries).length).toEqual(0)
    });

    it('find a single StoreResource from the state and denormalises it if told to', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryId: '22'
      }
      let res;
      let storeResource = service.findOne(query, false, true);
      storeResource.subscribe(it => res = it);
      service.denormaliseOne(storeResource).subscribe(it => {
        expect(it).toEqual(res);
      });
    });
  });

  describe('findMany', () => {
    it('find multiple StoreResources from the state', () => {
      let query = {
        type: 'Article',
        queryId: '22'
      }
      let storeResource = service.findMany(query, false);
      storeResource.subscribe(it => {
        expect(_.get(it[0], 'resource.type')).toEqual('Article');
        expect(_.get(it[0], 'resource.id')).toEqual('1');
        expect(_.get(it[1], 'resource.type')).toEqual('Article');
        expect(_.get(it[1], 'resource.id')).toEqual('2');
      });
    });

    it('remove the query from the state after unsubscribing', () => {
      let query = {
        type: 'Article',
        queryId: '22'
      }
      let storeResource = service.findMany(query, false, true);
      let subs = storeResource.subscribe();
      expect(service.storeSnapshot.queries['22']).toBeDefined()
      subs.unsubscribe();
      expect(service.storeSnapshot.queries['22']).not.toBeDefined()
    });

    it('find multiple StoreResource from the state and denormalises it if told to', () => {
      let query = {
        type: 'Article',
        queryId: '22'
      }
      let res;
      let storeResource = service.findMany(query, false, true);
      storeResource.subscribe(it => res = it);
      service.denormaliseMany(storeResource).subscribe(it => {
        expect(it).toEqual(res);
      });

    });

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

  describe('selectStoreResource', () => {

  });

  describe('denormaliseOne and denormaliseMany', () => {
    it('should denormalise a StoreResource', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryType: 'getOne',
        queryId: '22'
      }
      let storeResource = service.denormaliseOne(service.findOne(query, false));
      storeResource.subscribe(it => {
        expect(_.get(it, 'resource.relationships.author.reference.resource')).toBeDefined();
      });
    });

    it('should denormalise an array of StoreResource', () => {
      let query = {
        type: 'Article',
      }
      let storeResource = service.denormaliseMany(service.findMany(query, false));
      storeResource.subscribe(it => {
        expect(_.get(it[0], 'resource.relationships.author.reference.resource')).toBeDefined();
      });
    });

  });
});
