import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isStickyBarVisible: true,
    activeModal: null,
  },
  reducers: {
    setStickyBarVisible: (state, action) => {
      state.isStickyBarVisible = action.payload;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

export const { setStickyBarVisible, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
