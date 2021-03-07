/** @packageDocumentation
 * @module simple-loadable-data
 */

import { ActionCreator, ReducerTypes } from "@ngrx/store";
import { TypedAction } from "@ngrx/store/src/models";
import { OnReducer } from "@ngrx/store/src/reducer_creator";

export interface ExecuteActionPayload<TResource> {
  data: TResource;
}

/**
 * @deprecated
 */
export type LoadActionPayload<TResource> = ExecuteActionPayload<TResource>;

export interface ParamsPayload<TParams> {
  params: TParams;
}

export interface FailedParamsPayload<TParams> extends ParamsPayload<TParams> {
  error?: unknown;
  errorMsg?: string;
}

/**
 * Simple wrapper for loaded data in the state.
 */
export interface ResourceState<TResource, TParams = void> {
  /**
   * Has this resource been loaded?
   * `true` *after* the success action
   */
  loaded?: boolean;

  /**
   * Is this resource currently loading?
   * `false` *before* any load action,
   * `true` *after* the load action,
   * `false` *after* success or fail
   */
  loading?: boolean;

  /**
   * Indicates if the last request has failed.
   */
  failed?: boolean;

  /**
   * The stores the loaded data.
   * If no data has been loaded yet, contains the initial value (see {@link initialRS}).
   */
  results: TResource;

  /**
   * If data has been loaded, and was loaded with params,
   * stores these params of the last request.
   */
  lastParams?: TParams | undefined;

  /**
   * If data is currently loading, and loading was requested with params,
   * stores these params.
   */
  loadingParams?: TParams | undefined;

  /**
   * If error happened and has a error message,
   * store it.
   */
  lastErrorMsg?: string | undefined;
  lastError?: unknown;
  failedParams?: TParams;
}

export type ExecuteActionType<
  TName extends string = string
> = `[${TName}] Execute`;

export type ExecuteActionCreator<
  TResource,
  TParams = void,
  TName extends string = string
> = ActionCreator<
  ExecuteActionType<TName>,
  (
    props: ParamsPayload<TParams>,
  ) => ParamsPayload<TParams> & TypedAction<ExecuteActionType<TName>>
>;

/**
 * @deprecated
 */
export type LoadActionCreator<TResource, TParams = void> = ExecuteActionCreator<
  TResource,
  TParams
>;

export type SuccessActionType<
  TName extends string = string
> = `[${TName}] Execute Success`;

export type SuccessActionCreator<
  TResource,
  TParams = void,
  TName extends string = string
> = ActionCreator<
  SuccessActionType<TName>,
  (
    props: ExecuteActionPayload<TResource> & ParamsPayload<TParams>,
  ) => ExecuteActionPayload<TResource> &
    ParamsPayload<TParams> &
    TypedAction<SuccessActionType<TName>>
>;

export type FailedActionType<
  TName extends string = string
> = `[${TName}] Execute Failed`;

export type FailedActionCreator<
  TParams = void,
  TName extends string = string
> = ActionCreator<
  FailedActionType<TName>,
  (
    props: FailedParamsPayload<TParams>,
  ) => FailedParamsPayload<TParams> & TypedAction<FailedActionType<TName>>
>;

/**
 * A collection of actions that facilitate resource loading.
 */
export interface ExecuteActions<
  TResource,
  TParams = void,
  TName extends string = string
> {
  /**
   * Dispatch this action to trigger the loading of a resource.
   */
  execute: ExecuteActionCreator<TResource, TParams, TName>;

  /**
   * @deprecated
   */
  load: ExecuteActions<TResource, TParams>["execute"];

  /**
   * Listen for this event to know when loading finished successfully.
   */
  success: SuccessActionCreator<TResource, TParams, TName>;

  /**
   * This event indicates a failure in the load effect.
   */
  failed: FailedActionCreator<TParams, TName>;
}

/**
 * @deprecated
 */
export type LoadActions<TResource, TParams = void> = ExecuteActions<
  TResource,
  TParams
>;

export const NO_PARAMS = { params: undefined };

export type On<Reducer extends ActionCreator, State> = OnReducer<
  State,
  Reducer[]
>;

export type ExecuteReducerTypes<TResource, TState, TParams = void> = readonly [
  ReducerTypes<TState, [ExecuteActions<TResource, TParams>["execute"]]>,
  ReducerTypes<TState, [ExecuteActions<TResource, TParams>["success"]]>,
  ReducerTypes<TState, [ExecuteActions<TResource, TParams>["failed"]]>,
  /**
   * @deprecated
   */
  ReducerTypes<TState, [ExecuteActions<TResource, TParams>["execute"]]>,
];
