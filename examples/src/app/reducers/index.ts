import {
  ActionReducerMap,
  createFeatureSelector,
  createReducer,
  createSelector,
  MetaReducer,
} from "@ngrx/store";
import {
  createLoadActions,
  createLoadReducer,
  initial,
  ResourceState,
} from "@zeit-dev/ngrx-util";
import { environment } from "../../environments/environment";

export const todosActions = createLoadActions<Todo[]>("todos");

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export type TodosResource = ResourceState<Todo[]>;

export const appFeatureKey = "app";

export interface AppState {
  todos: TodosResource;
}

export interface AppStateSlice {
  [appFeatureKey]: AppState;
}

export const appFeatureSelector = createFeatureSelector<AppState>(
  appFeatureKey,
);
export const todosSelector = createSelector(
  appFeatureSelector,
  (state) => state.todos,
);

export const reducers: ActionReducerMap<AppState> = {
  todos: createReducer(
    initial<Todo[], void>([]),
    ...createLoadReducer<Todo[], TodosResource>(todosActions),
  ),
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
