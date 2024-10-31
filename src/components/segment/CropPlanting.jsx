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

const CropPlanting = ({ SegmentId }) => {
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
      field: "plantingDay",
      headerName: "Planting Date",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.plantingDay) return new Date(row.plantingDay).toDateString();
        else return " ";
      },
    },
    {
      field: "seedType",
      headerName: "Seed Type",
      minWidth: 150,
    },
    {
      field: "quantityPlanted",
      headerName: "Quantity Planted",
      minWidth: 150,
      renderCell: ({ row }) => `${row.quantityPlanted} kgs`,
    },
    {
      field: "sizeOfLand",
      headerName: "Size of Land",
      minWidth: 150,
      renderCell: ({ row }) => `${row.sizeOfLand} acres`,
    },
    {
      field: "harvestDate",
      headerName: "Expected Date of Harvest",
      minWidth: 150,
      renderCell: ({ row }) => {
        return new Date(row.harvestDate).toLocaleDateString();
      },
    },
    {
      field: "PlantedBy",
      headerName: "Planted By",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.PlantedBy)
          return `${row.PlantedBy.User_First_Name} ${row.PlantedBy.User_Last_Name}`;
        else return " ";
      },
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
        ${Environment.BaseURL}/api/Planting/readAllPlanting?Segments_ID=${SegmentId}`,
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

export default CropPlanting;
