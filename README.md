# ngrx-json-api

[![CircleCI](https://circleci.com/gh/abdulhaq-e/ngrx-json-api.svg?style=shield&circle-token=:af0b4d120bc34d24279b9d3266d0db5fe0293d3b)](https://circleci.com/gh/abdulhaq-e/ngrx-json-api)
[![npm version](https://badge.fury.io/js/ngrx-json-api.svg)](https://badge.fury.io/js/ngrx-json-api)
[![Coverage Status](https://coveralls.io/repos/github/abdulhaq-e/ngrx-json-api/badge.svg?branch=development)](https://coveralls.io/github/abdulhaq-e/ngrx-json-api?branch=development)

**A JSON API client library for ngrx.**

**Note: v1.0 of the library is compatible with old releases of @ngrx tools (< 2). The current version (>= 2) is compatible with the latest versions of @ngrx platform (>= 4)**

## Documentation

- [Store Structure](./docs/store_structure.md)
- [Service Overview](./docs/service_overview.md)
- [Actions](./docs/actions.md)
- [Basic Usage](./docs/basic_usage.md)
- [Advanced Usage](./docs/advanced_usage.md)

## Getting Started

**1. Install the library:**
```
npm i ngrx-json-api --save
```

Install the dependencies:
```
npm i --save @ngrx/effects @ngrx/store rxjs-compat
```

**Note:** `rxjs-compat` is only needed if you are using `rxjs >= 6.0.0`

**2. Define the resources:**
```ts
import { ResourceDefinition } from 'ngrx-json-api';

const resourceDefinitions: Array<ResourceDefinition> = [
    { type: 'Article', collectionPath: 'articles' },
    { type: 'Person', collectionPath: 'people' },
    { type: 'Comment', collectionPath: 'comments' },
    { type: 'Blog', collectionPath: 'blogs' }
];
```

Note that if the type of a resource matches its `collectionPath` in the URL, then no resource definition is necessary.

**3. Import `NgrxJsonApiModule` providing the above definitions and the API url.**

Make sure `StoreModule` and `HttpClientModule` are imported beforehand.

```ts
@NgModule({
    imports: [
      BrowserModule,
      /* other imports */
      HttpClientModule,
      StoreModule.forRoot(reducers, {}), // reducers, initial state
      NgrxJsonApiModule.configure({
        apiUrl: 'http://localhost.com',
        resourceDefinitions: resourceDefinitions,
      }),
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

**4. Inject `NgrxJsonApiService` into the component:**
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'my-component',
})
export class MyComponent {
  constructor(private ngrxJsonApiService: NgrxJsonApiService) {}
}
```

**5. Use the service to interact with the JSON API server and/or state:**

For example, to read data from the server and display this data in the view:
```ts
import { Component, OnInit } from '@angular/core';
import {
  NgrxJsonApiService,
  QueryResult,
  NGRX_JSON_API_DEFAULT_ZONE,
  Query,
  Direction
} from 'ngrx-json-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'my-component',
  template: `{{ queryResults | async | json }}`
})
export class MyComponent implements OnInit {
  
  public queryResult: Observable<QueryResult>;
  
  constructor(ngrxJsonApiService: NgrxJsonApiService) {  }

  ngOnInit () {
    // a zone represents an independent json-api instance
    const zone = this.ngrxJsonApiService.getZone(NGRX_JSON_API_DEFAULT_ZONE);

    // add query to store to trigger request from server
    const query: Query = {
      queryId: 'myQuery',
      type: 'projects',
      // id: '12' => add to query single item
      params: {
        fields: ['name'],
        include: ['tasks'],
        page: {
          offset: 20,
          limit: 10
        },
        // SortingParam[]
        sorting: [
          { api: 'name', direction: Direction.ASC }
        ],
        // FilteringParam[]
        filtering: [
          { path: 'name', operator: 'EQ', value: 'John' }
        ]
      }
    };

    zone.putQuery({
      query: query,
      fromServer: true // you may also query locally from contents in the store, e.g. new resource
    });

    // select observable to query result holding the loading state and (future) results
    const denormalise = false;

    this.queryResult = this.ngrxJsonApiService.selectManyResults(query.queryId, denormalise);
  }
}
```

The service is the main API for using `ngrx-json-api`. The fetching methods return an `Observable` with the obtained resources stored in a `data` property.

## Example application

For an example application have a look at https://github.com/crnk-project/crnk-example. It combines `ngrx-json-api`
with [Crnk](http://www.crnk.io) as JSON API server implementation to gain a JSON API end-to-end example.
[@crnk/angular-ngrx](https://www.npmjs.com/package/@crnk/angular-ngrx) is further used to facilitate binding
of Angular forms and tables to JSON API. More information can be found at http://www.crnk.io/releases/stable/documentation/#_angular_development_with_ngrx.

## Upgrading from v1.0

Upgrade from v1 is really easy; two simple steps:

  1. Remove `storeLocation` from `NgrxJsonApiModule` configuration. It's not needed anymore!
  2. Remove `NgrxJsonApiReducer` from `StoreModule` configuration.
  3. Import `HttpClientModule` in the application.

# THANKS :heart:

This library wouldn't exist without all the ngrx libraries along with the docs and tools provided with each. Thanks to Ngrx/[Store](https://github.com/ngrx/store),[Effects](https://github.com/ngrx/effects). Also, the basis of this library is [redux-json-api](https://github.com/dixieio/redux-json-api) and [devour](https://github.com/twg/devour) so a huge thanks to the developers of both these JSON API client libs.
