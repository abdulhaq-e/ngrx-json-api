import {
  async,
  inject,
  fakeAsync,
  tick,
  TestBed
} from '@angular/core/testing';

import { MockBackend } from '@angular/http/testing';
import {
  Http,
  ConnectionBackend,
  BaseRequestOptions,
  Response,
  ResponseOptions
} from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { NgrxJsonApi } from '../src/api';
import {
  NGRX_JSON_API_CONFIG,
  apiFactory,
} from '../src/module';
import {
  NgrxJsonApiConfig,
  ResourceDefinition
} from '../src/interfaces';

describe('ngrx json api', () => {
  let jsonapi;
  let resourcesDefinitions: Array<ResourceDefinition> = [
    {
      type: 'Post',
      collectionPath: 'posts',
    },
    {
      type: 'Person',
      collectionPath: 'people',
    }
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http, useFactory: (backend: ConnectionBackend,
            defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }, deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: NgrxJsonApi,
          useFactory: apiFactory,
          deps: [Http, NGRX_JSON_API_CONFIG]
        },
        {
          provide: NGRX_JSON_API_CONFIG,
          useValue: {
            apiUrl: 'myapi.com',
            resourceDefinitions: resourcesDefinitions
          }
        },
      ]
    });
  });
  //
  beforeEach(inject([NgrxJsonApi], (api) => {
    jsonapi = api;
  }));

  it('should have the api url', () => {
    expect(jsonapi.apiUrl).toEqual('myapi.com');
  });

  describe('urlBuilder', () => {
    it('should build url for getOne queries', () => {
      let query = {
        queryType: 'getOne',
        type: 'Post',
        id: '1'
      }
      let url = jsonapi.urlBuilder(query);
      expect(url).toEqual('myapi.com/posts/1');
    });

    it('should build url for deleteOne queries', () => {
      let query = {
        queryType: 'deleteOne',
        type: 'Post',
        id: '1'
      }
      let url = jsonapi.urlBuilder(query);
      expect(url).toEqual('myapi.com/posts/1');
    });

    it('should build url for getMany queries', () => {
      let url = jsonapi.urlBuilder({
        type: 'Post',
        queryType: 'getMany'
      });
      expect(url).toEqual('myapi.com/posts');
    });

    it('should build url for create queries', () => {
      let url = jsonapi.urlBuilder({
        type: 'Post',
        queryType: 'create'
      });
      expect(url).toEqual('myapi.com/posts');
    });
  })

  describe('find', () => {
    it('should find a single model using find with getOne',
      fakeAsync(inject([MockBackend], (mockBackend) => {
        mockBackend.connections.subscribe(c => {
          // console.log(c.request);
          expect(c.request.url).toBe('myapi.com/posts/1');
          expect(c.request.method).toBe(0);
        });
        jsonapi.find({
          query: {
            queryType: 'getOne',
            type: 'Post',
            id: 1
          }
        });
        tick();
      })));

    it('should find multiple models using find with getMany',
      fakeAsync(inject([MockBackend], (mockBackend) => {
        mockBackend.connections.subscribe(c => {
          // console.log(c.request);
          expect(c.request.url).toBe('myapi.com/posts');
          expect(c.request.method).toBe(0);
        });
        jsonapi.find({
          query: {
            type: 'Post',
            queryType: 'getMany',
          }
        });
        tick();
      })));

    it('should find resources with queryParams',
      fakeAsync(inject([MockBackend], (mockBackend) => {
        mockBackend.connections.subscribe(c => {
          expect(c.request.url).toBe(
            'myapi.com/posts?include=person,comments&filter[person__name]=smith&filter[person__age]=20');
          expect(c.request.method).toBe(0);
        });
        jsonapi.find({
          query: {
            queryType: 'getMany',
            type: 'Post'
                            params: {
              filtering: [
                { path: 'person__name', value: 'smith' },
                { path: 'person__age', value: 20 }
              ],
              include: ['person', 'comments']
            }
          }
        });
        tick();
      })));
  });

  it('should have the appropriate json api headers attached in the request',
    fakeAsync(inject([MockBackend], (mockBackend) => {
      mockBackend.connections.subscribe(c => {
        // console.log(c.request);
        expect(c.request.headers.has('Content-Type')).toBeTruthy();
        expect(c.request.headers.has('Accept')).toBeTruthy();
        expect(c.request.headers.get('Content-Type')).toBe('application/vnd.api+json');
        expect(c.request.headers.get('Accept')).toBe('application/vnd.api+json');
      });
      jsonapi.create({
        query: {
          type: 'Post',
          queryType: 'create'
        },
        jsonApiData: {
          data: { title: 'Hello World' }
        }
      });
      tick();
    })));

  describe('request', () => {
    it('should make handle requests using request!',
      fakeAsync(inject([MockBackend], (mockBackend) => {
        mockBackend.connections.subscribe(c => {
          // console.log(c.request);
          expect(c.request.url).toBe('myapi.com/posts/1');
          expect(c.request.method).toBe(0);
        });
        jsonapi.request({ url: 'myapi.com/posts/1', method: 'GET' });
        tick();
      })));
  });

  describe('create', () => {
    it('should should create a model using create',
      fakeAsync(inject([MockBackend], (mockBackend) => {
        mockBackend.connections.subscribe(c => {
          // console.log(c.request);
          expect(c.request.url).toBe('myapi.com/posts');
          expect(c.request.method).toBe(1);
          expect(c.request._body).toBe(JSON.stringify({
            data: {
              title: 'Hello', type: 'Post'
            }
          }));
        });
        jsonapi.create({
          jsonApiData: {
            data: { title: 'Hello', type: 'Post' }
          },
          query: {
            queryType: 'getMany',
            type: 'Post'
          }
        });
        tick();
      })));
  });

  describe('update', () => {
    it('should update a model using update!',
      fakeAsync(inject([MockBackend], (mockBackend) => {
        mockBackend.connections.subscribe(c => {
          // console.log(c.request);
          expect(c.request.url).toBe('myapi.com/posts/1');
          expect(c.request.method).toBe(6);
          expect(c.request._body).toBe(JSON.stringify({
            data: { title: 'Hello', id: '1', type: 'Post' }
          }));
        });
        jsonapi.update({
          jsonApiData: {
            data: {
              title: 'Hello', id: '1', type: 'Post'
            }
          },
          query: {
            queryType: 'update',
            type: 'Post',
            id: '1'
          }
        });
        tick();
      })));
  });

  describe('delete', () => {
    it('should delete a model using delete!',
      fakeAsync(inject([MockBackend], (mockBackend) => {
        mockBackend.connections.subscribe(c => {
          // console.log(c.request);
          expect(c.request.url).toBe('myapi.com/posts/1');
          expect(c.request.method).toBe(3);
        });
        jsonapi.delete({
          query: {
            queryType: 'deleteOne',
            type: 'Post',
            id: '1'
          }
        });
        tick();
      })));
  });

});

