import * as _ from 'lodash';

import {
  HttpHeaders,
  HttpClient,
  HttpRequest,
  // required for building
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpSentEvent,
  HttpUserEvent,
} from '@angular/common/http';

import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import {
  Document,
  NgrxJsonApiConfig,
  OperationType,
  ResourceDefinition,
  Query,
  QueryParams,
} from './interfaces';
import {
  generateIncludedQueryParams,
  generateFieldsQueryParams,
  generateFilteringQueryParams,
  generateSortingQueryParams,
  generateQueryParams,
} from './utils';

export class NgrxJsonApi {
  public headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
  });
  public requestUrl: string;
  public definitions = this.config.resourceDefinitions;

  constructor(private http: HttpClient, public config: NgrxJsonApiConfig) {
    if (this.config.requestHeaders) {
      for (let name of _.keys(this.config.requestHeaders)) {
        const value = this.config.requestHeaders[name];
        this.headers = this.headers.set(name, value);
      }
    }
  }

  private urlBuilder(query: Query, operation: OperationType) {
    switch (operation) {
      case 'GET': {
        if (query.type && query.id) {
          return this.resourceUrlFor(query.type, query.id);
        } else if (query.type) {
          return this.collectionUrlFor(query.type);
        }
      }
      case 'DELETE': {
        if (query.type && query.id) {
          return this.resourceUrlFor(query.type, query.id);
        }
      }
      case 'PATCH': {
        if (query.type && query.id) {
          return this.resourceUrlFor(query.type, query.id);
        }
      }
      case 'POST': {
        return this.collectionUrlFor(query.type);
      }
    }
  }

  private collectionPathFor(type: string) {
    // assume that type == collectionPath if not configured otherwise
    let definition = _.find(this.definitions, { type: type });
    if (definition) {
      return `${definition.collectionPath}`;
    } else {
      return type;
    }
  }

  private collectionUrlFor(type: string) {
    let collectionPath = this.collectionPathFor(type);
    return `${this.config.apiUrl}/${collectionPath}`;
  }

  private resourcePathFor(type: string, id: string) {
    let collectionPath = this.collectionPathFor(type);
    return `${collectionPath}/${encodeURIComponent(id)}`;
  }

  private resourceUrlFor(type: string, id: string) {
    let resourcePath = this.resourcePathFor(type, id);
    return `${this.config.apiUrl}/${resourcePath}`;
  }

  public find(query: Query): Observable<any> {
    let _generateIncludedQueryParams = generateIncludedQueryParams;
    let _generateFilteringQueryParams = generateFilteringQueryParams;
    let _generateFieldsQueryParams = generateFieldsQueryParams;
    let _generateSortingQueryParams = generateSortingQueryParams;
    let _generateQueryParams = generateQueryParams;

    if (this.config.hasOwnProperty('urlBuilder')) {
      let urlBuilder = this.config.urlBuilder;

      if (urlBuilder.generateIncludedQueryParams) {
        _generateIncludedQueryParams = urlBuilder.generateIncludedQueryParams;
      }
      if (urlBuilder.generateFilteringQueryParams) {
        _generateFilteringQueryParams = urlBuilder.generateFilteringQueryParams;
      }
      if (urlBuilder.generateFieldsQueryParams) {
        _generateFieldsQueryParams = urlBuilder.generateFieldsQueryParams;
      }
      if (urlBuilder.generateSortingQueryParams) {
        _generateSortingQueryParams = urlBuilder.generateSortingQueryParams;
      }
      if (urlBuilder.generateQueryParams) {
        _generateQueryParams = urlBuilder.generateQueryParams;
      }
    }

    let queryParams = '';
    let includedParam = '';
    let filteringParams = '';
    let sortingParams = '';
    let fieldsParams = '';
    let offsetParams = '';
    let limitParams = '';

    if (typeof query === undefined) {
      return Observable.throw('Query not found');
    }

    if (query.hasOwnProperty('params') && !_.isEmpty(query.params)) {
      if (_.hasIn(query.params, 'include')) {
        includedParam = _generateIncludedQueryParams(query.params.include);
      }
      if (_.hasIn(query.params, 'filtering')) {
        filteringParams = _generateFilteringQueryParams(query.params.filtering);
      }
      if (_.hasIn(query.params, 'sorting')) {
        sortingParams = _generateSortingQueryParams(query.params.sorting);
      }
      if (_.hasIn(query.params, 'fields')) {
        fieldsParams = _generateFieldsQueryParams(query.params.fields);
      }
      if (_.hasIn(query.params, 'limit')) {
        limitParams = 'page[limit]=' + query.params.limit;
      }
      if (_.hasIn(query.params, 'offset')) {
        offsetParams = 'page[offset]=' + query.params.offset;
      }
    }
    queryParams = _generateQueryParams(
      includedParam,
      filteringParams,
      sortingParams,
      fieldsParams,
      offsetParams,
      limitParams
    );

    let requestOptions = {
      method: 'GET',
      url: this.urlBuilder(query, 'GET') + queryParams,
    };

    return this.request(requestOptions);
  }

  public create(query: Query, document: Document): Observable<any> {
    if (typeof query === undefined) {
      return Observable.throw('Query not found');
    }

    if (typeof document === undefined) {
      return Observable.throw('Data not found');
    }

    let requestOptions = {
      method: 'POST',
      url: this.urlBuilder(query, 'POST'),
      body: JSON.stringify({ data: document.data }),
    };

    return this.request(requestOptions);
  }

  public update(query: Query, document: Document): Observable<any> {
    if (typeof query === undefined) {
      return Observable.throw('Query not found');
    }

    if (typeof document === undefined) {
      return Observable.throw('Data not found');
    }
    let requestOptions = {
      method: 'PATCH',
      url: this.urlBuilder(query, 'PATCH'),
      body: JSON.stringify({ data: document.data }),
    };

    return this.request(requestOptions);
  }

  public delete(query: Query): Observable<any> {
    if (typeof query === undefined) {
      return Observable.throw('Query not found');
    }

    let requestOptions = {
      method: 'DELETE',
      url: this.urlBuilder(query, 'DELETE'),
    };

    return this.request(requestOptions);
  }

  private request(requestOptions: any) {
    let request: HttpRequest<any>;
    let newRequestOptions = {
      ...requestOptions,
      headers: this.headers,
      observe: 'response',
    };

    if (requestOptions.method === 'GET') {
      let { method, url, ...init } = newRequestOptions;
      return this.http.get(url, init);
    } else if (requestOptions.method === 'POST') {
      let { method, url, body, ...init } = newRequestOptions;
      return this.http.post(url, body, init);
    } else if (requestOptions.method === 'PATCH') {
      let { method, url, body, ...init } = newRequestOptions;
      return this.http.patch(url, body, init);
    } else if (requestOptions.method === 'DELETE') {
      let { method, url, ...init } = newRequestOptions;
      return this.http.delete(url, init);
    }
  }
}
