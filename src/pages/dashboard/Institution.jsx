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

const InstitutionDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [unpaidFarms, setUnpaidFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [institution, setInstitution] = useState();
  const [wallet, setWallet] = useState(false);
  const isDesktop = useMediaQuery("(min-width:600px)");

  const fetchUsers = useQuery("fetch_users", () => {
    return axios
      .get(
        `${Environment.BaseURL}/api/institutions/readMembers/${user.institution._id}`,
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
            setUsers(res.data);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  });

  const fetchFarms = useQuery("fetch_farms", () => {
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
            let frms = [];
            setFarms(res.data);
            const unpaid = res.data.map((farm) => {
              if (!farm.isSubscriptionFeePaid) {
                frms.push(farm);
              }
              return;
            });
            Promise.all(unpaid).then(() => {
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

  const fetchInstitutionWallet = useQuery("institution_wallet", () => {
    return axios
      .get(`${Environment.BaseURL}/api/user/wallet/readWallet/${user.id}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            setWallet(res.data);
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
            notify("Renewed successfully", "success");
            fetchFarms.refetch();
          } else notify("Could not pay for farm", "error");
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
      fetchUsers.refetch();
      fetchInstitution.refetch();
      fetchInstitutionWallet.refetch();
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
        return row.Farm_Location_County.split(" ")[2];
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
                sx={{
                  backgroundColor: `${colors.greenAccent[500]}`,
                  "&:hover": {
                    backgroundColor: colors.greenAccent[300],
                  },
                }}
              >
                <MonetizationOnIcon />
              </IconButton>
            </Box>
          );
        } else return "";
      },
    },
  ];

  return (
    <Box display={"flex"} flexDirection="column" width="95%">
      <Box
        width={"100%"}
        display="flex"
        justifyContent={"space-evenly"}
        flexDirection={isDesktop ? undefined : "column"}
        alignItems="center"
        mt="30px"
      >
        <Box
          display={"flex"}
          flexDirection="column"
          justifyContent={"center"}
          alignItems="center"
          padding={"30px 50px"}
          boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px"
          width={isDesktop ? undefined : "70%"}
        >
          <Typography variant="h3" sx={{ fontSize: "30pt" }}>
            {users.length}
          </Typography>
          <Typography sx={{ color: colors.greenAccent[500] }}>
            Active Users
          </Typography>
        </Box>
        <Box
          display={"flex"}
          flexDirection="column"
          justifyContent={"center"}
          alignItems="center"
          padding={"30px 50px"}
          boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px"
          width={isDesktop ? undefined : "70%"}
          mt={isDesktop ? undefined : "20px"}
        >
          <Typography variant="h3" sx={{ fontSize: "30pt" }}>
            {farms.length}
          </Typography>
          <Typography sx={{ color: colors.greenAccent[500] }}>Farms</Typography>
        </Box>
        <Box
          display={"flex"}
          flexDirection="column"
          justifyContent={"center"}
          alignItems="center"
          padding={"30px 50px"}
          boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px"
          width={isDesktop ? undefined : "70%"}
          mt={isDesktop ? undefined : "20px"}
        >
          <Typography variant="h3" sx={{ fontSize: "30pt" }}>
            {wallet ? `Kshs ${wallet.Amount}` : "Kshs 0"}
          </Typography>
          <Typography sx={{ color: colors.greenAccent[500] }}>
            Wallet Balance
          </Typography>
        </Box>
      </Box>
      <Box mt="30px" width="100%">
        <Typography variant="h3">Farms Spread per County</Typography>
        <FarmLocationsModule />
      </Box>
      <Box mt="50px" width="100%">
        <Typography variant="h3">Farms Without Subscription</Typography>
        {loading ? (
          <ListSuspenseLoader />
        ) : (
          <CustomDataGrid rows={unpaidFarms} cols={cols} />
        )}
      </Box>
    </Box>
  );
};

export default InstitutionDashboard;
