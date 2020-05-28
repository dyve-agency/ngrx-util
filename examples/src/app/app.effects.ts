import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Actions, createEffect} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {createLoadEffect} from '@zeit-dev/ngrx-util';
import {delay} from 'rxjs/operators';
import {AppStateSlice, todosActions} from './reducers';

export const TODOS_URL = 'https://jsonplaceholder.typicode.com/todos';

@Injectable()
export class AppEffects {
  readonly loadTodos$ = createEffect(() => this._actions$.pipe(
    createLoadEffect(todosActions, () => {
      return this._http.get(TODOS_URL).pipe(
        // Simulate some loading time
        delay(2000),
      );
    }, this._store$),
  ));

  constructor(
    private readonly _store$: Store<AppStateSlice>,
    private readonly _actions$: Actions,
    private readonly _http: HttpClient,
  ) {
  }
}
