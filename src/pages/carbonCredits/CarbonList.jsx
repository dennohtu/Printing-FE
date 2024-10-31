import { Box, Button, IconButton, TextField } from "@mui/material";
import ModalDialog from "../../components/Modal";
import Header from "../../components/Header";
import { ListSuspenseLoader } from "../../components/SuspenseLoader";
import CustomDataGrid from "../../components/CustomDataGrid";
import { notify } from "../../utils/Toast";
import { useMutation } from "react-query";
import axios from "axios";
import { Environment } from "../../Environment";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { tokens } from "../../Theme";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const CarbonList = () => {
    const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
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
        field: "User_Passport_Photo",
        headerName: "Photo",
        minWidth: 150,
        renderCell: ({ row }) => {
          if (row.User_Passport_Photo) {
            return (
              <img
                style={{ width: "100px", height: "100px", objectFit: "contain" }}
                src={row.User_Passport_Photo}
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
        field: "User_First_Name",
        headerName: "Name",
        flex: 1,
        minWidth: 150,
        renderCell: ({ row }) => {
          return `${row.User_First_Name} ${row.User_Last_Name}`;
        },
      },
      { field: "User_Email", headerName: "Email", flex: 2, minWidth: 250 },
      { field: "User_Phone", headerName: "Phone", flex: 1, minWidth: 200 },
      {field: 'User_Carbon_Credits', headerName: 'Carbon Credits', flex: 1, minWidth: 150},
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
        user.role === "admin"
          ? `
        ${Environment.BaseURL}/api/user/readAllUser`
          : `${Environment.BaseURL}/api/institutions/readMembers/${user.institution._id}`,
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
            setUsers(userData);
          }
          setLoading(false);
        },
        (error) => {
          notify("Unable to fetch user data", "error");
          setLoading(false);
        }
      );
  });

  const credits = useMutation(({ id, credits }) => {
    return axios
      .put(
        `
        ${Environment.BaseURL}/api/user/editCarbonCredits/${id}`,
        {
          credits: credits,
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
            notify("User credited", "success");
            mutation.mutate();
          } else {
            notify(
              "Could not credit User. Please try again later",
              "error"
            );
          }
          setLoading(false);
          setOpen(false);
        },
        (error) => {
          console.error(error);
          notify("Unable to fetch user data", "error");
          setLoading(false);
          setOpen(false);
        }
      );
  });

  const execute = (operation, item) => {
    let creds;
    if (operation === "add") {
        creds = parseInt(item.User_Carbon_Credits) + parseInt(value)
    } else creds = (parseInt(item.User_Carbon_Credits) - parseInt(value)) < 0 ? 0 : (parseInt(item.User_Carbon_Credits) - parseInt(value))
    credits.mutate({ id: item._id, credits: creds });

  }

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
        title={"Carbon Credits"}
        subtitle={"Manage Carbon Credits"}
      />
      {loading ? (
        <ListSuspenseLoader />
      ) : (
        <CustomDataGrid rows={users} cols={userCols} />
      )}
    </Box>
  );
}
export default CarbonList