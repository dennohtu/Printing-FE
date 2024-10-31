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

const Fertilizer = ({ SegmentId }) => {
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
      field: "createdAt",
      headerName: "Date",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.createdAt) return new Date(row.createdAt).toDateString();
        else return " ";
      },
    },
    {
      field: "type",
      headerName: "type",
      minWidth: 150,
    },
    { field: "name", headerName: "Name", minWidth: 150 },
    {
      field: "quantity",
      headerName: "Quantity",
      minWidth: 150,
      renderCell: ({ row }) => {
        return `${row.quantity} kgs`;
      },
    },
    {
      field: "notes",
      headerName: "Notes",
      minWidth: 150,
    },
    {
      field: "photo",
      headerName: "Photo",
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <img
            src={row.photo ? row.photo : "/assets/images/thorium-main.png"}
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        );
      },
    },
  ];

  const mutation = useMutation(() => {
    return axios
      .get(
        `
        ${Environment.BaseURL}/api/manureAndFertiliser/readAllManureAndFertilisers?Segments_ID=${SegmentId}`,
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
            notify("No Segment Data found", "error");
          } else {
            notify("Unable to fetch segment data", "error");
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
      width={"95%"}
    >
      {loading ? (
        <ListSuspenseLoader />
      ) : items.length === 0 ? (
        <NoData />
      ) : (
        <CustomDataGrid rows={items} cols={cols} />
      )}
    </Box>
  );
};

export default Fertilizer;
