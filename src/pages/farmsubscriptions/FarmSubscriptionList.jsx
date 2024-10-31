import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useSelector } from "react-redux";
import { Environment } from "../../Environment";
import { tokens } from "../../Theme";
import axios from "axios";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { ListSuspenseLoader } from "../../components/SuspenseLoader";
import CustomDataGrid from "../../components/CustomDataGrid";
import { notify } from "../../utils/Toast";
import FertilizerModule from "../../components/chartviews/FertilizerModule";
import FarmLocationsModule from "../../components/chartviews/FarmLocations";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import Header from "../../components/Header";

const FilterItem = ({ title, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      display="flex"
      width="100%"
      justifyContent="center"
      alignItems="center"
      height="40px"
      background={selected === title ? colors.green[500] : "white"}
      onClick={() => setSelected(title)}
    >
      <Typography
        sx={{
          color: selected === title ? "white" : colors.green[500],
          fontWeight: 600,
          letterSpacing: "2px",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

const FarmSubscriptionList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useSelector((state) => state.user);
  const [farms, setFarms] = useState([]);
  const [unpaidFarms, setUnpaidFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [institution, setInstitution] = useState();
  const [selected, setSelected] = useState("All");
  const isDesktop = useMediaQuery("(min-width:600px)");

  const fetchFarms = useQuery("farms", () => {
    setLoading(true);
    return axios
      .get(
        `${Environment.BaseURL}/api/farm/readAllFarmsForInstitution/${user.institution._id}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      )
      .then(
        (res) => {
          if (res.status === 200) {
            setFarms(res.data);
            let frms = [];
            const finder = res.data.map((farm) => {
              if (!farm.isSubscriptionFeePaid) {
                frms.push(farm);
              }
              return;
            });
            Promise.all(finder).then(() => {
              setUnpaidFarms(frms);
            });
          }
          setLoading(false);
        },
        (err) => {
          console.log(err);
          setLoading(false);
        }
      );
  });

  const fetchInstitution = useQuery("institution", () => {
    return axios
      .get(
        `${Environment.BaseURL}/api/institutions/readInstitution/${user.institution._id}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      )
      .then(
        (res) => {
          if (res.status === 200) {
            setInstitution(res.data);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  });

  const creditFarmMutation = (item) => {
    creditFarm.mutate({ farmId: item._id });
  };

  const creditFarm = useMutation(({ farmId }) => {
    setLoading(true);
    return axios
      .get(`${Environment.BaseURL}/api/farm/payWithWallet/${farmId}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            notify("Subscription renewed", "success");
            fetchFarms.refetch();
          } else notify("Could not renew subscription", "error");
          setLoading(false);
        },
        (err) => {
          console.error(err);
          if (err.response && err.response.data) {
            notify(err.response.data.message, "error");
          } else notify(err.message, "error");
          setLoading(false);
        }
      );
  });

  useEffect(() => {
    if (user.token) {
      fetchFarms.refetch();
      fetchInstitution.refetch();
    }
  }, [user]);

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "Farm_Image",
      headerName: "Image",
      minWidth: 150,
      renderCell: ({ row: { Farm_Image } }) => {
        return (
          <img
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
            src={Farm_Image}
            alt="farm"
          />
        );
      },
    },
    { field: "Farm_Name", headerName: "Name", flex: 1, minWidth: 150 },
    {
      field: "Farm_Location_Country",
      headerName: "Country",
      cellClassName: "nameColumnCell",
      minWidth: 150,
      renderCell: ({ row }) => {
        return row.Farm_Location_Country.split(" ")[2];
      },
    },
    {
      field: "Farm_Location_County",
      headerName: "Location",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return row.Farm_Location_County.split(" ")[1].split(",")[0];
      },
    },
    {
      field: "isSubscriptionFeePaid",
      headerName: "Subscription",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row: { isSubscriptionFeePaid } }) => {
        if (isSubscriptionFeePaid)
          return (
            <IconButton
              sx={{
                background: colors.greenAccent[500],
                "&:hover": { background: colors.greenAccent[500] },
              }}
            >
              <TaskAltIcon />
            </IconButton>
          );
        else
          return (
            <IconButton
              sx={{
                background: colors.redAccent[500],
                "&:hover": { background: colors.redAccent[500] },
              }}
            >
              <HighlightOffIcon />
            </IconButton>
          );
      },
    },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (user.employee?.ReadOnly || !user.employee) {
          return (
            <Box
              width="90%"
              m="0 auto"
              display={"flex"}
              justifyContent="space-evenly"
            >
              <IconButton
                onClick={() => creditFarmMutation(row)}
                disabled={loading}
                sx={{
                  backgroundColor: `${colors.greenAccent[500]}`,
                  "&:hover": {
                    backgroundColor: colors.greenAccent[300],
                  },
                }}
              >
                <CurrencyExchangeIcon />
              </IconButton>
            </Box>
          );
        } else return "";
      },
    },
  ];

  return (
    <Box display={"flex"} flexDirection="column" width="95%">
      <Header
        title={"Farm Subscriptions"}
        subtitle={"Manage Farm Subscriptions"}
      />
      <Box mt="50px" width="100%">
        <Box
          mt="30px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        ></Box>
        {loading ? (
          <ListSuspenseLoader />
        ) : (
          <CustomDataGrid rows={farms} cols={cols} />
        )}
      </Box>
    </Box>
  );
};

export default FarmSubscriptionList;
