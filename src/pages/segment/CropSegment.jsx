import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, IconButton, Tab, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../Theme";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CropScouting from "../../components/segment/CropScouting";
import CropTreatment from "../../components/segment/CropTreatment";
import CropSales from "../../components/segment/CropSales";
import Fertilizer from "../../components/segment/Fertilizer";
import CropProduction from "../../components/segment/CropProduction";
import PastureTreatment from "../../components/segment/PastureTreatment";
import Crop from "../../components/segment/Crop";
import CropPlanting from "../../components/segment/CropPlanting";
import CropSeedlings from "../../components/segment/CropSeedlings";
import CropIrrigation from "../../components/segment/CropIrrigation";

const CropSegmentItem = () => {
  const [currentTab, setCurrentTab] = useState("CropSeedlings");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();
  let { segment } = location.state;

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
            segment && segment.Crop_ID
              ? segment.Crop_ID.Crop_Image
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
          <Typography variant="h4" sx={{ width: "100%" }}>
            {segment.segmentDescription}
          </Typography>
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
              width: "30%",
            }}
          >
            <Tab label="Crop Seedlings" value="CropSeedlings" />
            <Tab label="Crop Planting" value="CropPlanting" />
            <Tab label="Crop Irrigation" value="CropIrrigation" />
            <Tab label="Crop Scouting" value="CropScouting" />
            <Tab label="Crop Treatment" value="CropTreatment" />
            <Tab label="Manure & Fertilizer" value="Fertilizer" />
            <Tab label="Crop Harvesting" value="CropProduction" />
            <Tab label="Crop Sales" value="CropSales" />
          </TabList>
          <TabPanel value="CropSeedlings" sx={{ width: "70%" }}>
            <CropSeedlings SegmentId={segment._id} sx={{ width: "70%" }} />
          </TabPanel>
          <TabPanel value="CropScouting" sx={{ width: "70%" }}>
            <CropScouting SegmentId={segment._id} sx={{ width: "70%" }} />
          </TabPanel>
          <TabPanel value="CropIrrigation" sx={{ width: "70%" }}>
            <CropIrrigation SegmentId={segment._id} sx={{ width: "70%" }} />
          </TabPanel>
          <TabPanel value="CropTreatment" sx={{ width: "70%" }}>
            <CropTreatment SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="CropSales" sx={{ width: "70%" }}>
            <CropSales SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="Fertilizer" sx={{ width: "70%" }}>
            <Fertilizer SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="CropProduction" sx={{ width: "70%" }}>
            <CropProduction SegmentId={segment._id} />
          </TabPanel>
          <TabPanel value="CropPlanting" sx={{ width: "70%" }}>
            <CropPlanting SegmentId={segment._id} />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default CropSegmentItem;
