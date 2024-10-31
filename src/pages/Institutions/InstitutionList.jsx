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

const InstitutionList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [openInstitutionDeposit, setOpenInstitutionDeposit] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const viewMembers = (e, item) => {
    e.stopPropagation();
    navigate("/members", {
      state: { data: { id: item._id, type: "institution" } },
    });
  };

  const editItem = (e, item) => {
    e.stopPropagation();
    navigate("/institutions/add", { state: { user: item } });
  };

  const deleteItem = (e, item) => {
    e.stopPropagation();
    setToDelete(item._id);
    setOpen(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const deleteMutation = useMutation(() => {
    return axios
      .delete(
        `${Environment.BaseURL}/api/institutions/deleteInstitution/${toDelete}`,
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

  const depositFunds = (e, row) => {
    e.stopPropagation();
    setCurrentInstitution(row);
    setOpenInstitutionDeposit(true);
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
      field: "logo",
      headerName: "Logo",
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <img
            style={{ objectFit: "contain", width: "100px", height: "100px" }}
            src={row.logo}
            alt="logo"
          />
        );
      },
    },
    { field: "name", headerName: "Name", minWidth: 150 },
    {
      field: "country",
      headerName: "Country",
      cellClassName: "nameColumnCell",
      minWidth: 150,
    },
    { field: "county", headerName: "County", flex: 1, minWidth: 150 },
    { field: "bio", headerName: "Bio", flex: 2, minWidth: 150 },
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
                backgroundColor: `${colors.grey[500]}`,
                "&:hover": {
                  backgroundColor: colors.grey[300],
                },
              }}
              onClick={(e) => depositFunds(e, row)}
            >
              <AccountBalanceWalletIcon />
            </IconButton>
            <IconButton
              sx={{
                backgroundColor: `${colors.greenAccent[500]}`,
                "&:hover": {
                  backgroundColor: colors.greenAccent[300],
                },
              }}
              onClick={(e) => viewMembers(e, row)}
            >
              <GroupsIcon />
            </IconButton>
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
    navigate("/institutions/add");
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

  const deposit = useMutation(() => {
    const body = {
      Transaction_Type: "Deposit",
      Amount: depositAmount,
      User_ID: currentInstitution.User_ID._id,
    };
    setDepositLoading(true);
    return axios
      .post(
        `
        ${Environment.BaseURL}/api/user/wallet/createTransaction`,
        body,
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
          setDepositLoading(false);
          if (res.status === 200) {
            notify("Funds deposited successfully", "success");
            setOpenInstitutionDeposit(false);
          }
        },
        (err) => {
          setDepositLoading(false);
          console.error(err);
          if (err.response && err.response.data) {
            notify(err.response.data.message, "error");
          } else {
            notify("Could not fund account.\n" + err.message, "error");
          }
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
      <Header title={"INSTITUTIONS"} subtitle={"Manage Institutions"} />
      <DeleteDialog
        open={open}
        setOpen={setOpen}
        delete={handleDelete}
      ></DeleteDialog>
      <ModalDialog
        title={"Deposit To Institution Wallet"}
        open={openInstitutionDeposit}
        handleClose={() => setOpenInstitutionDeposit(false)}
      >
        <TextField
          fullWidth
          variant="filled"
          type="number"
          label="Amount to Deposit"
          onChange={(e) => setDepositAmount(e.currentTarget.valueAsNumber)}
          value={depositAmount}
          name="depositAmount"
        />
        <Box
          display="flex"
          justifyContent={"space-evenly"}
          width="100%"
          mt="20px"
        >
          <Button
            variant="contained"
            sx={{
              background: colors.greenAccent[500],
              color: "white",
              cursor: "pointer",
              "&:hover": { background: colors.greenAccent[300] },
            }}
            onClick={() => {
              deposit.mutate();
            }}
            disabled={depositLoading}
          >
            Deposit
          </Button>
          <Button
            variant="contained"
            sx={{
              background: colors.grey[500],
              color: "white",
              cursor: "pointer",
              "&:hover": { background: colors.grey[300] },
            }}
            onClick={() => setOpenInstitutionDeposit(false)}
            disabled={depositLoading}
          >
            Cancel
          </Button>
        </Box>
      </ModalDialog>
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

export default InstitutionList;
