import { Box, useTheme, IconButton, Button } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useMutation } from "react-query";
import { useSelector } from "react-redux";
import { Environment } from "../../Environment";
import { notify } from "../../utils/Toast";
import { tokens } from "../../Theme";
import { useEffect } from "react";
import Header from "../../components/Header";
import CustomDataGrid from "../../components/CustomDataGrid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ListSuspenseLoader } from "../../components/SuspenseLoader";
import { useNavigate } from "react-router-dom";
import DeleteDialog from "../../components/DeleteDialog";

const OrderList = () => {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "Product",
      headerName: "Product",
      minWidth: 150,
      renderCell: ({ row }) => {
        return row.Product?.Product_Name;
      },
      flex: 2,
    },
    {
      field: "Client",
      headerName: "Client",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Client)
          return row.Client.User_First_Name + " " + row.Client.User_Last_Name;
        else return " ";
      },
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      minWidth: 150,
      renderCell: ({ row }) => {
        return new Date(row.createdAt).toLocaleDateString();
      },
      flex: 1,
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "fulfilled",
      headerName: "Fulfilled",
      minWidth: 150,
      renderCell: ({ row }) => {
        return row.fulfilled === 0 ? "No" : "Yes";
      },
    },
  ];

  useEffect(() => {
    if (user.token) {
      setLoading(true);
      mutation.mutate();
    }
  }, [user]);
  const mutation = useMutation(() => {
    return axios
      .get(
        `
        ${Environment.BaseURL}/api/marketplace/orders/readAllOrders`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      )
      .then(
        (response) => {
          let userData = response.data;

          if (response.status === 200) {
            setItems(userData);
          }
          setLoading(false);
        },
        (error) => {
          notify("Unable to fetch data", "error");
          setLoading(false);
        }
      );
  });

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <Header
        title={"Marketplace Orders"}
        subtitle={"Manage Orders on Marketplace"}
      />
      <Box display="flex" justifyContent={"flex-end"} width="90%"></Box>
      {loading ? (
        <ListSuspenseLoader />
      ) : (
        <CustomDataGrid rows={items} cols={cols} />
      )}
    </Box>
  );
};

export default OrderList;