describe('ngrx json api with overridden configs', () => {
  let jsonapi;
  let resourcesDefinitions: Array<ResourceDefinition> = [
    {
      type: 'Post',
      collectionPath: 'posts',
    },
    {
      type: 'Person',
      collectionPath: 'people',
    }
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http, useFactory: (backend: ConnectionBackend,
            defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }, deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: NgrxJsonApi,
          useFactory: apiFactory,
          deps: [Http, NGRX_JSON_API_CONFIG]
        },
        {
          provide: NGRX_JSON_API_CONFIG,
          useValue: {
            apiUrl: 'myapi.com',
            resourceDefinitions: resourcesDefinitions,
            urlBuilder: {
              generateIncludedQueryParams: (params) => 'helloIncluded',
              generateFilteringQueryParams: (params) => 'helloFiltering',
              generateFieldsQueryParams: (params) => 'helloFields',
              generateSortingQueryParams: (params) => 'helloSorting'
              // generateQueryParams: (params) => 'helloGenerator'
            }
          }
        },
      ]
    });
  });
  //
  beforeEach(inject([NgrxJsonApi], (api) => {
    jsonapi = api;
  }));

  it('should find resources with queryParams',
    fakeAsync(inject([MockBackend], (mockBackend) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.url).toBe(
          'myapi.com/posts?helloIncluded&helloFiltering&helloSorting&helloFields');
        expect(c.request.method).toBe(0);
      });
      jsonapi.find({
        query: {
          queryType: 'getMany',
          type: 'Post',
          params: {
            filtering: [
              { path: 'person__name', value: 'smith' },
              { path: 'person__age', value: 20 }
            ],
            include: ['person', 'comments'],
            sorting: [{ api: 'person', direction: 'ASC' }],
            fields: ['name']
          }
        }
      });
      tick();
    })));
});
