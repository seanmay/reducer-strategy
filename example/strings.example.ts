import { Strategy } from "redux-strategies";

type BuyAction = {
  type: "Buy";
  payload: { item: "Shoes" | "Socks"; quantity: number };
};

type SellAction = {
  type: "Sell";
  payload: { itemId: "ABC" | "123"; cost: number };
};

type Actions = BuyAction | SellAction;

interface State {
  x: number;
  y: string;
}

const strategy = Strategy<State, Actions>({
  Buy: (state, action) => ({ x: 0, y: "" }),
  Sell: (state, action): State => ({ ...state, y: action.payload.itemId })
});

strategy(
  { x: 0, y: "" },
  { type: "Buy", payload: { item: "Socks", quantity: 0 } }
);

strategy(
  { x: 0, y: "" },
  { type: "Sell", payload: { itemId: "123", cost: 123 } }
);
