import * as _ from 'lodash';

import {
    Headers,
    Http,
    Request,
    RequestOptions,
    Response,
    RequestMethod,
    URLSearchParams
} from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import {
    Document,
    NgrxJsonApiConfig,
    Payload,
    ResourceDefinition,
    ResourceQuery,
    QueryParams,
    QueryType,
} from './interfaces';
import {
    generateIncludedQueryParams,
    generateFieldsQueryParams,
    generateFilteringQueryParams,
    generateSortingQueryParams,
    generateQueryParams
} from './utils';

export class NgrxJsonApi {

    public headers: Headers = new Headers({
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
    });
    public requestUrl: string;
    public apiUrl = this.config.apiUrl;
    public definitions = this.config.resourceDefinitions;

    constructor(
        private http: Http,
        public config: NgrxJsonApiConfig
    ) {}

    private urlBuilder(query: ResourceQuery) {
        switch (query.queryType) {
            case 'getOne':
            case 'deleteOne':
            case 'update':
                return this.resourceUrlFor(query.type, query.id);
            case 'getMany':
            case 'create':
                return this.collectionUrlFor(query.type);
        }

    }

    private collectionPathFor(type: string) {
        // assume that type == collectionPath if not configured otherwise
        let definition = _.find(this.definitions,{ type: type })
        if(definition){
            return `${definition.collectionPath}`;
        }else{
            return type;
        }
    }

    private collectionUrlFor(type: string) {
        let collectionPath = this.collectionPathFor(type);
        return `${this.apiUrl}/${collectionPath}`;
    }

    private resourcePathFor(type: string, id: string) {
        let collectionPath = this.collectionPathFor(type);
        return `${collectionPath}/${encodeURIComponent(id)}`;
    }

    private resourceUrlFor(type: string, id: string) {
        let resourcePath = this.resourcePathFor(type, id);
        return `${this.apiUrl}/${resourcePath}`;
    }

    public find(payload: Payload) {

        let query = payload.query;
        let queryParams = '';
        let includedParam: string = '';
        let filteringParams: string = '';
        let sortingParams: string = '';
        let fieldsParams: string = '';

        if (typeof query === undefined) {
            return Observable.throw('Query not found');
        }

        if (query.hasOwnProperty('params') && !_.isEmpty(query.params)) {
            if (_.hasIn(query.params, 'include')) {
                includedParam = generateIncludedQueryParams(query.params.include);
            }
            if (_.hasIn(query.params, 'filtering')) {
                filteringParams = generateFilteringQueryParams(query.params.filtering);
            }
            if (_.hasIn(query.params, 'filtering')) {
              sortingParams = generateSortingQueryParams(query.params.sorting);
            }
            if (_.hasIn(query.params, 'fields')) {
              fieldsParams = generateFieldsQueryParams(query.params.fields);
            }
        }

        queryParams = generateQueryParams(includedParam, filteringParams, sortingParams, fieldsParams);

        let requestOptionsArgs = {
            method: RequestMethod.Get,
            url: this.urlBuilder(query) + queryParams,
        };

        return this.request(requestOptionsArgs);
    }

    public create(payload: Payload) {

        let query = payload.query
        let document = payload.jsonApiData;

        if (typeof query === undefined) {
            return Observable.throw('Query not found');
        }

        if (typeof document === undefined) {
            return Observable.throw('Query not found');
        }

        let requestOptionsArgs = {
            method: RequestMethod.Post,
            url: this.urlBuilder(query),
            body: JSON.stringify({ data: document.data })
        };

        return this.request(requestOptionsArgs);
    }

    public update(payload: Payload) {

        let query = payload.query;
        let document = payload.jsonApiData;

        if (typeof query === undefined) {
            return Observable.throw('Query not found');
        }

        if (typeof document === undefined) {
            return Observable.throw('Query not found');
        }
        let requestOptionsArgs = {
            method: RequestMethod.Patch,
            url: this.urlBuilder(query),
            body: JSON.stringify({ data: document.data })
        };

        return this.request(requestOptionsArgs);
    }


    public delete(payload: Payload) {

        let query = payload.query;

        if (typeof query === undefined) {
            return Observable.throw('Query not found');
        }

        let requestOptions = {
            method: RequestMethod.Delete,
            url: this.urlBuilder(query)
        };

        return this.request(requestOptions);
    }


    private request(requestOptionsArgs) {

        let requestOptions = new RequestOptions(requestOptionsArgs);

        let request = new Request(requestOptions.merge({
            headers: this.headers
        }));

        return this.http.request(request);
    }
}
