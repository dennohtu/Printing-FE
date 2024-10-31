import {
  Container,
  Typography,
  Button,
  CssBaseline,
  Box,
  LinearProgress,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import OtpInput from "react18-input-otp";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "react-query";
import axios from "axios";
import { Environment } from "../../Environment";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../stores/UserSlice";
import { loadState, saveState } from "../../utils/LocalStorage";
import { tokens } from "../../Theme";

function Otp() {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [otp, setOtp] = useState("");
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    handleResendOtp();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    verifyMutation.mutate({ User_Phone: user.phone, OTP: otp });
  };

  const handleResendOtp = () => {
    toast("OTP sent to your registered email address", "Success");
    resendOtp.mutate({ User_Phone: user.phone });
  };

  const sendOtp = (phone) => {
    var _headers = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    // const headers = new Api()._headers
    return axios.post(
      `${Environment.BaseURL}/api/user/sendOTPToPhoneNUmber`,
      phone,
      _headers
    );
  };

  const resendOtp = useMutation((phone) => sendOtp(phone));

  // TODO optimize this code use the Use the verify Otp code
  const verifyMutation = useMutation((otp) => {
    var _headers = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    return axios
      .post(
        `
    ${Environment.BaseURL}/api/user/checkOTPValid`,
        otp,
        _headers
      )
      .then(
        (response) => {
          if (response.status === 200) {
            const userN = { ...user, loggedIn: true, otpVerified: true };
            const usr = loadState("auth");
            if (usr) {
              saveState("auth", userN);
            }
            dispatch(login(userN));
            toast("OTP is valid", "success");
            navigate("/", { replace: true });
          }
        },
        (error) => {
          toast("Your OTP is invalid", "error");
          setLoading(false);
        }
      );
  });

  return (
    <Box sx={{ width: "100%" }}>
      {loading ? (
        <LinearProgress sx={{ backgroundColor: colors.greenAccent[500] }} />
      ) : (
        ""
      )}
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={`/assets/images/thorium-main.png`}
            alt="thorium-logo"
            width={110}
            height={100}
          />
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 4, mb: 4 }}
          >
            {/* <Typography
            variant="h4"
            component="h4"
            justifyContent="center"
            alignItems="center">
                Enter Your 6 digit Code
          </Typography> */}

            <OtpInput
              value={otp}
              onChange={(otp) => setOtp(otp)}
              numInputs={4}
              separator={<span>-</span>}
              inputStyle={{
                width: "3rem",
                height: "3rem",
                margin: "1 1rem",
                fontSize: "2rem",
                borderRadius: 4,
                border: "1px solid rgba(0,0,0,0.3)",
              }}
            />
            <Typography
              sx={{
                marginTop: 4,
              }}
              variant="h6"
              component="h6"
              justifyContent="center"
              alignItems="center"
            >
              Click{" "}
              <span onClick={handleResendOtp} style={{ cursor: "pointer" }}>
                <b>here</b>
              </span>{" "}
              to resend OTP
            </Typography>
            {/* <div>the otp is {otp}</div> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                mb: 2,
                backgroundColor: colors.greenAccent[500],
                "&:hover": { backgroundColor: colors.greenAccent[300] },
              }}
            >
              Verify
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Otp;
