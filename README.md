# ngrx-json-api

[![CircleCI](https://circleci.com/gh/abdulhaq-e/ngrx-json-api.svg?style=shield&circle-token=:af0b4d120bc34d24279b9d3266d0db5fe0293d3b)](https://circleci.com/gh/abdulhaq-e/ngrx-json-api)
[![npm version](https://badge.fury.io/js/ngrx-json-api.svg)](https://badge.fury.io/js/ngrx-json-api)

## A JSON API client for ngrx

### How to use this library?

#### Although this library is heavily tested, integration tests have not been done yet but here goes:

1- Import `NgrxJsonApiModule`, `NgrxStoreReducer` and `initNgrxJsonApiStore` from 'ngrx-json-api'
```ts
import { NgrxJsonApiModule, NgrxJsonApiStore, initNgrxJsonApiStore } from 'ngrx-json-api'.
```
2- Create an array of resource definitions (see `src/interfaces.ts`):
```ts
let resourcesDefinitions: Array<ResourceDefinition> = [
    {
        type: 'Article',
        collectionPath: 'articles',
        attributes: ['title', 'subtitle'],
        relationships: {
            'author': { 'type': 'Person', 'relationType': 'hasOne' },
            'comments': { 'type': 'Comment', 'relationType': 'hasMany' },
        }
    },
    {
      type: 'Person',
      collectionPath: 'people',
      attributes: ['name'],
      relationships: {
        'blog': { 'type': 'Blog', 'relationType': 'hasOne' }
      }
    },
    {
        type: 'Comment',
        collectionPath: 'comments',
        attributes: ['text'],
        relationships: {}
    },
    {
        type: 'Blog',
        collectionPath: 'blogs',
        attributes: ['name'],
        relationships: {}
    }
];
```
3- Use `NgrxStoreReducer` as a reducer for the JSON API state and use `initNgrxJsonApiStore` to provide initial data giving the above resource definitions as input.
```ts
StoreModule.provide({ counter: counterReducer, api: NgrxStoreReducer},
  { api: initNgrxJsonApiStore(resourcesDefinition)})
```
It's important to know where in the state lives `NgrxJsonApiStore` because it will be used in the next step (in the above example it's 'api')

3- Place `NgrxJsonApiModule` in the `import` property of the root module configurations (usually AppModule) and pass the required configs:
```ts
@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    StoreModule.provide({ counter: counterReducer, api: NgrxStoreReducer},
      { api: initNgrxJsonApiStore(resourcesDefinition)})
    NgrxJsonApiModule.configure(apiUrl, resourcesDefinitions, ngrxJsonApiStoreLocation)
  ],
  declarations: [ AppComponent ],
  providers: [ ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
```

* `apiUrl` is a string for the root location of the api, e.g.: `http://127.0.0.1`
* `resourcesDefinitions` is an `Array` of resource definition as defined above:
* `ngrxJsonApistoreLocation` is the location of `NgrxJsonApiStore` in the main state. This is required for selectors to work properly

4- Import `NgrxJsonApiActions` inside the smart component and use on of its *static* methods to emit an action.

*TODO: provide examples*

5- Inject `NgrxJsonApiSelectors` into the smart component and use its methods to select parts of the state.

*TODO: provide examples*


# THANKS :heart:

This library wouldn't exist without all the ngrx libraries along with the docs and tools provided with each. Thanks to Ngrx/[Store](https://github.com/ngrx/store),[Effects](https://github.com/ngrx/effects). Also, the basis of this library is [redux-json-api](https://github.com/dixieio/redux-json-api) and [devour](https://github.com/twg/devour) so a huge thanks to the developers of both these JSON API client libs.
