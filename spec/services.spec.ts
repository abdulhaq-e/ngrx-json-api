import { inject, TestBed } from '@angular/core/testing';

import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import { NgrxJsonApiService } from '../src/services';

import { denormaliseStoreResource } from '../src/utils';

import { StoreResource } from '../src/interfaces';
import { TestingModule } from './testing.module';
import { resourceDefinitions } from './test_utils';

describe('NgrxJsonApiService', () => {
  let service: NgrxJsonApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
    });
  });

  beforeEach(
    inject([NgrxJsonApiService], s => {
      service = s;
    })
  );

  describe('findOne', () => {
    it('find a single StoreResource from the state', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryId: '22',
      };
      let storeResource = service.findOne({ query, fromServer: false });
      storeResource.subscribe(it => {
        expect(_.get(it.data, 'type')).toEqual('Article');
        expect(_.get(it.data, 'id')).toEqual('1');
      });
    });

    it('remove the query from the state after unsubscribing', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryId: '22',
      };
      let storeResource = service.findOne({ query, fromServer: false });
      let subs = storeResource.subscribe();
      expect(service.storeSnapshot.queries['22']).toBeDefined();
      subs.unsubscribe();
      expect(service.storeSnapshot.queries['22']).not.toBeDefined();
    });

    it('shoud run without a provided queryId and should remote it properly when done', () => {
      let query = {
        id: '1',
        type: 'Article',
      };
      let storeResource = service.findOne({ query, fromServer: false });
      let subs = storeResource.subscribe();
      expect(Object.keys(service.storeSnapshot.queries).length).toEqual(5);
      subs.unsubscribe();
      expect(Object.keys(service.storeSnapshot.queries).length).toEqual(4);
    });

    it('find a single StoreResource from the state and denormalises it if told to', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryId: '22',
      };
      let res;
      let storeResource = service
        .findOne({ query, fromServer: false, denormalise: true })
        .map(it => it.data);
      storeResource.subscribe(it => (res = it));
      service.denormaliseResource(storeResource).subscribe(it => {
        expect(it).toEqual(res);
      });
    });
  });

  describe('selectStoreResource', () => {
    it('should return resource', () => {
      let storeResource = service.selectStoreResource({
        type: 'Article',
        id: '1',
      });
      storeResource.subscribe(it => {
        expect(it.type).toEqual('Article');
        expect(it.id).toEqual('1');
      });
    });
  });

  describe('findMany', () => {
    it('find multiple StoreResources from the state', () => {
      let query = {
        type: 'Article',
        queryId: '22',
      };
      let storeResource = service.findMany({ query, fromServer: false });
      storeResource.subscribe(it => {
        expect(_.get(it.data[0], 'type')).toEqual('Article');
        expect(_.get(it.data[0], 'id')).toEqual('1');
        expect(_.get(it.data[1], 'type')).toEqual('Article');
        expect(_.get(it.data[1], 'id')).toEqual('2');
      });
    });

    it('remove the query from the state after unsubscribing', () => {
      let query = {
        type: 'Article',
        queryId: '22',
      };
      let storeResource = service.findMany({
        query,
        fromServer: false,
        denormalise: true,
      });
      let subs = storeResource.subscribe();
      expect(service.storeSnapshot.queries['22']).toBeDefined();
      subs.unsubscribe();
      expect(service.storeSnapshot.queries['22']).not.toBeDefined();
    });

    it('find multiple StoreResource from the state and denormalises it if told to', () => {
      let query = {
        type: 'Article',
        queryId: '22',
      };
      let res: Array<StoreResource>;
      let storeResources: Observable<Array<StoreResource>> = service
        .findMany({ query, fromServer: false, denormalise: true })
        .map(it => it.data);
      storeResources.subscribe(it => (res = it));
      service.denormaliseResource(storeResources).subscribe(it => {
        expect(it).toEqual(res);
      });
    });
  });

  describe('putQuery', () => {
    it('putQuery adds query to store', () => {
      let query = {
        type: 'Article',
        queryId: '22',
      };
      service.putQuery({ query, fromServer: false });

      expect(service.storeSnapshot.queries['22']).toBeDefined();
      expect(service.storeSnapshot.queries['22'].query.type).toBe('Article');
    });

    it('putQuery should replace existing query', () => {
      let query1 = {
        type: 'Article',
        queryId: '22',
        params: {
          limit: 4,
        },
      };
      let query2 = {
        type: 'Article',
        queryId: '22',
        params: {
          limit: 5,
        },
      };
      service.putQuery({ query: query1, fromServer: false });
      expect(service.storeSnapshot.queries['22'].query.params.limit).toBe(4);
      service.putQuery({ query: query2, fromServer: false });
      expect(service.storeSnapshot.queries['22'].query.params.limit).toBe(5);
    });
  });

  describe('findInternal', () => {});

  describe('removeQuery', () => {});

  describe('getResourceSnapshot', () => {});

  describe('getPersistedResourceSnapshot', () => {});

  describe('getResourceSnapshot', () => {});

  describe('selectResults', () => {});

  describe('selectResultIdentifiers', () => {});

  describe('selectResource', () => {});

  describe('modifyResourceErrors', () => {
    it('add/modify/removeResourceError should update StoreResource accordingly', () => {
      service.postResource({
        resource: {
          type: 'Article',
          id: '1',
        },
      });

      service.addResourceErrors({ type: 'Article', id: '1' }, [{ code: '0' }]);
      expect(service.storeSnapshot.data['Article']['1']).toBeDefined();
      expect(service.storeSnapshot.data['Article']['1'].errors.length).toBe(1);
      expect(service.storeSnapshot.data['Article']['1'].errors[0].code).toBe(
        '0'
      );

      service.removeResourceErrors({ type: 'Article', id: '1' }, [
        { code: '0' },
      ]);
      expect(service.storeSnapshot.data['Article']['1']).toBeDefined();
      expect(service.storeSnapshot.data['Article']['1'].errors.length).toBe(0);

      service.setResourceErrors({ type: 'Article', id: '1' }, [{ code: '0' }]);
      expect(service.storeSnapshot.data['Article']['1']).toBeDefined();
      expect(service.storeSnapshot.data['Article']['1'].errors.length).toBe(1);
      expect(service.storeSnapshot.data['Article']['1'].errors[0].code).toBe(
        '0'
      );
    });
  });

  describe('getDenormalisedPath', () => {
    it('should get the denormalised path for a simple', () => {
      let path = 'title';
      let resolvedPath = service.getDenormalisedPath(
        path,
        'Article',
        resourceDefinitions
      );
      expect(resolvedPath).toEqual('attributes.title');
    });

    it('should get the denormalised path for an attribute in a related resource', () => {
      let path = 'author.firstName';
      let resolvedPath = service.getDenormalisedPath(
        path,
        'Article',
        resourceDefinitions
      );
      expect(resolvedPath).toEqual(
        'relationships.author.reference.attributes.firstName'
      );
    });

    it('should get the denormalised path for an attribute in a deeply related resource', () => {
      let path = 'author.profile.id';
      let resolvedPath = service.getDenormalisedPath(
        path,
        'Article',
        resourceDefinitions
      );
      expect(resolvedPath).toEqual(
        'relationships.author.reference.relationships.profile.reference.attributes.id'
      );
    });

    it('should get the denormalised path for a hasOne related resource', () => {
      let path = 'author';
      let resolvedPath = service.getDenormalisedPath(
        path,
        'Article',
        resourceDefinitions
      );
      expect(resolvedPath).toEqual('relationships.author.reference');
    });

    it('should get the denormalised path for a deeply hasOne related resource', () => {
      let path = 'author.profile';
      let resolvedPath = service.getDenormalisedPath(
        path,
        'Article',
        resourceDefinitions
      );
      expect(resolvedPath).toEqual(
        'relationships.author.reference.relationships.profile.reference'
      );
    });

    it('should get the denormalised path for a hasMany related resource', () => {
      let path = 'comments';
      let resolvedPath = service.getDenormalisedPath(
        path,
        'Article',
        resourceDefinitions
      );
      expect(resolvedPath).toEqual('relationships.comments.reference');
    });
  });

  describe('getDenormalisedValue', () => {
    let denormalisedR;
    beforeEach(() => {
      denormalisedR = denormaliseStoreResource(
        service.storeSnapshot.data['Article']['1'],
        service.storeSnapshot.data
      );
    });
    it('should get the value from a DenormalisedStoreResource given a simple path: attribute', () => {
      let value = service.getDenormalisedValue('title', denormalisedR);
      expect(value).toEqual('Article 1');
    });

    it('should get the value from a DenormalisedStoreResource given a simple path: related attribute', () => {
      let value = service.getDenormalisedValue('author.name', denormalisedR);
      expect(value).toEqual('Person 1');
    });

    it('should get a hasOne related resource from a DenormalisedStoreResource given a simple path', () => {
      let relatedR = service.getDenormalisedValue('author', denormalisedR);
      expect(relatedR).toBeDefined();
      expect(relatedR.type).toEqual('Person');
    });

    it('should get a hasMany related resource from a DenormalisedStoreResource given a simple path', () => {
      let relatedR = service.getDenormalisedValue('comments', denormalisedR);
      expect(relatedR).toBeDefined();
      expect(relatedR[0].type).toEqual('Comment');
      expect(relatedR[0].id).toEqual('1');
    });
  });

  describe('clear', () => {
    it('clear should empty the store', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryId: '22',
      };
      service.findOne({ query, fromServer: false });
      expect(_.isEmpty(service.storeSnapshot.data)).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.queries['22'])).toBe(false);

      service.clear();
      expect(_.isEmpty(service.storeSnapshot.data)).toBe(true);
      expect(_.isEmpty(service.storeSnapshot.queries['22'])).toBe(true);
    });
  });

  xdescribe('compact', () => {
    it('compact to clear store if no queries exists', () => {
      expect(_.isEmpty(service.storeSnapshot.data)).toBe(false);
      service.storeSnapshot.queries = {};
      service.compact();
      expect(_.isEmpty(service.storeSnapshot.data)).toBe(true);
    });

    it('compact should not clear resource if query exist', () => {
      let query = {
        id: '1',
        type: 'Comment',
        queryId: '22',
      };
      service.findOne({ query, fromServer: false });
      expect(_.isEmpty(service.storeSnapshot.data)).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.queries['22'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Blog'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Article'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Person'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Comment']['1'])).toBe(false);

      service.compact();

      expect(_.isEmpty(service.storeSnapshot.data)).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.queries['22'])).toBe(false);
      expect(_.isUndefined(service.storeSnapshot.data['Blog'])).toBe(true);
      expect(_.isUndefined(service.storeSnapshot.data['Article'])).toBe(true);
      expect(_.isUndefined(service.storeSnapshot.data['Person'])).toBe(true);
      expect(_.isEmpty(service.storeSnapshot.data['Comment']['1'])).toBe(false);
    });

    it('compact should not alter state after second run', () => {
      let query = {
        id: '1',
        type: 'Comment',
        queryId: '22',
      };
      service.findOne({ query, fromServer: false });

      let state0 = service.storeSnapshot;
      service.compact();
      expect(_.isEmpty(service.storeSnapshot.queries['22'])).toBe(false);
      let state1 = service.storeSnapshot;

      service.compact();
      expect(_.isEmpty(service.storeSnapshot.queries['22'])).toBe(false);
      let state2 = service.storeSnapshot;

      expect(state0 === state1).toBe(false);
      expect(state1 === state2).toBe(true);
    });

    it('compact should not clear modified resources', () => {
      expect(_.isEmpty(service.storeSnapshot.data)).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Blog'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Article'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Person'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Comment']['1'])).toBe(false);

      service.storeSnapshot.data['Comment']['1'].state = 'UPDATED';

      service.compact();

      expect(_.isEmpty(service.storeSnapshot.data)).toBe(false);
      expect(_.isUndefined(service.storeSnapshot.data['Blog'])).toBe(true);
      expect(_.isUndefined(service.storeSnapshot.data['Article'])).toBe(true);
      expect(_.isUndefined(service.storeSnapshot.data['Person'])).toBe(true);
      expect(_.isEmpty(service.storeSnapshot.data['Comment']['1'])).toBe(false);
    });

    it('compact should not clear resource and related resources if query exist', () => {
      let query = {
        id: '1',
        type: 'Article',
        queryId: '22',
      };
      service.findOne({ query, fromServer: false });
      expect(_.isEmpty(service.storeSnapshot.data)).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.queries['22'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Article']['1'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Blog'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Comment'])).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.data['Person'])).toBe(false);

      service.compact();

      // article 1 => comment 1
      // article 1 => person 1
      // person 1 => blog 1,3
      // person 1 => profile 1
      // blog 1 => person 2
      // blog 3 => person 1
      expect(_.isEmpty(service.storeSnapshot.data)).toBe(false);
      expect(_.isEmpty(service.storeSnapshot.queries['22'])).toBe(false);
      expect(_.keys(service.storeSnapshot.data['Article'])).toEqual(['1']);
      expect(_.keys(service.storeSnapshot.data['Comment'])).toEqual(['1']);
      expect(_.keys(service.storeSnapshot.data['Person'])).toEqual(['1', '2']);
      expect(_.keys(service.storeSnapshot.data['Blog'])).toEqual(['1', '3']);
      expect(_.keys(service.storeSnapshot.data['Profile'])).toEqual(['1']);
    });
  });
});
