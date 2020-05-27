/** @packageDocumentation
 * @module simple-loadable-data
 */

import {ErrorHandler} from '@angular/core';
import {ofType} from '@ngrx/effects';
import {Action, createAction, On, on, props} from '@ngrx/store';
import {Observable, of, pipe} from 'rxjs';
import {catchError, exhaustMap, map, withLatestFrom} from 'rxjs/operators';
import {LoadActionPayload, LoadActions, ParamsPayload} from './types';

/**
 * Creates a set of {@link LoadActions}
 *
 * @param resource a unique name for this loaded resource.
 */
export function createLoadActions<TResource, TParams = void>(resource: string): LoadActions<TResource, TParams> {
  return {
    load: createAction(`[${resource}] Load`, props<ParamsPayload<TParams>>()),
    success: createAction(`[${resource}] Load Success`, props<LoadActionPayload<TResource> & ParamsPayload<TParams>>()),
    failed: createAction(`[${resource}] Load Failed`, props<ParamsPayload<TParams>>()),
  };
}

/**
 * Creates the reducer hooks necessary to reflect the current loading
 * state + loaded data in the state.
 *
 * @param actions
 */
export function createLoadReducer<TResource, TState, TParams = void>(actions: LoadActions<TResource, TParams>): On<TState>[] {
  return [
    on<LoadActions<TResource, TParams>['load'], TState>(actions.load, (state: TState, action: ParamsPayload<TParams> & Action) => ({
      ...state,
      loading: true,
      loadingParams: action.params,
    })),
    on<LoadActions<TResource, TParams>['success'], TState>(
      actions.success,
      (state: TState, action: LoadActionPayload<TResource> & ParamsPayload<TParams> & Action) => ({
        ...state,
        loading: false,
        loadingParams: undefined,
        lastParams: action.params,
        loaded: true,
        results: action.data,
      }),
    ),
    on<TState>(actions.failed, (state: TState) => ({
      ...state,
      loading: false,
      loadingParams: undefined,
      loaded: false,
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
export function createLoadEffect<TResource, TParams, TState>(
  actions: LoadActions<TResource, TParams>,
  loadAndMap: (params: TParams, state: TState) => Observable<TResource>,
  state$: Observable<TState>,
  errorHandler?: ErrorHandler,
) {
  return pipe(
    ofType(actions.load),
    withLatestFrom(state$),
    exhaustMap(([action, state]) => {
      return loadAndMap(action.params, state).pipe(
        map((response) => actions.success({data: response, params: action.params})),
        catchError((e) => {
          if (errorHandler) {
            errorHandler.handleError(e);
          }
          return of(actions.failed({params: action.params}));
        }),
      );
    }),
  );
}
