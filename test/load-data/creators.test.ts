import {ErrorHandler} from '@angular/core';
import {createEffect} from '@ngrx/effects';
import {createReducer} from '@ngrx/store';
import exp from 'constants';
import {cold, hot} from 'jest-marbles';
import {of, throwError} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import {createLoadActions, createLoadEffect, createLoadReducer, initial, ResourceState} from '../../lib/load-data';

describe('load-data/creators', () => {
  describe('createLoadActions', () => {
    it('creates 3 actions: load, success, failed', () => {
      const actions = createLoadActions<{}>('foobar');

      expect(actions.load.type).toEqual('[foobar] Load');
      expect(actions.success.type).toEqual('[foobar] Load Success');
      expect(actions.failed.type).toEqual('[foobar] Load Failed');
    });
  });

  describe('initial', () => {
    it('should create an initial state with default values', () => {
      const state = initial<{}, void>({});

      expect(state.results).toEqual({});
      expect(state.loaded).toBeFalsy();
      expect(state.loading).toBeFalsy();
      expect(state.lastParams).toBeUndefined();
      expect(state.loadingParams).toBeUndefined();
    });
  });

  describe('createLoadEffect', () => {
    type TestState = ResourceState<string[], {foo: string}>;
    const actions = createLoadActions<string[], {foo: string}>('foobar');
    const initialState = initial<string[], {foo: string}>([]);
    const reducer = createReducer<TestState>(
      initialState,
      ...createLoadReducer<string[], TestState, {foo: string}>(actions),
    );

    it('should create an effect that reacts to load event and dispatches success', () => {
      const actions$ = hot('l', {l: actions.load({params: {foo: 'foo'}})});
      const effect$ = createEffect(() => actions$.pipe(
        createLoadEffect(actions, (params, state) => {
          return of(['loaded', 'resource']);
        }, of(initialState)),
      ));

      expect(effect$)
        .toBeObservable(cold('s', {s: actions.success({data: ['loaded', 'resource'], params: {foo: 'foo'}})}));
    });

    it('should create an effect that reacts to load event and dispatches failed on error', () => {
      const actions$ = hot('l', {l: actions.load({params: {foo: 'foo'}})});
      const effect$ = createEffect(() => actions$.pipe(
        createLoadEffect(actions, (params, state) => {
          return throwError('something is wrong');
        }, of(initialState)),
      ));

      expect(effect$)
        .toBeObservable(cold('f', {f: actions.failed({params: {foo: 'foo'}})}));
    });

    it('should report errors to an error handler', async () => {
      const errorHandler = {
        handleError: jest.fn(),
      };

      const actions$ = of(actions.load({params: {foo: 'foo'}}));
      const effect$ = createEffect(() => actions$.pipe(
        createLoadEffect(actions, (params, state) => {
          return throwError('something is wrong');
        }, of(initialState), errorHandler),
      ));

      await effect$.toPromise();
      expect(errorHandler.handleError.mock.calls[0][0]).toEqual('something is wrong');
    });
  });

  describe('createLoadReducers', () => {
    describe('reducer without params', () => {
      type TestState = ResourceState<string[]>;
      const actions = createLoadActions<string[]>('foobar');
      const state = initial<string[], void>([]);
      const reducer = createReducer<TestState>(state, ...createLoadReducer<string[], TestState>(actions));

      it('reduces load event', () => {
        const newState = reducer(state, actions.load({params: undefined}));

        expect(newState.loading).toBeTruthy();
      });

      it('reduces success event', () => {
        const newState = reducer(state, actions.success({data: ['a', 'b'], params: undefined}));

        expect(newState.loading).toBeFalsy();
        expect(newState.loaded).toBeTruthy();
        expect(newState.results).toEqual(['a', 'b']);
      });

      it('reduces failed event', () => {
        const newState = reducer(state, actions.failed({params: undefined}));

        expect(newState.loading).toBeFalsy();
        expect(newState.loaded).toBeFalsy();
        expect(newState.results).toEqual([]);
      });
    });

    describe('reducer with params', () => {
      type TestState = ResourceState<string[], {foo: string}>;
      const actions = createLoadActions<string[], {foo: string}>('foobar');
      const state = initial<string[], {foo: string}>([]);
      const reducer = createReducer<TestState>(
        state,
        ...createLoadReducer<string[], TestState, {foo: string}>(actions),
      );

      it('reduces load event', () => {
        const newState = reducer(state, actions.load({params: {foo: 'foo'}}));

        expect(newState.loadingParams).toEqual({foo: 'foo'});
        expect(newState.lastParams).toBeUndefined();
      });

      it('reduces success event', () => {
        const newState = reducer(state, actions.success({data: ['a', 'b'], params: {foo: 'foo'}}));

        expect(newState.lastParams).toEqual({foo: 'foo'});
        expect(newState.loadingParams).toBeUndefined();
      });

      it('reduces failed event', () => {
        const newState = reducer(state, actions.failed({params: {foo: 'foo'}}));

        expect(newState.loadingParams).toBeUndefined();
        expect(newState.lastParams).toBeUndefined();
      });
    });

  });
});
