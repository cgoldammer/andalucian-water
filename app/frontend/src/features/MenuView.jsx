import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import { texts } from "../texts";
import { Link as RouterLink } from "react-router-dom";

const pagesData = [
  { name: "Home", url: "/" },
  { name: "Reservoirs", url: "/reservoirs" },
  { name: "Shortfall", url: "/shortfall" },
  { name: "About", url: "/about" },
];
const pagesDataNoUser = [];

export function TopMenu() {
  const pagesDataAll = pagesData.concat(pagesDataNoUser);

  const getPagesItem = (pageData) => {
    const { name, url } = pageData;
    var item = (
      <MenuItem key={name} component={RouterLink} to={url}>
        <Typography textAlign="center">{name}</Typography>
      </MenuItem>
    );
    return item;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">{texts.appName}</Typography>
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            {pagesDataAll.map(getPagesItem)}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
