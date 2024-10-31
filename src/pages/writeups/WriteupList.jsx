import {
  Box,
  useTheme,
  IconButton,
  Button,
  TextField,
  Typography,
  Modal,
} from "@mui/material";
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
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

const WriteupItem = ({ open, handleClose, row }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const cols = [
    {
      field: "stage",
      headerName: "Stage",
      flex: 1,
    },
    {
      field: "pd",
      headerName: "Pest/ Disease",
      flex: 1,
    },
    {
      field: "prevention",
      headerName: "Prevention",
      flex: 2,
    },
    {
      field: "treatment",
      headerName: "Treatment",
      flex: 2,
    },
  ];
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="writeup-item-title"
      aria-describedby="parent-modal-description"
    >
      <Box
        display={"flex"}
        width={"100%"}
        height={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Box
          display={"flex"}
          flexDirection={"column"}
          width={"50vw"}
          height={"80vh"}
          justifyContent={"center"}
          alignItems={"center"}
          borderRadius={"15px"}
          p="20px"
          sx={{ background: colors.primary[400] }}
        >
          <IconButton
            style={{ alignSelf: "end" }}
            onClick={() => handleClose()}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h2"
            fontWeight={"bold"}
            style={{ marginBottom: "30px" }}
          >
            {row?.title}
          </Typography>
          <Typography
            style={{
              width: "100%",
              marginBottom: "20px",
              textAlign: "justify",
            }}
          >
            {row?.text}
          </Typography>
          <CustomDataGrid rows={row?.table} cols={cols} />
        </Box>
      </Box>
    </Modal>
  );
};

const WriteupList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [openWriteupItem, setOpenWriteupItem] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [toDelete, setToDelete] = useState("");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { loading, runFetch } = useFetch();

  const editItem = (e, item) => {
    e.stopPropagation();
    navigate("/writeups/add", { state: { writeup: item } });
  };

  const viewText = (e, row) => {
    e.stopPropagation();
    setOpenWriteupItem(true);
    setCurrentItem(row);
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
      headerName: "Image",
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <img
            style={{ objectFit: "contain", width: "100px", height: "100px" }}
            src={row.photo}
            alt="logo"
          />
        );
      },
    },
    { field: "title", headerName: "Title", minWidth: 150 },
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
            <IconButton
              sx={{
                backgroundColor: `${colors.greenAccent[500]}`,
                "&:hover": {
                  backgroundColor: colors.greenAccent[300],
                },
              }}
              onClick={(e) => viewText(e, row)}
            >
              <VisibilityIcon />
            </IconButton>
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
            <IconButton
              sx={{
                backgroundColor: colors.redAccent[500],
                "&:hover": {
                  backgroundColor: colors.redAccent[300],
                },
              }}
              onClick={(e) => handleDelete(e, row)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  const addNew = () => {
    navigate("/writeups/add");
  };

  const fetchData = async () => {
    const { data, error } = await runFetch({
      url: "/writeups/readAllwriteup",
      method: "GET",
    });
    console.log(data);
    console.log(error);
    if (error) {
      toast.error(error);
    } else {
      setItems(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteItem = async (id) => {
    const { data, error } = await runFetch({
      url: `/writeups/deletewriteup/${id}`,
      method: "DELETE",
    });

    if (error) toast.error(error);
    else {
      toast.success("Deleted Successfully");
      await fetchData();
      setOpen(false);
      setToDelete("");
    }
  };

  const handleDelete = (e, row) => {
    e.stopPropagation();
    setToDelete(row);
    setOpen(true);
  };

  useEffect(() => {
    if (currentItem != null) {
      setOpenWriteupItem(true);
    }
  }, [currentItem]);

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <Header title={"Crop Writeups"} subtitle={"Manage Writeups"} />
      <WriteupItem
        open={openWriteupItem}
        handleClose={() => setOpenWriteupItem(false)}
        row={currentItem}
      />
      <DeleteDialog
        open={open}
        setOpen={setOpen}
        delete={() => deleteItem(toDelete._id)}
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

export default WriteupList;
