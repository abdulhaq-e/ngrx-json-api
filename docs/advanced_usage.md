## Advanced Usage

To follow this guide easily, it is a good idea to open [interfaces.ts](../src/interfaces.ts) and the interfaces defined in [service.ts](../src/service.ts);

### Fetching

Both fetching methods `findMany` and `findOne` take an object of type `FindOptions` which accepts three properties. The `query` property is required and takes a `Query` object. The other two properties are `boolean` and are optional.

#### Query object

The required `Query` object does not have an required properties but in general the `type` of the `Resource` and the `id` (for `findOne`) are passed. Other possible values are `queryId` and `queryParams` are discussed later. It is suffice to say that the `queryId` is auto generated if omitted.


#### Offline queries

The first optional property is `fromServer` which determines if the find request is sent to the server or not. If omitted requests will be sent to the server (default is `fromServer: true`).
```ts
let query = {
  type: 'Article',
  id: '1',
}
// offline fetching
let queryResults = this.ngrxService.findOne({query: query, fromServer: false});
// server fetching
let queryResults = this.ngrxService.findOne({query: query});
// similar to the above
let queryResults = this.ngrxService.findOne({query: query, fromServer: true});
```

#### Denormalization

The second optional property is `denormalize`. The default value is `false` but lets explain what happens if it's set to `true`. JSON API resources are highly normalized, so an example resource would be:
```js
let resource = {
  type: 'Article',
  id: '1',
  attributes: {
    title: 'Random Article'
  },
  relationships: {
    author: {
      type: 'Person',
      id: '2'
    }
  }
}
```

Now if someone requires to access the title (in a template perhaps), it can be easily done via: `resource.attributes.title`. What about the author attributes or worse the author friends. A horrible solution would be to ask the server for the resource of `type: Person` with `id: 2`. JSON API specs supports "included resources" which allows for the author resource to be included in the response, however, on the client side it is still a mess to obtain the author resource directly. 

Normalisation is great for database schemas, not so great for rendering data, **denormalization** to the rescue.

Assuming the author resource (`type=Person, id=2`) will be included (or already in the state), setting `denormalize: true` will allow the resource to obtain related resources directly. Denormalized resources will give the following result:

```js
let resource = {
  type: 'Article',
  id: '1',
  attributes: {
    title: 'Random Article'
  },
  relationships: {
    author: {
      type: 'Person',
      id: '2',
      reference: {
        type: 'Person',
        id: '2',
        attributes: {
          name: 'Random Author',
          age: '55'
        },
      }
    }
  }
}
```

Now it is easy to access the article's author name: `resource.relationships.author.reference.attributes.name`. Two **important** things to note here is that this has nothing to do with JSON API specs, the specs do not deal with how the data is stored or viewed. The second thing is; if you think the syntax is horrible and long then yes we agree and when we discuss `Pipes` we will simplify the syntax a lot.

### Query results

So a query was sent like this:
```ts
let query = {
  type: 'Article',
  id: '1',
}
let queryResults = this.ngrxService.findOne({query: query});
```

How are the results obtained? The above `queryResults` variable is an `Observable` of type `OneQueryResult` (for `findOne`) or `ManyQueryResult` (for `findMany`). So we need to subscribe to this `Observable` to access the results.
```ts
let results;
queryResults.subscribe(it => results = it);
```

`QueryResult` (the parent of `OneQueryResult` and `ManyQueryResult`) has some pretty cool properties. Most important is `data` which contains the actual resource(s).
```ts
let resource = results.data
```

Another property is `loading` which is a boolean indicating whether the query is still running or not. `errors` are errors returned from the server.

### Modifying data

NgrxJsonApi provides two approaches to modifying resources. One is to "queue" all the required requests (create, delete or update) then "apply" them when the users wants to do so. The other approach is to immediately send the request. 

The default behaviour is queuing all operations.

#### Creating resources

`postResource` allows to add a new resource to the store. 

```ts
let resource = {
  type: 'Article',
  id: '1',
  attributes: {
    title: 'Randomness'
  }
};
// create a resource locally
this.ngrxService.postResource({resource: resource})
// this is equivalent:
// this.ngrxService.postResource({resource: resource, toRemote: false})
```

Now we have created a `StoreResource`, its `state` will be "CREATED". We can perform other operations and once we want to apply them all we run:

```ts
this.ngrxService.apply()
```

If everything goes well, the `StoreResource` will have a `state` of `IN_SYNC`

The optional `toRemote` parameter lets you directly `POST` that resource to the server (see [basic usage](./docs/basic_usage)).


#### Patching resource

`patchResource` allows to patch a resource to the store. The passed attribute and relationship
values will be merged into the current resource.

Attributes and relationships not contained within
the patch remain unaffected.

```ts
let resource = {
  type: 'Article',
  id: '1',
  attributes: {
    title: 'Randomness'
  }
};
this.ngrxService.patchResource({resource: resource})
```

The optional `toRemote`  parameter lets you directly `PATCH` that resource to the server.

#### Deleting resources

`deleteResource` allows to mark a new resource for deletion in the store.

```ts
this.ngrxService.deleteResource({resourceId: {type: 'Article', id: '10'}})
```

The optional `toRemote` parameter lets  you directly `DELETE` that resource on the server as well.

Once the `DELETE` request succeeds, it will be removed from the store.

#### Bulk updates

`apply` performs an update on the server for all local, unsaved modifications (where the state is
not 'IN_SYNC'). Currently multiple requests are created. There is not yet any bulk request for JSON
API. In the future `apply` will further allow more fine-grained control of what can be updated.

### Updating error states

`addResourceErrors`, `removeResourceErrors` and `setResourceErrors` allow to update the errors of a
resource. This is useful when client-side validation must be applied.

### Lifecycle of a Query

`findOne` and `findMany` perform three tasks at once:

1. setup a new query.
2. select the state of that query.
3. remove the query again from the store when a subscription ends.

It is also possible to perform those three tasks separately with the `putQuery`, `selectManyResults`
or `selectOneResult` and  `removeQuery`. If you desire to keep queries longer in the store, for
example, to allow to quickly return to a previous page,  then you likely will have to fallback to
this methods.

### House Keeping

When `GET` are executed, the store gets filled up with fetched resources. The `clear` and `compact`
methods allow to either  entirely clear the store resp. remove all resources not referenced directly
or indirectly (relationships) by a query.

### Paging, Filtering, Sorting, Inclusion, Field Sets

`QueryParams` object hold by a query allows to specify various `GET` parameters:

```ts
const zone = this.ngrxService.getZone(NGRX_JSON_API_DEFAULT_ZONE);

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

const queryResult = this.selectManyResults(query.queryId);
...

### Pipes

TODO add documentation
