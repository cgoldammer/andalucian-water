import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { listToDictByKey } from "../../helpers/helpers";
const url = process.env.BACKENDURL || "http://localhost:9999/";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: url,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = "Token " + getState().userData.token;
      if (token != undefined && endpoint != "registerUser") {
        headers.set("authorization", token);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "ReservoirState", "Reservoir", "Daily"],
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
      query: () => {
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
      query: () => {
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
      transformResponse: (response) => listToDictByKey(response, "uuid"),
      providesTags: ["Reservoir"],
    }),
    getRainfall: builder.query({
      query: (data) => {
        const { is_first_of_year, reservoir_uuids, start_date, end_date } =
          data;
        return {
          url: `/get_rainfall?is_first_of_year=${is_first_of_year}&reservoir_uuids=${reservoir_uuids}&start_date=${start_date}&end_date=${end_date}`,
          method: "GET",
        };
      },
      providesTags: ["ReservoirState"],
    }),
    getReservoirStates: builder.query({
      query: (data) => {
        const { is_first_of_year, reservoir_uuids, start_date, end_date } =
          data;
        return {
          url: `/get_reservoir_states?is_first_of_year=${is_first_of_year}&reservoir_uuids=${reservoir_uuids}&start_date=${start_date}&end_date=${end_date}`,
          method: "GET",
        };
      },
      providesTags: ["ReservoirState"],
    }),
    getDailyData: builder.query({
      query: (data) => {
        const { isFirstOfYear, reservoirUuids, startDate, endDate } = data;
        const uuidsJoined = reservoirUuids.join(",");
        const url = `/get_wide/?is_first_of_year=${isFirstOfYear}&reservoir_uuids=${uuidsJoined}&start_date=${startDate}&end_date=${endDate}`;
        return {
          url: url,
          method: "GET",
        };
      },
      providesTags: ["Daily"],
    }),
    getReservoirsJson: builder.query({
      query: () => {
        return {
          url: "/get_reservoirs_geojson",
          method: "GET",
        };
      },
    }),
    getRegionsJson: builder.query({
      query: () => {
        return {
          url: "/get_regions_geojson",
          method: "GET",
        };
      },
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
  useGetReservoirsJsonQuery,
  useGetRegionsJsonQuery,
  util,
} = apiSlice;
