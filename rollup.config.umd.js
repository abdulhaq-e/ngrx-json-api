
export default {
  input: 'dist/FESM/ngrx-json-api.es5.js',
  output: {
    format: 'umd',
    file: 'dist/bundles/ngrx-json-api.umd.js',
    sourcemap: true
  },
  exports: 'named',
  name: 'ngrx.json.api',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/ErrorObservable': 'Rx.Observable',
    'rxjs/observable/concat': 'Rx.Observable',
    'rxjs/observable/throw': 'Rx.Observable',
    'rxjs/observable/of': 'Rx.Observable',
    'rxjs/operator/catch': 'Rx.Observable.prototype',
    'rxjs/operator/combineLatest': 'Rx.Observable.prototype',
    'rxjs/operator/concat': 'Rx.Observable.prototype',
    'rxjs/operator/concatMap': 'Rx.Observable.prototype',
    'rxjs/operator/concatAll': 'Rx.Observable.prototype',
    'rxjs/operator/distinctUntilChanged': 'Rx.Observable.prototype',
    'rxjs/operator/do': 'Rx.Observable.prototype',
    'rxjs/operator/finally': 'Rx.Observable.prototype',
    'rxjs/operator/filter': 'Rx.Observable.prototype',
    'rxjs/operator/let': 'Rx.Observable.prototype',
    'rxjs/operator/map': 'Rx.Observable.prototype',
    'rxjs/operator/mapTo': 'Rx.Observable.prototype',
    'rxjs/operator/mergeMap': 'Rx.Observable.prototype',
    'rxjs/operator/switchMap': 'Rx.Observable.prototype',
    'rxjs/operator/switchMapTo': 'Rx.Observable.prototype',
    'rxjs/operator/take': 'Rx.Observable.prototype',
    'rxjs/operator/toArray': 'Rx.Observable.prototype',
    'rxjs/operator/withLatestFrom': 'Rx.Observable.prototype',
    'lodash': 'lodash'
  }
}
