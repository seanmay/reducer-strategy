interface FSA {
  type: string;
  error?: true;
  payload?: any;
  meta?: any;
}

interface NarrowingAction<Key extends string> {
  type: Key;
}

interface BasicAction<Key extends string> {
  type: Key;
  payload?: any
  meta?: any;
}

interface ErrorAction<Key extends string> {
  type: Key;
  error: true;
  payload?: any;
  meta?: any;
}

type SpecificAction<
  Action extends BasicAction<Keys> | ErrorAction<Keys>,
  Key extends string,
  Keys extends string = Action["type"]
> = Extract<Action, NarrowingAction<Key>>;

interface Reducer<State, Action> {
  (state: State, action: Action): State;
}

type ReducerMap<
  State,
  Actions extends BasicAction<Keys> | ErrorAction<Keys>,
  Keys extends string = Actions["type"]
> = { [key in Keys]: Reducer<State, SpecificAction<Actions, key>> };

const isUnknownAction = (
  action: { type: string },
  map: { [key: string]: any }
): action is FSA => !(action.type in map);

type AnyAction<Keys extends string> = ErrorAction<Keys> | BasicAction<Keys>;

export const Strategy = <
  State,
  Actions extends AnyAction<Keys>,
  Keys extends string = Actions["type"]
>(
  map: ReducerMap<State, Actions>
): Reducer<State, Actions | Exclude<FSA, { type: Keys }>> => (state, action) =>
  isUnknownAction(action, map)
    ? state
    : map[action.type](state, action as SpecificAction<
        typeof action,
        typeof action.type
      >);
