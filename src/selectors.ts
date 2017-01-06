// import * as _.find from 'lodash/map';
// import * as _.includes from 'lodash/includes';
// import * as _.reduce from 'lodash/reduce';
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
  QueryType,
  ResourceIdentifier,
  Resource,
  Query,
  StoreResource,
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
        .map(resources => resources[type]);
    };
  }

  public queryStore$(query: Query) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      let selected$;
      switch (query.queryType) {
        case 'getOne': {
          if (query.id && query.type) {
            selected$ = state$
              .let(this.getStoreResource$({
                id: query.id,
                type: query.type
              }))
              .map(it => it.resource);
          } else {
            selected$ = state$
              .let(this.getStoreResourceOfType$(query.type))
              .combineLatest(state$.let(this.getStoreData$()),
              (
                resources: NgrxJsonApiStoreResources,
                storeData: NgrxJsonApiStoreData
              ) => filterResources(
                resources,
                storeData,
                query,
                this.config.resourceDefinitions,
                this.config.filteringConfig,
                ))
              .map(filteredResources => {
                if (filteredResources.length === 0) {
                  return {};
                } else if (filteredResources.length === 1) {
                  return filteredResources[0].resource;
                } else {
                  throw new Error('Got more than one resource');
                }
              });
          }
          return selected$.distinctUntilChanged();
        }
        case 'getMany': {
          selected$ = state$.let(
            this.getStoreResourceOfType$(query.type)
          ).combineLatest(
            state$.let(this.getStoreData$()),
            (
              resources: NgrxJsonApiStoreResources,
              storeData: NgrxJsonApiStoreData
            ) => filterResources(
              resources,
              storeData,
              query,
              this.config.resourceDefinitions,
              this.config.filteringConfig,
            ).map(it => it.resource)
            );
          return selected$.distinctUntilChanged();
        }
        default:
          return Observable.throw('Unknown query');
      }
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
        .map(it => it[queryId]);
    };
  }

  public getResultIdentifiers$(queryId: string) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getResourceQuery$(queryId))
        .map(it => it.resultIds);
    };
  }

  public getResults$(queryId: string) {

    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getResultIdentifiers$(queryId))
        .mergeMap(ids => state$.let(this.getManyStoreResource$(ids)));
    };
  }

  public getStoreResource$(identifier: ResourceIdentifier) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreResourceOfType$(identifier.type))
        .map(resources => resources[identifier.id]);
    };
  }

  public getManyStoreResource$(identifiers: Array<ResourceIdentifier>) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      let obs = identifiers.map(id => state$.let(this.getStoreResource$(id)));
      return Observable.zip(...obs);
    };
  }

  public getResource$(identifier: ResourceIdentifier) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreResource$(identifier))
        .map(it => it ? it.resource : null);
    };
  }

  public getManyResource$(identifiers: Array<ResourceIdentifier>) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$.let(this.getManyStoreResource$(identifiers))
        .map(it => it.map(r => r.resource));
    };
  }

  public getPersistedResource$(store: Store<T>, identifier: ResourceIdentifier) {
    return (state$: Observable<NgrxJsonApiStore>) => {
      return state$
        .let(this.getStoreResource$(identifier))
        .map(it => it ? it.persistedResource : null);
    };
  }
}
