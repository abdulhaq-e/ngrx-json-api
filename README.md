# ngrx-json-api

[![CircleCI](https://circleci.com/gh/abdulhaq-e/ngrx-json-api.svg?style=shield&circle-token=:af0b4d120bc34d24279b9d3266d0db5fe0293d3b)](https://circleci.com/gh/abdulhaq-e/ngrx-json-api) [![npm version](https://badge.fury.io/js/ngrx-json-api.svg)](https://badge.fury.io/js/ngrx-json-api)

## A JSON API client for ngrx

### Getting Started

1- Import what is is required, the ngModule and the reducer:

```typescript
import { NgrxJsonApiModule, NgrxJsonApiStoreReducer } from 'ngrx-json-api'.
```

2- Create an array of resource definitions (see `src/interfaces.ts`):

```typescript
let resourceDefinitions: Array<ResourceDefinition> = [
    {
      type: 'Article',
      collectionPath: 'articles',
    },
    {
      type: 'Person',
      collectionPath: 'people',
    }
    {
      type: 'Comment',
      collectionPath: 'comments',
    },
    {
      type: 'Blog',
      collectionPath: 'blogs',
    }
];
```

3- Use `NgrxJsonApiStoreReducer` as a reducer for the JSON API state.

```typescript
StoreModule.provide({ counter: counterReducer, api: NgrxJsonApiStoreReducer})
```

It's important to know where in the state lives `NgrxJsonApiStore` because it will be used in the next step (in the above example it's 'api')

3- Place `NgrxJsonApiModule` in the `import` property of the root module configurations (usually AppModule) and pass the required config object:

```typescript
@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    // Other imports
    StoreModule.provide({ counter: counterReducer, api: NgrxStoreReducer}),
    // This is what we want.
    NgrxJsonApiModule.configure({
      apiUrl: 'http://localhost.com',
      resourceDefinitions: resourceDefinitions,
      storeLocation: 'api'
    })
  ],
  declarations: [ AppComponent ],
  providers: [ ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
```

As can be seen, the config object passed to `configure` must have three properties:
- `apiUrl` is a string for the root location of the api, e.g.: `http://127.0.0.1`
- `resourceDefinitions` is an `Array` of resource definition as defined above:
- `storeLocation` is the location of `NgrxJsonApiStore` in the main state. This is required for selectors to function properly.

4- Import `NgrxJsonApiActions` inside the smart component and use on of its _static_ methods to emit an action.

_TODO: provide examples_

5- Inject `NgrxJsonApiSelectors` into the smart component and use its methods to select parts of the state.

_TODO: provide examples_

# THANKS :heart:

This library wouldn't exist without all the ngrx libraries along with the docs and tools provided with each. Thanks to Ngrx/[Store](https://github.com/ngrx/store),[Effects](https://github.com/ngrx/effects). Also, the basis of this library is [redux-json-api](https://github.com/dixieio/redux-json-api) and [devour](https://github.com/twg/devour) so a huge thanks to the developers of both these JSON API client libs.
