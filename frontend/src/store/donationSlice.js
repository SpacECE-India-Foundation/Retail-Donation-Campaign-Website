import { createSlice } from "@reduxjs/toolkit";

const donationSlice = createSlice({
  name: "donation",
  initialState: {
    amount: null,
    paymentMode: null,
    transactionId: "",
  },
  reducers: {
    setDonationDraft: (state, action) => {
      Object.assign(state, action.payload);
    },
    resetDonationDraft: (state) => {
      state.amount = null;
      state.paymentMode = null;
      state.transactionId = "";
    },
  },
});

export const { setDonationDraft, resetDonationDraft } = donationSlice.actions;
export default donationSlice.reducer;
