// import * as _.map from 'lodash/map';
// import * as _.find from 'lodash/find';
// import * as _.isEmpty from 'lodash/isEmpty';
// import * as _.hasIn from 'lodash/hasIn';

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


import { API_URL, RESOURCES_DEFINITIONS } from './module';
import {
    ResourceQuery,
    QueryParams,
    ResourceDefinition
} from './interfaces';

export class NgrxJsonApi {

    public headers: Headers = new Headers({
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
    });
    public models: { [key: string]: any };
    public urlBuilder = [];

    constructor(
        private http: Http,
        private apiUrl: string,
        private definitions: Array<ResourceDefinition>
    ) {
    }

    public create(payload) {
        return this.all({ type: payload.type }).post(payload);
    }

    public delete(query: ResourceQuery) {
        return this.one(query).destroy();
    }

    public find(query: ResourceQuery) {
        if (typeof query.id === 'undefined') {
            return this.findAll(query);
        }
        return this.one(query).get(query.params);
    }

    public update(payload) {
        return this.one({ type: payload.type, id: payload.id }).patch(payload);
    }

    private all(query: ResourceQuery) {
        this.urlBuilder.push({
            path: this.collectionPathFor(query.type)
        });
        return this;
    }

    private buildPath() {
        return _.map(this.urlBuilder, 'path').join('/');
    }

    private buildUrl() {
        return `${this.apiUrl}/${this.buildPath()}`;
    }

    private collectionPathFor(type: string) {
        let collectionPath: string = _.find(this.definitions,
            { type: type }).collectionPath;
        return `${collectionPath}`;
    }

    private collectionUrlFor(type: string) {
        let collectionPath = this.collectionPathFor(type);
        return `${this.apiUrl}/${collectionPath}`;
    }

    private destroy() {

        let requestOptions = {
            method: RequestMethod.Delete,
            url: this.buildUrl()
        };

        this.resetUrlBuilder();

        return this.request(requestOptions);
    }

    private findAll(query: ResourceQuery) {
        return this.all(query).get(query.params);
    }

    private get(params: QueryParams = {}) {

        let requestParams = new URLSearchParams();

        if (!_.isEmpty(params)) {
            if (_.hasIn(params, 'include')) {
                requestParams.append('include', params.include.join(','));
            }

            // TODO: refactor, extremely ugly!

            // let filters = [params.filtering[0].value];
            //
            // params.filtering.slice(1).forEach(f => {
            //   filters.push('[' + f.type + ']' + '=' + f.value)
            // })
            // requestParams.append(
            //   'filter' + '[' + params.filtering[0].type + ']', filters.join(','));

            // the code below doesn't satisfy JSON API recommendation:
            if (_.hasIn(params, 'filtering')) {
                params.filtering.forEach(f => {
                    requestParams.append('filter' + '[' + f.type + ']', f.value);
                });
            }
        }

        // TODO: implement param conversion.

        let requestOptionsArgs = {
            method: RequestMethod.Get,
            url: this.buildUrl(),
            search: requestParams
        };

        this.resetUrlBuilder();

        return this.request(requestOptionsArgs);
    }

    private one(query: ResourceQuery) {
        this.urlBuilder.push({
            path: this.resourcePathFor(query.type, query.id)
        });
        return this;
    }

    private patch(payload) {

        let requestOptionsArgs = {
            method: RequestMethod.Patch,
            url: this.buildUrl(),
            body: JSON.stringify(payload)
        };

        this.resetUrlBuilder();

        return this.request(requestOptionsArgs);
    }

    private post(payload) {
        let requestOptionsArgs = {
            method: RequestMethod.Post,
            url: this.buildUrl(),
            body: JSON.stringify(payload)
        };

        this.resetUrlBuilder();

        return this.request(requestOptionsArgs);
    }

    private resetUrlBuilder() {
        this.urlBuilder = [];
    }

    private resourcePathFor(type: string, id: string) {
        let collectionPath = this.collectionPathFor(type);
        return `${collectionPath}/${encodeURIComponent(id)}`;
    }

    private resourceUrlFor(type: string, id) {
        let resourcePath = this.resourcePathFor(type, id);
        return `${this.apiUrl}/${resourcePath}`;
    }

    private request(requestOptionsArgs) {

        let requestOptions = new RequestOptions(requestOptionsArgs);

        let request = new Request(requestOptions.merge({
            headers: this.headers
        }));

        return this.http.request(request);
    }
}
