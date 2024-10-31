import { Box, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { tokens } from "../../Theme";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import axios from "axios";
import { Environment } from "../../Environment";
import { notify } from "../../utils/Toast";
import { useEffect } from "react";

export const FarmSegment = ({ segment }) => {
  const { user } = useSelector((state) => state.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [crops, setCrops] = useState();
  const navigate = useNavigate();

  const segmentClick = () => {
    navigate("/segment/view/crop", {
      state: { segment: segment },
    });
  };

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    width: "100%",
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: colors.grey[theme.palette.mode === "light" ? 800 : 200],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: colors.greenAccent[500],
    },
  }));

  return (
    <Box
      display="flex"
      justifyContent={"flex-start"}
      alignItems="center"
      p="10px"
      borderRadius={"5px"}
      backgroundColor={
        theme.palette.mode === "light" ? "#ededed" : colors.grey[600]
      }
      height="100px"
      width={"70%"}
      mt="10px"
      mb="10px"
      onClick={segmentClick}
    >
      <img
        style={{
          height: "99%",
          objectFit: "contain",
          backgroundColor: "white",
          borderRadius: "5px",
        }}
        src={
          segment.Crop_ID
            ? segment.Crop_ID.Crop_Image
            : "/assets/images/thorium-main.png"
        }
      />
      <Box
        ml="30px"
        display={"flex"}
        flexDirection="column"
        justifyContent={"center"}
        alignItems="start"
        width="90%"
      >
        <Typography variant="h3" sx={{ fontWeight: "bold", fontSize: "14pt" }}>
          {segment.segmentName}
        </Typography>
        <Typography sx={{ fontSize: "10pt" }}>
          {segment.segmentDescription}
        </Typography>
        <BorderLinearProgress variant="determinate" value={50} />
        <Typography sx={{ mt: "10px" }}>{`Updated on: ${new Date(
          segment.updatedAt
        ).toLocaleDateString()}`}</Typography>
      </Box>
    </Box>
  );
};

export const AnimalSegment = ({ segment }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (user) {
      fetchAnimals();
    }
  }, [user]);

  const fetchAnimals = async () => {
    axios
      .get(
        `${Environment.BaseURL}/api/Animal/readAllAnimalDetails?Segments_ID=${segment._id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      )
      .then(
        (response) => {
          if (response.status === 200) {
            setAnimals(response.data);
            setLoading(false);
          }
        },
        (error) => {
          if (error.response.status === 403) {
            notify("No data for farm found");
            console.log("No Data found");
          } else {
            console.error(error);
            notify("Could not fetch data. Check console for details", error);
          }
          setLoading(false);
        }
      );
  };
  const segmentClick = () => {
    if (!loading) {
      navigate("/segment/view/animal", {
        state: { segment: segment, animals: animals },
      });
    }
  };

  //fetch animals in segment

  return (
    <Box
      display="flex"
      justifyContent={"flex-start"}
      alignItems="center"
      p="10px"
      borderRadius={"5px"}
      backgroundColor={
        theme.palette.mode === "light" ? "#ededed" : colors.grey[600]
      }
      height="100px"
      width={"70%"}
      mt="10px"
      mb="10px"
      onClick={segmentClick}
      sx={{ cursor: loading ? "not-allowed" : "pointer" }}
    >
      <img
        style={{
          height: "99%",
          objectFit: "contain",
          backgroundColor: "white",
          borderRadius: "5px",
        }}
        src={
          segment.AnimalBreed_ID
            ? segment.AnimalBreed_ID.photo
            : "/assets/images/thorium-main.png"
        }
      />
      <Box
        ml="30px"
        display={"flex"}
        flexDirection="column"
        justifyContent={"center"}
        alignItems="start"
        width="90%"
      >
        <Typography variant="h3" sx={{ fontWeight: "bold", fontSize: "14pt" }}>
          {segment.segmentName}
        </Typography>
        <Typography
          sx={{ fontSize: "10pt" }}
        >{`${animals.length} animals`}</Typography>
        <Typography sx={{ mt: "10px" }}>{`Updated on: ${new Date(
          segment.updatedAt
        ).toLocaleDateString()}`}</Typography>
      </Box>
    </Box>
  );
};
