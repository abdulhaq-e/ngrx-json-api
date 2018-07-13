## Store Structure

It is advisable to read this guide while having [interfaces.ts](../src/interfaces.ts) opened.

ngrx-json-api structures its store into zones, each representing an isolated instance of ngrx-json-api:

```
{
  NgrxJsonApi: {
    zones: {
      'default': {
         ...
      }
    }
  }
}
```

By default services and actions make use of the `default` zone. But applications are free to introduce additional zones;
for example to isolate modifications to a resource while still being worked on from an editor screen. One main advantage of 
this design is that each zone can be independently synchronized with the server or discarded.

`NgrxJsonApiZone` then consists of a number of properties, the main two are `data` and `queries`.

```js
let store = {
  data: {}
  queries: {}
  // ...
}
```

`data` stores the resources indexed by `type` 
and `id` and `queries` stores the queries used to obtain the resources (local and remote queries) indexed by `queryId`.

```js
data: {
  movies: {
    1: {}, // StoreResource
    2: {} // StoreResource
  },
  articles: {
    10: {}, // StoreResource
    52: {} // StoreResource
  }
}
```

```js
queries: {
  12: {}, // StoreQuery
  43: {}, // StoreQuery
  6778: {} // StoreQuery
}
```

As can be seen from above, what is indexed by `type` and `id` is actually a `StoreResource` which can be thought of as a normal JSON API Resource on steroids. In addition to the typical properties of a JSON API Resource (id, type, attributes, relationships), it has 5 other properties:

```js
movies: {
  1: {
    id: '1',
    type: 'Movie',
    attributes: {},
    relationships: {}, // cool stuff below
    state: 'IN_SYNC',
    persistedResource: {},
    loading: 'GET',
    errors: [],
    hasTemporaryId: false
  }
}
```

  - `persistedResource` is the `Resource` as it is on the server.
  - `state` is the state of this `Resource`, "IN_SYNC" means it is exactly the same as the `persistedResource` (it has just been obtained from the server OR it has been created locally and on the server OR it has been modified and the modifications were successfully sent to the server). Other possible values indicate that the resource has been created/deleted/updated **only locally**. Another possible value for `state` is "NOT_LOADED" which indicated that all we know about this resource is its `type` and `id` (it probably came from another resource `relationships`).
  - `errors` are server side errors returned while creating/updating/deleting the resource.
  - `loading` gives the type of operation being run on this resource or `false` for no operation.
  - `hasTemporaryId`
  
A `StoreQuery` (which is indexed by `queryId` under `queries`) looks like this:

```js
queries: {
  437: {
    query: {
      type: 'Movie',
      queryId: 437
    },
    loading: false,
    resultIds: [{type: 'Movie', id: 10}, {type: 'Movie', id: 20}, {type: 'Movie', id: 53}],
    meta: {},
    links: {},
    errors: []
  }
}
```

  - `query` is a `Query` object (see advanced usage)
  - `loading` boolean indicating whether the query is being processed or not.
  - `resultIds` an array containing the `type` and `id` of the found resources.
  - `meta` and `links` returned in the response.
  - `errors`: JSON API errors or HTTP errors that occurred while performing the query.

Finally, the store has 5 other properties that are operation counters, i.e: `isCreating: 3` means 3 creation operations are taking place.

An example of an `NgrxJsonApiStore` is given below:

```js
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
      }
    }
  }
}
```
