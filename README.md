# ngrx-json-api

[![CircleCI](https://circleci.com/gh/abdulhaq-e/ngrx-json-api.svg?style=shield&circle-token=:af0b4d120bc34d24279b9d3266d0db5fe0293d3b)](https://circleci.com/gh/abdulhaq-e/ngrx-json-api)
[![npm version](https://badge.fury.io/js/ngrx-json-api.svg)](https://badge.fury.io/js/ngrx-json-api)
[![Coverage Status](https://coveralls.io/repos/github/abdulhaq-e/ngrx-json-api/badge.svg?branch=master)](https://coveralls.io/github/abdulhaq-e/ngrx-json-api?branch=master)

**A JSON API client library for ngrx.**

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

The `NgrxJsonApiService` instance methods `findOne` and `findMany` are the ones used for fetching data either from the server or from the state (offline fetching). Both return a handler with a `results` property that contains an `Observable` of the results. To use both methods, a `ResourceQuery` must be given as an input in addition to an optional boolean for server side or client side fetching. Default is server side fetching.

The ResourceQuery must have at least a `type` and `queryId` properties. Other possible properties are `id`, `params` and `queryType`. We will not use the last two now.

Let's jump to examples:

#### 1- Fetching a single resource:
```ts
/* let's find a single resource of type `Article` and id `1` */
let query = {
  type: 'Article',
  id: '1',
  queryId: '0' // any string is fine, it will be made optional
}
// to fetch this 'article' from the server:
let queryResults = this.ngrxService.findOne(query)
// this is equivalent: this.ngrxService.findOne(query, true)

```
To subscribe and obtain the results, we can manually subscribe or use the Async pipe if we're using this in the view.
```ts
let results;
this.queryResults.results.subscribe(it => results = it);
```

What if we somehow already have this resource in the state and we want to obtain this article from that state rather than sending a request to the server. Well, we only need to change one thing:
```ts
let queryResults = this.ngrxService.findOne(query, false)
// false means don't get this resource from the server.
```

That was simple! One thing to note before moving to the next example; `findOne` will raise an error if more than one resource was returned whether from the server or from the state.

#### 2- Fetching multiple resources
```ts
/* let's find all resources of type `Article` */
let query = {
  type: 'Article',
  queryId: '0' // any string is fine, it will be made optional
}
// to fetch all articles from the server:
let queryResults = this.ngrxService.findMany(query)
// to do the same thing without sending requests to the server:
let queryResults = this.ngrxService.findMany(query, false)
```

We just replaced `findOne` by `findMany`. Removing `id` from the query was unnecessary because `findMany` will just ignore it. Subscribing to the observable and getting the results work exactly like example 1. This time however, the results are an array rather than a single plain object.

#### What is the structure of the fetched resource?

By default, it will be a `ResourceStore`, see the [interfaces](./src/interfaces.ts) file for a detailed definition. In short a `ResourceStore` has a bunch of properties with the famously known JSON API Resource (with its `type`, `id`, `attributes` and `relationships`) placed in a `resource` property.

For example, to obtain the `title` of the article with id 1 fetched in example 1, we use:
```
let title = results.resource.attributes.title
```

We can obtain the resource immediately, which will allow us to use `results.attributes.title`, but this is left for later parts of the documentation.

### Adding data

### Updating data

### Deleting data

# THANKS :heart:

This library wouldn't exist without all the ngrx libraries along with the docs and tools provided with each. Thanks to Ngrx/[Store](https://github.com/ngrx/store),[Effects](https://github.com/ngrx/effects). Also, the basis of this library is [redux-json-api](https://github.com/dixieio/redux-json-api) and [devour](https://github.com/twg/devour) so a huge thanks to the developers of both these JSON API client libs.
