
## Actions

In redux, actions are sent with a payload which triggers a reducer function which modifies the state depending on the action type and the payload.

The following actions are used in NgrxJsonApi:

| Action Type                   | Description   |
| ----------------------------- | ------------- |
| API_CREATE_INIT               | Issues a `POST` request for a resource.                                                                                                |
| API_CREATE_SUCCESS            | Upon success completion of a `POST` request.                                                                                           |
| API_CREATE_FAIL               | Upon a failure of a `POST` request.                                                                                                    |
| API_GET_INIT                 | Issues a `GET` request for a resource.                                                                                                 |
| API_GET_SUCCESS              | Upon success completion of a `GET` request.                                                                                            |
| API_GET_FAIL                 | Upon a failure of a `GET` request.                                                                                                     |
| API_UPDATE_INIT               | Issues a `PATCH` request for a resource.                                                                                               |
| API_UPDATE_SUCCESS            | Upon success completion of a `PATCH` request.                                                                                          |
| API_UPDATE_FAIL               | Upon a failure of a `PATCH` request.                                                                                                   |
| API_DELETE_INIT               | Issues a `DELETE` request for a resource.                                                                                              |
| API_DELETE_SUCCESS            | Upon success completion of a `DELETE` request.                                                                                         |
| API_DELETE_FAIL               | Upon a failure of a `DELETE` request.                                                                                                  |
| API_APPLY_INIT                | Initiates the appropriate API_X_INIT action for all pending local modifications except resources in state `NEW`.                                                       |
| API_APPLY_SUCCESS             | Upon success completion of all requested modifications.                                                                                |
| API_APPLY_FAIL                | Upon failure a at least one requested modification.                                                                                    |
| API_ROLLBACK:                 | Reverts all local changes to resources in the store.                                                                                   |
| API_QUERY_REFRESH             | Updates the result of a query by initiating a API_READ_INIT.                                                                           |
| LOCAL_QUERY_INIT              | Sets up a query that is run locally based on the contents of the store.                                                                |
| LOCAL_QUERY_SUCCESS           | Triggered when a local query was successfully updated in the store.                                                                    |
| LOCAL_QUERY_FAIL              | Triggered when a local query failed.                                                                                                   |
| DELETE_STORE_RESOURCE         | Marks a resource in the store for deletion. Does not trigger an update to the server.                                                  |
| PATCH_STORE_RESOURCE          | Patches a resource in the store by merging the provided values with the ones from the store. Does not trigger an update to the server. |
| POST_STORE_RESOURCE           | Adds a new resource to the store. Does not trigger an update to the server. The resource then carries the state `CREATED`.           |
| NEW_STORE_RESOURCE            | Adds a new resource to the store that is not yet considered being ready to be posted to the server. The resource then carries the state `NEW` rather than `CREATED`. | 
| MODIFY_STORE_RESOURCE_ERRORS  | Modifies the errors of a resource in the store. Use for client side validation.                                                        |
| REMOVE_QUERY                  | Removes a query from the store.                                                                                                        |
| COMPACT_STORE                 | Removes all resources from the store that are not directly or indirectly (relationships) references from a query                       |
| CLEAR_STORE                   | Removes all the contents from the store                                              

More information are available in [actions.ts](../src/actions.ts).
