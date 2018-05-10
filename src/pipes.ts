import { Pipe, PipeTransform } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { NgrxJsonApiService } from './services';
import { Resource, ResourceIdentifier, StoreResource } from './interfaces';

@Pipe({ name: 'jaSelectStoreResource' })
export class SelectStoreResourcePipe implements PipeTransform {
  constructor(private service: NgrxJsonApiService) {}

  transform(id: ResourceIdentifier): Observable<StoreResource> {
    return this.service.selectStoreResource(id);
  }
}

@Pipe({ name: 'jaSelectStoreResources' })
export class SelectStoreResourcesPipe implements PipeTransform {
  constructor(private service: NgrxJsonApiService) {}

  transform(ids: ResourceIdentifier[]): Observable<StoreResource[]> {
    return this.service.selectStoreResources(ids);
  }
}

@Pipe({ name: 'denormaliseStoreResource' })
export class DenormaliseStoreResourcePipe implements PipeTransform {
  constructor(private service: NgrxJsonApiService) {}

  transform(
    obs: Observable<StoreResource | StoreResource[]>
  ): Observable<StoreResource | StoreResource[]> {
    return this.service.denormaliseResource(obs);
  }
}

@Pipe({ name: 'getDenormalisedValue' })
export class GetDenormalisedValuePipe implements PipeTransform {
  constructor(private service: NgrxJsonApiService) {}

  transform(path: string, storeResource: StoreResource): any {
    return this.service.getDenormalisedValue(path, storeResource);
  }
}
