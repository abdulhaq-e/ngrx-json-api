# ngrx-json-api

[![CircleCI](https://circleci.com/gh/abdulhaq-e/ngrx-json-api.svg?style=shield&circle-token=:af0b4d120bc34d24279b9d3266d0db5fe0293d3b)](https://circleci.com/gh/abdulhaq-e/ngrx-json-api)
[![npm version](https://badge.fury.io/js/ngrx-json-api.svg)](https://badge.fury.io/js/ngrx-json-api)
[![Coverage Status](https://coveralls.io/repos/github/abdulhaq-e/ngrx-json-api/badge.svg?branch=development)](https://coveralls.io/github/abdulhaq-e/ngrx-json-api?branch=development)

**A JSON API client library for ngrx.**

**Note: v1.0 of the library is compatible with old releases of @ngrx tools (< 2). The current version (>= 2) is compatible with the latest versions of @ngrx platform (>= 4)**

## Table of Contents

- [Getting Started](#getting-started)
- [Basic Usage](./docs/basic_usage.md)
- [Store Structure](./docs/store_structure.md)
- [Advanced Usage](./docs/advanced_usage.md)
- [Upgrading from v1.0](#upgrading-from-v10)


## Getting Started

**1- Install the library:**
```
npm i ngrx-json-api --save
```

**2- Define the resources:**
```ts
import { ResourceDefinition } from 'ngrx-json-api';
let resourceDefinitions: Array<ResourceDefinition> = [
    { type: 'Article', collectionPath: 'articles' }
    { type: 'Person', collectionPath: 'people' }
    { type: 'Comment', collectionPath: 'comments' }
    { type: 'Blog', collectionPath: 'blogs' }
];
```

Note that if the type of a resource matches its `collectionPath` in the URL, then no resource definition is necessary.

**3- Import `NgrxJsonApiModule` providing the above definitions and the API url.**

Make sure `StoreModule` and `HttpClientModule` are imported beforehand.

```ts
@NgModule({
    imports: [
      BrowserModule,  
      /* other imports */
      HttpClientModule,
      StoreModule.forRoot({ counter: counterReducer}, {})
      NgrxJsonApiModule.configure({
        apiUrl: 'http://localhost.com',
        resourceDefinitions: resourceDefinitions,
      }),
    ],
    declarations: [AppComponent]
    bootstrap: [AppComponent]
})
export class AppModule {}
```

**4- Inject `NgrxJsonApiService` into the component:**
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'my-component',
})
export class MyComponent {
  constructor(private ngrxJsonApiService: NgrxJsonApiService) {}
}
```

**5- Use the service to interact with the JSON API server and/or state:**

For example, to read data from the server and display this data in the view:
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'my-component',
  template: `{{ queryResults | async }}`
})
export class MyComponent {
  
  constructor(private ngrxJsonApiService: NgrxJsonApiService) {  }

  public queryResults = this.ngrxJsonApiService
    .findMany({
      queryType: 'getMany',
      type: 'Article'
      });      
}
```

The service is the main API for using `ngrx-json-api`. The fetching methods return an `Observable` with the obtained resources stored in a `data` property. More details about the response type and other methods for the service are provided in the docs.

## Upgrading from v1.0

Upgrade from v1 is really easy; two simple steps:

  1. Remove `storeLocation` from `NgrxJsonApiModule` configuration. It's not needed anymore!
  2. Remove `NgrxJsonApiReducer` from `StoreModule` configuration.
  3. Import `HttpClientModule` in the application.

# THANKS :heart:

This library wouldn't exist without all the ngrx libraries along with the docs and tools provided with each. Thanks to Ngrx/[Store](https://github.com/ngrx/store),[Effects](https://github.com/ngrx/effects). Also, the basis of this library is [redux-json-api](https://github.com/dixieio/redux-json-api) and [devour](https://github.com/twg/devour) so a huge thanks to the developers of both these JSON API client libs.
