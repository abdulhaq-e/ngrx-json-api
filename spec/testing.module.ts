import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { initialNgrxJsonApiState } from '../src/reducers';
import { NgrxJsonApiModule } from '../src/module';
import { updateStoreDataFromPayload } from '../src/utils';

import { resourceDefinitions, testPayload } from './test_utils';

let queries = {
  '1': {
    query: {
      queryId: '1',
    },
    resultIds: [{ type: 'Article', id: '1' }, { type: 'Article', id: '2' }],
  },
  '2': {
    query: {
      queryId: '2',
    },
    resultIds: [{ type: 'Blog', id: '1' }],
  },
  '55': {
    query: {
      queryId: '55',
    },
    resultIds: [],
  },
  '56': {
    query: {
      queryId: '1',
    },
    resultIds: [{ type: 'Article', id: '10' }, { type: 'Article', id: '20' }],
  },
};

let initialState = {
  NgrxJsonApi: {
    zones: {
      default: {
        ...{},
        ...initialNgrxJsonApiState,
        ...{
          data: updateStoreDataFromPayload({}, testPayload),
          queries: queries,
        },
      },
    },
  },
};

@NgModule({
  imports: [
    StoreModule.forRoot({}, { initialState: initialState }),
    EffectsModule.forRoot([]),
    HttpClientTestingModule,
    HttpClientModule,
    NgrxJsonApiModule.configure({
      resourceDefinitions: resourceDefinitions,
      apiUrl: 'myapi.com',
      requestHeaders: {
        'Custom-Header': '42',
      },
    }),
  ],
  providers: [],
})
export class TestingModule {}

@NgModule({
  imports: [
    StoreModule.forRoot({}, { initialState: initialState }),
    EffectsModule.forRoot([]),
    HttpClientModule,
    HttpClientTestingModule,
    NgrxJsonApiModule.configure({
      resourceDefinitions: resourceDefinitions,
      apiUrl: 'myapi.com',
      urlBuilder: {
        generateIncludedQueryParams: params => 'helloIncluded',
        generateFilteringQueryParams: params => 'helloFiltering',
        generateFieldsQueryParams: params => 'helloFields',
        generateSortingQueryParams: params => 'helloSorting',
        // generateQueryParams: (params) => 'helloGenerator'
      },
    }),
  ],
  providers: [],
})
export class AlternativeTestingModule {}

// export class JsonApiMock {
//   constructor() { }
//
//   create(query, document) {
//     if (document.data.type === 'SUCCESS') {
//       return Observable.of('SUCCESS');
//     } else if (document.data.type === 'FAIL') {
//       return Observable.throw('FAIL');
//     }
//   }
//
//   update(query, document) {
//     if (document.data.type === 'SUCCESS') {
//       return Observable.of('SUCCESS');
//     } else if (document.data.type === 'FAIL') {
//       return Observable.throw('FAIL');
//     }
//   }
//
//   find(query) {
//     if (query.type === 'SUCCESS') {
//       let res = {
//         data: {
//           type: 'SUCCESS'
//         }
//       };
//       return Observable.of(new Response(
//         new ResponseOptions({
//           body: JSON.stringify(res),
//           status: 200
//         })
//       ));
//     } else if (query.type === 'FAIL') {
//       return Observable.throw('FAIL QUERY');
//     }
//   }
//
//   delete(query) {
//     if (query.type === 'SUCCESS') {
//       return Observable.of(new Response(
//         new ResponseOptions({})));
//     } else if (query.type === 'FAIL') {
//       return Observable.throw('FAIL QUERY');
//     }
//   }
// }
//
// export const MOCK_JSON_API_PROVIDERS = [
//   { provide: JsonApiMock, useClass: JsonApiMock },
//   { provide: NgrxJsonApi, useExisting: JsonApiMock }
// ];
//
//
// export class NgrxJsonApiMockEffects extends NgrxJsonApiEffects {
//   // constructor() {
//   //   // super()
//   // }
//
//   private toErrorPayload(query, response) {
//     if (response === 'FAIL QUERY') {
//       return { query: query };
//     } else if (response === 'Unknown query') {
//       return query;
//     }
//     return ({
//       query: query,
//       jsonApiData: { data: { type: response } }
//     });
//   }
//
//   private generatePayload(resource, operation) {
//     return resource;
//   }
// }
//
// export const MOCK_NGRX_EFFECTS_PROVIDERS = [
//   { provide: NgrxJsonApiMockEffects, useClass: NgrxJsonApiMockEffects },
//   { provide: NgrxJsonApiEffects, useExisting: NgrxJsonApiMockEffects }
// ];
