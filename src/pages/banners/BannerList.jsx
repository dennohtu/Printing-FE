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

const BannerList = () => {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const editItem = (item) => {
    navigate("/banners/add", { state: { banner: item } });
  };

  const deleteItem = (item) => {
    setToDelete(item._id);
    setOpen(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const deleteMutation = useMutation(() => {
    return axios
      .delete(`${Environment.BaseURL}/api/banners/deleteBanner/${toDelete}`, {
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
    { field: "Message", headerName: "Message", flex: 3, minWidth: 150 },
    {
      field: "Expiry",
      headerName: "Expiry Date",
      flex: 1,
      minWidth: 150,
      renderCell: ({row}) => {
        return new Date(row.Expiry).toLocaleDateString()
      }
    },
    {
        field: "expired",
        headerName: "Expired",
        flex: 1,
        minWidth: 150,
        renderCell: ({row}) => {
          return new Date().getTime() > new Date(row.Expiry) ? 'Yes' : 'No'
        }
      },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (!user.employee?.ReadOnly) {
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
                onClick={() => editItem(row)}
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

  const addNew = () => {
    navigate("/banners/add");
  };

  useEffect(() => {
    if (user.token) {
      setLoading(true);
      mutation.mutate();
    }
  }, [user]);
  const mutation = useMutation(() => {
    return axios
      .get(
        `
        ${Environment.BaseURL}/api/banners/readAllBanner`,
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
          notify("Unable to fetch data", "error");
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
      <Header
        title={"BANNER"}
        subtitle={"Manage Banners"}
      />
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
        <CustomDataGrid rows={items} cols={cols} />
      )}
    </Box>
  );
};

export default BannerList;
