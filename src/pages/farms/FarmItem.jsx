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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import Badge from "../../components/Badge";
import { ImageGroup, Image } from "react-fullscreen-image";
import { tokens } from "../../Theme";
import {
  ButtonLoadingPlaceholder,
  LargeContentPlaceHolder,
  ListSuspenseLoader,
} from "../../components/SuspenseLoader";
import { useMutation, useQuery } from "react-query";
import { Environment } from "../../Environment";
import { notify } from "../../utils/Toast";
import axios from "axios";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import LaunchIcon from "@mui/icons-material/Launch";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import TabList from "@mui/lab/TabList";
import WorkingRecords from "../../components/farm/WorkingRecords";
import VisitorRecords from "../../components/farm/VisitorRecords";
import EmployeeRecords from "../../components/farm/EmployeeRecords";
import { AnimalSegment, FarmSegment } from "../../components/farm/Segment";
import NoData from "../../components/NoData";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Weather from "../../components/farm/Weather";
import WeatherRecords from "../../components/farm/WeatherRecords";
import AssetRecords from "../../components/farm/AssetRecords";
import DebtorRecords from "../../components/farm/DebtorRecords";
import SoilTest from "../../components/farm/SoilTest";
import MaintenanceRecords from "../../components/farm/MaintenanceRecords";
import FarmRecords from "../../components/farm/FarmRecords";
import VericompostList from "../../components/farm/VeriCompostList";
import ModalDialog from "../../components/Modal";

