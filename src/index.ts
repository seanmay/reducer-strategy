type Immutable<T> = T extends any[]
  ? ImmutableArray<T[number]>
  : T extends object ? ImmutableObject<T> : T;

type ImmutableObject<T> = { readonly [key in keyof T]: Immutable<T[key]> };

interface ImmutableArray<T> extends ReadonlyArray<Immutable<T>> {}

interface FSA {
  type: string;
  error?: true;
  payload?: any;
  meta?: any;
}

type InferredKeys<T> = T extends { type: infer Key } ? Key : never;

interface BasicAction<Key> {
  type: Key;
  payload?: any;
  meta?: any;
}

interface ErrorAction<Key> {
  type: Key;
  error: true;
  payload?: any;
  meta?: any;
}

type AnyAction<Key> = BasicAction<Key> | ErrorAction<Key>;
type NarrowingAction<Key> = { type: Key };
type SpecificAction<Action, Key> = Extract<Action, NarrowingAction<Key>>;

interface Reducer<State, Action> {
  (state: Immutable<State>, action: Immutable<Action>): Immutable<State>;
}

type ReducerMap<State, Actions, Keys extends string> = {
  [key in Keys]: (state: Immutable<State>, action: Immutable<SpecificAction<Actions, key>>) => Immutable<State>
  // Reducer<State, SpecificAction<Actions, key>>
};

const isUnknownAction = (
  action: { type: string },
  map: { [key: string]: any }
): action is FSA => !(action.type in map);

export const Strategy = <
  State,
  Actions extends AnyAction<Keys>,
  Keys extends string = Extract<InferredKeys<Actions>, string>
>(
  map: ReducerMap<State, Actions, Keys>
) => (state: State, action: Actions) => {
  const isUnknown = isUnknownAction(action, map);
  if (isUnknown) {
    return state as Immutable<State>;
  } else {
    const reduce = map[action.type];
    const result: Immutable<State> = reduce(
      state as Immutable<typeof state>,
      action as Immutable<SpecificAction<typeof action, typeof action.type>>
    );
    return result;
  }
};
