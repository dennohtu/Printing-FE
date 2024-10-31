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
import NoData from "../NoData";
import { useLocation } from "react-router-dom";

const AnimalList = ({ animals }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

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
    { field: "Animal_Tag_Number", headerName: "Tag Number", minWidth: 150 },
    {
      field: "Animal_Breed",
      headerName: "Breed",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Animal_Breed) return row.Animal_Breed.name;
        else return " ";
      },
    },
    {
      field: "Animal_Gender",
      headerName: "Gender",
      minWidth: 150,
    },
    {
      field: "Animal_DOB",
      headerName: "Date of Birth",
      minWidth: 150,
      renderCell: ({ row }) => {
        return new Date(row.Animal_DOB).toDateString();
      },
    },
    {
      field: "photo",
      headerName: "Photo",
      renderCell: ({ row }) => {
        return (
          <img
            src={
              row.Photo
                ? row.photo
                : row.Animal_Breed?.type_ID?.photo
                ? row.Animal_Breed?.type_ID?.photo
                : "/assets/images/thorium-main.png"
            }
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        );
      },
    },
  ];

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
      ) : animals?.length === 0 ? (
        <NoData />
      ) : (
        <CustomDataGrid rows={animals} cols={cols} />
      )}
    </Box>
  );
};

export default AnimalList;
