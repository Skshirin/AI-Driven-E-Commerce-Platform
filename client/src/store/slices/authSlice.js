import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "./uiSlice";

 export const register = createAsyncThunk(
  "auth/register",
  async (data, { thunkApi }) => {
    try{
      const response = await axiosInstance.post("/auth/register", data);
      toast.success(response.data.message);
      return response.data;
      thunkApi.dispatch(toggleAuthPopup);
      return response.data.user;
    }
    catch(error){
      toast.error(error.response.data.message);
      return thunkApi.rejectWithValue(error.response.data);
    }
  });

 export const login = createAsyncThunk(
  "auth/login",
  async (data, { thunkApi }) => {
    try{
      const response = await axiosInstance.post("/auth/login", data);
      toast.success(response.data.message);
      return response.data;
      thunkApi.dispatch(toggleAuthPopup);
      return response.data.user;
    }
    catch(error){
      toast.error(error.response.data.message);
      return thunkApi.rejectWithValue(error.response.data);
    }
  });

  export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, { thunkApi }) => {
    try{
      const response = await axiosInstance.get("/me");
      return response.data.user;
    }
    catch(error){
      return thunkApi.rejectWithValue(error.response.data) || "Failed to get user";
    }
  });

  export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { thunkApi }) => {
    try{
      const response = await axiosInstance.get("/logout");
      thunkApi.dispatch(toggleAuthPopup);
      return null;
    }
    catch(error){
      toast.error(error.response.data.message);
      return thunkApi.rejectWithValue(error.response.data) || "Failed to logout";
    }
  });

   export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { thunkApi }) => {
    try{
      const response = await axiosInstance.post("/auth/password/forgot?frontendUrl=http://localhost:5173",  email );
      return response.data;
      toast.success(response.data.message);
      return null;
    }
    catch(error){
      toast.error(error.response.data.message);
      return thunkApi.rejectWithValue(error.response.data);
    }
  });

  export const resetPassword = createAsyncThunk(
  "auth/password/reset",
  async ({token, password, confirmPassword}, { thunkApi }) => {
    try{
      const response = await axiosInstance.post(`/auth/password/reset/${token}`, { token, password, confirmPassword });
      return response.data;
      toast.success(response.data.message);
      return null;
    }
    catch(error){
      toast.error(error.response.data.message);
      return thunkApi.rejectWithValue(error.response.data);
    }
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
