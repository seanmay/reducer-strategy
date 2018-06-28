import { Strategy } from "redux-strategies";
import { createStore } from "redux";

enum ShoePurchase {
  Request = "Request",
  Error = "Error",
  Success = "Success"
}

interface TransactionSuccess {
  quantity: number;
  id: string;
}

interface TransactionRequest {
  quantity: number;
}

type BuyShoesAction = {
  type: ShoePurchase.Request;
  payload: TransactionRequest;
};

type BuyShoesError = {
  type: ShoePurchase.Error;
  error: true;
  payload: Error;
};

type BuyShoesSuccess = {
  type: ShoePurchase.Success;
  payload: TransactionSuccess;
};

type ShoeActions = BuyShoesAction | BuyShoesError | BuyShoesSuccess;

type ShoeState = {
  pending: boolean;
  errors: Error[];
  shoes: number;
};

export const shoeducer = Strategy<ShoeState, ShoeActions>({
  [ShoePurchase.Request]: (state, action) => ({ ...state, pending: true }),
  [ShoePurchase.Error]: (state, action) => {
    console.error(action.payload.message);
    // note that I don't need to check if `action.payload.message` exists
    // `message` is a required `string`, on `Error`
    return {
      ...state,
      pending: false,
      errors: state.errors.concat(action.payload)
    };
  },
  [ShoePurchase.Success]: (state, action) => {
    action.payload.id; // <-- hover over this, with a TS2.8+ editor.
    // Infer all the things!
    return {
      ...state,
      pending: false,
      errors: [],
      shoes: state.shoes + action.payload.quantity
    };
  }
});

const ShoeAction = {
  [ShoePurchase.Request]: (quantity: number): BuyShoesAction => ({
    type: ShoePurchase.Request,
    payload: { quantity }
  }),
  [ShoePurchase.Error]: (err: Error): BuyShoesError => ({
    type: ShoePurchase.Error,
    payload: err,
    error: true
  }),
  [ShoePurchase.Success]: (
    transaction: TransactionSuccess
  ): BuyShoesSuccess => ({
    type: ShoePurchase.Success,
    payload: transaction
  })
};

const store = createStore(shoeducer, { shoes: 0, pending: false, errors: [] });

store.dispatch<ShoeActions>({
  type: ShoePurchase.Error,
  error: true,
  payload: { name: "SomeRandomError", message: "" }
}); //?

store.dispatch<ShoeActions>({
  type: ShoePurchase.Success,
  payload: { id: "someID", quantity: 5 }
}); //?

store.dispatch<ShoeActions>({
  type: ShoePurchase.Success,
  payload: { id: "someID", quantity: 5 }
}); //?

store.dispatch<ShoeActions>(ShoeAction[ShoePurchase.Request](8));

shoeducer(
  { shoes: 0, pending: true, errors: [] },
  { type: ShoePurchase.Request, payload: { quantity: 5 } }
);