const FarmItem = () => {
  const { user } = useSelector((state) => state.user);
  const [farm, setFarm] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [tabItem, setTabItem] = useState("Crops");
  const [segments, setSegments] = useState([]);
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    if (location.state && location.state.farm) {
      //set farm data
      setFarm(location.state.farm);
    }
  }, [location]);

  useEffect(() => {
    if (farm) {
      setLoading(false);
    }
    if (farm._id != null && user) {
      fetchSegmentsMutation.refetch();
    }
  }, [farm, user]);

  const waivePayment = useMutation(() => {
    setLoading(true);
    return axios
      .put(
        `${Environment.BaseURL}/api/farm/waivePayment`,
        { FarmID: farm._id },
        {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      )
      .then(
        (res) => {
          setLoading(false);
          if (res.status === 200) {
            notify("Waived successfully", "success");
          }
        },
        (err) => {
          setLoading(false);
          console.error(err);
          if (err.response.status === 403) {
            notify("No farm found for this id");
          }
        }
      );
  });

  const fetchSegmentsMutation = useQuery("segments", () => {
    return axios
      .get(
        `${Environment.BaseURL}/api/Segments/readAllSegments?Farm_ID=${location.state.farm._id}`,
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
            setSegments(response.data);
          } else {
            notify(
              "Could not fetch segments associated with this farm",
              "error"
            );
          }
        },
        (error) => {
          if (error.code === "ERR_BAD_REQUEST") {
            console.log("No segments found");
          } else {
            notify(
              "An error occured when trying to fetch segments for this farm. More details are in the console.",
              "error"
            );
            console.error(error);
          }
        }
      );
  });

  const handleTabChange = (e, val) => {
    setTabItem(val);
  };

  return (
    <Box mt="20px" width="100%">
      {loading ? (
        <LargeContentPlaceHolder />
      ) : (
        <Box
          width={"100%"}
          display="flex"
          flexDirection={"column"}
          p="20px"
          alignItems={"center"}
        >
          <ModalDialog
            open={open}
            handleClose={() => setOpen(false)}
            title="Waive Farm"
          >
            <Box width="100%">
              <Typography>Waive Subscription Payment for this Farm?</Typography>
              <Box display="flex" width="100%" justifyContent={"space-between"}>
                <Button
                  disabled={loading}
                  onClick={() => waivePayment.mutate()}
                  sx={{
                    background: colors.greenAccent[500],
                    color: "white",
                    "&:hover": {
                      background: colors.greenAccent[300],
                    },
                  }}
                >
                  Waive
                </Button>
                <Button
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  sx={{
                    background: colors.grey[600],
                    color: "white",
                    "&:hover": {
                      background: colors.grey[300],
                    },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </ModalDialog>
          <Box width={"95%"}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIcon sx={{ fontSize: "18pt" }} />
            </IconButton>
          </Box>
          <Typography variant="h1" sx={{ fontWeight: "800" }}>
            {farm.Farm_Name}
          </Typography>
          <Box
            display={"flex"}
            justifyContent="space-evenly"
            alignItems="center"
            width={"90%"}
            flexDirection={isDesktop ? undefined : "column"}
          >
            <img
              src={
                farm.Farm_Image
                  ? farm.Farm_Image
                  : "/assets/images/thorium-main.png"
              }
              alt="profilePhoto"
              style={{
                borderRadius: "50%",
                width: "300px",
                objectFit: "cover",
              }}
            />
            <Box
              display="flex"
              flexDirection={"column"}
              width="90%"
              alignItems={"center"}
            >
              <Box
                display={"flex"}
                justifyContent="space-between"
                alignItems="center"
                width={isDesktop ? "50%" : "100%"}
              >
                <LocationOnIcon
                  sx={{ fontSize: "20pt", color: colors.greenAccent[500] }}
                />
                <Link
                  href={`https://www.google.com/maps/@${farm.Farm_Location_Latitude},${farm.Farm_Location_Longitude},15z`}
                  target="_blank"
                  underline="hover"
                  sx={{
                    fontSize: "14pt",
                    fontWeight: "600",
                    "&:hover": { color: colors.greenAccent[500] },
                  }}
                >
                  {`${farm.Farm_Location_County}`}
                </Link>
              </Box>
              <Box
                display={"flex"}
                justifyContent="space-between"
                alignItems="center"
                width={isDesktop ? "50%" : "100%"}
              >
                <MapIcon
                  sx={{ fontSize: "20pt", color: colors.greenAccent[500] }}
                />
                <Typography
                  sx={{
                    fontSize: "14pt",
                    fontWeight: "600",
                  }}
                >
                  {`${farm.Farm_Size} Acre(s)`}
                </Typography>
              </Box>
              <Box
                display={"flex"}
                width={isDesktop ? "70%" : "100%"}
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
                    Farm Owner Information
                  </Typography>
                  <Tooltip
                    title={
                      farm.User_ID
                        ? "View Farmer"
                        : "No Farmer Information Available"
                    }
                    sx={{ background: colors.grey[300], fontSize: "8pt" }}
                    arrow
                  >
                    <LaunchIcon
                      sx={{
                        fontSize: "14pt",
                        color: colors.greenAccent[500],
                        "&:hover": { cursor: "pointer" },
                      }}
                      onClick={() =>
                        farm.User_ID &&
                        navigate("/users/view", {
                          state: { user: farm.User_ID },
                        })
                      }
                    />
                  </Tooltip>
                </Box>
                {farm.User_ID ? (
                  <Box>
                    <Typography>
                      {farm.User_ID
                        ? `Name: ${farm.User_ID.User_First_Name} ${farm.User_ID.User_Last_Name}`
                        : ""}
                    </Typography>
                    <Typography>
                      {farm.User_ID ? `Email: ${farm.User_ID.User_Email}` : ""}
                    </Typography>
                    <Typography>
                      {farm.User_ID
                        ? `Phone Number: ${farm.User_ID.User_Phone}`
                        : ""}
                    </Typography>
                  </Box>
                ) : (
                  <NoData />
                )}
              </Box>
            </Box>
          </Box>
          {user.role === "admin" && !farm.isSubscriptionFeePaid && (
            <Box
              width={isDesktop ? "70%" : "100%"}
              display="flex"
              justifyContent={"flex-end"}
            >
              <Button
                sx={{
                  padding: "15px 30px",
                  background: colors.greenAccent[500],
                  color: "white",
                  "&:hover": {
                    background: colors.greenAccent[300],
                  },
                  mt: "20px",
                }}
                onClick={() => setOpen(true)}
              >
                Waive Payment
              </Button>
            </Box>
          )}
          <Box
            width={isDesktop ? "70%" : "100%"}
            display="flex"
            justifyContent={"space-between"}
            alignItems="center"
            mt="20px"
            p="20px"
            borderRadius={"7px"}
            boxShadow="rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px"
          >
            <Weather farmId={farm._id} />
          </Box>
          <Box
            mt="30px"
            width="100%"
            height="1px"
            backgroundColor={colors.grey[900]}
          />
          <Box
            width="100%"
            display={"flex"}
            flexDirection={isDesktop ? undefined : "column"}
          >
            <TabContext value={tabItem}>
              <TabList
                variant="scrollable"
                scrollButtons="auto"
                textColor={"secondary"}
                indicatorColor={"secondary"}
                orientation={isDesktop ? "vertical" : undefined}
                sx={{
                  background: isDesktop ? colors.grey[900] : undefined,
                  height: isDesktop ? "100%" : undefined,
                  width: isDesktop ? "30%" : "100%",
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
                  value="Crops"
                  label="Crops"
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
                  value="Animals"
                  label="Animals"
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
                  value="Employees"
                  label="Employees"
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
                  value="Work Records"
                  label="Work Records"
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
                  value="Visitor Records"
                  label="Visitor Records"
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
                  value="Asset Records"
                  label="Asset Records"
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
                  value="Debtor Records"
                  label="Debtor Records"
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
                  value="Weather Records"
                  label="Weather Records"
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
                  value="Soil Tests"
                  label="Soil Tests"
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
                  value="Maintenance Records"
                  label="Maintenance Records"
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
                  value="Farm Company Records"
                  label="Farm Company Records"
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
                  value="vermicompost"
                  label="Vermicompost"
                />
              </TabList>
              <TabPanel
                value="Crops"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                {fetchSegmentsMutation.isLoading ? (
                  <ListSuspenseLoader />
                ) : segments.length === 0 ||
                  segments.filter((seg) => seg.segmentType === "Crop")
                    .length === 0 ? (
                  <NoData />
                ) : (
                  segments
                    .filter((seg) => seg.segmentType === "Crop")
                    .map((seg, idx) => {
                      return <FarmSegment segment={seg} key={idx} />;
                    })
                )}
              </TabPanel>
              <TabPanel
                value="Animals"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                {fetchSegmentsMutation.isLoading ? (
                  <ListSuspenseLoader />
                ) : segments.length === 0 ||
                  segments.filter((seg) => seg.segmentType === "Animal")
                    .length === 0 ? (
                  <NoData />
                ) : (
                  segments
                    .filter((seg) => seg.segmentType === "Animal")
                    .map((seg, idx) => {
                      return <AnimalSegment segment={seg} key={idx} />;
                    })
                )}
              </TabPanel>
              <TabPanel
                value="Employees"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <EmployeeRecords farmID={farm._id} userID={farm.User_ID?._id} />
              </TabPanel>
              <TabPanel
                value="Work Records"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <WorkingRecords farmID={farm._id} />
              </TabPanel>
              <TabPanel
                value="Visitor Records"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <VisitorRecords farmID={farm._id} />
              </TabPanel>
              <TabPanel
                value="Asset Records"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <AssetRecords farmID={farm._id} />
              </TabPanel>
              <TabPanel
                value="Debtor Records"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <DebtorRecords farmID={farm._id} />
              </TabPanel>
              <TabPanel
                value="Weather Records"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <WeatherRecords farmID={farm._id} />
              </TabPanel>
              <TabPanel
                value="Soil Tests"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <SoilTest farmID={farm._id} />
              </TabPanel>
              <TabPanel
                value="Maintenance Records"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <MaintenanceRecords farmID={farm._id} />
              </TabPanel>
              <TabPanel
                value="Farm Company Records"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <FarmRecords farmID={farm._id} />
              </TabPanel>
              <TabPanel
                value="vermicompost"
                sx={{
                  width: isDesktop ? "70%" : "100%",
                }}
              >
                <VericompostList FarmId={farm._id} />
              </TabPanel>
            </TabContext>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FarmItem;
