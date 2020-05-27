/** @packageDocumentation
 * @module simple-loadable-data
 */

import {ActionCreator} from '@ngrx/store';
import {TypedAction} from '@ngrx/store/src/models';

export interface LoadActionPayload<T> {
  data: T;
}

export interface ParamsPayload<P> {
  params: P;
}

/**
 * Simple wrapper for loaded data in the state.
 */
export interface ResourceState<TResource, TParams = void> {
  /**
   * Has this resource been loaded?
   * `true` *after* the success action
   */
  loaded: boolean;

  /**
   * Is this resource currently loading?
   * `false` *before* any load action,
   * `true` *after* the load action,
   * `false` *after* success or fail
   */
  loading: boolean;

  /**
   * The stores the loaded data.
   * If no data has been loaded yet, contains the initial value (see {@link initial}).
   */
  results: TResource;

  /**
   * If data has been loaded, and was loaded with params,
   * stores these params of the last request.
   */
  lastParams: TParams | undefined;

  /**
   * If data is currently loading, and loading was requested with params,
   * stores these params.
   */
  loadingParams: TParams | undefined;
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
export function initial<T, P>(initialValue: T): ResourceState<T, P> {
  return {
    loaded: false,
    loading: false,
    results: initialValue,
    lastParams: undefined,
    loadingParams: undefined,
  };
}

export type LoadActionCreator<T, P = void> = ActionCreator<string, (props: ParamsPayload<P>) => ParamsPayload<P> & TypedAction<string>>;
export type SuccessActionCreator<T, P = void> = ActionCreator<string, (props: LoadActionPayload<T> & ParamsPayload<P>) => LoadActionPayload<T> & ParamsPayload<P> & TypedAction<string>>;
export type FailedActionCreator<P = void> = ActionCreator<string, (props: ParamsPayload<P>) => ParamsPayload<P> & TypedAction<string>>;

/**
 * A collection of actions that facilitate resource loading.
 */
export interface LoadActions<T, P = void> {
  /**
   * Dispatch this action to trigger the loading of a resource.
   */
  load: LoadActionCreator<T, P>;

  /**
   * Listen for this event to know when loading finished successfully.
   */
  success: SuccessActionCreator<T, P>;

  /**
   * This event indicates a failure in the load effect.
   */
  failed: FailedActionCreator<P>;
}
