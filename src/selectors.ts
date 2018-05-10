import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/zip';

import { filter, map } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';

import {
  ManyQueryResult,
  NGRX_JSON_API_DEFAULT_ZONE,
  NgrxJsonApiState,
  NgrxJsonApiStore,
  NgrxJsonApiStoreResources,
  NgrxJsonApiZone,
  OneQueryResult,
  Resource,
  ResourceIdentifier,
  NgrxJsonApiStoreQueries,
  StoreResource,
  NgrxJsonApiStoreData,
  StoreQuery,
} from './interfaces';
import { denormaliseStoreResource, denormaliseStoreResources } from './utils';

export function selectNgrxJson() {
  return (state$: Observable<any>) =>
    (<Store<any>>state$).pipe(
      select('NgrxJsonApi'),
      map((it: any) => it as NgrxJsonApiState),
      filter((it: any) => !_.isUndefined(it))
    );
}

export function selectNgrxJsonApiDefaultZone() {
  return selectNgrxJsonApiZone(NGRX_JSON_API_DEFAULT_ZONE);
}

export function selectNgrxJsonApiZone(zoneId: string) {
  return (state$: Observable<any>) =>
    (<Store<any>>state$)
      .let(selectNgrxJson())
      .map((it: any) => it.zones[zoneId] as NgrxJsonApiZone);
}

export function getNgrxJsonApiZone(state: any, zoneId: string) {
  return state['NgrxJsonApi']['zones'][zoneId] as NgrxJsonApiZone;
}

export function selectStoreQuery(
  queryId: string
): (state: Observable<NgrxJsonApiStore>) => Observable<StoreQuery> {
  return (state$: Observable<NgrxJsonApiStore>) => {
    return state$.map(state => state.queries[queryId]);
  };
}

export function selectStoreResourcesOfType(
  type: string
): (
  state: Observable<NgrxJsonApiStore>
) => Observable<NgrxJsonApiStoreResources> {
  return (state$: Observable<NgrxJsonApiStore>) => {
    return state$
      .map(state => state.data)
      .map(data => (data ? data[type] : undefined));
  };
}

export function selectStoreResource(identifier: ResourceIdentifier) {
  return (state$: Observable<NgrxJsonApiStore>) => {
    return state$
      .let(selectStoreResourcesOfType(identifier.type))
      .map(
        resources =>
          (resources ? resources[identifier.id] : undefined) as StoreResource
      );
  };
}

export function selectStoreResources(identifiers: ResourceIdentifier[]) {
  return (state$: Observable<NgrxJsonApiStore>) => {
    return state$.pipe(
      map(state => state.data),
      map(data => {
        return identifiers.map(identifier => {
          if (!data || !data[identifier.type]) {
            return undefined;
          }
          return data[identifier.type][identifier.id] as StoreResource;
        });
      })
    );
  };
}

export function selectManyQueryResult(
  queryId: string,
  denormalize?: boolean
): (state: Observable<NgrxJsonApiStore>) => Observable<ManyQueryResult> {
  return (state$: Observable<NgrxJsonApiStore>) => {
    return state$.map(state => {
      let storeQuery = state.queries[queryId];
      if (!storeQuery) {
        return undefined;
      }

      if (_.isEmpty(storeQuery.resultIds)) {
        let queryResult: ManyQueryResult = {
          ...storeQuery,
          data: _.isUndefined(storeQuery.resultIds) ? undefined : [],
        };
        return queryResult;
      } else {
        let results = storeQuery.resultIds.map(
          id => (state.data[id.type] ? state.data[id.type][id.id] : undefined)
        );
        if (denormalize) {
          results = denormaliseStoreResources(results, state.data);
        }
        return {
          ...storeQuery,
          data: results as Array<StoreResource>,
        };
      }
    });
  };
}

export function selectOneQueryResult(
  queryId: string,
  denormalize?: boolean
): (state: Observable<NgrxJsonApiStore>) => Observable<OneQueryResult> {
  return (state$: Observable<NgrxJsonApiStore>) => {
    return state$.map(state => {
      let storeQuery = state.queries[queryId];
      if (!storeQuery) {
        return undefined;
      }

      if (_.isEmpty(storeQuery.resultIds)) {
        let queryResult: OneQueryResult = {
          ...storeQuery,
          data: _.isUndefined(storeQuery.resultIds) ? undefined : null,
        };
        return queryResult;
      } else {
        if (storeQuery.resultIds.length >= 2) {
          throw new Error(
            'expected single result for query ' + storeQuery.query.queryId
          );
        }

        let resultId = storeQuery.resultIds[0];
        let result = state.data[resultId.type]
          ? state.data[resultId.type][resultId.id]
          : undefined;
        if (denormalize) {
          result = denormaliseStoreResource(result, state.data);
        }
        const queryResult: OneQueryResult = {
          ...storeQuery,
          data: result,
        };
        return queryResult;
      }
    });
  };
}

/**
 * deprecated, to not use any longer
 */
export function getNgrxJsonApiStore(state$: Observable<any>): Observable<any> {
  return state$.let(selectNgrxJsonApiDefaultZone());
}

/**
 * deprecated, to not use any longer
 */
export class NgrxJsonApiSelectors {
  constructor() {}

  public getNgrxJsonApiStore$(): (state$: Observable<any>) => Observable<any> {
    return (state$: Observable<any>): Observable<NgrxJsonApiStore> => {
      return state$.let(selectNgrxJsonApiDefaultZone());
    };
  }

  public getStoreData$(): (
    state$: Store<NgrxJsonApiStore>
  ) => Observable<NgrxJsonApiStoreData> {
    return (
      state$: Store<NgrxJsonApiStore>
    ): Observable<NgrxJsonApiStoreData> => {
      return state$.select('data');
    };
  }

  public getStoreResourceOfType$(type: string) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreData$())
        .map(resources => (resources ? resources[type] : undefined));
    };
  }

  public getStoreQueries$() {
    return (state$: Store<NgrxJsonApiStore>) => {
      return state$.select('queries');
    };
  }

  public getResourceQuery$(queryId: string) {
    return selectStoreQuery(queryId);
  }

  public getStoreResource$(identifier: ResourceIdentifier) {
    return selectStoreResource(identifier);
  }

  public getManyResults$(queryId: string, denormalize: boolean) {
    return selectManyQueryResult(queryId, denormalize);
  }

  public getOneResult$(queryId: string, denormalize: boolean) {
    return selectOneQueryResult(queryId, denormalize);
  }

  public getPersistedResource$(identifier: ResourceIdentifier) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreResource$(identifier))
        .map(it => (it ? it.persistedResource : undefined));
    };
  }
}
