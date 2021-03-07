import { ResourceState } from "./types";

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

export function loadingRS<TParams = void>(
  params?: TParams,
): Omit<ResourceState<unknown, TParams>, "results"> {
  return {
    loadingParams: params,
    loading: true,
  };
}

export function loadedRS<TResource, TParams = void>(
  value: TResource,
  params?: TParams,
): ResourceState<TResource, TParams> {
  return {
    loaded: true,
    loading: false,
    loadingParams: undefined,
    lastParams: params,
    results: value,
    lastError: undefined,
    lastErrorMsg: undefined,
    failed: undefined,
  };
}

export function failedRS<TParams = void>(
  params?: TParams,
  errorMsg?: string,
  error?: unknown,
): Omit<ResourceState<unknown, TParams>, "results"> {
  return {
    failed: true,
    loading: false,
    loadingParams: undefined,
    lastErrorMsg: errorMsg,
    lastError: error,
    failedParams: params,
  };
}

/**
 * @deprecated
 */
export const initial = initialRS;
