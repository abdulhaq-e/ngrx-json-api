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

**1. Install the library:**
```
npm i ngrx-json-api --save
```

**2. Define the resources:**
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

**3. Import `NgrxJsonApiModule` providing the above definitions and the API url.**

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
import { Component } from '@angular/core';
import {
	NGRX_JSON_API_DEFAULT_ZONE,
	NgrxJsonApiService,
} from 'ngrx-json-api';

@Component({
  selector: 'my-component',
  template: `{{ queryResults | async }}`
})
export class MyComponent {
  
  public queryResult: Observable<QueryResult>;
  
  constructor(ngrxJsonApiService: NgrxJsonApiService) {  }

    // a zone represents an independent json-api instance
    let zone = this.ngrxJsonApiService.getZone(NGRX_JSON_API_DEFAULT_ZONE);
    
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
        sorting: {
          { api: 'name', direction: Direction.ASC }
        },
        filtering: {
          { path: 'name', operator: 'EQ', value: 'John' }
        }
      }    
    };
    zone.putQuery({
      query: query,
    	fromServer: true // you may also query locally from contents in the store, e.g. new resource
    });
    
    // select observable to query result holding the loading state and (future) results
    const denormalise = false;
    this.queryResult = this.selectManyResults(newQuery.queryId, denormalise);

}
```

The service is the main API for using `ngrx-json-api`. The fetching methods return an `Observable` with the obtained resources stored in a `data` property. More details about the response type and other methods for the service are provided in the docs.

## Data Structures

To get familiar with the store structure of ngrx-json-api, it is best to study the store-related interfaces in
https://github.com/abdulhaq-e/ngrx-json-api/blob/master/src/interfaces.ts. An example looks like:

```
{
  NgrxJsonApi: {
    zones: {
      'default': {
        isCreating: 0,
        isReading: 0,
        isUpdating: 0,
        isDeleting: 0,
        isApplying: 0,
        data: {
          person: {
            '53ad06b7-43c3-31a6-82a0-9da4d07be5f0': {
              id: '53ad06b7-43c3-31a6-82a0-9da4d07be5f0',
              type: 'person',
              attributes: {
                year: 0,
                name: 'Robert Downey Jr.',
                version: 0
              },
              relationships: {
                roles: {
                  links: {
                    self: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0/relationships/roles',
                    related: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0/roles'
                  }
                },
                history: {
                  links: {
                    self: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0/relationships/history',
                    related: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0/history'
                  }
                }
              },
              links: {
                self: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0'
              },
              persistedResource: {
                id: '53ad06b7-43c3-31a6-82a0-9da4d07be5f0',
                type: 'person',
                attributes: {
                  year: 0,
                  name: 'Robert Downey Jr.',
                  version: 0
                },
                relationships: {
                  roles: {
                    links: {
                      self: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0/relationships/roles',
                      related: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0/roles'
                    }
                  },
                  history: {
                    links: {
                      self: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0/relationships/history',
                      related: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0/history'
                    }
                  }
                },
                links: {
                  self: 'http://localhost:8080/api/person/53ad06b7-43c3-31a6-82a0-9da4d07be5f0'
                }
              },
              state: 'IN_SYNC',
              errors: [],
              loading: false
            },
            ....
          }
        },
        queries: {
          person_list: {
            loading: false,
            query: {
              queryId: 'person_list',
              type: 'person',
              params: {
                include: []
              }
            },
            errors: [],
            resultIds: [
              {
                type: 'person',
                id: '53ad06b7-43c3-31a6-82a0-9da4d07be5f0'
              },
              ...
            ],
            meta: {
              totalResourceCount: 9
            },
            links: {
              first: 'http://localhost:8080/api/person?page[limit]=10',
              last: 'http://localhost:8080/api/person?page[limit]=10'
            }
          }
        }
      }
    }
  },
  app: {
    notifications: {},
    current: {
      resourceType: 'person',
      created: false
    }
  }
}
```

There are three main structures:

- `data` holds the resources organized by type and id. Each resource is of type `StoreResource`.
  Next to the attributes, relationships, meta information and link information, `StoreResource` further
  carries a `state`, `error`, `loading` and `persistedResource`. The `state` specifies what kind of changes
  have been compared its counter-part on the server. Valid states are `NEW`, `IN_SYNC`, `CREATED`, `UPDATED`,
  `DELETED`, `NOT_LOADED`. Note that there is subtle difference between `NEW` and `CREATED`. `CREATED` is considered
  ready to be posted to the server, while `NEW` is not (see `NgrxJsonApiZoneService.apply(...)`).
- `queries` holds query parameters and results. Each query is of type `StoreQuery` and identified by a `queryId`. Queries 
  do not holds the result resources on their own, but rather refer to `data` using `resultIds`. Selectors 
  allow to denormalize the queries again (see the subsequent services section).
- `zones` allow to setup multiple, isolated instances of ngrx-json-api. This can be useful, for example,
  to isolate modifications while still being worked on from already persisted resources. The modification
  can then also independently be saved or discarded.
  
There are two situation where denormalization is provided by services (see below) to help working with the data structures:

- Getting result resources for a query.
- Getting related resources for a resource.  
  
  
## Data Structures

To get familiar with the available actions, have a look at https://github.com/abdulhaq-e/ngrx-json-api/blob/master/src/actions.ts.


## Services

There is one service available: `NgrxJsonApiService`. It holds two main methods both returning a `NgrxJsonApiZoneService` instance:

- `getZone(zoneId: string)`
- `getDefaultZone`

`NgrxJsonApiZoneService` holds utility methods to interact with the store: do selections and trigger actions:

- `putQuery(...)` puts a new query into the store (see example above). A query usually is fetched from the server. But
  it can also be executed locally with the contents of the store. The later is typically used together with `newResource(...)`. 
- `refreshQuery(queryId)` triggers a refresh of the query from the server.
- `removeQuery(queryId)` removed the query from the store. `compact` can subsequently garbage collect unused/unreferenced resources.
- `selectManyResults(queryId, denormalize)` gives an Observable for the specified query where an array of results is expected. 
  Denormalization allows to follow relationships by making use of `ManyResourceRelationship.reference` instead of
  `ManyResourceRelationship.data`.
- `selectOneResults(queryId, denormalize)` gives an Observable for the specified query where only a single result is expected. 
  Denormalization allows to follow the relationship by making use of `OneResourceRelationship.reference` instead of
   `OneResourceRelationship.data`.
- `selectStoreResource(id)` gives an Observable for the specified resource, identified by type and id.
- `selectStoreResources(ids)` gives an Observable for the specified resources, identified by type and id.
- `patchResource(...)` updates a resource in the store (or directly on the server if specified). Fields not specifies in the patch are taken from the existing resource.
- `newResource(...)` creates a new resource in the store. Each resource is not yet considered being created, meaning it is ignored by `apply()`.
- `postResource(...)`  marks a resource for creation (or directly creates it on the server if specified)
- `deleteResource(...)` marks a resource for deletion (or directly deletes it on the server if specified)
- `apply()` transmits and insertions, updates and deletions to the server.
- `clear()` deletes all queries and resources from the zone.
- `compact()` performs garbage collection by removing all resources from the zone that are not directly or indirectly references by a query.
- `addResourceErrors`, `removeResourceErrors()` and `setResourceErrors()` to modify the `errors` of a `StoreResource`


More information are available in https://github.com/abdulhaq-e/ngrx-json-api/blob/master/src/services.ts. The
actions are available in https://github.com/abdulhaq-e/ngrx-json-api/blob/master/src/actions.ts.


## Example application

For an example application have a look at https://github.com/crnk-project/crnk-example. It combines ngrx-json-api
with http://www.crnk.io as JSON API server implementation to gain a JSON API end-to-end example. 
[@crnk/angular-ngrx](https://www.npmjs.com/package/@crnk/angular-ngrx) is further used to facilitate binding
of Angular forms and tables to JSON API. More information can be found at http://www.crnk.io/releases/stable/documentation/#_angular_development_with_ngrx.


## Upgrading from v1.0

Upgrade from v1 is really easy; two simple steps:

  1. Remove `storeLocation` from `NgrxJsonApiModule` configuration. It's not needed anymore!
  2. Remove `NgrxJsonApiReducer` from `StoreModule` configuration.
  3. Import `HttpClientModule` in the application.

# THANKS :heart:

This library wouldn't exist without all the ngrx libraries along with the docs and tools provided with each. Thanks to Ngrx/[Store](https://github.com/ngrx/store),[Effects](https://github.com/ngrx/effects). Also, the basis of this library is [redux-json-api](https://github.com/dixieio/redux-json-api) and [devour](https://github.com/twg/devour) so a huge thanks to the developers of both these JSON API client libs.
