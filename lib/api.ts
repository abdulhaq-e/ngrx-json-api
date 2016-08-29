import _ = require('lodash');

import { Injectable, Inject } from '@angular/core';

import {
  Headers,
  Http,
  Request,
  RequestOptions,
  RequestMethod,
  URLSearchParams
} from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


import { API_URL, RESOURCES_DEFINITIONS } from './module';
import {
  Query,
  ResourceDefinition
  } from './interfaces';


export interface Options {
  model?: string;
  id?: string;
}

@Injectable()
export class JsonApi {

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

  one(type: string, id: string) {
    this.urlBuilder.push({
      path: this.resourcePathFor(type, id)
    });
    return this;
  }

  all(type: string) {
    this.urlBuilder.push({
      path: this.collectionPathFor(type)
    });
    return this;
  }

  resetUrlBuilder() {
    this.urlBuilder = [];
  }

  buildPath() {
    return _.map(this.urlBuilder, 'path').join('/');
  }

  buildUrl() {
    return `${this.apiUrl}/${this.buildPath()}`;
  }

  get(params = {}) {

    let requestParams = new URLSearchParams();

    // TODO: implement param conversion.

    let requestOptionsArgs = {
      method: RequestMethod.Get,
      url: this.urlFor(),
      search: requestParams
    };

    this.resetUrlBuilder();

    return this.request(requestOptionsArgs);
  }

  post(payload) {
    let requestOptionsArgs = {
      method: RequestMethod.Post,
      url: this.urlFor(),
      body: JSON.stringify(payload)
    };

    this.resetUrlBuilder();

    return this.request(requestOptionsArgs);
  }

  patch(payload) {

    let requestOptionsArgs = {
      method: RequestMethod.Patch,
      url: this.urlFor(),
      body: JSON.stringify(payload)
    };

    this.resetUrlBuilder();

    return this.request(requestOptionsArgs);
  }

  destroy() {

    let requestOptions = {
      method: RequestMethod.Delete,
      url: this.urlFor()
    };

    this.resetUrlBuilder();

    return this.request(requestOptions);
  }

  request(requestOptionsArgs) {

    let requestOptions = new RequestOptions(requestOptionsArgs);

    let request = new Request(requestOptions.merge({
      headers: this.headers
    }));

    return this.http.request(request).map(res => res.json());
  }

  find(options: Query) {
    if (typeof options.id === 'undefined') {
      return this.findAll(options);
    }
    return this.one(options.type, options.id).get(options.params);
  }

  findAll(options: Query) {
    return this.all(options.type).get(options.params);
  }

  create(resourceType, payload) {
    return this.all(resourceType).post(payload);
  }

  update(resourceType, payload) {
    return this.one(resourceType, payload.id).patch(payload);
  }

  delete(options: Query) {
    return this.one(options.type, options.id).destroy();
  }

  collectionPathFor(type: string) {
    let collectionPath: string = _.find(this.definitions,
      {type: type}).collectionPath;
    return `${collectionPath}`;
  }

  resourcePathFor(resourceType: string, id: string) {
    let collectionPath = this.collectionPathFor(resourceType);
    return `${collectionPath}/${encodeURIComponent(id)}`;
  }

  collectionUrlFor(resourceType: string) {
    let collectionPath = this.collectionPathFor(resourceType);
    return `${this.apiUrl}/${collectionPath}`;
  }

  resourceUrlFor(resourceType: string, id) {
    let resourcePath = this.resourcePathFor(resourceType, id);
    return `${this.apiUrl}/${resourcePath}`;
  }

  urlFor(options: Options = {}) {
    if (!_.isUndefined(options.model) && !_.isUndefined(options.id)) {
      return this.resourceUrlFor(options.model, options.id);
    } else if (!_.isUndefined(options.model)) {
      return this.collectionUrlFor(options.model);
    } else {
      return this.buildUrl();
    }
  }

  pathFor(options: Options = {}) {
    if (!_.isUndefined(options.model) && !_.isUndefined(options.id)) {
      return this.resourcePathFor(options.model, options.id);
    } else if (!_.isUndefined(options.model)) {
      return this.collectionPathFor(options.model);
    } else {
      return this.buildPath();
    }
  }
}
