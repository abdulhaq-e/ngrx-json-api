# ngrx-json-api

[![CircleCI](https://circleci.com/gh/abdulhaq-e/ngrx-json-api.svg?style=shield&circle-token=:af0b4d120bc34d24279b9d3266d0db5fe0293d3b)](https://circleci.com/gh/abdulhaq-e/ngrx-json-api)
[![npm version](https://badge.fury.io/js/ngrx-json-api.svg)](https://badge.fury.io/js/ngrx-json-api)

** A JSON API client library for ngrx. **

## Table of Contents

- [Getting Started](#getting-started)
- [Basic Usage](#basic-usage)
  - [Reading data](#reading-data)
  - [Adding data](#adding-data)
  - [Updating data](#updating-data)
  - [Deleting data](#deleting-data)

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
**3- Import `NgrxJsonApiModule` providing the above definitions, the API url and the JSON API state location as configuration.**

Also use `NgrxJsonApiStoreReducer` as a reducer for the JSON API state.
```ts
@NgModule({
    imports: [
      BrowserModule,  
      /* other imports */
      NgrxJsonApiModule.configure({
        apiUrl: 'http://localhost.com',
        resourceDefinitions: resourceDefinitions,
        storeLocation: 'api'
      }),
      StoreModule.provide({ counter: counterReducer,  api: NgrxJsonApiStoreReducer})
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
  template: {{ resourcesQuery.results | async }}
})
export class MyComponent {
  constructor(private ngrxJsonApiService: NgrxJsonApiService) {  }

  public resourcesQuery = this.ngrxJsonApiService
    .findMany({
      queryType: 'getMany',
      type: 'Article'
      });
}
```

## Basic Usage

### Fetching data

### Adding data

### Updating data

### Deleting data

# THANKS :heart:

This library wouldn't exist without all the ngrx libraries along with the docs and tools provided with each. Thanks to Ngrx/[Store](https://github.com/ngrx/store),[Effects](https://github.com/ngrx/effects). Also, the basis of this library is [redux-json-api](https://github.com/dixieio/redux-json-api) and [devour](https://github.com/twg/devour) so a huge thanks to the developers of both these JSON API client libs.
