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

import '@ngrx/core/add/operator/select';

import { compose } from '@ngrx/core/compose';
import { Store } from '@ngrx/store';

import {
  NgrxJsonApiConfig,
  NgrxJsonApiStore,
  NgrxJsonApiStoreData,
  NgrxJsonApiStoreResources,
  Resource,
  ResourceIdentifier,
  Query,
  StoreResource,
  ManyQueryResult,
  OneQueryResult,
  StoreQuery
} from './interfaces';
import {
  filterResources
} from './utils';


export class NgrxJsonApiSelectors<T> {

  public storeLocation: string = this.config.storeLocation;

  constructor(public config: NgrxJsonApiConfig) {
  }

  public getStoreData$() {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$.select('data');
    };
  }

  public getStoreResourceOfType$(type: string) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$.let(this.getStoreData$())
        .map(resources => resources ? resources[type] : undefined);
    };
  }

  public queryStore$(query: Query) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      let selected$;
      if (!query.type) {
        return state$.map(() => Observable.throw('Unknown query'));
      } else if (query.type && query.id) {
        selected$ = state$
          .let(this.getStoreResource$({type: query.type, id: query.id}));
      } else {
        selected$ = state$
          .let(this.getStoreResourceOfType$(query.type))
          .combineLatest(state$.let(this.getStoreData$()), (resources: NgrxJsonApiStoreResources,
            storeData: NgrxJsonApiStoreData) => filterResources(resources, storeData, query,
            this.config.resourceDefinitions, this.config.filteringConfig));
      }
      return selected$.distinctUntilChanged();
    };
  }

  public getStoreQueries$() {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$.select('queries');
    };
  }

  public getResourceQuery$(queryId: string) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreQueries$())
        .map(it => it ? it[queryId] : undefined);
    };
  }

  public getManyResults$(queryId: string) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getResourceQuery$(queryId))
        .switchMap(query => state$.let(this.getManyQueryResult$(query)));
    };
  }

  public getOneResult$(queryId: string) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getResourceQuery$(queryId))
        .switchMap(query => state$.let(this.getOneQueryResult$(query)));
    };
  }

  public getStoreResource$(identifier: ResourceIdentifier) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreResourceOfType$(identifier.type))
        .map(resources => (resources ? resources[identifier.id] : undefined) as StoreResource);
    };
  }

  public getManyQueryResult$(storeQuery: StoreQuery) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      if (!storeQuery) {
        return Observable.of(undefined);
      }

      if (_.isEmpty(storeQuery.resultIds)) {
        let queryResult: ManyQueryResult = Object.assign({}, storeQuery, {
          data: _.isUndefined(storeQuery.resultIds) ? undefined : []
        });
        return Observable.of(queryResult);
      } else {
        let obs = storeQuery.resultIds.map(id =>
          id ? state$.let(this.getStoreResource$(id)) : undefined);
        return Observable.zip(...obs).map(results => {
          let queryResult: ManyQueryResult = Object.assign({}, storeQuery, {
            data: results as Array<StoreResource>
          });
          return queryResult;
        });
      }
    };
  }

  public getOneQueryResult$(storeQuery: StoreQuery) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      if (!storeQuery) {
        return Observable.of(undefined);
      }

      if (_.isEmpty(storeQuery.resultIds)) {
        let queryResult: ManyQueryResult = Object.assign({}, storeQuery, {
          data: _.isUndefined(storeQuery.resultIds) ? undefined : null
        });
        return Observable.of(queryResult);
      } else {
        if (storeQuery.resultIds.length >= 2) {
          throw new Error('expected single result for query ' + storeQuery.query.queryId);
        }
        let id = storeQuery.resultIds[0];
        return state$.let(this.getStoreResource$(id)).map(result => {
          let queryResult: OneQueryResult = Object.assign({}, storeQuery, {
            data: result
          });
          return queryResult;
        });
      }
    };
  }

  public getPersistedResource$(store: Store<T>, identifier: ResourceIdentifier) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreResource$(identifier))
        .map(it => it ? it.persistedResource : undefined);
    };
  }
}
