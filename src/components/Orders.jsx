import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useSelector } from "react-redux";
import CustomDataGrid from "./CustomDataGrid";
import NoData from "./NoData";
import axios from "axios";
import { Environment } from "../Environment";
import { notify } from "../utils/Toast";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { tokens } from "../Theme";

const PendingFulfillmentList = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useSelector((state) => state.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    if (user) {
      fetchFarmPayments.refetch();
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
      field: "updatedAt",
      headerName: "Order Date",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => {
        return new Date(row.updatedAt).toLocaleDateString();
      },
    },
    {
      field: "Products",
      headerName: "Products",
      flex: 1,
      minWidth: 250,
      renderCell: ({ row }) => {
        return (
          <ul>
            {row.Products.map((order, idx) => {
              return (
                <li>{`${order.quantity} ${order.Product_ID.Product_Name}`}</li>
              );
            })}
          </ul>
        );
      },
    },
    {
      field: "User_ID",
      headerName: "Customer",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.User_ID) {
          return `${row.User_ID.User_First_Name} ${row.User_ID.User_Last_Name}`;
        } else return "";
      },
    },
    {
      field: "Total_Cost",
      headerName: "Total Cost",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return `Kshs ${row.Total_Cost.toFixed(2)}`;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <Box>
            <IconButton
              onClick={() => updateFulfillment(row)}
              sx={{
                background: colors.greenAccent[600],
                "&:hover": { background: colors.greenAccent[400] },
              }}
            >
              <DoneAllIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  const updateFulfillment = (item) => {
    fulfillPayment.mutate(item);
  };

  const fulfillPayment = useMutation(({ _id }) => {
    return axios
      .put(
        `${Environment.BaseURL}/api/marketplace/orders/updateOrder/${_id}`,
        {
          fulfilled: 1,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then(
        (res) => {
          if (res.status === 200) {
            notify("Order Fulfillment Completed successfully", "success");
            fetchFarmPayments.refetch();
          } else {
            notify("Could not complete fulfillment", "error");
          }
        },
        (err) => {
          console.error(err);
          notify("Could not update order status. " + err.message, "error");
        }
      );
  });

  const fetchFarmPayments = useQuery("unfulfilledOrders", () => {
    return axios
      .get(`${Environment.BaseURL}/api/marketplace/orders/readAllOrders`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            const ords = res.data.filter((o) => o.fulfilled === 0);
            setOrders(ords);
          } else {
            notify("Unable to fetch orders");
          }
        },
        (err) => {
          console.error(err);
          if (err.code !== "ERR_BAD_REQUEST") {
            notify("Could not complete request. Contact admin", "error");
          }
        }
      );
  });

  return (
    <Box width="100%">
      <Typography variant="h3">Orders Pending Fullfilment</Typography>
      {/* <Box display="flex" justifyContent={"space-evenly"} alignItems="center">
        <Typography variant="h4">Select a period to fetch data for</Typography>
        <WeekPicker week={dateValue} setWeek={changeWeek} colors={colors} />
      </Box> */}
      {orders.length === 0 ? (
        <NoData />
      ) : (
        <CustomDataGrid rows={orders} cols={cols} />
      )}
    </Box>
  );
};

export default PendingFulfillmentList;
