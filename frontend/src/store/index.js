import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import donationReducer from "./donationSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    donation: donationReducer,
    ui: uiReducer,
  },
});
