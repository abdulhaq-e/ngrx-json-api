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
    API_URL,
    RESOURCE_DEFINITIONS,
    apiFactory
} from '../src/module';
import { ResourceDefinition } from '../src/interfaces';

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
                    provide: NgrxJsonApi,
                    useFactory: apiFactory,
                    deps: [Http, API_URL, RESOURCE_DEFINITIONS]
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
                    provide: RESOURCE_DEFINITIONS, useValue: resourcesDefinitions
                }
            ]
        });
    });

    beforeEach(inject([NgrxJsonApi], (api) => {
        jsonapi = api;
    }));

    it('should have the api url', () => {
        expect(jsonapi.apiUrl).toEqual('myapi.com');
    });

    it('should build url for a single item using one', () => {
        let oneItem = jsonapi.one({ type: 'Post', id: '10' });
        expect(oneItem.urlBuilder[0].path).toEqual('posts/10');
        expect(oneItem.urlBuilder[0].path).not.toEqual('post/10');
    });

    it('should build url for a all item using all', () => {
        let oneItem = jsonapi.all({ type: 'Post' });
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
        jsonapi.one({ type: 'Post', id: '1' });
        expect(jsonapi.buildPath()).toBe('posts/1');
        jsonapi.resetUrlBuilder();
        expect(jsonapi.urlBuilder).toEqual([]);
        jsonapi.all({ type: 'Post' });
        expect(jsonapi.buildPath()).toBe('posts');
    });

    it('should build the url using buildUrl', () => {
        jsonapi.one({ type: 'Post', id: '1' });
        expect(jsonapi.buildUrl()).toBe('myapi.com/posts/1');
        jsonapi.resetUrlBuilder();
        expect(jsonapi.urlBuilder).toEqual([]);
        jsonapi.all({ type: 'Post' });
        expect(jsonapi.buildUrl()).toBe('myapi.com/posts');
    });

    it('should perform a get request on a single resource',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                expect(c.request.url).toBe('myapi.com/posts/1');
                expect(c.request.method).toBe(0);
            });
            jsonapi.one({ type: 'Post', id: '1' }).get();
            tick();
        })));

    it('should perform a get request on multiple resources',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                expect(c.request.url).toBe('myapi.com/posts');
                expect(c.request.method).toBe(0);
            });
            jsonapi.all({ type: 'Post' }).get();
            tick();
        })));

    it('should perform a get request with queryParams',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                expect(c.request.url).toBe(
                    'myapi.com/posts?include=person,comments&filter[person__name]=smith&filter[person__age]=20');
                expect(c.request.method).toBe(0);
            });
            jsonapi.all({ type: 'Post' }).get({
                filtering: [
                    { api: 'person__name', value: 'smith' },
                    { api: 'person__age', value: 20 }
                ],
                include: ['person', 'comments']
            });
            tick();
        })));

    it('should perform a post request on a single resource',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts/1');
                expect(c.request.method).toBe(1);
                expect(c.request._body).toBe(
                    JSON.stringify({
                        data: {
                            title: 'Hello World!'
                        }
                    }));
            });
            jsonapi.one({ type: 'Post', id: '1' })
                .post({ data: { title: 'Hello World!' } });
            tick();
        })));

    it('should perform a post request on multiple resources',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts');
                expect(c.request.method).toBe(1);
                expect(c.request._body).toBe(JSON.stringify({
                    data: {
                        title: 'Hello World!'
                    }
                }));
            });
            jsonapi.all({ type: 'Post' }).post({
                data: {
                    title: 'Hello World!'
                }
            });
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
            jsonapi.all({ type: 'Post' }).post({ title: 'Hello World!' });
            tick();
            jsonapi.one({ type: 'Post', id: '10' }).post({ title: 'Hello World!' });
            tick();
        })));

    it('should perform a patch request',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts');
                expect(c.request.method).toBe(6);
                expect(c.request._body).toBe(JSON.stringify({
                    data: {
                        title: 'Hello World!'
                    }
                }));
            });
            jsonapi.all({ type: 'Post' }).patch({
                data: {
                    title: 'Hello World!'
                }
            });
            tick();
        })));

    it('should perform a delete request',
        fakeAsync(inject([MockBackend], (mockBackend) => {
            mockBackend.connections.subscribe(c => {
                // console.log(c.request);
                expect(c.request.url).toBe('myapi.com/posts/1');
                expect(c.request.method).toBe(3);
            });
            jsonapi.one({ type: 'Post', id: '1' }).destroy();
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
                expect(c.request._body).toBe(JSON.stringify({
                    data: {
                        title: 'Hello', type: 'Post'
                    }
                }));
            });
            jsonapi.create({
                data: { title: 'Hello', type: 'Post' }
            });
            tick();
        })));

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
                data: {
                    title: 'Hello', id: '1', type: 'Post'
                }
            });
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
