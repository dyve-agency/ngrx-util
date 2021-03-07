/** @packageDocumentation
 * @module simple-loadable-data
 */

import { ActionCreator } from "@ngrx/store";
import { TypedAction } from "@ngrx/store/src/models";

export interface ExecuteActionPayload<TResource> {
  data?: TResource;
}

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
}

/**
 * "Constructor" for an empty/initial resource state.
 * You have to supply an initial/'null'-value for the {@link ResourceState.results}.
 * For object you would typically use `ResourceState<MyClass | undefined, void>` with
 * `initial<MyClass, void>(undefined)` (or `null` if you prefer).
 * For lists, the best choice is usually an empty list: `initial<MyClass[], void>([])`.
 *
 * @param initialValue
 */
export function initialRS<TResource, TParams>(
  initialValue: TResource,
): ResourceState<TResource, TParams> {
  return {
    results: initialValue,
  };
}

export type ExecuteActionCreator<TResource, TParams = void> = ActionCreator<
  string,
  (
    props: ParamsPayload<TParams>,
  ) => ParamsPayload<TParams> & TypedAction<string>
>;
export type SuccessActionCreator<TResource, TParams = void> = ActionCreator<
  string,
  (
    props: ExecuteActionPayload<TResource> & ParamsPayload<TParams>,
  ) => ExecuteActionPayload<TResource> &
    ParamsPayload<TParams> &
    TypedAction<string>
>;
export type FailedActionCreator<TParams = void> = ActionCreator<
  string,
  (
    props: FailedParamsPayload<TParams>,
  ) => FailedParamsPayload<TParams> & TypedAction<string>
>;

/**
 * A collection of actions that facilitate resource loading.
 */
export interface ExecuteActions<TResource, TParams = void> {
  /**
   * Dispatch this action to trigger the loading of a resource.
   */
  execute: ExecuteActionCreator<TResource, TParams>;

  /**
   * Listen for this event to know when loading finished successfully.
   */
  success: SuccessActionCreator<TResource, TParams>;

  /**
   * This event indicates a failure in the load effect.
   */
  failed: FailedActionCreator<TParams>;
}

export const NO_PARAMS = { params: undefined };
