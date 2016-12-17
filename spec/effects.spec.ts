// import {
//     async,
//     inject,
//     fakeAsync,
//     tick,
//     TestBed
// } from '@angular/core/testing';
//
// import {
//     EffectsTestingModule,
//     EffectsRunner
// } from '@ngrx/effects/testing';
//
// import { NgrxJsonApiEffects } from '../src/effects';
// import {
//     ApiCreateInitAction,
//     ApiCreateSuccessAction,
//     ApiCreateFailAction,
//     ApiUpdateInitAction,
//     ApiUpdateSuccessAction,
//     ApiUpdateFailAction,
//     ApiReadInitAction,
//     ApiReadSuccessAction,
//     ApiReadFailAction,
//     ApiDeleteInitAction,
//     ApiDeleteSuccessAction,
//     ApiDeleteFailAction,
//     DeleteFromStateAction
// } from '../src/actions';
//
// import { MOCK_JSON_API_PROVIDERS } from '../src/testing';
//
// describe('NgrxJsonApiEffects', () => {
//     let runner: EffectsRunner;
//     let effects;
//
//     beforeEach(() => TestBed.configureTestingModule({
//         imports: [
//             EffectsTestingModule
//         ],
//         providers: [
//             ...MOCK_JSON_API_PROVIDERS,
//             NgrxJsonApiEffects
//         ]
//     }));
//
//     beforeEach(inject([EffectsRunner, NgrxJsonApiEffects],
//         (_runner, _effects) => {
//             runner = _runner;
//             effects = _effects;
//         }
//     ));
//
//     let successPayload = {
//         jsonApiData: {
//             data: {
//                 type: 'SUCCESS'
//             }
//         },
//         query: {
//             queryType: 'create',
//             type: 'SUCCESS'
//         }
//     };
//     let failPayload = {
//         jsonApiData: {
//             data: {
//                 type: 'FAIL'
//             }
//         },
//         query: {
//             queryType: 'create',
//             type: 'SUCCESS'
//         }
//     };
//     let successQuery = {
//         query: {
//             type: 'SUCCESS'
//         }
//     };
//     let failQuery = {
//         query: {
//             type: 'FAIL'
//         }
//     };
//
//
//     it('should respond to successfull CREATE_INIT action', () => {
//         runner.queue(new ApiCreateInitAction(successPayload));
//         let res;
//         effects.createResource$.subscribe(result => {
//             res = result;
//             expect(result).toEqual(
//                 new ApiCreateSuccessAction(successPayload));
//         });
//         expect(res).toBeDefined();
//     });
//
//     it('should respond to failed CREATE_INIT action', () => {
//         let res;
//         runner.queue(new ApiCreateInitAction(failPayload));
//         effects.createResource$.subscribe(result => {
//             res = result;
//             expect(result).toEqual(
//                 new ApiCreateFailAction(failPayload));
//         });
//         expect(res).toBeDefined();
//     });
//
//     it('should respond to successfull UPDATE_INIT action', () => {
//         let res;
//         runner.queue(new ApiUpdateInitAction(successPayload));
//         effects.updateResource$.subscribe(result => {
//             res = result;
//             expect(result).toEqual(
//                 new ApiUpdateSuccessAction(successPayload));
//         });
//         expect(res).toBeDefined();
//     });
//
//     it('should respond to failed UPDATE_INIT action', () => {
//         let res;
//         runner.queue(new ApiUpdateInitAction(failPayload));
//         effects.updateResource$.subscribe(result => {
//             res = result;
//             expect(result).toEqual(
//                 new ApiUpdateFailAction(failPayload));
//         });
//         expect(res).toBeDefined();
//     });
//
//     it('should respond to successfull READ_INIT action', () => {
//         let res;
//         runner.queue(new ApiReadInitAction(successQuery));
//         effects.readResource$.subscribe(result => {
//             res = result;
//             expect(result).toEqual(
//                 new ApiReadSuccessAction({
//                     jsonApiData: result.payload.jsonApiData,
//                     query: successQuery.query
//                 }));
//         });
//         expect(res).toBeDefined();
//     });
//
//     it('should respond to failed READ_INIT action', () => {
//         let res;
//         runner.queue(new ApiReadInitAction(failQuery));
//         effects.readResource$.subscribe(result => {
//             res = result;
//             expect(result).toEqual(
//                 new ApiReadFailAction(failQuery));
//         });
//         expect(res).toBeDefined();
//     });
//
//     it('should respond to successfull DELETE_INIT action', () => {
//         let res;
//         runner.queue(new ApiDeleteInitAction(successQuery));
//         effects.deleteResource$.subscribe(result => {
//             res = result;
//             expect(result).toEqual(
//                 new ApiDeleteSuccessAction(successQuery));
//         });
//         expect(res).toBeDefined();
//     });
//
//     it('should respond to failed DELETE_INIT action', () => {
//         let res;
//         runner.queue(new ApiDeleteInitAction(failQuery));
//         effects.deleteResource$.subscribe(result => {
//             res = result;
//             expect(result).toEqual(
//                 new ApiDeleteFailAction(failQuery));
//         });
//         expect(res).toBeDefined();
//     });
//
// });
