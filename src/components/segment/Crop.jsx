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
import { useLocation, useNavigate } from "react-router-dom";
import DeleteDialog from "../DeleteDialog";
import NoData from "../NoData";

const Crop = ({ crops }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      minWidth: 150,
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "Crop_Image",
      headerName: "Photo",
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <img
            src={row.Crop_Image}
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
            alt="crop photo"
          />
        );
      },
    },
    {
      field: "Crop_Name",
      headerName: "Name",
      minWidth: 150,
    },
    {
      field: "Crop_Calendar_ID",
      headerName: "Calendar",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Crop_Calendar_ID)
          return `1. ${row.Crop_Calendar_ID.propagationPeriod} \n2. ${row.Crop_Calendar_ID.transplantingperiod} \n3. ${row.Crop_Calendar_ID.weedingPeriod} \n4. ${row.Crop_Calendar_ID.harvestingTime}`;
        else return "";
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
      ) : crops.length === 0 ? (
        <NoData />
      ) : (
        <CustomDataGrid rows={crops} cols={cols} />
      )}
    </Box>
  );
};

export default Crop;
