// import {
//   addProviders,
//   async,
//   inject,
//   fakeAsync,
// } from '@angular/core/testing';
//
// import {
//   MOCK_EFFECTS_PROVIDERS,
//   MockStateUpdates
// } from '@ngrx/effects/testing';
//
// import { JsonApiEffects } from '../lib/effects';
// import { JsonApiActions } from '../lib/actions';
//
// import { MOCK_JSON_API_PROVIDERS } from '../lib/testing';
//
// describe('Json Api Effects', () => {
//   let effects: JsonApiEffects;
//   let updates$: MockStateUpdates;
//
//   beforeEach(() => {
//     addProviders([
//       JsonApiActions,
//       JsonApiEffects,
//       MOCK_EFFECTS_PROVIDERS,
//       MOCK_JSON_API_PROVIDERS
//     ])
//   });
//
//   beforeEach(inject([JsonApiEffects, MockStateUpdates], (jsonApiEffects, mockUpdates) => {
//     effects = jsonApiEffects;
//     updates$ = mockUpdates;
//   }));
//   let successPayload = {
//     options: {
//       entityType: 'Whatever',
//       id: '1'
//     },
//     data: {
//       type: 'SUCCESS'
//     }
//   };
//   let failPayload = {
//     options: {
//       entityType: 'Whatever',
//       id: '2'
//     },
//     data: {
//       type: 'FAIL'
//     }
//   };
//
//
//   it('should respond to successfull CREATE_INIT action', () => {
//
//     updates$.sendAction({
//       type: JsonApiActions.API_CREATE_INIT,
//       payload: successPayload
//     });
//
//     // TODO: Test that the Observable has emitted some in the
//     // first place!
//
//     effects.createEntity$.subscribe(action => {
//       expect(action.type).toBe(JsonApiActions.API_CREATE_SUCCESS);
//       expect(action.payload).toBe(successPayload);
//     });
//
//   });
//
//   it('should respond to failed CREATE_INIT action', () => {
//
//     updates$.sendAction({
//       type: JsonApiActions.API_CREATE_INIT,
//       payload: failPayload
//     });
//
//     effects.createEntity$.subscribe(action => {
//       expect(action.type).toBe(JsonApiActions.API_CREATE_FAIL);
//       expect(action.payload).toBe(failPayload);
//     });
//   });
//
//   it('should respond to successfull UPDATE_INIT action', () => {
//
//     updates$.sendAction({
//       type: JsonApiActions.API_UPDATE_INIT,
//       payload: successPayload
//     });
//
//     effects.updateEntity$.subscribe(action => {
//       expect(action.type).toBe(JsonApiActions.API_UPDATE_SUCCESS);
//       expect(action.payload).toBe(successPayload);
//     });
//
//   });
//
//   it('should respond to fail UPDATE_INIT action', () => {
//
//     updates$.sendAction({
//       type: JsonApiActions.API_UPDATE_INIT,
//       payload: failPayload
//     });
//
//     effects.updateEntity$.subscribe(action => {
//       expect(action.type).toBe(JsonApiActions.API_UPDATE_FAIL);
//       expect(action.payload).toBe(failPayload);
//     });
//   });
//
//
//   it('should respond to successfull READ_INIT action', () => {
//     updates$.sendAction({
//       type: JsonApiActions.API_READ_INIT,
//       payload: successPayload
//     });
//
//     effects.readEntity$.subscribe(action => {
//       // console.log(action);
//       expect(action.type).toBe(JsonApiActions.API_READ_SUCCESS);
//       // expect(action.payload).toBe(successPayload);
//     });
//   });
//
//   it('should respond to fail READ_INIT action', () => {
//     updates$.sendAction({
//       type: JsonApiActions.API_READ_INIT,
//       payload: failPayload
//     });
//
//     effects.readEntity$.subscribe(action => {
//       // console.log(action);
//       expect(action.type).toBe(JsonApiActions.API_READ_FAIL);
//       expect(action.payload).toBe(failPayload);
//     });
//   });
//
//   let payloadSuccess = {
//     options: true,
//     data: {}
//   };
//   let payloadFail = {
//     options: false,
//     data: {}
//   };
//
//   it('should respond to successfull DELETE_INIT action', () => {
//     updates$.sendAction({
//       type: JsonApiActions.API_DELETE_INIT,
//       payload: payloadSuccess
//     });
//
//     effects.deleteEntity$.subscribe(action => {
//       // console.log(action);
//       expect(action.type).toBe(JsonApiActions.API_DELETE_SUCCESS);
//       expect(action.payload).toBe(payloadSuccess);
//     });
//   });
//
//   it('should respond to fail DELETE_INIT action', () => {
//     updates$.sendAction({
//       type: JsonApiActions.API_DELETE_INIT,
//       payload: payloadFail
//     });
//
//     effects.deleteEntity$.subscribe(action => {
//       // console.log(action);
//       expect(action.type).toBe(JsonApiActions.API_DELETE_FAIL);
//       expect(action.payload).toBe(payloadFail);
//     });
//
//     expect(true).toEqual(true);
//   });
//
// });
