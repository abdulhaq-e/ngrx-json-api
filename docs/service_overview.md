## Services

There is one service available: `NgrxJsonApiService`. It holds methods for:

- `getZone(zoneId: string)` to obtain the zone with the specified `zoneId`.
- `getDefaultZone` to obtain the `default` zone.
- All methods of `NgrxJsonApiZoneService` for the `default` zone as short-cut to avoid `getDefaultZone()`.

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


More information are available in [services.ts](../src/services.ts).
