import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
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

import { Store } from '@ngrx/store';

import {
  NgrxJsonApiConfig,
  NgrxJsonApiStore,
  NgrxJsonApiStoreData,
  NgrxJsonApiStoreResources,
  NgrxJsonApiStoreQueries,
  Resource,
  ResourceIdentifier,
  ResourceError,
  Query,
  StoreResource,
  ManyQueryResult,
  OneQueryResult,
  StoreQuery,
} from './interfaces';
import {
  filterResources,
  denormaliseStoreResource,
  denormaliseStoreResources,
} from './utils';

export class NgrxJsonApiSelectors {
  constructor(public config: NgrxJsonApiConfig) {}

  public getNgrxJsonApiStore$(): (state$: Store<any>) => Observable<NgrxJsonApiStore> {
    return (state$: Store<any>): Observable<NgrxJsonApiStore> => {
      return state$.select('NgrxJsonApi').select('api');
    };
  }

  public getStoreData$(): (state$: Store<NgrxJsonApiStore>) => Observable<NgrxJsonApiStoreData> {
    return (state$: Store<NgrxJsonApiStore>): Observable<NgrxJsonApiStoreData> => {
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

  public queryStore$(query: Query) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      let selected$: Observable<any>;
      if (!query.type) {
        return state$.map(() => Observable.throw('Unknown query'));
      } else if (query.type && query.id) {
        selected$ = state$.let(
          this.getStoreResource$({ type: query.type, id: query.id })
        );
      } else {
        selected$ = state$
          .let(this.getStoreResourceOfType$(query.type))
          .combineLatest(
            state$.let(this.getStoreData$()),
            (
              resources: NgrxJsonApiStoreResources,
              storeData: NgrxJsonApiStoreData
            ) =>
              filterResources(
                resources,
                storeData,
                query,
                this.config.resourceDefinitions,
                this.config.filteringConfig
              )
          );
      }
      return selected$.distinctUntilChanged();
    };
  }

  public getStoreQueries$() {
    return (state$: Store<NgrxJsonApiStore>) => {
      return state$.select('queries');
    };
  }

  public getResourceQuery$(queryId: string) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreQueries$())
        .map(it => (it ? it[queryId] : undefined));
    };
  }

  public getStoreResource$(identifier: ResourceIdentifier) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreResourceOfType$(identifier.type))
        .map(
          resources =>
            (resources ? resources[identifier.id] : undefined) as StoreResource
        );
    };
  }

  public getManyResults$(queryId: string, denormalize: boolean) {
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

  public getOneResult$(queryId: string, denormalize: boolean) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$.map(state => {
        let storeQuery = state.queries[queryId];
        if (!storeQuery) {
          return undefined;
        }

        if (_.isEmpty(storeQuery.resultIds)) {
          let queryResult: ManyQueryResult = {
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
          return {
            ...storeQuery,
            data: result,
          };
        }
      });
    };
  }

  public getPersistedResource$(
    identifier: ResourceIdentifier
  ) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreResource$(identifier))
        .map(it => (it ? it.persistedResource : undefined));
    };
  }
}
