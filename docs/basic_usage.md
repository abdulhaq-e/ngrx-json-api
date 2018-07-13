
### Fetching resources

#### 1- Fetching a single resource:

```ts
/* let's find a single resource of type `Article` and id `1` */
let query = {
  type: 'Article',
  id: '1',
}
// to fetch this 'article' from the server:
let queryResults = this.ngrxService.findOne({query: query});
```

#### 2- Fetching a single resource offline:

No requests will be sent to the server, the resource will be fetched from the state (if found!). Default is server side fetching.

```ts
let query = {
  type: 'Article',
  id: '1',
}
let queryResults = this.ngrxService.findOne({query: query, fromServer: false});
```

#### 3- Fetching multiple resources

```ts
/* let's find all resources of type `Article` */
let query = {
  type: 'Article',
}
// to fetch all articles from the server:
let queryResults = this.ngrxService.findMany({query: query});
// to do the same thing without sending requests to the server:
let queryResults = this.ngrxService.findMany({query, fromServer: false});
```

### Creating/Updating/Deleting resources

The `toRemote` parameter which is set to `true` in all the examples below makes an immediate request to the server. The other approach is explained in [advanced usage](./advanced_usage.md).

#### Creating resources

```ts
let resource = {
  type: 'Article',
  id: '1',
  attributes: {
    title: 'Randomness'
  }
};
// create a resource by sending a POST request immediately
this.ngrxService.postResource({resource: resource, toRemote: true})
```

### Patching resources

```ts
let resource = {
  type: 'Article',
  id: '1',
  attributes: {
    title: 'Randomness'
  }
};
this.ngrxService.patchResource({resource: resource,
toRemote: true})
```

### Deleting resources

```ts
this.ngrxService.deleteResource({resourceId: {type: 'Article', id: '10'}, toRemote: true})
```
