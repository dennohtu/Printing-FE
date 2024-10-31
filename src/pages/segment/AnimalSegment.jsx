import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, IconButton, Tab, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AnimalList from "../../components/segment/Animals";
import AnimalScouting from "../../components/segment/AnimalScouting";
import AnimalTreatment from "../../components/segment/AnimalTreatment";
import ArtificialInsemination from "../../components/segment/ArtificialInsemination";
import Birth from "../../components/segment/Birth";
import FeedingProgramme from "../../components/segment/FeedingProgramme";
import MeatProduction from "../../components/segment/MeatProduction";
import MilkProduction from "../../components/segment/MilkProduction";
import Mortality from "../../components/segment/Mortality";
import PoultryProduction from "../../components/segment/PoultryProduction";
import { tokens } from "../../Theme";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

const AnimalSegmentItem = () => {
  const [currentTab, setCurrentTab] = useState("Animals");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const { segment, animals } = location.state;

  const handleTabChange = (e, val) => {
    setCurrentTab(val);
  };

  return (
    <Box
      display="flex"
      flexDirection={"column"}
      alignItems="center"
      width="100%"
    >
      <Box display="flex" width="95%" mt="30px">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackOutlinedIcon style={{ fontSize: "20pt" }} />
        </IconButton>
      </Box>
      <Box
        display="flex"
        justifyContent={"space-evenly"}
        width="95%"
        alignItems="center"
      >
        <img
          src={
            segment.AnimalBreed_ID
              ? segment.AnimalBreed_ID.photo
              : "/assets/images/thorium-main.png"
          }
          style={{
            borderRadius: "50%",
            width: "250px",
            height: "250px",
            objectFit: "contain",
          }}
        />
        <Box display="flex" flexDirection={"column"}>
          <Typography variant="h2" sx={{ width: "100%", fontWeight: "800" }}>
            {segment.segmentName}
          </Typography>
          <Typography
            sx={{ width: "100%" }}
          >{`${animals.length} Animals`}</Typography>
        </Box>
      </Box>
      <Box height="1px" width="100%" bgcolor={colors.grey[900]} mt="70px"></Box>
      <Box display="flex" width={"100%"}>
        <TabContext value={currentTab}>
          <TabList
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor={"secondary"}
            indicatorColor={"secondary"}
            orientation="vertical"
            sx={{
              background: colors.grey[900],
              height: "100%",
            }}
          >
            <Tab label="Animals" value="Animals" />
            <Tab label="Birth" value="Birth" />
            <Tab label="Feeding Programmes" value="FeedingProgrammes" />
            <Tab label="Meat Production" value="MeatProduction" />
            <Tab label="Milk Production" value="MilkProduction" />
            <Tab label="Poultry Production" value="PoultryProduction" />
            <Tab label="Scouting" value="Scouting" />
            <Tab label="Treatment" value="Treatment" />
            <Tab
              label="Artificial Insemination"
              value="ArtificialInsemination"
            />
            <Tab label="Mortality" value="Mortality" />
          </TabList>
          <TabPanel value="Animals" sx={{ width: "100%" }}>
            <AnimalList animals={animals} />
          </TabPanel>
          <TabPanel value="Birth" sx={{ width: "100%" }}>
            <Birth SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="FeedingProgrammes" sx={{ width: "100%" }}>
            <FeedingProgramme SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="MeatProduction" sx={{ width: "100%" }}>
            <MeatProduction SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="MilkProduction" sx={{ width: "100%" }}>
            <MilkProduction SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="PoultryProduction" sx={{ width: "100%" }}>
            <PoultryProduction SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="Scouting" sx={{ width: "100%" }}>
            <AnimalScouting SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="Treatment" sx={{ width: "100%" }}>
            <AnimalTreatment SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="ArtificialInsemination" sx={{ width: "100%" }}>
            <ArtificialInsemination SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="Mortality" sx={{ width: "100%" }}>
            <Mortality SegmentId={segment._id} />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default AnimalSegmentItem;
