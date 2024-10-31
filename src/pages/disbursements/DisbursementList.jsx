import { Box, Button, IconButton, useTheme } from "@mui/material";
import { useState } from "react";
import { useMutation } from "react-query";
import { useSelector } from "react-redux";
import Header from "../../components/Header";
import { Environment } from "../../Environment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ListSuspenseLoader } from "../../components/SuspenseLoader";
import CustomDataGrid from "../../components/CustomDataGrid";
import { tokens } from "../../Theme";
import { useNavigate } from "react-router-dom";
import { notify } from "../../utils/Toast";
import { useEffect } from "react";
import axios from "axios";
import DeleteDialog from "../../components/DeleteDialog";
import MonetizationOn from "@mui/icons-material/MonetizationOn";

const DisbursementList = () => {
  const { user } = useSelector((state) => state.user);
  const [toDelete, setToDelete] = useState();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [institution, setInstitution] = useState();
  const addNew = () => {
    navigate("/institutions/disbursement/item");
  };

  const editItem = (evt, item) => {
    evt.stopPropagation();
    navigate("/institutions/disbursement/item", { state: { item: item } });
  };

  const viewFarmers = (evt, item) => {
    evt.stopPropagation();
    navigate("/institutions/disbursement/farmers", {
      state: { disbursement: item },
    });
  };

  useEffect(() => {
    if (user.institution) setInstitution(user.institution);
    if (user.token) {
      setLoading(true);
      mutation.mutate();
    }
  }, [user]);

  const mutation = useMutation(() => {
    return axios
      .get(
        `${Environment.BaseURL}/api/institutions/disbursement/readAllDisbursement`,
        {
          params:
            user.role === "institution"
              ? {
                  Institution_ID: user.institution ? user.institution._id : "",
                }
              : undefined,
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
            setData(userData);
          }
          setLoading(false);
        },
        (error) => {
          notify("Unable to fetch user data", "error");
          setLoading(false);
        }
      );
  });

  const deleteItem = (evt, item) => {
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
        `${Environment.BaseURL}/api/institutions/disbursement/deleteDisbursement/${toDelete}`,
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
      field: "Date",
      headerName: "Date",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.Date) {
          return new Date(row.Date).toDateString();
        } else {
          return "";
        }
      },
    },
    {
      field: "Institution_ID",
      headerName: "Institution",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return row.Institution_ID ? row.Institution_ID.name : "";
      },
    },
    {
      field: "Total_Amount",
      headerName: "Total_Amount",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return `Kshs ${row.Total_Amount}`;
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
            {!user.employee?.ReadOnly && (
              <IconButton
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  "&:hover": {
                    backgroundColor: colors.greenAccent[300],
                  },
                }}
                onClick={(evt) => viewFarmers(evt, row)}
              >
                <MonetizationOn />
              </IconButton>
            )}
            {user.role === "admin" && !user.employee?.ReadOnly && (
              <IconButton
                sx={{
                  backgroundColor: colors.blueAccent[500],
                  "&:hover": {
                    backgroundColor: colors.blueAccent[300],
                  },
                }}
                onClick={(evt) => editItem(evt, row)}
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
                onClick={(evt) => deleteItem(evt, row)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        );
      },
    },
  ];

  const rowClick = (row) => {
    navigate("/institutions/disbursement/item", { state: { item: row } });
  };

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection={"column"}
      alignItems="center"
      mt="30px"
    >
      <DeleteDialog
        open={open}
        setOpen={setOpen}
        delete={handleDelete}
      ></DeleteDialog>
      <Box width="95%">
        <Header
          title={"FUNDS DISBURSEMENTS"}
          subtitle={"Manage Disbursements"}
        />
        <Box display="flex" justifyContent={"flex-end"} width="90%">
          {user.role === "admin" && !user.employee?.ReadOnly && (
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
          )}
        </Box>
        {loading ? (
          <ListSuspenseLoader />
        ) : (
          <CustomDataGrid rowClick={rowClick} rows={data} cols={userCols} />
        )}
      </Box>
    </Box>
  );
};

export default DisbursementList;
