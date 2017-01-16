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
  ResourceIdentifier,
  Resource,
  Query,
  QueryError,
  StoreResource,
  ManyQueryResult,
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
          .let(this.getStoreResource$({ type: query.type, id: query.id }));
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

  private throwErrorOnQueryErrors$() {
    return (state$: Observable<StoreQuery>) => {
      return state$
		  .map(it => {
            if (it && it.errors && it.errors.length > 0) {
              let error = new QueryError();
              error.errors = it.errors;
              throw error;
            } else {
              return it;
            }
          });;
    };
  }

  public getResultIdentifiers$(queryId: string) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getResourceQuery$(queryId))
        .let(this.throwErrorOnQueryErrors$())
        .filter(it => it.resultIds != null)
        .map(it => it.resultIds);
    };
  }

  public getResults$(queryId: string) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getResourceQuery$(queryId))
        .let(this.throwErrorOnQueryErrors$())
		.switchMap(query => state$.let(this.getManyQueryResult$(query)))
  	    .filter(it => !_.isUndefined(it));
    };
  }

  public getStoreResource$(identifier: ResourceIdentifier) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreResourceOfType$(identifier.type))
        .map(resources => resources ? resources[identifier.id] : undefined);
    };
  }

  public getManyQueryResult$(query: StoreQuery) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      if (query && query.resultIds && query.resultIds.length == 0) {
        let queryResult: ManyQueryResult = {
          data : [],
          links : query.resultLinks,
          meta : query.resultMeta
        };
        return Observable.of(queryResult);
      }else if (query && query.resultIds) {
        let obs = query.resultIds.map(id => id ? state$.let(this.getStoreResource$(id)) : undefined);
        return Observable.zip(...obs).map(results => {
          let queryResult: ManyQueryResult = {
            data : results as Array<StoreResource>,
            links : query.resultLinks,
            meta : query.resultMeta
          };
          return queryResult;
        });
      } else {
        return Observable.of(undefined);
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
