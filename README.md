# @zeit-dev/ngrx-util

![size](https://badgen.net/bundlephobia/minzip/@zeit-dev/ngrx-util)
![npm](https://badgen.net/npm/v/@zeit-dev/ngrx-util)
![license](https://badgen.net/npm/license/@zeit-dev/ngrx-util)
![github](https://badgen.net/github/checks/zeitdev/ngrx-util)
![codeclimate](https://badgen.net/codeclimate/maintainability/zeitdev/ngrx-util)
![coverage](https://badgen.net/codeclimate/coverage/zeitdev/ngrx-util)

## What is it?

This is a tiny (but growing) collection of small, composable utilities to make
working with NgRx easier.

Goals:

- composable - easy to extend by combining with own/other tools
- functional - prefer (pure) functions over thick services
- lightweight and treeshake-able
- comprehensible - less of a blackbox

### Compatibility

- Angular 8.x, 9.x
- NgRx 8.x, 9.x (with compatible Angular version of course)

## Installation

```shell script
npm add @zeit-dev/ngrx-util
```

or

```shell script
yarn add @zeit-dev/ngrx-util
```

## Usage

As this is a library of mainly functions and types, there is _no_ Angular module to import.

### Loading async data into state

This library provides a set of functions and types to assist in the recurring requirement of
loading async data (typically from a REST API) into the state.

#### 1. Define State-model

To represent the (loaded/loading/failed) data within the state, we wrap it in a `ResourceState`
wrapper type:

```typescript
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
```

`TResource` is the type of your data, it could be anything. Typically an object (single resource)
or a list.  
_Note_: `results` is intentionally not nullable (or undefined)! This allows you to specify the
initial/default value yourself (e.g. `[]` for list data).
`TParams` is the type of parameters you may need to load the data. More on that later.

There are 3 helper functions to make the task of loading the data (effect) and storing that (and the
meta information in the wrapper) in the state (reducer): `createLoadActions`, `createLoadReducer`,
`createLoadEffect`.

So let's define a state shape, and an initial state content:

```typescript
import {ResourceState, initial} from '@zeit-dev/ngrx-util'

export interface Todo {
  title: string;
}

const TodoState = ResourceState<Todo[]>;
const initialTodoState = initial<Todo[]>([]);
```

#### 2. `createLoadActions` - define actions

In order to load an external resource, we want 3 actions/events to represent the lifecycle:

- `load`: Initiates the async request/task. Optionally takes a params object.
- `success`: Indicates the successful return of the async task.
- `failed`: Indicates a failure in the async task.

```typescript
import { createLoadActions } from "@zeit-dev/ngrx-util";

const todoActions = createLoadActions("todo");
// => { load: LoadActionCreator, success: SuccessActionCreator, failed: FailedActionCreator }
```

_Note_: If you don't want an actions-object `{load, success,failed}`, just destructure it right away:

```typescript
import { createLoadActions } from "@zeit-dev/ngrx-util";

const {
  load: loadtodo,
  success: todoSuccess,
  failed: todoFailed,
} = createLoadActions("todo");
```

#### 3. `createLoadReducer` - get it into state

This function does not define a complete reducer, instead (to be composable) it returns 3 `On`s,
see [NgRx Reducers](https://ngrx.io/guide/store/reducers#creating-the-reducer-function).

So you would typically do:

```typescript
import { createLoadReducer } from "@zeit-dev/ngrx-util";
import { ActionReducerMap, createReducer } from "@ngrx/store";

export const reducers: ActionReducerMap<{ todos: TodoState }> = {
  todos: createReducer(
    initialTodoState,
    ...createLoadReducer<Todo[], TodoState>(todoActions),
  ),
};
```

This creates 3 reductions:

1. on `load`: Sets `loading: true` (and updates `loadingParams` from `load.params`)
2. on `success`: Sets `loaded: true` and `loading: false`, updates `results`
   with the loaded data (see effects below)
3. on `failed`: Sets `loading: false`

#### 4. `createLoadEffect` - do the actual work

As with `createLoadReducer` this does not define a complete effect, but provides a composable
part to incorporate into your own effect.  
It basically just does 3 things:

1. filter actions (on type `load`)
2. hand `load.params` over to a user defined callback to do the actual loading
3. take the return value of the callback, wrap it in `success` (and let NgRx dispatch that)

Additionally to that, it can propagate errors to Angulars `ErrorHandler` (if you supply it),
it dispatches `failed` on errors and it passes the current state (or substate if you use
`this._store$.select(...)` in to the callback)

```typescript
import { HttpClient } from "@angular/common/http";
import { ErrorHandler, Injectable } from "@angular/core";
import { Actions, createEffect } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { createLoadEffect } from "@zeit-dev/ngrx-util";
import { delay } from "rxjs/operators";
import { AppStateSlice, todoActions } from "./reducers";

export const TODOS_URL = "https://jsonplaceholder.typicode.com/todos";

@Injectable()
export class AppEffects {
  readonly loadTodos$ = createEffect(() =>
    this._actions$.pipe(
      createLoadEffect(
        todoActions,
        (params, state) => {
          /*
        If you want idempotency, add sth like
        if (todoState.loaded && isEqual(todoState.lastParams, params)) return of(todoState.results);
        or debouncing
        if (todoState.loading && isEqual(todoState.loadingParams, params)) return of(todoState.results);
      */
          return this._http.get(TODOS_URL).pipe(
            // Simulate some loading time
            delay(2000),
          );
        },
        this._store$,
        this._errorHandler,
      ),
    ),
  );

  constructor(
    private readonly _store$: Store<AppStateSlice>,
    private readonly _actions$: Actions,
    private readonly _http: HttpClient,
    private readonly _errorHandler: ErrorHandler,
  ) {}
}
```

Also see the [full example app](https://github.com/zeitdev/ngrx-util/examples).

## TODOs

- Improve types
  - Make `params` truly optional
  - Make `store$` truly optional
- More
  - Documentation
  - Examples
- Extend ideas
  - Identifiable entity-list
  - Partial resources like
    - Head vs. detail
    - Pagination
    - Search-results
  - Simultaneous storage of diff. results for diff. params
  - Easy idempotency
  - Easy-state accessors (like hooks)
  - Maybe helper to create a simple service layer
