import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

 export const register = createAsyncThunk(
  "auth/register",
  async (data, { thunkApi }) => {
  });

 export const login = createAsyncThunk(
  "auth/login",
  async (data, { thunkApi }) => {
  });

  export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, { thunkApi }) => {
  });

  export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { thunkApi }) => {
  });

 const authSlice = createSlice({
   name: "auth",
   initialState: {
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isUpdatingPassword: false,
      isRequestingForToken: false,
      isCheckingAuth: true,
   },
  extraReducers: (builder) => {},
});

export default authSlice.reducer;
