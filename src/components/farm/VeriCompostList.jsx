import { Box, useTheme, IconButton, Button } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useMutation } from "react-query";
import { useSelector } from "react-redux";
import { Environment } from "../../Environment";
import { notify } from "../../utils/Toast";
import { tokens } from "../../Theme";
import { useEffect } from "react";
import Header from "../Header";
import CustomDataGrid from "../CustomDataGrid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ListSuspenseLoader } from "../SuspenseLoader";
import { useNavigate } from "react-router-dom";
import DeleteDialog from "../DeleteDialog";
import NoData from "../NoData";

const VericompostList = ({ FarmId }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    if (user.token) {
      setLoading(true);
      mutation.mutate();
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
      field: "Starting_Worms_Amount",
      headerName: "Starting Worms Amount",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Starting_Worms_Amount)
          return `${row.Starting_Worms_Amount} kgs`;
        else return " ";
      },
    },
    {
      field: "Starting_Bin_Size",
      headerName: "Starting Bin Size",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Starting_Bin_Size) {
          return `${row.Starting_Bin_Size} kgs`;
        } else return " ";
      },
    },
    {
      field: "Starting_Manure_Amount",
      headerName: "Starting Manure Amount",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Starting_Manure_Amount) {
          return `${row.Starting_Manure_Amount} kgs`;
        } else return " ";
      },
    },
    {
      field: "photo",
      headerName: "Photo",
      minWidth: 150,
      renderCell: ({ row }) => (
        <img
          src={row.photo ? row.photo : "/assets/images/thorium-main.png"}
          alt="vericompost photo"
          style={{ width: "100px", height: "100px", objectFit: "cover" }}
        />
      ),
    },
  ];

  const rowClick = (row) => {
    navigate("/vermicompost", { state: { vermicompost: row } });
  };

  const mutation = useMutation(() => {
    return axios
      .get(
        `
        ${Environment.BaseURL}/api/vermicompost/readAllVermicompost?Farm_ID=${FarmId}`,
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
          if (error.response.status === 403) {
            notify("No farm Data found", "error");
          } else {
            notify("Unable to fetch farm data", "error");
          }
          setLoading(false);
        }
      );
  });

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      justifyContent={"center"}
      width={"100%"}
    >
      {loading ? (
        <ListSuspenseLoader />
      ) : items.length === 0 ? (
        <NoData />
      ) : (
        <CustomDataGrid rowClick={rowClick} rows={items} cols={cols} />
      )}
    </Box>
  );
};

export default VericompostList;
