

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

4- Import `NgrxJsonApiService` inside the component and use one of its methods to interact with this library.

For example:

```ts
export class MyComponent {
  constructor(private ngrxJsonApiService: NgrxJsonApiService<AppState>) {}
  // to create a resource
  this.ngrxJsonApiService.create({
    jsonApiData: {
      data: {
        id: '1',
        type: 'Person',
        attributes: {
          name: 'John Smith',
          age: 50
        }          
      }
    },
    query: {
      type: 'Person',
      queryType: 'create'
    }
    });
    // to read a resource from the api
    this.ngrxJsonApiService.read({
      query: {
        type: 'Person',
        id: '1',
        queryType: 'getOne'
      }
    });
    // if we wanted to read all resources of type Person
    this.ngrxJsonApiService.read({
      query: {
        type: 'Person',
        queryType: 'getMany'
      }
    });
    // to delete a single resource
    this.ngrxJsonApiService.delete({
      query: {
        type: 'Person',
        id: '1',
        queryType: 'deleteOne'
      }
    });
    // similarly, to delete from the store (no request to api)
    this.ngrxJsonApiService.deleteFromState({
      query: {
        type: 'Person',
        id: '1',
      }
    });
    // or all resources can be deleted
    this.ngrxJsonApiService.deleteFromState({
      query: {
        type: 'Person',
      }
    });
    // to update a single resource
    this.ngrxJsonApiService.update({
      jsonApiData: {
        data: {
          id: '1',
          type: 'Person',
          attributes: {
            name: 'John Smith',
            age: 50
          }          
        }
      },
      query: {
        type: 'Person',
        queryType: 'update'
      }
    });
}
```

Now all we've done is interact with API using the instance of `NgrxJsonApiService` which will be responsible for updating the store after a response arrives. Using the same service we fetch data from the store to put in the view. This is done using selectors. Building on the above example and assuming the instance is called `ngrxJsonApiService`:

```ts
// to select a single resource:
this.ngrxJsonApiService.select$({
  query: {
    queryType: 'getOne',
    type: 'Person'
    id: '1'
  }
});

// to select all resources of type Person:
this.ngrxJsonApiService.select$({
  query: {
    queryType: 'getMany',
    type: 'Person'
  }
});

// to select all resources:
this.ngrxJsonApiService.select$({
  query: {
    queryType: 'getAll'
  }
});
```

Most of the time, when selecting all resources or resources of one type (`getMany`), filtering is used. Filtering is explained in the docs.

### Documentation

* [Filters](./docs/filters.md)
