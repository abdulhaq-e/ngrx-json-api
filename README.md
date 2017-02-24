# ngrx-json-api

[![CircleCI](https://circleci.com/gh/abdulhaq-e/ngrx-json-api.svg?style=shield&circle-token=:af0b4d120bc34d24279b9d3266d0db5fe0293d3b)](https://circleci.com/gh/abdulhaq-e/ngrx-json-api)
[![npm version](https://badge.fury.io/js/ngrx-json-api.svg)](https://badge.fury.io/js/ngrx-json-api)
[![Coverage Status](https://coveralls.io/repos/github/abdulhaq-e/ngrx-json-api/badge.svg?branch=development)](https://coveralls.io/github/abdulhaq-e/ngrx-json-api?branch=development)

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

Note that if the type of a resource matches its collectionPath in the URL, then no resource definition is necessary.



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



## Store Structure

The contents of ngrx-jsonapi in a store can, for example, look as follows:

```json
{
    isCreating: 0,
    isReading: 0,
    isUpdating: 0,
    isDeleting: 0,
    isApplying: 0,
    data: {
      movie: {
        'b61b2f41-46d8-3899-88e1-fcd45138fb0d': {
          id: 'b61b2f41-46d8-3899-88e1-fcd45138fb0d',
          type: 'movie',
          attributes: {
            year: '2015',
            title: 'Captain America: Civil War',
            type: 'MOVIE'
          },
          relationships: {
            actors: {
              links: {
                self: '...',
                related: '...'
              }
            }
          },
          persistedResource: {
            id: 'b61b2f41-46d8-3899-88e1-fcd45138fb0d',
            type: 'movie',
            attributes: {
              year: '2015',
	            title: 'Captain America: Civil War',
              type: 'MOVIE',
            },
            relationships: {
              actors: {
                links: {
                  self: '...',
                  related: '...'
                }
              }
            }          
          },
          state: 'IN_SYNC',
          errors: [],
          loading: false
        },
      }
    },
    queries: {
      movieQuery: {
        loading: false,
        query: {
          queryId: 'movieTable',
          type: 'movie',
          params: {
            offset: 0,
            limit: 10
          }
        },
        errors: [],
        resultIds: [
          {
            type: 'movie',
            id: 'b61b2f41-46d8-3899-88e1-fcd45138fb0d'
          },
        ],
        meta: {
          ...
        },
        links: {
          ...
        }
      }
    }
  }
```

There are two main types of contents: `data` and `queries`. `data` stores the resources indexed by type 
and id and `queries` stores the state of `GET` requests. To perform a `GET` request a new query with a given
name is put into the store. `ngrx-json-api` sets the loading indicator to true and begins fetching the resources from
the remote repository. Once the results are available, all the resources from the `data` and `include` section are stored
within the `data` section of the store. The ids of the `data` resources, the links information and meta information are stored
within the corresponding query of the store. Note that the query does not hold a direct reference to its result resources to
adhere to the normalization principle of reduce. In case of JSON API errors the errors array within the query is updated 
accordingly. In case of a HTTP error the errors array is updated as well with the error code and message.


Resources within the `data` section can be created, updated and marked for deletion. Such modifications are
performed locally. Directly after the modification or at any later stage the changes can be applied back to the remote 
server. For that purpose resources in the store carry a number of additional status information: `errors`, `state`, `loading` 
and `persistedResource`.  `errors` is used if a `DELETE`, `PATCH` or `POST` of that resource fails. `state` has one of the 
following states: `IN_SYNC`, `CREATED`, `UPDATED`, `DELETED` or `NOT_LOADED` depending on the state of the modifications. Note 
that a resource cannot directly be deleted, but is rather marked with the state `DELETED` until the actual deletion on the 
server-side succeeds. `persistedResource` holds the state of a resource as it is currently stored on the server. 
If a resource is in state `IN_SYNC`, then it will hold the same values as in the resource itself. If modifications are 
performed locally, then the values will be different until the changes have been successfully applied on the server-side. In 
that case `ngrx-json-api` will update `persistedResource`.
  
  
  
   
## Actions

The following actions are supported:

| Action Type                   | Description   |
| ----------------------------- | ------------- |
| API_CREATE_INIT               | Issues a `POST` request for a resource.                                                                                                |
| API_CREATE_SUCCESS            | Upon success completion of a `POST` request.                                                                                           |
| API_CREATE_FAIL               | Upon a failure of a `POST` request.                                                                                                    |
| API_READ_INIT                 | Issues a `GET` request for a resource.                                                                                                 |
| API_READ_SUCCESS              | Upon success completion of a `GET` request.                                                                                            |
| API_READ_FAIL                 | Upon a failure of a `GET` request.                                                                                                     |
| API_UPDATE_INIT               | Issues a `PATCH` request for a resource.                                                                                               |
| API_UPDATE_SUCCESS            | Upon success completion of a `PATCH` request.                                                                                          |
| API_UPDATE_FAIL               | Upon a failure of a `PATCH` request.                                                                                                   |
| API_DELETE_INIT               | Issues a `DELETE` request for a resource.                                                                                              |
| API_DELETE_SUCCESS            | Upon success completion of a `DELETE` request.                                                                                         |
| API_DELETE_FAIL               | Upon a failure of a `DELETE` request.                                                                                                  |
| API_APPLY_INIT                | Initiates the appropriate API_X_INIT action for all pending local modifications.                                                       |
| API_APPLY_SUCCESS             | Upon success completion of all requested modifications.                                                                                |
| API_APPLY_FAIL                | Upon failure a at least one requested modification.                                                                                    |
| API_ROLLBACK:                 | Reverts all local changes to resources in the store.                                                                                   |
| API_QUERY_REFRESH             | Updates the result of a query by initiating a API_READ_INIT.                                                                           |
| LOCAL_QUERY_INIT              | Sets up a query that is run locally based on the contents of the store.                                                                |
| LOCAL_QUERY_SUCCESS           | Triggered when a local query was successfully updated in the store.                                                                    |
| LOCAL_QUERY_FAIL              | Triggered when a local query failed.                                                                                                   |
| DELETE_STORE_RESOURCE         | Marks a resource in the store for deletion. Does not trigger an update to the server.                                                  |
| PATCH_STORE_RESOURCE          | Patches a resource in the store by merging the provided values with the ones from the store. Does not trigger an update to the server. |
| POST_STORE_RESOURCE           | Adds a new resource to the store. Does not trigger an update to the server.                                                            |
| MODIFY_STORE_RESOURCE_ERRORS  | Modifies the errors of a resource in the store. Use for client side validation.                                                        |
| REMOVE_QUERY                  | Removes a query from the store.                                                                                                        |
| COMPACT_STORE                 | Removes all resources from the store that are not directly or indirectly (relationships) references from a query                       |
| CLEAR_STORE                   | Removes all the contents from the store                                                                                                |

For more information have a look at the sources. The subsequent sections will show the usage of `NgrxJsonApiService` that
allows to trigger such actions and perform a number of different selections. You make use of the actions directly when
working with effects. For each action type there is a corresponding Typescript interface.

  

## Basic Usage

### Fetching data

The `NgrxJsonApiService` instance methods `findOne` and `findMany` are the ones used for fetching data either from the server or from the state (offline fetching). Both return a handler with a `results` property that contains an `Observable` of the results. To use both methods, a `ResourceQuery` must be given as an input in addition to an optional boolean for server side or client side fetching. Default is server side fetching.

The ResourceQuery must have at least a `type`. The optional `queryId` propertly lets you specify an id for the query, used to 
address it within the store. If no `queryId` is provided, a random one is chosen. The optional `id` property is used to specify
 the id of a resource, if a single resource should be fetched. The optional `params` property is used for for sorting, 
 filtering, paging, field sets and inclusions.

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


#### Denormalization

`findOne` and `findMany` take an optional `denormalise` argument. In that case relationships to other resources get resolved during
the selection. It is then possible to follow relationships as follows:

```
let title = results.resource.relationships.person.reference.attributes.name
```

Notice the `reference` instead of `data` attribute to follow the denormalized relationship instead of just accessing the 
identifier of the related resource.


#### Lifecycle of a Query

`findOne` and `findMany` perform three tasks at once: 

1. setup a new query.
2. select the state of that query.
3. remove the query again from the store when a subscription ends.

It is also possible to perform those three tasks separately with the `putQuery`, `selectManyResults` resp. `selectOneResult` and 
`removeQuery`. If you desire to keep queries longer in the store, for example, to allow to quickly return to a previous page, 
then you likely will have to fallback to this methods.


#### House Keeping

When `GET` are executed, the store gets filled up with fetched resources. The `clear` and `compact` methods allow to either 
entirely clear the store resp. remove all resources not referenced directly or indirectly (relationships) by a query.


### Posting data

`postResource` allows to add a new resource to the store. The optional `toRemote` parameter lets you directly `POST` that 
resource to the server as well.


### Patching data

`patchResource` allows to patch a resource to the store. The passed attribute and relationship values will be merged into the 
current resource. Attributes and relationships not contained within the patch remain unaffected. The optional `toRemote` 
parameter lets you directly `PATCH` that resource to the server as well.

### Deleting data

`deleteResource` allows to mark a new resource for deletion in the store. The optional `toRemote` parameter lets 
you directly `DELETE` that resource on the server as well. Once the `DELETE` request succeeds, it will be removed from the store.

### Bulk updates
 
`apply` performs an update on the server for all local, unsaved modifications (where the state is not 'IN_SYNC'). Currently
multiple requests are created. There is not yet any bulk request for JSON API. In the future `apply` will further allow
more fine-grained control of what can be updated.

### Updating error states

`addResourceErrors`, `removeResourceErrors` and `setResourceErrors` allow to update the errors of a resource. This is
 useful when client-side validation must be applied.



# THANKS :heart:

This library wouldn't exist without all the ngrx libraries along with the docs and tools provided with each. Thanks to Ngrx/[Store](https://github.com/ngrx/store),[Effects](https://github.com/ngrx/effects). Also, the basis of this library is [redux-json-api](https://github.com/dixieio/redux-json-api) and [devour](https://github.com/twg/devour) so a huge thanks to the developers of both these JSON API client libs.
