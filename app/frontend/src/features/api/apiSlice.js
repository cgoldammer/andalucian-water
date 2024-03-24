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
          method: "GET",
        };
      },
      providesTags: ["User"],
    }),
    getLoginTest: builder.query({
      query: (params) => {
        return {
          url: "/login_test",
          method: "GET",
        };
      },
      providesTags: ["User"],
    }),
    getReservoirs: builder.query({
      query: () => {
        return {
          url: "/get_reservoirs",
          method: "GET",
        };
      },
      providesTags: ["Reservoir"],
    }),
    getRainfall: builder.query({
      query: (data) => {
        const { is_first_of_month, reservoir_uuids, start_date, end_date } =
          data;
        console.log(
          "Getting data for rainfall: ",
          reservoir_uuids,
          " from ",
          start_date,
          " to ",
          end_date
        );
        return {
          url: `/get_rainfall?is_first_of_month=${is_first_of_month}&reservoir_uuids=${reservoir_uuids}&start_date=${start_date}&end_date=${end_date}`,
          method: "GET",
        };
      },
      providesTags: ["ReservoirState"],
    }),
    getReservoirStates: builder.query({
      query: (data) => {
        const { is_first_of_month, reservoir_uuids, start_date, end_date } =
          data;
        console.log(
          "Getting data for reservoirs: ",
          reservoir_uuids,
          " from ",
          start_date,
          " to ",
          end_date
        );
        return {
          url: `/get_reservoir_states?is_first_of_month=${is_first_of_month}&reservoir_uuids=${reservoir_uuids}&start_date=${start_date}&end_date=${end_date}`,
          method: "GET",
        };
      },
      providesTags: ["ReservoirState"],
    }),
    getDailyData: builder.query({
      query: (data) => {
        const { reservoir_uuids, start_date, end_date } = data;
        console.log(
          "Getting data for reservoirs: ",
          reservoir_uuids,
          " from ",
          start_date,
          " to ",
          end_date
        );
        return {
          url: `/get_daily_data?reservoir_uuids=${reservoir_uuids}&start_date=${start_date}&end_date=${end_date}`,
          method: "GET",
        };
      },
      providesTags: ["ReservoirState"],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLogoutMutation,
  useGetTestQuery,
  useGetLoginTestQuery,
  useGetReservoirsQuery,
  useGetRainfallQuery,
  useGetReservoirStatesQuery,
  useGetDailyDataQuery,
  util,
} = apiSlice;
