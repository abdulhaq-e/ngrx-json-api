
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

There are two situation where denormalization is provided by services (see [Service Overview](./service_overview.md) ) to help working with these data structures:

- Getting result resources for a query.
- Getting related resources for a resource.  
