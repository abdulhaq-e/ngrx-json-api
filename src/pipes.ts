import { Pipe, PipeTransform } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { NgrxJsonApiService } from './services';
import {
  Resource,
  ResourceIdentifier,
  StoreResource
} from './interfaces';

@Pipe({ name: 'jaGetResource' })
export class GetResourcePipe implements PipeTransform {

  constructor(private service: NgrxJsonApiService) {
  }

  transform(id: ResourceIdentifier): Resource {
    return this.service.getResourceSnapshot(id);
  }
}

@Pipe({ name: 'jaSelectResource' })
export class SelectResourcePipe implements PipeTransform {

  constructor(private service: NgrxJsonApiService) {
  }

  transform(id: ResourceIdentifier): Observable<Resource> {
    return this.service.selectResource(id);
  }
}

@Pipe({ name: 'jaSelectStoreResource' })
export class SelectStoreResourcePipe implements PipeTransform {

  constructor(private service: NgrxJsonApiService) {
  }

  transform(id: ResourceIdentifier): Observable<StoreResource> {
    return this.service.selectStoreResource(id);
  }
}

@Pipe({ name: 'denormaliseOneStoreResource' })
export class DenormaliseOneStoreResourcePipe implements PipeTransform {

  constructor(private service: NgrxJsonApiService) {
  }

  transform(obs: Observable<StoreResource>): Observable<StoreResource> {
    return this.service.denormaliseOne(obs);
  }
}

@Pipe({ name: 'denormaliseManyStoreResource' })
export class DenormaliseManyStoreResourcePipe implements PipeTransform {

  constructor(private service: NgrxJsonApiService) {
  }

  transform(obs: Observable<StoreResource[]>): Observable<StoreResource[]> {
    return this.service.denormaliseMany(obs);
  }
}
