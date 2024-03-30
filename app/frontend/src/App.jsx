import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import CssBaseline from "@mui/material/CssBaseline";
import { Route, Routes, useParams } from "react-router-dom";
import {
  ThemeProvider,
  Box,
  Container,
  Button,
  CardMedia,
  FormControl,
  Input,
  InputLabel,
  FormHelperText,
  TextField,
} from "@mui/material";
import Typography from "@mui/material/Typography";

import { FooterView } from "./features/FooterView";
import { texts } from "./texts";
import { theme, Image, NewButton } from "./helpers/helpersUI";
import { isDev } from "./helpers/helpers";
import { TopMenu } from "./features/MenuView";
import { IntroView } from "./features/IntroView";

import { AdminView } from "./features/AdminView";
import { useDispatch, useSelector } from "react-redux";
import { useGetLoginTestQuery } from "./features/api/apiSlice";
import { UserView, LoginView } from "./features/LoginView";
import { MapView } from "./features/MapView";
import { setToken } from "./reducers/userReducer";
import { ReservoirsView } from "./features/reservoir/ReservoirsView";
import { GapChart } from "./features/reservoir/GapChart";

const EmptyView = () => {
  return <div />;
};

const sections = (settings) => {
  const views = {
    admin: settings.hasAdmin ? AdminView : EmptyView,
    map: MapView,
    table: GapChart,
    intro: IntroView,
    footer: FooterView,
  };

  /* Only keep the views that are enabled in settings. */
  const viewsVisibleList = settings.viewsVisible;
  const viewsVisible = { admin: views.admin };
  viewsVisibleList.forEach((view) => {
    if (views[view]) {
      viewsVisible[view] = views[view];
    }
  });
  return viewsVisible;
};

const sectionsDiv = (settings) => {
  const sectionViews = sections(settings);

  const sectionView = (section) => {
    const SectionComponent = sectionViews[section];
    return (
      <Grid key={section} xs={12}>
        <div id={"section" + section}>
          <SectionComponent />
        </div>
      </Grid>
    );
  };

  return (
    <Grid container spacing={2}>
      {Object.keys(sectionViews).map(sectionView)}
    </Grid>
  );
};

const MagicLogin = () => {
  const { token } = useParams();
  const dispatch = useDispatch();

  // Dispatch the setToken action to update the token state in Redux store
  dispatch(setToken(token));
  console.log("Set magic token: ", token);

  return <MapView />;
};

/* The main app, which pulls in all the other windows. */
export function App() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  console.log("Settings: ", settings);
  const sectionsDivFull = sectionsDiv(settings);
  const token = useSelector((state) => state.userData.token);
  // const { data, error, isLoading } = useGetLoginTestQuery({
  //   skip: token != undefined,
  // });
  // console.log("Login data: ", data);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <Container maxWidth="md">
          <Grid container justifyContent="center" alignItems="center">
            <Grid container xs={12}>
              <TopMenu />
            </Grid>
            <Grid container justifyContent="center" alignItems="center" xs={12}>
              <Routes>
                {/* <Route path="/" element={<IntroView />} /> */}
                <Route path="/" element={sectionsDivFull} />
                <Route path="/explore" element={<MapView />} />
                <Route path="/explore/:token" element={<MagicLogin />} />
                {/* <Route path="/profile" element={<UserView />} /> */}
                <Route path="/register" element={<LoginView />} />
              </Routes>
            </Grid>
          </Grid>
        </Container>
      </CssBaseline>
    </ThemeProvider>
  );
}
