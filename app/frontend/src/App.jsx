import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import CssBaseline from "@mui/material/CssBaseline";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider, Container } from "@mui/material";

import { FooterView } from "./features/FooterView";
import { theme } from "./helpers/helpersUI";
import { TopMenu } from "./features/MenuView";
import { IntroView } from "./features/IntroView";
import { AboutView } from "./features/AboutView";
import { AdminView } from "./features/AdminView";
import { useSelector } from "react-redux";
import { MapView } from "./features/MapView";
import { GapChart } from "./features/reservoir/GapChart";
import { GapView } from "./features/reservoir/GapView";
import { OverviewView } from "./features/OverviewView";

const EmptyView = () => {
  return <div />;
};

const sections = (settings) => {
  const views = {
    admin: settings.hasAdmin ? AdminView : EmptyView,
    scatter: GapView,
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

/* The main app, which pulls in all the other windows. */
export function App() {
  const settings = useSelector((state) => state.settings);
  const sectionsDivFull = sectionsDiv(settings);

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
                <Route path="/overview" element={<OverviewView />} />
                <Route path="/reservoirs" element={<MapView />} />
                <Route path="/shortfall" element={<GapView />} />
                <Route path="/about" element={<AboutView />} />
              </Routes>
            </Grid>
          </Grid>
        </Container>
      </CssBaseline>
    </ThemeProvider>
  );
}
