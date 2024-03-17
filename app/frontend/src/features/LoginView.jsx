import React, { useState } from "react";
import {
  Grid,
  TextField,
  FormControlLabel,
  Button,
  Typography,
  Link,
  FormLabel,
  RadioGroup,
  FormControl,
  Radio,
} from "@mui/material";
import { useRegisterUserMutation, useGetLoginTestQuery, util } from "./api/apiSlice";
import { setToken } from "../reducers/userReducer";
import { useDispatch, useSelector } from "react-redux";
import { hasUserTokenSelector, userSelector } from "../store";
import { useNavigate } from "react-router-dom";

export function UserView() {
  const token = useSelector((state) => state.userData.token);
  console.log("UserView token: ", token)
  const { data, error, isLoading } = useGetLoginTestQuery({
    skip: token != undefined,
  });
  if (token == undefined) {
    return <div>Not logged in</div>;
  }
  if (isLoading || data == undefined) {
    return <div>Loading...</div>;
  }
  console.log("UserView data: ", data)
  const user = data.user;
  return (
    <div>
      <div> Username: {user}</div>
    </div>
  );
}

export function LoginView(props) {
  const [password, setPassword] = useState("a");
  const [username, setUserName] = useState("a");
  const [isLogin, setIsLogin] = useState(false);
  const dispatch = useDispatch();
  const hasUserToken = useSelector(hasUserTokenSelector);
  console.log("hasUserToken: " + hasUserToken);

  const navigate = useNavigate();
  const [registerUser, { error: registerError }] = useRegisterUserMutation();
  const registerAction = (data) =>
    new Promise((resolve, reject) => {
      registerUser({ username, password, isLogin })
        .unwrap()
        .then((data) => {
          dispatch(setToken(data.token));
          dispatch(util.invalidateTags(["User", "IngredientSet"]));
          resolve();
        })
        .catch((rejected) => console.error(rejected));
    });
  const passwordReset = !isLogin ? (
    <span />
  ) : (
    <Typography>
      <Link href="#">Forgot password ?</Link>
    </Typography>
  );

  return (
    <Grid>
      <Grid align="center">
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={isLogin ? "login" : "register"}
            onChange={(e) => setIsLogin(e.target.value == "login")}
          >
            <FormControlLabel
              value="register"
              control={<Radio />}
              label="Register"
            />
            <FormControlLabel value="login" control={<Radio />} label="Login" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <TextField
        label="Username"
        placeholder="Enter username"
        variant="outlined"
        value={username}
        onChange={(e) => setUserName(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="Password"
        placeholder="Enter password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        required
      />
      <Grid align="center">
        <Button
          type="submit"
          color="primary"
          variant="contained"
          onClick={() =>
            registerAction({ username, password, isLogin }).then((data) => {
              console.log("Invalidating / " + username + ": " + password);
              console.log("Data");
              console.log(data);
              navigate("/");
              // refetchUser();
            })
          }
        >
          {isLogin ? "Login" : "Register"}
        </Button>
        {passwordReset}
      </Grid>

      {/*<div>*/}
      {/*  <div>{userError != undefined ? userError.status : ""}</div>*/}
      {/*</div>*/}
    </Grid>
  );
}
