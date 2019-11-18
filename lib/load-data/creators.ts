import {ofType} from '@ngrx/effects';
import {Action, createAction, On, on, props} from '@ngrx/store';
import {Observable, of, pipe} from 'rxjs';
import {catchError, exhaustMap, map, withLatestFrom} from 'rxjs/operators';
import {LoadActionPayload, LoadActions, ParamsPayload} from './types';

export function createLoadActions<T, P = void>(resource: string): LoadActions<T, P> {
  return {
    load: createAction(`[${resource}] Load`, props<ParamsPayload<P>>()),
    success: createAction(`[${resource}] Load Success`, props<LoadActionPayload<T> & ParamsPayload<P>>()),
    failed: createAction(`[${resource}] Load Failed`, props<ParamsPayload<P>>()),
  };
}

export function createLoadReducer<T, S, P = void>(actions: LoadActions<T, P>): On<S>[] {
  return [
    on<LoadActions<T, P>['load'], S>(actions.load, (state: S, action: ParamsPayload<P> & Action) => ({
      ...state,
      loading: true,
      lastParams: action.params,
    })),
    on<LoadActions<T, P>['success'], S>(actions.success, (state: S, action: LoadActionPayload<T> & Action) => ({
      ...state,
      loading: false,
      loaded: true,
      results: action.data,
    })),
    on<S>(actions.failed, (state: S) => ({
      ...state,
      loading: false,
      loaded: false,
    })),
  ];
}

export function createLoadEffect<T, P, S>(
  actions: LoadActions<T, P>,
  loadAndMap: (params: P, state: S) => Observable<T>,
  state$: Observable<S>,
) {
  return pipe(
    ofType(actions.load),
    withLatestFrom(state$),
    exhaustMap(([action, state]) => {
      return loadAndMap(action.params, state).pipe(
        map((response) => actions.success({data: response, params: action.params})),
        catchError(() => of(actions.failed({params: action.params}))),
      );
    }),
  );
}
