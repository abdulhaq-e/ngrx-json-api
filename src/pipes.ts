import { Pipe, PipeTransform } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { NgrxJsonApiService } from './services';
import {
  NGRX_JSON_API_DEFAULT_ZONE,
  Resource,
  ResourceIdentifier,
  StoreResource,
} from './interfaces';

@Pipe({ name: 'jaSelectStoreResource' })
export class SelectStoreResourcePipe implements PipeTransform {
  constructor(private service: NgrxJsonApiService) {}

  transform(
    id: ResourceIdentifier,
    zoneId: string = NGRX_JSON_API_DEFAULT_ZONE
  ): Observable<StoreResource> {
    return this.service.getZone(zoneId).selectStoreResource(id);
  }
}

@Pipe({ name: 'jaSelectStoreResources' })
export class SelectStoreResourcesPipe implements PipeTransform {
  constructor(private service: NgrxJsonApiService) {}

  transform(
    ids: ResourceIdentifier[],
    zoneId: string = NGRX_JSON_API_DEFAULT_ZONE
  ): Observable<StoreResource[]> {
    return this.service.getZone(zoneId).selectStoreResources(ids);
  }
}

@Pipe({ name: 'denormaliseStoreResource' })
export class DenormaliseStoreResourcePipe implements PipeTransform {
  constructor(private service: NgrxJsonApiService) {}

  transform(
    obs: Observable<StoreResource | StoreResource[]>,
    zoneId: string = NGRX_JSON_API_DEFAULT_ZONE
  ): Observable<StoreResource | StoreResource[]> {
    return this.service.denormaliseResource(obs, zoneId);
  }
}

@Pipe({ name: 'getDenormalisedValue' })
export class GetDenormalisedValuePipe implements PipeTransform {
  constructor(private service: NgrxJsonApiService) {}

  transform(path: string, storeResource: StoreResource): any {
    return this.service.getDenormalisedValue(path, storeResource);
  }
}
