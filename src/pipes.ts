import { Pipe, PipeTransform } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { NgrxJsonApiService } from './services';
import {
  Resource,
  ResourceIdentifier,
  ResourceStore
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

@Pipe({ name: 'jaSelectResourceStore' })
export class SelectResourceStorePipe implements PipeTransform {

    constructor(private service: NgrxJsonApiService) {
    }

    transform(id: ResourceIdentifier): Observable<ResourceStore> {
        return this.service.selectResourceStore(id);
    }
}

@Pipe({ name: 'denormaliseResource'})
export class DenormaliseResourcePipe implements PipeTransform {

  constructor(private service: NgrxJsonApiService) {
  }

  transform(obs: Observable<Resource> | Observable<ResourceStore>): Observable<any> {
      return obs.let<Resource | ResourceStore, any>(this.service.denormalise());
  }

}
