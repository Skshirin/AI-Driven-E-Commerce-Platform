import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "./popupSlice.js";
import { toggleSidebar } from "./popupSlice.js";

 export const register = createAsyncThunk(
  "auth/register",
  async (data, { thunkApi }) => {
    try{
      const response = await axiosInstance.post("/auth/register", data);
      toast.success(response.data.message);
      thunkApi.dispatch(toggleAuthPopup());
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
      thunkApi.dispatch(toggleAuthPopup());
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
      thunkApi.dispatch(toggleAuthPopup());
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
      const response = await axiosInstance.put(`/auth/password/reset/${token}`, { password, confirmPassword });
      toast.success(response.data.message);
      return response.data.user;
    }
    catch(error){
      const message = error.response.data.message || "Failed to reset password";
      toast.error(message);
      return thunkApi.rejectWithValue(message);
    }
  });

  export const updatePassword = createAsyncThunk(
  "auth/password/update",
  async (data, { thunkApi }) => {
    try{
      const response = await axiosInstance.put(`/auth/password/update/`, data);
      toast.success(response.data.message);
      return null;
    }
    catch(error){
      const message = error.response.data.message || "Failed to update password";
      toast.error(message);
      return thunkApi.rejectWithValue(message);
    }
  });

  export const updateProfile = createAsyncThunk(
  "auth/me/update",
  async (data, { thunkApi }) => {
    try{
      const response = await axiosInstance.put(`/auth/profile/update/`, data);
      toast.success(response.data.message);
      return response.data.user;
    }
    catch(error){
      const message = error.response.data.message || "Failed to update profile";
      toast.error(message);
      return thunkApi.rejectWithValue(message);
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
  extraReducers: (builder) => {
    builder
    .addCase(register.pending, (state) => {
      state.isSigningUp = true;
    })
    .addCase(register.fulfilled, (state, action) => {
      state.isSigningUp = false;
      state.authUser = action.payload;
    })
    .addCase(register.rejected, (state) => {
      state.isSigningUp = false;
    })
    builder
    .addCase(login.pending, (state) => {
      state.isLoggingIn = true;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.isLoggingIn = false;
      state.authUser = action.payload;
    })
    .addCase(login.rejected, (state) => {
      state.isLoggingIn = false;
    })
    .addCase(getUser.pending, (state) => {
      state.isCheckingAuth = true;
      state.authUser = null;
    })
    .addCase(getUser.fulfilled, (state, action) => {
      state.isCheckingAuth = false;
      state.authUser = action.payload;
    })
    .addCase(getUser.rejected, (state) => {
      state.isCheckingAuth = false;
      state.authUser = null;
    })
    .addCase(logout.pending, (state) => {
      state.authUser = null;
    })
    .addCase(logout.fulfilled, (state) => {
      state.authUser = {};
    })
    .addCase(logout.rejected, (state) => {
      state.authUser = state.authUser;
    })
    .addCase(forgotPassword.pending, (state) => {
      state.isRequestingForToken = true;
    })
    .addCase(forgotPassword.fulfilled, (state) => {
      state.isRequestingForToken = false;
    })
    .addCase(forgotPassword.rejected, (state) => {
      state.isRequestingForToken = false;
    })
    .addCase(resetPassword.pending, (state) => {
      state.isUpdatingPassword = true;
    })
    .addCase(resetPassword.fulfilled, (state) => {
      state.isUpdatingPassword = false;
      state.authUser = action.payload;
    })
    .addCase(resetPassword.rejected, (state) => {
      state.isUpdatingPassword = false;
    })
    .addCase(updatePassword.pending, (state) => {
      state.isUpdatingPassword = true;
    })
    .addCase(updatePassword.fulfilled, (state) => {
      state.isUpdatingPassword = false;
      state.authUser = action.payload;
    })
    .addCase(updatePassword.rejected, (state) => {
      state.isUpdatingPassword = false;
    })
    .addCase(updateProfile.pending, (state) => {
      state.isUpdatingProfile = true;
    })
    .addCase(updateProfile.fulfilled, (state) => {
      state.isUpdatingProfile = false;
      state.authUser = action.payload;
    })
    .addCase(updateProfile.rejected, (state) => {
      state.isUpdatingProfile = false;
    })
  },
});

export default authSlice.reducer;
