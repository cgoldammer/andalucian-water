import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import base64 from "base-64";
const url = process.env.BACKENDURL;
console.log("Backend: " + url);

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: url,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = "Token " + getState().userData.token;
      console.log("Header token in request:" + token);
      if (token != undefined && endpoint != "registerUser") {
        headers.set("authorization", token);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "ReservoirState", "Reservoir"],
  credentials: "include",
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      invalidatesTags: ["User"],
      query: (data) => {
        const { username, password, isLogin } = data;
        const urlLogin = isLogin ? "/login" : "/register";
        return {
          url: urlLogin,
          method: "POST",
          headers: {
            username: username,
            password: password,
          },
        };
      },
    }),
    logout: builder.mutation({
      // invalidatesTags: ["User", "IngredientSet"],
      query: (data) => {
        return {
          url: "/logout",
          method: "POST",
        };
      },
    }),
    getTest: builder.query({
      query: (params) => {
        return {
          url: `/test/${params.text}`,
          method: "GET"
        };
      },
      providesTags: ["User"],
    }),
    getLoginTest: builder.query({
      query: (params) => {
        return {
          url: "/login_test",
          method: "GET"
        };
      },
      providesTags: ["User"],
    }),
    getReservoirStates: builder.query({
        query: () => {
            return {
            url: "/get_reservoir_states",
            method: "GET",
            };
        },
        providesTags: ["ReservoirState"],
        }),
    })
});

export const {
    useRegisterUserMutation,
    useLogoutMutation,
    useGetTestQuery,
    useGetLoginTestQuery,
    useGetReservoirStatesQuery,
    util
} = apiSlice;