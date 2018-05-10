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
  
