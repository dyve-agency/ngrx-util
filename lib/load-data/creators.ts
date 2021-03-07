/** @packageDocumentation
 * @module simple-loadable-data
 */

import {ErrorHandler} from '@angular/core';
import {ofType} from '@ngrx/effects';
import {Action, createAction,  on, props} from '@ngrx/store';
import {Observable, of, OperatorFunction, pipe} from 'rxjs';
import {catchError, exhaustMap, map, withLatestFrom} from 'rxjs/operators';
import {ExecuteActionPayload, ExecuteActions, FailedParamsPayload, ParamsPayload} from './types';

/**
 * Creates a set of {@link ExecuteActions}
 *
 * @param resource a unique name for this loaded resource.
 */
export function createExecuteActions<TResource, TParams = void>(resource: string): ExecuteActions<TResource, TParams> {
  return {
    execute: createAction(`[${resource}] Execute`, props<ParamsPayload<TParams>>()),
    success: createAction(`[${resource}] Execute Success`, props<ExecuteActionPayload<TResource> & ParamsPayload<TParams>>()),
    failed: createAction(`[${resource}] Execute Failed`, props<FailedParamsPayload<TParams>>()),
  };
}

/**
 * Creates the reducer hooks necessary to reflect the current loading
 * state + loaded data in the state.
 *
 * @param actions
 */
export function createExecuteReducer<TResource, TState, TParams = void>(actions: ExecuteActions<TResource, TParams>) {
  return [
    on<TState, [ExecuteActions<TResource, TParams>['execute']]>(
      actions.execute,
      (state: TState, action: ParamsPayload<TParams> & Action) => ({
        ...state,
        loading: true,
        loadingParams: action.params,
        lastError: undefined,
      }),
    ),
    on<TState, [ExecuteActions<TResource, TParams>['success']]>(
      actions.success,
      (state: TState, action: ExecuteActionPayload<TResource> & ParamsPayload<TParams> & Action) => ({
        ...state,
        loading: false,
        loadingParams: undefined,
        lastParams: action.params,
        loaded: true,
        results: action.data,
        errorMsg: undefined,
      }),
    ),
    on<TState, [ExecuteActions<TResource, TParams>['failed']]>(
      actions.failed, (state: TState, action: FailedParamsPayload<TParams> & Action) => ({
        ...state,
        loading: false,
        loadingParams: undefined,
        loaded: false,
        errorMsg: action.errorMsg,
      })),
  ];
}

/**
 * Creates a load-effect for the given load-actions
 *
 * @param actions the set of load-action that represent the loading events
 * @param loadAndMap a function that returns an observable with the requested data,
 *                   this is usually the API request to the backend.
 * @param state$ the state observable (store, or a selected sub-state to be used in `loadAndMap`)
 * @param errorHandler an optional (Angular) error handler to report failures to
 */
export function createExecuteEffect<TResource, TParams, TState>(
  actions: ExecuteActions<TResource, TParams>,
  loadAndMap: (params: TParams, state: TState) => Observable<TResource>,
  state$: Observable<TState>,
  errorHandler?: ErrorHandler,
): OperatorFunction<Action, Action> {
  return pipe(
    ofType(actions.execute),
    withLatestFrom(state$),
    exhaustMap(([action, state]) => {
      return loadAndMap(action.params, state).pipe(
        map((response) => actions.success({data: response, params: action.params})),
        catchError((e) => {
          if (errorHandler) {
            errorHandler.handleError(e);
          }
          return of(actions.failed({
            params: action.params,
            error: e,
            errorMsg: e.error ? e.error.error : ''
          }));
        }),
      );
    }),
  );
}
