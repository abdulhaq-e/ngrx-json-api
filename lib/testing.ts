import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { JsonApi } from './api';


export class JsonApiMock {
  constructor () {}

  create(entityType, data) {
    if (data.type === 'SUCCESS') {
      return Observable.of('SUCCESS');
    } else if (data.type === 'FAIL') {
      return Observable.throw('FAIL');
    }
  }

  update(entityType, data) {
    if (data.type === 'SUCCESS') {
      return Observable.of('SUCCESS');
    } else if (data.type === 'FAIL') {
      return Observable.throw('FAIL');
    }
  }

  find(options) {
    if (options.id === '1') {
      return Observable.of(new Response(
        { body: '{"1": 1}' }
      ));
    } else if (options.id === '2') {
      return Observable.throw(new Response(
        { status: 404 }
      ));
    }
  }

  delete(ok: boolean) {
      if (ok) {
        return Observable.of(new Response({}));
      } else if (!ok) {
        return Observable.throw(new Response(
          { status: 404 }
        ));
      }
    }
}

export const MOCK_JSON_API_PROVIDERS = [
  { provide: JsonApiMock, useClass: JsonApiMock },
  { provide: JsonApi, useExisting: JsonApiMock }
];
