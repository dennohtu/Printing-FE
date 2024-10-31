import KeyIcon from "@mui/icons-material/Key";
import KeyOffIcon from "@mui/icons-material/KeyOff";
import {
  Box,
  useTheme,
  IconButton,
  Button,
  Typography,
  TextField,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
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
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import { CSVLink } from "react-csv";
import generatePassword from "generate-password-browser";
import Papa from "papaparse";

const Employees = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const isDesktop = useMediaQuery("(min-width:600px)");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const deleteUser = (evt, item) => {
    evt.stopPropagation();
    setToDelete(item._id);
    setOpen(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const deleteMutation = useMutation(() => {
    return axios
      .delete(
        `${Environment.BaseURL}/api/employees/deleteEmployee/${toDelete}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      )
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

  const userCols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "User_Photo",
      headerName: "Photo",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.User_ID.User_Passport_Photo) {
          return (
            <img
              style={{
                width: "100px",
                height: "100px",
                objectFit: "contain",
              }}
              src={row.User_ID.User_Passport_Photo}
              alt="Profile picture"
            />
          );
        } else {
          return (
            <PersonIcon
              style={{
                color: colors.greenAccent[500],
                fontSize: 50,
              }}
            />
          );
        }
      },
    },
    {
      field: "User_Name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return `${row.User_ID.User_First_Name} ${row.User_ID.User_Last_Name}`;
      },
    },
    {
      field: "ReadOnly",
      headerName: "ReadOnly",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.ReadOnly) {
          return (
            <KeyIcon
              style={{ color: colors.greenAccent[500], fontSize: "18pt" }}
            />
          );
        } else
          return (
            <KeyOffIcon
              style={{ color: colors.redAccent[500], fontSize: "18pt" }}
            />
          );
      },
    },
    {
      field: "Marketplace_Management",
      headerName: "Marketplace",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Marketplace_Management) {
          return (
            <KeyIcon
              style={{ color: colors.greenAccent[500], fontSize: "18pt" }}
            />
          );
        } else
          return (
            <KeyOffIcon
              style={{ color: colors.redAccent[500], fontSize: "18pt" }}
            />
          );
      },
    },
    {
      field: "Sales_Management",
      headerName: "Sales",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Sales_Management) {
          return (
            <KeyIcon
              style={{ color: colors.greenAccent[500], fontSize: "18pt" }}
            />
          );
        } else
          return (
            <KeyOffIcon
              style={{ color: colors.redAccent[500], fontSize: "18pt" }}
            />
          );
      },
    },
    {
      field: "Farm_Management",
      headerName: "Farm",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Farm_Management) {
          return (
            <KeyIcon
              style={{ color: colors.greenAccent[500], fontSize: "18pt" }}
            />
          );
        } else
          return (
            <KeyOffIcon
              style={{ color: colors.redAccent[500], fontSize: "18pt" }}
            />
          );
      },
    },
    {
      field: "Institution_Management",
      headerName: "Institution",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Institution_Management) {
          return (
            <KeyIcon
              style={{ color: colors.greenAccent[500], fontSize: "18pt" }}
            />
          );
        } else
          return (
            <KeyOffIcon
              style={{ color: colors.redAccent[500], fontSize: "18pt" }}
            />
          );
      },
    },
    {
      field: "User_Management",
      headerName: "User",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.User_Management) {
          return (
            <KeyIcon
              style={{ color: colors.greenAccent[500], fontSize: "18pt" }}
            />
          );
        } else
          return (
            <KeyOffIcon
              style={{ color: colors.redAccent[500], fontSize: "18pt" }}
            />
          );
      },
    },
    {
      headerName: "Actions",
      flex: 2,
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
                backgroundColor: colors.blueAccent[500],
                "&:hover": {
                  backgroundColor: colors.blueAccent[300],
                },
              }}
              onClick={(evt) => editUser(evt, row)}
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
              onClick={(evt) => deleteUser(evt, row)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  const addNew = () => {
    navigate("/employees/add", { state: { employees: users } });
  };

  const editUser = (evt, row) => {
    evt.stopPropagation();
    navigate("/employees/add", { state: { employee: row } });
  };

  useEffect(() => {
    if (user.token) {
      setLoading(true);
      mutation.mutate();
    }
  }, [user]);

  const mutation = useMutation(() => {
    return axios
      .get(`${Environment.BaseURL}/api/employees/readAllEmployee`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (response) => {
          let userData = response.data;

          if (response.status === 200) {
            setUsers(userData);
          }
          setLoading(false);
        },
        (error) => {
          console.error(error);
          if (error.response.status !== 403) {
            notify("Could not fetch Data", "error");
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
      width={"95%"}
    >
      <DeleteDialog
        open={open}
        setOpen={setOpen}
        delete={handleDelete}
      ></DeleteDialog>
      <Header title={"Employees"} subtitle={"Manage Users"} />
      <Box display="flex" justifyContent={"flex-end"} width="100%">
        <Button
          variant="contained"
          sx={{
            backgroundColor: colors.greenAccent[500],
            "&:hover": { backgroundColor: colors.greenAccent[300] },
          }}
          onClick={() => addNew()}
          disabled={loading}
        >
          Add New
        </Button>
      </Box>
      {loading ? (
        <ListSuspenseLoader />
      ) : (
        <CustomDataGrid rows={users} cols={userCols} />
      )}
    </Box>
  );
};

export default Employees;
