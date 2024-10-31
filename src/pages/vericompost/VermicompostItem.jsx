import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  IconButton,
  Link,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { tokens } from "../../Theme";
import { LargeContentPlaceHolder } from "../../components/SuspenseLoader";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import TabList from "@mui/lab/TabList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VermicompostSales from "./VermicompostSales";
import VermicompostProduction from "./VermicompostProduction";
import VermicompostAddition from "./VermicompostAddition";
import Header from "../../components/Header";

const VericompostItem = () => {
  const { user } = useSelector((state) => state.user);
  const [vermicompost, setVermicompost] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [tabItem, setTabItem] = useState("Vericompost Additions");
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    if (location.state && location.state.vermicompost) {
      //set farm data
      setVermicompost(location.state.vermicompost);
    }
  }, [location]);

  const handleTabChange = (e, val) => {
    setTabItem(val);
  };

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
          <Header
            title={"Vermicompost Item"}
            subtitle={"View Vermicompost Item"}
          />
          <Box width={"95%"}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIcon sx={{ fontSize: "18pt" }} />
            </IconButton>
          </Box>
          <Box
            display={"flex"}
            justifyContent="space-evenly"
            alignItems="center"
            width={"90%"}
          >
            <img
              src={
                vermicompost.photo
                  ? vermicompost.photo
                  : "/assets/images/thorium-main.png"
              }
              alt="vermicompost"
              style={{ borderRadius: "50%", width: "300px", height: "300px" }}
            />
            <Box
              display={"flex"}
              width="40%"
              padding={"20px"}
              flexDirection="column"
              borderRadius="8px"
              mt="15px"
              boxShadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
            >
              <Box
                display={"flex"}
                width="97%"
                justifyContent={"space-between"}
              >
                <Typography sx={{ mb: "20px" }} variant="h4">
                  Vermicompost Information
                </Typography>
              </Box>
              <Box>
                <Typography>
                  {`Starting Worms Amount: ${vermicompost.Starting_Worms_Amount} kgs`}
                </Typography>
                <Typography>
                  {`Starting Bin Size: ${vermicompost.Starting_Bin_Size} kgs`}
                </Typography>
                <Typography>
                  {`Starting Manure Amount: ${vermicompost.Starting_Manure_Amount} kgs`}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            mt="30px"
            width="100%"
            height="1px"
            backgroundColor={colors.grey[900]}
          />
          <Box width="100%" display="flex" flexDirection="column">
            <TabContext value={tabItem}>
              <TabList
                variant="scrollable"
                scrollButtons="auto"
                textColor={"secondary"}
                indicatorColor={"secondary"}
                sx={{
                  width: "100%",
                }}
                onChange={handleTabChange}
              >
                <Tab
                  sx={{
                    fontSize: "10pt",
                    letterSpacing: "2px",
                    "&:hover": {
                      background: colors.greenAccent[500],
                      color: "white",
                    },
                  }}
                  value="Vericompost Additions"
                  label="Vericompost Additions"
                />
                <Tab
                  sx={{
                    fontSize: "10pt",
                    letterSpacing: "2px",
                    "&:hover": {
                      background: colors.greenAccent[500],
                      color: "white",
                    },
                  }}
                  value="Vericompost Production"
                  label="Vericompost Production"
                />
                <Tab
                  sx={{
                    fontSize: "10pt",
                    letterSpacing: "2px",
                    "&:hover": {
                      background: colors.greenAccent[500],
                      color: "white",
                    },
                  }}
                  value="Vericompost Sales"
                  label="Vericompost Sales"
                />
              </TabList>
              <TabPanel
                value="Vericompost Additions"
                sx={{
                  width: "100%",
                }}
              >
                <VermicompostAddition VermicompostId={vermicompost._id} />
              </TabPanel>
              <TabPanel
                value="Vericompost Production"
                sx={{
                  width: "100%",
                }}
              >
                <VermicompostProduction VermicompostId={vermicompost._id} />
              </TabPanel>
              <TabPanel
                value="Vericompost Sales"
                sx={{
                  width: "100%",
                }}
              >
                <VermicompostSales VermicompostId={vermicompost._id} />
              </TabPanel>
            </TabContext>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VericompostItem;
