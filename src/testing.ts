import { Response, ResponseOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import { NgrxJsonApi } from './api';
import { Document } from './interfaces';


export class JsonApiMock {
    constructor() { }

    create(payload: Document) {
        if (payload.data.type === 'SUCCESS') {
            return Observable.of('SUCCESS');
        } else if (payload.data.type === 'FAIL') {
            return Observable.throw('FAIL');
        }
    }

    update(payload: Document) {
        if (payload.data.type === 'SUCCESS') {
            return Observable.of('SUCCESS');
        } else if (payload.data.type === 'FAIL') {
            return Observable.throw('FAIL');
        }
    }

    find(query) {
        if (query.type === 'SUCCESS') {
            let res = {
                data: {
                    type: 'SUCCESS'
                }
            }
            return Observable.of(new Response(
                new ResponseOptions({
                    body: JSON.stringify(res),
                    status: 200
                })
            ));
        } else if (query.type === 'FAIL') {
            let res = {
                data: {
                    type: 'FAIL'
                }
            }
            return Observable.throw(new Response(
                new ResponseOptions({ status: 404 })
            ));
        }
    }

    delete(query) {
        if (query.type === 'SUCCESS') {
            return Observable.of(new Response(
                new ResponseOptions({})));
        } else if (query.type === 'FAIL') {
            return Observable.throw(new Response(
                new ResponseOptions({ status: 404 })));
        }
    }
}

export const MOCK_JSON_API_PROVIDERS = [
    { provide: JsonApiMock, useClass: JsonApiMock },
    { provide: NgrxJsonApi, useExisting: JsonApiMock }
];
