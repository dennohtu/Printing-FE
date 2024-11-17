import { Box, Button, Icon, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { Environment } from "../../Environment";
import { tokens } from "../../Theme";
import { notify } from "../../utils/Toast";
import EditIcon from "@mui/icons-material/Edit";
import Header from "../../components/Header";
import { ListSuspenseLoader } from "../../components/SuspenseLoader";
import CustomDataGrid from "../../components/CustomDataGrid";
import { useNavigate } from "react-router-dom";

const Payments = () => {
  const [sales, setSales] = useState([]);
  const { user } = useSelector((state) => state.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      farmSales.refetch();
    }
  }, [user]);

  let burundiFranc = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BIF",
  });

  const farmSales = useQuery("sales", () => {
    return axios
      .get(`${Environment.BaseURL}/api/marketplace/orders/readAllPaidOrders`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            setSales(res.data);
          } else {
            console.error("Could not Fetch: " + res.data);
          }
        },
        (err) => {
          console.error(err);
          notify("Could not Fetch. Check console for details", "error");
        }
      );
  });

  const addNew = () => {
    navigate("/paymentsEdit");
  };

  const editItem = (item) => {
    navigate("/paymentsEdit", { state: { payment: item } });
  };

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "Payment_ID",
      headerName: "Payment ID",
      flex: 1,
    },
    {
      field: "Order_ID",
      headerName: "Order",
      flex: 1,
      renderCell: ({ row }) => {
        return `${row.Order_ID?.Order_ID}`;
      },
    },
    {
      field: "Transaction_Reference",
      headerName: "Transaction Reference",
    },
    {
      field: "Amount_Paid",
      headerName: "Amount Paid",
      renderCell: ({ row }) => {
        return `${burundiFranc.format(row.Amount_Paid)}`;
      },
    },
    {
      field: "Balance",
      headerName: "Balance",
      renderCell: ({ row }) => {
        return `${burundiFranc.format(row.Balance)}`;
      },
    },
    {
      field: "Status",
      headerName: "Status",
    },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if ((user.employee && !user.employee.ReadOnly) || !user.employee) {
          return (
            <Box
              width="90%"
              m="0 auto"
              display={"flex"}
              justifyContent="space-evenly"
            >
              <IconButton
                sx={{
                  backgroundColor: colors.blueAccent[500],
                  "&:hover": {
                    backgroundColor: colors.blueAccent[300],
                  },
                }}
                onClick={() => editItem(row)}
              >
                <EditIcon />
              </IconButton>
            </Box>
          );
        } else return "";
      },
    },
  ];

  return (
    <Box display={"flex"} width="95%" flexDirection={"column"}>
      <Header title={"Client Payments"} subtitle={"Manage ClientPayments"} />
      <Box display="flex" justifyContent={"flex-end"} width="90%">
        <Button
          variant="contained"
          sx={{
            backgroundColor: colors.greenAccent[500],
            "&:hover": { backgroundColor: colors.greenAccent[300] },
          }}
          onClick={addNew}
        >
          Add New
        </Button>
      </Box>
      {loading ? (
        <ListSuspenseLoader />
      ) : (
        <CustomDataGrid rows={sales} cols={cols} />
      )}
    </Box>
  );
};

export default Payments;
