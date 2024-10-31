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
import Agriculture from "@mui/icons-material/Agriculture";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import GroupsIcon from "@mui/icons-material/Groups";
import DeleteDialog from "../../components/DeleteDialog";
import { useNavigate } from "react-router-dom";

const FarmsList = () => {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const viewEmployees = (e, item) => {
    e.stopPropagation();
    navigate("/members", { state: { data: { id: item._id, type: "farm" } } });
  };

  const editItem = (e, item) => {
    e.stopPropagation();
    navigate("/farms/add", { state: { farm: item } });
  };

  const deleteItem = (e, item) => {
    e.stopPropagation();
    setToDelete(item._id);
    setOpen(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const addNew = () => {
    navigate("/farms/add");
  };

  const deleteMutation = useMutation(() => {
    return axios
      .delete(`${Environment.BaseURL}/api/farm/deleteFarm/${toDelete}`, {
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
            mutation.mutate();
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

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "Farm_Image",
      headerName: "Image",
      minWidth: 150,
      renderCell: ({ row: { Farm_Image } }) => {
        return (
          <img
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
            src={Farm_Image}
            alt="farm"
          />
        );
      },
    },
    { field: "Farm_Name", headerName: "Name", flex: 1, minWidth: 150 },
    {
      field: "Farm_Location_Country",
      headerName: "Country",
      cellClassName: "nameColumnCell",
      minWidth: 150,
      renderCell: ({ row }) => {
        return row.Farm_Location_Country !== "null" ? row.Farm_Location_Country: row.Farm_Location_County? row.Farm_Location_County.split(",").length === 1 ? "":row.Farm_Location_County.split(",")[row.Farm_Location_County.split(",").length -1]:"";
      },
    },
    {
      field: "Farm_Location_County",
      headerName: "Location",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return row.Farm_Location_County? row.Farm_Location_County:"";
      },
    },
    {
      field: "isSubscriptionFeePaid",
      headerName: "Subscription",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row: { isSubscriptionFeePaid } }) => {
        if (isSubscriptionFeePaid)
          return (
            <IconButton
              sx={{
                background: colors.greenAccent[500],
                "&:hover": { background: colors.greenAccent[500] },
              }}
            >
              <TaskAltIcon />
            </IconButton>
          );
        else
          return (
            <IconButton
              sx={{
                background: colors.redAccent[500],
                "&:hover": { background: colors.redAccent[500] },
              }}
            >
              <HighlightOffIcon />
            </IconButton>
          );
      },
    },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <Box
            width="90%"
            m="0 auto"
            display={"flex"}
            justifyContent="space-evenly"
          >
            <IconButton
              sx={{
                backgroundColor: `${colors.greenAccent[500]}`,
                "&:hover": {
                  backgroundColor: colors.greenAccent[300],
                },
              }}
              onClick={(e) => viewEmployees(e, row)}
            >
              <GroupsIcon />
            </IconButton>
            {user.role === "admin" && !user.employee?.ReadOnly && (
              <IconButton
                sx={{
                  backgroundColor: colors.blueAccent[500],
                  "&:hover": {
                    backgroundColor: colors.blueAccent[300],
                  },
                }}
                onClick={(e) => editItem(e, row)}
              >
                <EditIcon />
              </IconButton>
            )}
            {user.role === "admin" && !user.employee?.ReadOnly && (
              <IconButton
                sx={{
                  backgroundColor: colors.redAccent[500],
                  "&:hover": {
                    backgroundColor: colors.redAccent[300],
                  },
                }}
                onClick={(e) => deleteItem(e, row)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    if (user.token) {
      console.log(user);
      setLoading(true);
      mutation.mutate();
    }
  }, [user]);
  const mutation = useMutation(() => {
    return axios
      .get(
        user.role === "institution"
          ? `${Environment.BaseURL}/api/farm/readAllFarmsForInstitution/${user.institution._id}`
          : `${Environment.BaseURL}/api/farm/readAllFarm`,
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
          console.error(error);
          setLoading(false);
        }
      );
  });

  const rowClick = (row) => {
    navigate("/farms/view", { state: { farm: row } });
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
        setOpen={setOpen}
        delete={handleDelete}
      ></DeleteDialog>
      <Header title={"Farms"} subtitle={"Manage Farms"} />
      {user.role === "admin" && !user.employee?.ReadOnly && (
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
        <CustomDataGrid rowClick={rowClick} rows={items} cols={cols} />
      )}
    </Box>
  );
};

export default FarmsList;
