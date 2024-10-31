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
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ModalDialog from "../../components/Modal";

const CreditList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [operation, setOperation] = useState("add");
  const [value, setValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const userCols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "bio",
      headerName: "Bio",
      flex: 2,
      minWidth: 150,
    },
    { field: "credits", headerName: "Credits", minWidth: 150 },
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
                backgroundColor: `${colors.greenAccent[500]}`,
                "&:hover": {
                  backgroundColor: colors.greenAccent[300],
                },
              }}
              onClick={() => clickOpen("add", row)}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              sx={{
                backgroundColor: colors.redAccent[500],
                "&:hover": {
                  backgroundColor: colors.redAccent[300],
                },
              }}
              onClick={() => clickOpen("remove", row)}
            >
              <RemoveIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

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
        ${Environment.BaseURL}/api/institutions/readAllInstitutions`,
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
            setInstitutions(userData);
          }
          setLoading(false);
        },
        (error) => {
          notify("Unable to fetch institution data", "error");
          setLoading(false);
        }
      );
  });

  const addCredits = useMutation(({ id }) => {
    return axios
      .put(
        `
        ${Environment.BaseURL}/api/institutions/addCredits/${id}`,
        {
          credits: value,
        },
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
          if (response.status === 200) {
            notify("Institution credited", "success");
            mutation.mutate();
          } else {
            notify(
              "Could not credit institution. Please try again later",
              "error"
            );
          }
          setLoading(false);
          setOpen(false);
        },
        (error) => {
          console.error(error);
          notify("Unable to fetch institution data", "error");
          setLoading(false);
          setOpen(false);
        }
      );
  });

  const removeCredits = useMutation(({ id }) => {
    return axios
      .put(
        `
        ${Environment.BaseURL}/api/institutions/removeCredits/${id}`,
        {
          credits: value,
        },
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
          if (response.status === 200) {
            notify("Institution credits removed", "success");
            mutation.mutate();
          } else {
            notify(
              "Could not credit institution. Please try again later",
              "error"
            );
          }
          setLoading(false);
          setOpen(false);
        },
        (error) => {
          console.error(error);
          notify("Unable to fetch institution data", "error");
          setLoading(false);
          setOpen(false);
        }
      );
  });

  const execute = (operation, item) => {
    if (operation === "add") addCredits.mutate({ id: item._id });
    else removeCredits.mutate({ id: item._id });
  };

  const clickOpen = (operation, item) => {
    setOperation(operation);
    setItem(item);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <ModalDialog open={open}>
        <Box display="flex" width="95%" flexDirection={"column"}>
          <TextField
            fullWidth
            variant="outlined"
            type="number"
            label={`Credits to ${operation}`}
            onChange={(evt) => setValue(evt.currentTarget.value)}
            value={value}
            name="operationvalue"
          />
          <Box
            display="flex"
            mt="30px"
            width="80%"
            justifyContent={"space-evenly"}
          >
            <Button
              sx={{
                background: colors.greenAccent[500],
                color: "white",
                "&:hover": {
                  background: colors.greenAccent[300],
                },
              }}
              onClick={() => execute(operation, item)}
            >
              Save
            </Button>
            <Button
              sx={{
                background: colors.redAccent[500],
                color: "white",
                "&:hover": {
                  background: colors.redAccent[300],
                },
              }}
              onClick={() => closeModal()}
              variant="danger"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </ModalDialog>
      <Header
        title={"Institution Credits"}
        subtitle={"Manage Institution Credits"}
      />
      {loading ? (
        <ListSuspenseLoader />
      ) : (
        <CustomDataGrid rows={institutions} cols={userCols} />
      )}
    </Box>
  );
};

export default CreditList;
