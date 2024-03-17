import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import SettingsOutlinedIcon from "@mui/icons-material/Settings";
import { setToken } from "../reducers/userReducer";
import { texts } from "../texts";

import Link from "@mui/material/Link";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useGetUserQuery, useLogoutMutation, useGetLoginTestQuery, util } from "./api/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { hasUserTokenSelector, userSelector } from "../store";

const pagesData = [
  { name: "Home", url: "/" },
];
const pagesDataNoUser = [
  { name: "Register or Login", url: "/register"}
];
const pagesDataUser = [
  { name: "Explore", url: "/explore" },
];

const settingsData = [{ name: "About", url: "/about" }];
const settingsDataNoUser = [
];

const settingsDataUser = [
  { name: "Logout", submit: "/logout" },
  { name: "Profile", url: "/profile" },
];

export function TopMenu() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const dispatch = useDispatch();
  const [logout, { error: logoutError }] = useLogoutMutation();
  const hasUserToken = useSelector(hasUserTokenSelector);

  const pagesDataAll = pagesData.concat(
    hasUserToken ? pagesDataUser : pagesDataNoUser
  );

  const settingsDataAll = settingsData.concat(
    hasUserToken ? settingsDataUser : settingsDataNoUser
  );

  console.log("Has token: " + hasUserToken)

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const getPagesItem = (pageData) => {
    const { name, url } = pageData;
    var item = (
      <MenuItem
        key={name}
        onClick={handleCloseUserMenu}
        component={RouterLink}
        to={url}
      >
        <Typography textAlign="center">{name}</Typography>
      </MenuItem>
    );
    return item;
  };

  const getMenuItem = (settingsData) => {
    const { name, url, submit } = settingsData;
    var item = (
      <MenuItem
        key={name}
        onClick={() => {
          logout().then(() => {
            console.log("LOGGING OUT")
            
            dispatch(setToken(undefined));
            dispatch(util.invalidateTags(["User"]));
            // Reset the data stored at the useGetLoginTestQuery endpoint
            
          });
          handleCloseUserMenu();
        }}
      >
        <Typography textAlign="center">{name}</Typography>
      </MenuItem>
    );
    if (url != undefined) {
      item = (
        <MenuItem
          key={name}
          onClick={handleCloseUserMenu}
          component={RouterLink}
          to={url}
        >
          <Typography textAlign="center">{name} </Typography>
        </MenuItem>
      );
    }
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

          <Box>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <SettingsOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settingsDataAll.map(getMenuItem)}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
