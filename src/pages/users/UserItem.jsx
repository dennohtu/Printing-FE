import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import Badge from "../../components/Badge";
import { tokens } from "../../Theme";
import {
  ButtonLoadingPlaceholder,
  LargeContentPlaceHolder,
} from "../../components/SuspenseLoader";
import { useMutation } from "react-query";
import { Environment } from "../../Environment";
import { notify } from "../../utils/Toast";
import axios from "axios";
import ArrowBack from "@mui/icons-material/ArrowBack";

const liStyle = {
  position: "relative",
  paddingTop: "66%",
};

const UserItem = () => {
  const { user } = useSelector((state) => state.user);
  const [userEdit, setUser] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerify] = useState(false);
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width:600px)");

  const ulStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${isDesktop ? "4" : "2"}, minmax(100px, 1fr))`,
    gridGap: "15px",
    listStyle: "none",
    margin: "0",
    padding: "0",
  };

  useEffect(() => {
    if (location.state && location.state.user) {
      //set user data
      setUser(location.state.user);
    }
  }, [location]);

  useEffect(() => {
    if (userEdit) {
      setLoading(false);
    }
  }, [userEdit]);

  const verifyUser = (type) => {
    setVerify(true);
    if (type === "verify") verify.mutate({ User_Verified: true });
    else if (type === "thorium") verify.mutate({ User_Thorium_Farmer: true });
    else if (type === "organic") verify.mutate({ User_Organic_Farmer: true });
  };

  const verify = useMutation((data) => {
    return axios({
      url: `${Environment.BaseURL}/api/user/updateUser/${userEdit._id}`,
      method: "PUT",
      data: data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify("User Verified Successfully", "success");
          setVerify(false);
        } else {
          notify("Could not Verify User.\n" + response.data.message, "error");
          setVerify(false);
        }
      },
      (error) => {
        console.log("Error: ", error);
        notify(
          "An error occured while trying to verify user.\n" + error.message,
          "error"
        );
        setVerify(false);
      }
    );
  });

  return (
    <Box mt="20px" width="100%">
      {loading ? (
        <LargeContentPlaceHolder />
      ) : (
        <Box
          width={"95%"}
          display="flex"
          flexDirection={"column"}
          p="20px"
          alignItems={"center"}
        >
          <Box width="100%">
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack sx={{ fontSize: "18pt" }} />
            </IconButton>
          </Box>
          <Typography variant="h1" sx={{ fontWeight: "800" }}>
            {`${userEdit.User_First_Name} ${userEdit.User_Last_Name}`}
          </Typography>
          <Box
            display={"flex"}
            justifyContent={isDesktop ? "space-evenly" : "center"}
            alignItems="center"
            width={"100%"}
            flexDirection={isDesktop ? undefined : "column"}
          >
            <img
              src={
                userEdit.User_Passport_Photo
                  ? userEdit.User_Passport_Photo
                  : "/assets/images/placeholder.jpg"
              }
              alt="profilePhoto"
              style={{
                borderRadius: "50%",
                width: "200px",
                height: "200px",
                objectFit: userEdit.User_Passport_Photo ? undefined : "contain",
              }}
            />
            <Box display="flex" flexDirection={"column"}>
              <Typography
                variant="h5"
                sx={{ fontSize: "14pt", fontWeight: "600" }}
              >
                {userEdit.User_Gender === "M"
                  ? "Male"
                  : userEdit.User_Gender === "F"
                  ? "Female"
                  : userEdit.User_Gender}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontSize: "14pt", fontWeight: "600" }}
              >
                {userEdit.User_Email}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontSize: "14pt", fontWeight: "600" }}
              >
                {userEdit.User_Phone}
              </Typography>
            </Box>
          </Box>
          <Box mt="20px" display="flex" width="95%">
            <Typography
              sx={{ fontWeight: "bold" }}
            >{`Date Joined: `}</Typography>
            <Typography sx={{ fontWeight: "bold" }}>
              {new Date(userEdit.User_Onboard_Date).toLocaleDateString()}
            </Typography>
          </Box>
          <Box width={"95%"} mt="20px" display="flex" justifyContent={"center"}>
            <Typography
              variant="h3"
              sx={{ fontWeight: "700", textDecorationLine: "underline" }}
            >
              Badges
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection={isDesktop ? undefined : "column"}
            justifyContent={"space-evenly"}
            alignItems="center"
          >
            {userEdit.User_Thorium_Farmer && (
              <Badge thoriumFarmer={userEdit.User_Thorium_Farmer} />
            )}
            {userEdit.User_Verified && (
              <Badge userVerified={userEdit.User_Verified} />
            )}
            {userEdit.User_Organic_Farmer && (
              <Badge organicFarmer={userEdit.User_Organic_Farmer} />
            )}
            {!userEdit.User_Organic_Farmer &&
              !userEdit.User_Thorium_Farmer &&
              !userEdit.User_Verified && <Badge />}
          </Box>
          {user && user.role === "admin" && !user.employee?.ReadOnly && (
            <Box
              display="flex"
              flexDirection={"column"}
              mt="20px"
              width="95%"
              justifyContent={"center"}
              alignItems="center"
            >
              <Typography
                variant="h3"
                sx={{ fontWeight: "700", textDecorationLine: "underline" }}
              >
                User Documents
              </Typography>
              <Box
                width={"90%"}
                mt="20px"
                display="flex"
                justifyContent={"flex-end"}
              >
                <Button
                  disabled={verifying}
                  variant="contained"
                  sx={{
                    background: colors.greenAccent[500],
                    marginRight: "20px",
                    "&:hover": {
                      background: colors.greenAccent[300],
                    },
                  }}
                  onClick={() => verifyUser("organic")}
                >
                  {verifying ? (
                    <ButtonLoadingPlaceholder />
                  ) : (
                    "Verify User as Organic Farmer"
                  )}
                </Button>
                <Button
                  disabled={verifying}
                  variant="contained"
                  sx={{
                    background: colors.greenAccent[500],
                    marginRight: "20px",
                    "&:hover": {
                      background: colors.greenAccent[300],
                    },
                  }}
                  onClick={() => verifyUser("thorium")}
                >
                  {verifying ? (
                    <ButtonLoadingPlaceholder />
                  ) : (
                    "Verify User As Thorium Farmer"
                  )}
                </Button>
                <Button
                  disabled={verifying}
                  variant="contained"
                  sx={{
                    background: colors.greenAccent[500],
                    "&:hover": {
                      background: colors.greenAccent[300],
                    },
                  }}
                  onClick={() => verifyUser("verify")}
                >
                  {verifying ? <ButtonLoadingPlaceholder /> : "Verify User"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UserItem;
