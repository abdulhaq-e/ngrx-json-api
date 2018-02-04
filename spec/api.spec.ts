import { inject, TestBed } from '@angular/core/testing';

import { HttpTestingController } from '@angular/common/http/testing';

import { NgrxJsonApi } from '../src/api';

import { AlternativeTestingModule, TestingModule } from './testing.module';

describe('ngrx json api', () => {
  let jsonapi: NgrxJsonApi;
  let httpMock: HttpTestingController;
  let req;

  const getRequest = () => {
    req = httpMock.expectOne(r => r.url.slice(0, 5) == 'myapi');
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
    });
  });
  //
  beforeEach(
    inject([NgrxJsonApi, HttpTestingController], (_api, _http) => {
      jsonapi = _api;
      httpMock = _http;
    })
  );

  afterEach(() => {
    httpMock.verify();
  });

  it('should have the api url', () => {
    expect(jsonapi.config.apiUrl).toEqual('myapi.com');
  });

  describe('urlBuilder', () => {
    it('should build url for getOne queries', () => {
      let query = {
        type: 'Post',
        id: '1',
      };
      let url = jsonapi.urlBuilder(query, 'GET');
      expect(url).toEqual('myapi.com/posts/1');
    });

    it('should build url for DELETE', () => {
      let query = {
        type: 'Post',
        id: '1',
      };
      let url = jsonapi.urlBuilder(query, 'DELETE');
      expect(url).toEqual('myapi.com/posts/1');
    });

    it('should build url for GET with type only', () => {
      let url = jsonapi.urlBuilder(
        {
          type: 'Post',
        },
        'GET'
      );
      expect(url).toEqual('myapi.com/posts');
    });

    it('should build url for POST queries', () => {
      let url = jsonapi.urlBuilder(
        {
          type: 'Post',
        },
        'POST'
      );
      expect(url).toEqual('myapi.com/posts');
    });
  });

  describe('find', () => {
    it('should find a single model using find with getOne', () => {
      jsonapi
        .find({
          type: 'Post',
          id: 1,
        })
        .subscribe();
      getRequest();
      expect(req.request.url).toBe('myapi.com/posts/1');
      expect(req.request.method).toEqual('GET');
    });

    it('should find multiple models using find with getMany', () => {
      jsonapi
        .find({
          type: 'Post',
        })
        .subscribe();
      getRequest();
      expect(req.request.url).toBe('myapi.com/posts');
      expect(req.request.method).toBe('GET');
    });

    it('should find resources with queryParams', () => {
      jsonapi
        .find({
          type: 'Post',
          params: {
            filtering: [
              { path: 'person__name', value: 'smith' },
              { path: 'person__age', value: 20 },
            ],
            include: ['person', 'comments'],
          },
        })
        .subscribe();
      getRequest();
      expect(req.request.url).toBe(
        'myapi.com/posts?include=person,comments&filter[person__name]=smith&filter[person__age]=20'
      );
      expect(req.request.method).toBe('GET');
    });
  });

  it('should have the appropriate json api headers attached in the request', () => {
    jsonapi
      .create(
        {
          type: 'Post',
        },
        {
          data: { title: 'Hello World' },
        }
      )
      .subscribe();
    getRequest();
    expect(req.request.headers.has('Content-Type')).toBeTruthy();
    expect(req.request.headers.has('Accept')).toBeTruthy();
    expect(req.request.headers.has('Custom-Header')).toBeTruthy();
    expect(req.request.headers.get('Content-Type')).toBe(
      'application/vnd.api+json'
    );
    expect(req.request.headers.get('Custom-Header')).toBe('42');
    expect(req.request.headers.get('Accept')).toBe('application/vnd.api+json');
  });

  describe('request', () => {
    it('should make handle requests using request!', () => {
      jsonapi.request({ url: 'myapi.com/posts/1', method: 'GET' }).subscribe();
      getRequest();
      expect(req.request.url).toBe('myapi.com/posts/1');
      expect(req.request.method).toBe('GET');
    });
    it('should return the complete response!', () => {
      jsonapi
        .request({ url: 'myapi.com/posts/1', method: 'GET' })
        .subscribe(it => {
          expect(it.status).toBeDefined();
          expect(it.body).toBeDefined();
        });
      getRequest();
      req.flush({ data: { type: 'Person', id: '10' } });
      expect(req.request.url).toBe('myapi.com/posts/1');
      expect(req.request.method).toBe('GET');
    });
  });

  describe('create', () => {
    it('should should create a model using create', () => {
      jsonapi
        .create(
          {
            type: 'Post',
          },
          {
            data: { title: 'Hello', type: 'Post' },
          }
        )
        .subscribe();
      getRequest();
      expect(req.request.url).toBe('myapi.com/posts');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(
        JSON.stringify({
          data: {
            title: 'Hello',
            type: 'Post',
          },
        })
      );
    });
  });

  describe('update', () => {
    it('should update a model using update!', () => {
      jsonapi
        .update(
          {
            type: 'Post',
            id: '1',
          },
          {
            data: {
              title: 'Hello',
              id: '1',
              type: 'Post',
            },
          }
        )
        .subscribe();
      getRequest();
      expect(req.request.url).toBe('myapi.com/posts/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBe(
        JSON.stringify({
          data: { title: 'Hello', id: '1', type: 'Post' },
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a model using delete!', () => {
      jsonapi
        .delete({
          type: 'Post',
          id: '1',
        })
        .subscribe();
      getRequest();
      expect(req.request.url).toBe('myapi.com/posts/1');
      expect(req.request.method).toBe('DELETE');
    });
  });
});

describe('ngrx json api with overridden configs', () => {
  let jsonapi: NgrxJsonApi;
  let httpMock: HttpTestingController;
  let req;

  const getRequest = () => {
    req = httpMock.expectOne(r => r.url.slice(0, 5) == 'myapi');
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AlternativeTestingModule],
    });
  });

  beforeEach(
    inject([NgrxJsonApi, HttpTestingController], (_api, _http) => {
      jsonapi = _api;
      httpMock = _http;
    })
  );

  afterEach(() => {
    httpMock.verify();
  });

  it('should find resources with queryParams', () => {
    jsonapi
      .find({
        type: 'Post',
        params: {
          filtering: [
            { path: 'person__name', value: 'smith' },
            { path: 'person__age', value: 20 },
          ],
          include: ['person', 'comments'],
          sorting: [{ api: 'person', direction: 'ASC' }],
          fields: ['name'],
        },
      })
      .subscribe();
    getRequest();
    expect(req.request.url).toBe(
      'myapi.com/posts?helloIncluded&helloFiltering&helloSorting&helloFields'
    );
    expect(req.request.method).toBe('GET');
  });
});
