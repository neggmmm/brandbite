import { configureStore } from "@reduxjs/toolkit";
import rewardReducer from "./slices/rewardSlice";
import orderUserSlice from "./slices/orderUser.slice";
import cartSlice from "./slices/cartSlice"; // Import the cart slice 

export const store = configureStore({
  reducer: {
    reward: rewardReducer,
    orderUser: orderUserSlice,
     cart: cartSlice, // Add this line
  },
});