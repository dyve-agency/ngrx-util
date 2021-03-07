/** @packageDocumentation
 * @module simple-loadable-data
 */

import { ErrorHandler } from "@angular/core";
import { ofType } from "@ngrx/effects";
import { Action, createAction, on, props, ReducerTypes } from "@ngrx/store";
import { Observable, of, OperatorFunction, pipe } from "rxjs";
import { catchError, exhaustMap, map, withLatestFrom } from "rxjs/operators";
import { failedRS, loadedRS, loadingRS } from "./helpers";
import {
  ExecuteActionPayload,
  ExecuteActions,
  ExecuteReducerTypes,
  FailedParamsPayload,
  ParamsPayload,
} from "./types";

/**
 * Creates a set of {@link ExecuteActions}
 *
 * @param resource a unique name for this loaded resource.
 */
export function createExecuteActions<
  TResource,
  TParams = void,
  TName extends string = string
>(resource: TName): ExecuteActions<TResource, TParams, TName> {
  return {
    execute: createAction(
      `[${resource}] Execute` as const,
      props<ParamsPayload<TParams>>(),
    ),
    load: createAction(
      `[${resource}] Execute` as const,
      props<ParamsPayload<TParams>>(),
    ),
    success: createAction(
      `[${resource}] Execute Success` as const,
      props<ExecuteActionPayload<TResource> & ParamsPayload<TParams>>(),
    ),
    failed: createAction(
      `[${resource}] Execute Failed` as const,
      props<FailedParamsPayload<TParams>>(),
    ),
  };
}

/**
 * @deprecated
 */
export const createLoadActions = createExecuteActions;

/**
 * Creates the reducer hooks necessary to reflect the current loading
 * state + loaded data in the state.
 *
 * @param actions
 */
export function createExecuteReducer<
  TResource,
  TState,
  TParams = void,
  TName extends string = string
>(
  actions: ExecuteActions<TResource, TParams, TName>,
): ExecuteReducerTypes<TResource, TState, TParams> {
  return [
    on<TState, [ExecuteActions<TResource, TParams, TName>["execute"]]>(
      actions.execute,
      (state: TState, action: ParamsPayload<TParams> & Action) => ({
        ...state,
        ...loadingRS(action.params),
      }),
    ),

    on<TState, [ExecuteActions<TResource, TParams, TName>["success"]]>(
      actions.success,
      (
        state: TState,
        action: ExecuteActionPayload<TResource> &
          ParamsPayload<TParams> &
          Action,
      ) => ({
        ...state,
        ...loadedRS(action.data, action.params),
      }),
    ),
    on<TState, [ExecuteActions<TResource, TParams, TName>["failed"]]>(
      actions.failed,
      (state: TState, action: FailedParamsPayload<TParams> & Action) => ({
        ...state,
        ...failedRS(action.params, action.errorMsg, action.error),
      }),
    ),
    on<TState, [ExecuteActions<TResource, TParams, TName>["load"]]>(
      actions.load,
      (state: TState, action: ParamsPayload<TParams> & Action) => ({
        ...state,
        ...loadingRS(action.params),
      }),
    ),
  ] as const;
}

/**
 * @deprecated
 */
export const createLoadReducer = createExecuteReducer;

/**
 * Creates a load-effect for the given load-actions
 *
 * @param actions the set of load-action that represent the loading events
 * @param loadAndMap a function that returns an observable with the requested data,
 *                   this is usually the API request to the backend.
 * @param state$ the state observable (store, or a selected sub-state to be used in `loadAndMap`)
 * @param errorHandler an optional (Angular) error handler to report failures to
 */
export function createExecuteEffect<
  TResource,
  TParams,
  TState,
  TName extends string = string
>(
  actions: ExecuteActions<TResource, TParams, TName>,
  loadAndMap: (params: TParams, state: TState) => Observable<TResource>,
  state$: Observable<TState>,
  errorHandler?: ErrorHandler,
): OperatorFunction<Action, Action> {
  return pipe(
    ofType(actions.execute),
    withLatestFrom(state$),
    exhaustMap(([action, state]) => {
      return loadAndMap(action.params, state).pipe(
        map((response) =>
          actions.success({ data: response, params: action.params }),
        ),
        catchError((e) => {
          if (errorHandler) {
            errorHandler.handleError(e);
          }
          return of(
            actions.failed({
              params: action.params,
              error: e,
              errorMsg: e.error ? e.error.error : "",
            }),
          );
        }),
      );
    }),
  );
}

/**
 * @deprecated
 */
export const createLoadEffect = createExecuteEffect;
