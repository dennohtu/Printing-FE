import { Box, useTheme, IconButton, Button, TextField } from "@mui/material";
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
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ModalDialog from "../../components/Modal";
import useFetch from "../../hooks/useFetch";

const PestDiseaseList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const { loading, runFetch } = useFetch();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const editItem = (e, item) => {
    e.stopPropagation();
    navigate("/pestDisease/add", { state: { pd: item } });
  };

  const deleteItem = (e, item) => {
    e.stopPropagation();
    setToDelete(item._id);
    setOpen(true);
  };

  const deletePd = async (id) => {
    const { data, error } = await runFetch({
      url: `/pestdiseases/deletepestdisease/${id}`,
      method: "DELETE",
    });
    if (data) {
      notify("Deleted Successfully", "success");
      setOpen(false);
      await fetchData();
    } else {
      notify(
        "An error occured. This is probably on our end. contact admin.\n" +
          error,
        "error"
      );
    }
  };

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "photo",
      headerName: "Photo",
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <img
            style={{ objectFit: "contain", width: "100px", height: "100px" }}
            src={row.photo}
            alt="pest or disease photo"
          />
        );
      },
    },
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "type", headerName: "Type", flex: 1, minWidth: 150 },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 250,
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
            {!user.employee?.ReadOnly && (
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

  const addNew = () => {
    navigate("/pestDisease/add");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await runFetch({
      url: "/pestdiseases/readAllpestdisease",
      method: "GET",
    });

    if (data) {
      setItems(data);
    } else {
      console.log(error);
      notify(error, "error");
    }
  };

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <Header title={"PESTS & DISEASES"} subtitle={"Manage Pests & Diseases"} />
      <DeleteDialog
        open={open}
        setOpen={setOpen}
        delete={async () => await deletePd(toDelete)}
      ></DeleteDialog>
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

export default PestDiseaseList;
