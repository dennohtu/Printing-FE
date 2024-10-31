import { Box, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { tokens } from "../Theme";
import axios from "axios";
import { Environment } from "../Environment";
import { notify } from "../utils/Toast";
import { useEffect } from "react";
import NoData from "../components/NoData";
import { ListSuspenseLoader } from "../components/SuspenseLoader";
import CustomDataGrid from "../components/CustomDataGrid";

const UserWallet = () => {
  const { user } = useSelector((state) => state.user);
  const [wallet, setWallet] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 2,
      minWidth: 150,
      renderCell: ({ row }) => {
        return `${new Date(row.createdAt).toDateString()} ${new Date(
          row.createdAt
        ).toLocaleTimeString()}`;
      },
    },
    {
      field: "Transaction_Type",
      headerName: "Transaction Type",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "Amount_Transacted",
      headerName: "Amount",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Transaction_Type === "Deposit") {
          return `Kshs ${row.Amount_Transacted}`;
        } else return `(Kshs ${row.Amount_Transacted})`;
      },
    },
  ];

  useEffect(() => {
    if (user) {
      getWallet.refetch();
    }
  }, [user]);

  const getWallet = useQuery("fetchWallet", () => {
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
            fetchTransactions(res.data._id);
          }
        },
        (err) => {
          console.error(err);
          if (err.response.status === 403) {
            console.log("User has no wallet");
          }
        }
      );
  });

  const fetchTransactions = (walletId) => {
    return axios
      .get(
        `${Environment.BaseURL}/api/user/wallet/${walletId}/readTransactions`,
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
            setItems(res.data);
          }
          setLoading(false);
        },
        (err) => {
          console.error(err);
          if (err.response.status === 403) {
            console.log("User has no transactions");
          } else if (err.response.status === 503)
            console.log("Undefined Wallet id");
          else {
            notify(`could not fetch. \n${err.response.data.message}`);
          }
          setLoading(false);
        }
      );
  };

  return (
    <Box
      width="95%"
      display="flex"
      flexDirection="column"
      alignItems={"center"}
    >
      <Box width="90%" mt="30px" display={"flex"} justifyContent="flex-end">
        {wallet ? (
          <Box
            display="flex"
            flexDirection={"column"}
            p="5px 40px 10px 40px"
            borderRadius={"7px"}
            boxShadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
          >
            <Typography sx={{ color: colors.greenAccent[500] }}>
              Balance
            </Typography>
            <Typography
              sx={{ fontSize: "25pt", fontWeight: "800", mt: "30px" }}
            >{`Kshs ${wallet.Amount}`}</Typography>
          </Box>
        ) : (
          <NoData />
        )}
      </Box>

      <Box
        width="100%"
        height="1px"
        backgroundColor={colors.grey[400]}
        mt="20px"
      ></Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: "800",
          mt: "30px",
          fontSize: "25pt",
          color: colors.grey[700],
        }}
      >
        Transaction History
      </Typography>
      {loading ? (
        <ListSuspenseLoader />
      ) : (
        <CustomDataGrid rows={items} cols={cols} />
      )}
    </Box>
  );
};

export default UserWallet;
