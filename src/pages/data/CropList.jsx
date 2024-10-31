import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useMutation } from "react-query";
import { useSelector } from "react-redux";
import CustomDataGrid from "../../components/CustomDataGrid";
import DeleteDialog from "../../components/DeleteDialog";
import Header from "../../components/Header";
import { ListSuspenseLoader } from "../../components/SuspenseLoader";
import { Environment } from "../../Environment";
import { tokens } from "../../Theme";
import { notify } from "../../utils/Toast";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const CropList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user);
  const [crops, setCrops] = useState([]);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCrops.mutate();
    }
  }, [user]);

  const cropsCols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    { field: "Crop_Name", headerName: "Name" },
    {
      field: "Crop_Image",
      headerName: "Image",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <img
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
            src={row.Crop_Image}
            alt="crop photo"
          />
        );
      },
    },
    {
      field: "Crop_Calendar_ID",
      headerName: "Calendar",
      flex: 2,
      minWidth: 150,
      renderCell: ({ row: { Crop_Calendar_ID } }) => {
        if (Crop_Calendar_ID) {
          return (
            <ol>
              <li
                key={0}
              >{`Propagation Period: ${Crop_Calendar_ID.propagationPeriod} weeks`}</li>
              <li
                key={1}
              >{`Transplanting Period: ${Crop_Calendar_ID.transplantingperiod} weeks`}</li>
              <li
                key={2}
              >{`Weeding Period: ${Crop_Calendar_ID.weedingPeriod} weeks`}</li>
              <li
                key={3}
              >{`Harvesting Period: ${Crop_Calendar_ID.harvestingTime} weeks`}</li>
            </ol>
          );
        } else {
          return "No Calendar Set";
        }
      },
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
                onClick={(e) => editCrop(e, row)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: colors.redAccent[500],
                  "&:hover": {
                    backgroundColor: colors.redAccent[300],
                  },
                }}
                onClick={(e) => deleteCrop(e, row)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        } else return "";
      },
    },
  ];

  const fetchCrops = useMutation(() => {
    return axios
      .get(`${Environment.BaseURL}/api/crop/readAllCrops`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (response) => {
          if (response.status === 200) {
            setCrops(response.data);
            console.log(response.data);
          } else notify("Could not fetch Data", "error");
          setLoading(false);
        },
        (error) => {
          console.error(error);
          notify(
            "An error has occured. Contact admin. Details are in the console"
          );
          setLoading(false);
        }
      );
  });

  const deleteCropMutation = useMutation(() => {
    return axios
      .delete(`${Environment.BaseURL}/api/crop/deleteCrop/${toDelete}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            notify("Deleted Successfully", "success");
            setOpen(false);
            setLoading(true);
            fetchCrops.mutate();
          } else {
            notify("Could not delete.\n" + res.data.message, "error");
          }
        },
        (err) => {
          notify(
            "An error occured. This is probably on our end. contact admin.\n" +
              err.message,
            "error"
          );
        }
      );
  });

  const editCrop = (e, item) => {
    e.stopPropagation();
    navigate("/crops/add", { state: { crop: item } });
  };

  const deleteCrop = (e, item) => {
    e.stopPropagation();
    setToDelete(item._id);
    setOpen(true);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const closeDeleteDialog = () => {
    setOpen(false);
  };

  const handleAnimDelete = () => {
    deleteCropMutation.mutate();
  };

  const rowClick = (row) => {};

  const addNew = () => {
    navigate("/crops/add");
  };
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <DeleteDialog
        open={open}
        handleClose={closeDeleteDialog}
        delete={handleAnimDelete}
      ></DeleteDialog>
      <Header title={"Crops"} subtitle={"Manage Crops"} />
      <Box
        display={"flex"}
        flexDirection="column"
        width="100%"
        justifyContent="space-evenly"
      >
        <Box>
          {!user.employee?.ReadOnly && (
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
          )}
          {loading ? (
            <ListSuspenseLoader />
          ) : (
            <CustomDataGrid rowClick={rowClick} rows={crops} cols={cropsCols} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CropList;
