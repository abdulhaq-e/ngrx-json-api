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

import { API_URL, RESOURCES_DEFINTION } from './ng2';

import { JsonApiQuery } from './interfaces';


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
  public builderStack = [];
  public models: { [key: string]: any };

  constructor(
    private http: Http,
    @Inject(API_URL) private apiUrl,
    @Inject(RESOURCES_DEFINTION) private definition
  ) {
  }

  one(resourceType: string, id: string) {
    this.builderStack.push({
      path: this.resourcePathFor(resourceType, id)
    });
    return this;
  }

  all(resourceType: string) {
    this.builderStack.push({
      path: this.collectionPathFor(resourceType)
    });
    return this;
  }

  resetBuilder() {
    this.builderStack = [];
  }

  buildPath() {
    return _.map(this.builderStack, 'path').join('/');
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

    this.resetBuilder();

    return this.request(requestOptionsArgs);
  }

  post(payload) {
    let lastRequest = _.chain(this.builderStack).last();
    // console.log(lastRequest);

    let requestOptionsArgs = {
      method: RequestMethod.Post,
      url: this.urlFor(),
      // model: lastRequest.get('model').value(),
      body: JSON.stringify(payload)
    };

    this.resetBuilder();

    return this.request(requestOptionsArgs);
  }

  patch(payload) {
    let lastRequest = _.chain(this.builderStack).last();

    let requestOptionsArgs = {
      method: RequestMethod.Patch,
      url: this.urlFor(),
      body: JSON.stringify(payload)
    };

    this.resetBuilder();

    return this.request(requestOptionsArgs);
  }

  destroy() {
    let lastRequest = _.chain(this.builderStack).last();

    let requestOptions = {
      method: RequestMethod.Delete,
      url: this.urlFor()
    };

    this.resetBuilder();

    return this.request(requestOptions);
  }

  request(requestOptionsArgs) {

    let requestOptions = new RequestOptions(requestOptionsArgs);

    let request = new Request(requestOptions.merge({
      headers: this.headers
    }));

    return this.http.request(request).map(res => res.json());
  }

  find(options: JsonApiQuery) {
    if (typeof options.id === 'undefined') {
      return this.findAll(options);
    }
    return this.one(options.resourceType, options.id).get(options.params);
  }

  findAll(options: JsonApiQuery) {
    return this.all(options.resourceType).get(options.params);
  }

  create(resourceType, payload) {
    return this.all(resourceType).post(payload);
  }

  update(resourceType, payload) {
    return this.one(resourceType, payload.id).patch(payload);
  }

  delete(options: JsonApiQuery) {
    return this.one(options.resourceType, options.id).destroy();
  }

  collectionPathFor(resourceType: string) {
    let collectionPath = _.find(this.definition,
      {type: resourceType}).collectionPath;
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
