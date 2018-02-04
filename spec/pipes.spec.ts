import { inject, TestBed } from '@angular/core/testing';

import * as _ from 'lodash';
import {
  DenormaliseStoreResourcePipe,
  GetDenormalisedValuePipe,
  SelectStoreResourcePipe,
} from '../src/pipes';

import { denormaliseStoreResource } from '../src/utils';

import { TestingModule } from './testing.module';

describe('Pipes', () => {
  let pipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      providers: [
        DenormaliseStoreResourcePipe,
        GetDenormalisedValuePipe,
        SelectStoreResourcePipe,
      ],
    });
  });

  describe('GetDenormalisedValuePipe', () => {
    beforeEach(
      inject([GetDenormalisedValuePipe], p => {
        pipe = p;
      })
    );

    let denormalisedR;
    beforeEach(() => {
      denormalisedR = denormaliseStoreResource(
        pipe.service.storeSnapshot.data['Article']['1'],
        pipe.service.storeSnapshot.data
      );
    });
    it('should get the value from a DenormalisedStoreResource given a simple path: attribute', () => {
      let value = pipe.transform('title', denormalisedR);
      expect(value).toEqual('Article 1');
    });

    it('should get the value from a DenormalisedStoreResource given a simple path: related attribute', () => {
      let value = pipe.transform('author.name', denormalisedR);
      expect(value).toEqual('Person 1');
    });

    it('should get a hasOne related resource from a DenormalisedStoreResource given a simple path', () => {
      let relatedR = pipe.transform('author', denormalisedR);
      expect(relatedR).toBeDefined();
      expect(relatedR.type).toEqual('Person');
    });

    it('should get a hasMany related resource from a DenormalisedStoreResource given a simple path', () => {
      let relatedR = pipe.transform('comments', denormalisedR);
      expect(relatedR).toBeDefined();
      expect(relatedR[0].type).toEqual('Comment');
      expect(relatedR[0].id).toEqual('1');
    });
  });

  describe('SelectStoreResourcePipe', () => {
    beforeEach(
      inject([SelectStoreResourcePipe], p => {
        pipe = p;
      })
    );
  });

  describe('DenormaliseStoreResourcePipe', () => {
    beforeEach(
      inject([DenormaliseStoreResourcePipe], p => {
        pipe = p;
      })
    );

    it('should denormalise a Resource', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryId: '22',
      };
      let storeResource = pipe.service
        .findOne({ query, fromServer: false })
        .map(it => it.data);
      let denormalised = pipe.transform(storeResource);
      denormalised.subscribe(it => {
        expect(_.get(it, 'relationships.author.reference')).toBeDefined();
      });
    });

    it('should denormalise multiple StoreResource', () => {
      let query = {
        type: 'Article',
      };
      let storeResource = pipe.service
        .findMany({ query, fromServer: false })
        .map(it => it.data);
      let denormalised = pipe.transform(storeResource);
      denormalised.subscribe(it => {
        expect(_.get(it[0], 'relationships.author.reference')).toBeDefined();
      });
    });
  });
});
