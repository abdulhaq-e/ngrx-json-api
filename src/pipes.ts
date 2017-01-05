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

@Pipe({ name: 'denormaliseResource' })
export class DenormaliseResourcePipe implements PipeTransform {

  constructor(private service: NgrxJsonApiService) {
  }

  transform(obs: Observable<Resource> | Observable<StoreResource>): Observable<any> {
    return obs.let<Resource | StoreResource, any>(this.service.denormalise());
  }

}
