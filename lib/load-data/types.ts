import {ActionCreator} from '@ngrx/store';
import {TypedAction} from '@ngrx/store/src/models';

export interface LoadActionPayload<T> {
  data: T;
}

export interface ParamsPayload<P> {
  params: P;
}

export interface ResourceState<T, P = void> {
  loaded: boolean;
  loading: boolean;
  results: T;
  lastParams: P | undefined;
  loadingParams: P | undefined;
}

export function initial<T, P>(initialValue: T): ResourceState<T, P> {
  return {
    loaded: false,
    loading: false,
    results: initialValue,
    lastParams: undefined,
    loadingParams: undefined,
  };
}

export interface LoadActions<T, P = void> {
  load: ActionCreator<string, (props: ParamsPayload<P>) => ParamsPayload<P> & TypedAction<string>>;
  success: ActionCreator<string, (props: LoadActionPayload<T> & ParamsPayload<P>) => LoadActionPayload<T> & ParamsPayload<P> & TypedAction<string>>;
  failed: ActionCreator<string, (props: ParamsPayload<P>) => ParamsPayload<P> & TypedAction<string>>;
}
