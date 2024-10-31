import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import MuiPhoneNumber from "material-ui-phone-number-2";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";
import { LinearProgress, useTheme } from "@mui/material";
import { useState } from "react";
import { Environment } from "../../Environment";
import { tokens } from "../../Theme";
import { useDispatch } from "react-redux";
import { login } from "../../stores/UserSlice";
import { notify } from "../../utils/Toast";
import { saveState } from "../../utils/LocalStorage";
function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="#">
        Mex Printing
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function SignIn() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  let navigate = useNavigate();
  // TODO form validation

  const changePhoneNumber = (e) => {};

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const phoneStr = data.get("phone").toString().substring(1);
    const pass = data.get("password");
    const remember = data.get("remember");
    console.log(remember);

    const authData = {
      User_Phone: phoneStr,
      User_Password: pass,
      remember: remember,
    };
    mutation.mutate(authData);
  };
  // TODO optimize this code
  const mutation = useMutation((loginData) => {
    var _headers = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    return axios
      .post(
        `
        ${Environment.BaseURL}/api/user/login`,
        loginData,
        _headers
      )
      .then(
        (response) => {
          let userData = response.data;

          if (response.status === 200) {
            const user = {
              name: userData.User_First_Name + " " + userData.User_Last_Name,
              role: userData.User_Role_ID.role_name,
              email: userData.User_Email,
              phone: userData.User_Phone,
              token: userData.token,
              loggedIn: true,
              id: userData._id,
              otpVerified: true,
            };
            dispatch(login(user));
            if (loginData.remember === "remember") {
              saveState("auth", user);
            }
            navigate("/", { replace: true });
            notify("Login successful", "success");
          }
        },
        (error) => {
          notify(
            "Login unsuccessful Your phone number or password is incorrect",
            "error"
          );
          setLoading(false);
        }
      );
  });

  return (
    <Box sx={{ width: "100%" }}>
      {loading ? (
        <LinearProgress sx={{ background: colors.greenAccent[500] }} />
      ) : (
        ""
      )}
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={`/assets/images/logo.jpg`}
            alt="thorium-logo"
            width={110}
            height={100}
          />

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 3 }}
          >
            <MuiPhoneNumber
              id="outlined-password-input"
              variant="outlined"
              margin="normal"
              required
              fullWidth
              defaultCountry={"ke"}
              label="Phone"
              name="phone"
              autoFocus
              sx={{
                svg: {
                  height: "20px",
                },
                color: colors.greenAccent[500],
              }}
              onChange={changePhoneNumber}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              sx={{
                color: colors.greenAccent[500],
                outline: `none`,
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  sx={{
                    color: colors.greenAccent[500],
                    "&:hover": {
                      color: colors.greenAccent[500],
                    },
                  }}
                />
              }
              label="Remember me"
              name="remember"
              id="remember"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: colors.greenAccent[500],
                "&:hover": {
                  backgroundColor: colors.greenAccent[600],
                },
              }}
            >
              <Typography fontWeight={"bold"} variant="h5">
                Sign In
              </Typography>
            </Button>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </Box>
  );
}
