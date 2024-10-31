import { createSlice } from "@reduxjs/toolkit";
import { deleteState } from "../utils/LocalStorage";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {
      name: "",
      loggedIn: false,
      email: "",
      phone: "",
      token: "",
      role: "",
    },
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      deleteState("auth");
      state.user = {
        name: "",
        loggedIn: false,
        email: "",
        phone: "",
        token: "",
        role: "",
      };
    },
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
