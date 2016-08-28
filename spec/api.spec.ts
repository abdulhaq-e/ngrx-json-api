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

import { JsonApi } from '../lib/api';
import {
  API_URL,
  RESOURCES_DEFINITIONS,
  _apiFactory
  } from '../lib/module';
import { ResourceDefinition } from '../lib/interfaces';

describe('ngrx json api', () => {
    let jsonapi;
    let resourcesDefinitions: Array<ResourceDefinition> = [
        {
            type: 'Post',
            collectionPath: 'posts',
            attributes: ['title', 'subtitle'],
            relationships: {
                'author': { 'type': 'People', 'relationType': 'hasOne' },
                'tags': { 'type': 'Tag', 'relationType': 'hasMany' }
            }
        },
        {
            type: 'Person',
            collectionPath: 'people',
            attributes: ['name'],
            relationships: {}
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BaseRequestOptions,
                MockBackend,
                {
                    provide: JsonApi,
                    useFactory: _apiFactory,
                    deps: [Http, API_URL, RESOURCES_DEFINITIONS]
                },
                {
                    provide: Http, useFactory: (backend: ConnectionBackend,
                        defaultOptions: BaseRequestOptions) => {
                        return new Http(backend, defaultOptions);
                    }, deps: [MockBackend, BaseRequestOptions]
                },
                {
                    provide: API_URL, useValue: 'myapi.com'
                },
                {
                    provide: RESOURCES_DEFINITIONS, useValue: resourcesDefinitions
                }
            ]
        });
    });

    beforeEach(inject([JsonApi], (api) => {
        jsonapi = api;
    }));

    it('should have the api url', () => {
        expect(jsonapi.apiUrl).toEqual('myapi.com');
    });

    it('should build url for a single item using one', () => {
        let oneItem = jsonapi.one('Post', '10');
        expect(oneItem.urlBuilder[0].path).toEqual('posts/10');
        expect(oneItem.urlBuilder[0].path).not.toEqual('post/10');
    });

    it('should build url for a all item using all', () => {
        let oneItem = jsonapi.all('Post');
        // console.log(oneItem);
        expect(oneItem.urlBuilder[0].path).toEqual('posts');
        expect(oneItem.urlBuilder[0].path).not.toEqual('post');
    });

    it('should reset the builder stack', () => {
        jsonapi.urlBuilder = ['whatever'];
        expect(jsonapi.urlBuilder).not.toEqual([]);
        jsonapi.resetUrlBuilder();
        expect(jsonapi.urlBuilder).toEqual([]);
    });

    it('should build the path using buildPath', () => {
        jsonapi.one('Post', '1');
        expect(jsonapi.buildPath()).toBe('posts/1');
        jsonapi.resetUrlBuilder();
        expect(jsonapi.urlBuilder).toEqual([]);
        jsonapi.all('Post');
        expect(jsonapi.buildPath()).toBe('posts');
    });

    it('should build the url using buildUrl', () => {
        jsonapi.one('Post', '1');
        expect(jsonapi.buildUrl()).toBe('myapi.com/posts/1');
        jsonapi.resetUrlBuilder();
        expect(jsonapi.urlBuilder).toEqual([]);
        jsonapi.all('Post');
        expect(jsonapi.buildUrl()).toBe('myapi.com/posts');
    });

    it('should perform a get request on a single resource',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                expect(c.request.url).toBe('myapi.com/posts/1');
                expect(c.request.method).toBe(0);
            });
            jsonapi.one('Post', '1').get();
            tick();
        })));

    it('should perform a get request on multiple resources',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                expect(c.request.url).toBe('myapi.com/posts');
                expect(c.request.method).toBe(0);
            });
            jsonapi.all('Post').get();
            tick();
        })));

    it('should perform a post request on a single resource',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts/1');
                expect(c.request.method).toBe(1);
                expect(c.request._body).toBe(JSON.stringify({ title: 'Hello World!' }));
            });
            jsonapi.one('Post', '1').post({ title: 'Hello World!' });
            tick();
        })));

    it('should perform a post request on multiple resources',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts');
                expect(c.request.method).toBe(1);
                expect(c.request._body).toBe(JSON.stringify({ title: 'Hello World!' }));
            });
            jsonapi.all('Post').post({ title: 'Hello World!' });
            tick();
        })));

    it('should have the appropriate json api headers attached in the request',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.headers.has('Content-Type')).toBeTruthy();
                expect(c.request.headers.has('Accept')).toBeTruthy();
                expect(c.request.headers.get('Content-Type')).toBe('application/vnd.api+json');
                expect(c.request.headers.get('Accept')).toBe('application/vnd.api+json');
            });
            jsonapi.all('Post').post({ title: 'Hello World!' });
            tick();
            jsonapi.one('Post', '10').post({ title: 'Hello World!' });
            tick();
        })));

    it('should perform a patch request',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts');
                expect(c.request.method).toBe(6);
                expect(c.request._body).toBe(JSON.stringify({ title: 'Hello World!' }));
            });
            jsonapi.all('Post').patch({ title: 'Hello World!' });
            tick();
        })));

    it('should perform a delete request',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts/1');
                expect(c.request.method).toBe(3);
            });
            jsonapi.one('Post', '1').destroy();
            tick();
        })));

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

    it('should find a single model using find',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts/1');
                expect(c.request.method).toBe(0);
            });
            jsonapi.find({
                type: 'Post',
                id: 1
            });
            tick();
        })));

    it('should find multiple models using find with no id passed',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts');
                expect(c.request.method).toBe(0);
            });
            jsonapi.find({
                type: 'Post'
            });
            tick();
        })));

    it('should find multiple models using findAll',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts');
                expect(c.request.method).toBe(0);
            });
            jsonapi.findAll({
                type: 'Post'
            });
            tick();
        })));

    it('should should create a model using create',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts');
                expect(c.request.method).toBe(1);
                expect(c.request._body).toBe(JSON.stringify({ title: 'Hello' }));
            });
            jsonapi.create('Post', { title: 'Hello' });
            tick();
        })));

    it('should update a model using update!',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts/1');
                expect(c.request.method).toBe(6);
                expect(c.request._body).toBe(JSON.stringify({ title: 'Hello', id: '1' }));
            });
            jsonapi.update('Post', { title: 'Hello', id: '1' });
            tick();
        })));

    it('should delete a model using delete!',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts/1');
                expect(c.request.method).toBe(3);
            });
            jsonapi.delete({
                type: 'Post',
                id: '1'
            });
            tick();
        })));

});
