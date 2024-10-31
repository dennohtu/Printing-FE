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
import DeleteIcon from "@mui/icons-material/Delete";
import { ListSuspenseLoader } from "../../components/SuspenseLoader";
import { useNavigate } from "react-router-dom";
import DeleteDialog from "../../components/DeleteDialog";
import { useLocation } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";

const EmployeeList = () => {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const [data, setdata] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const deleteItem = (item) => {
    setToDelete(item._id);
    setOpen(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const deleteMutation = useMutation(() => {
    return axios
      .delete(
        data.type === "farm"
          ? `${Environment.BaseURL}/api/farm/deleteUserFromFarm/${data.id}/${toDelete}`
          : data.type === "farmer"
          ? `${Environment.BaseURL}/api/user/deleteFarmerEmployee/${data.id}/${toDelete}`
          : `${Environment.BaseURL}/api/institutions/deleteMember/${data.id}/${toDelete}`,
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
            fetchData.mutate();
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

  const addNew = () => {
    navigate("/users/add", {
      state: { type: location.state.data.type, id: location.state.data.id },
    });
  };

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    { field: "User_First_Name", headerName: "First Name", minWidth: 150 },
    {
      field: "User_Last_Name",
      headerName: "Last Name",
      cellClassName: "nameColumnCell",
      minWidth: 150,
    },
    { field: "User_Email", headerName: "Email", flex: 2, minWidth: 150 },
    { field: "User_Phone", headerName: "Phone", flex: 1, minWidth: 150 },
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
                  backgroundColor: colors.redAccent[500],
                  "&:hover": {
                    backgroundColor: colors.redAccent[300],
                  },
                }}
                onClick={() => deleteItem(row)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        } else return "";
      },
    },
  ];

  useEffect(() => {
    if (user.token) {
      if (location.state && location.state.data) {
        setLoading(true);
        setdata(location.state.data);
        fetchData.mutate(location.state.data);
      }
    }
  }, [user, location]);
  const fetchData = useMutation((data) => {
    return axios
      .get(
        data.type === "farm"
          ? `${Environment.BaseURL}/api/farm/readEmployees/${data.id}`
          : data.type === "farmer"
          ? `${Environment.BaseURL}/api/user/getFarmerEmployees/${data.id}`
          : `${Environment.BaseURL}/api/institutions/readMembers/${data.id}`,
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
          notify("Unable to fetch user data", "error");
          setLoading(false);
        }
      );
  });

  return (
    <Box
      m="20px"
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
      <Box width={"100%"}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack sx={{ fontSize: "18pt" }} />
        </IconButton>
      </Box>
      <Header
        title={user.role === "admin" ? "Members" : "Employees"}
        subtitle={user.role === "admin" ? "Manage Members" : "View Employees"}
      />
      {user.role === "admin" ||
        !user.employee?.ReadOnly ||
        (user.role !== "institution" && (
          <Box>
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
        ))}
      {loading ? (
        <ListSuspenseLoader />
      ) : items.length === 0 ? (
        "No Data to display"
      ) : (
        <CustomDataGrid rows={items} cols={cols} />
      )}
    </Box>
  );
};

export default EmployeeList;
