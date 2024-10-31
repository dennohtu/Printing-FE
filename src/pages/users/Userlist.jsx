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

// Allowed extensions for input file
const allowedExtensions = ["csv"];

const UserList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const [bulkData, setBulkData] = useState([]);
  const [uploadFile, setUploadFile] = useState();
  const [farmerRole, setFarmerRole] = useState();
  const isDesktop = useMediaQuery("(min-width:600px)");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const editUser = (evt, user) => {
    evt.stopPropagation();
    navigate("/users/add", { state: { user: user } });
  };

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
      .delete(`${Environment.BaseURL}/api/user/deleteUser/${toDelete}`, {
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
            {row.User_Role_ID?.role_name === "farmer" && (
              <IconButton
                sx={{
                  backgroundColor: `${colors.greenAccent[500]}`,
                  "&:hover": {
                    backgroundColor: colors.greenAccent[300],
                  },
                }}
                onClick={(evt) => viewMembers(evt, row)}
              >
                <GroupsIcon />
              </IconButton>
            )}
            {!user.employee?.ReadOnly && (
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
            )}
            {!user.employee?.ReadOnly && (
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
            )}
          </Box>
        );
      },
    },
  ];

  const viewMembers = (evt, item) => {
    evt.stopPropagation();
    navigate("/members", {
      state: { data: { id: item._id, type: "farmer" } },
    });
  };

  const addNew = () => {
    if (user.role === "institution") {
      navigate("/users/add", {
        state: { type: "institution", id: user.institution._id },
      });
    } else navigate("/users/add", { state: { type: "admin" } });
  };

  useEffect(() => {
    if (user.token) {
      setLoading(true);
      mutation.mutate();
      fetchFarmerRole.refetch();
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

  const rowClick = (row) => {
    console.log(row);
    navigate("/users/view", { state: { user: row } });
  };

  const fetchFarmerRole = useQuery("fetchFarmerRole", () => {
    return axios
      .get(`${Environment.BaseURL}/api/role/readAllRoles?role_name=farmer`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            setFarmerRole(res.data);
          }
        },
        (err) => {
          console.error(err);
        }
      );
  });

  const handleFileChange = (e) => {
    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        notify("Please input a csv file", "error");
        return;
      }

      // If input type is correct set the state
      setUploadFile(inputFile);
    }
  };

  useEffect(() => {
    if (uploadFile) {
      console.log("parsing");
      handleParse(uploadFile);
    } else {
      console.log("No file to parse");
    }
  }, [uploadFile]);

  useEffect(() => {
    if (bulkData.length > 0) {
      console.log("mutating");
      bulkUpload.mutate();
    } else console.log("No Data");
  }, [bulkData]);

  const handleParse = (inputFile) => {
    // Initialize a reader which allows user
    // to read any file or blob.
    const reader = new FileReader();

    // Event listener on reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      const columns = Object.keys(parsedData[0]);
      //check if columns are OK
      if (
        columns[0] !== "User_First_Name" ||
        columns[1] !== "User_Last_Name" ||
        columns[2] !== "User_Email" ||
        columns[3] !== "User_Phone" ||
        columns[4] !== "User_Gender"
      ) {
        notify(`Allowed Columns are: ${columns.join()} `, "error");
        return;
      }
      let data = [];
      let emailError = [];
      let PhoneError = [];
      for (const item in parsedData) {
        console.log(parsedData[item]);
        const pass = generatePassword.generate({
          length: 8,
          numbers: true,
          uppercase: true,
          lowercase: true,
          exclude: " ",
          strict: true,
        });
        if (
          !parsedData[item].User_Email ||
          !parsedData[item].User_Phone ||
          !parsedData[item].User_First_Name ||
          !parsedData[item].User_Last_Name ||
          !parsedData[item].User_Gender
        ) {
          console.log("skipping non filled row");
        } else if (!validateEmail(parsedData[item].User_Email)) {
          console.log("Email " + parsedData[item].User_Email);
          emailError.push(parsedData[item].User_Email);
        } else if (!validatePhone(parsedData[item].User_Phone)) {
          PhoneError.push(parsedData[item].User_Phone);
        } else {
          const farmer = {
            User_First_Name: parsedData[item].User_First_Name,
            User_Last_Name: parsedData[item].User_Last_Name,
            User_Email: parsedData[item].User_Email,
            User_Phone: parsedData[item].User_Phone,
            User_Password: pass,
            User_Role: farmerRole._id,
          };
          data.push(farmer);
        }
      }
      console.log(data);
      if (emailError.length > 0) {
        notify(
          `Some emails are not in the correct format: ${emailError.join()}`,
          "error"
        );
      } else if (PhoneError.length > 0) {
        notify(
          `All phone numbers must start with 254 and have 12 digits total. Check th following: ${PhoneError.join()}`,
          "error"
        );
      } else setBulkData(data);
    };
    reader.readAsText(inputFile);
  };

  const bulkUpload = useMutation(() => {
    setLoading(true);
    return axios
      .post(`${Environment.BaseURL}/api/user/registerMany`, bulkData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (res) => {
          setLoading(false);
          if (res.status === 200) {
            notify(res.data);
            mutation.mutate();
          }
        },
        (err) => {
          setLoading(false);
          if (err.response.status === 403) {
            notify(err.response.data.email, "error");
            notify(err.response.data.phone, "error");
          }
        }
      );
  });

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePhone = (phone) => {
    return String(phone)
      .toLowerCase()
      .match(/^[\]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/);
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
      <Header
        title={user.role === "admin" ? "USERS" : "FARMERS"}
        subtitle={"Manage Users"}
      />
      {!user.employee?.ReadOnly && (
        <Box display="flex" justifyContent={"flex-end"} width="100%">
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.greenAccent[500],
              "&:hover": { backgroundColor: colors.greenAccent[300] },
            }}
            onClick={addNew}
            disabled={loading}
          >
            Add New
          </Button>
        </Box>
      )}
      <Box mt="20px">
        <Typography
          variant="h6"
          sx={{ fontWeight: "800", color: colors.grey[700], fontSize: "18pt" }}
        >
          Bulk Upload
        </Typography>
      </Box>
      <Box
        display={"flex"}
        justifyContent={isDesktop ? "flex-start" : "center"}
        flexDirection={isDesktop ? undefined : "column"}
        width="100%"
        alignItems={"center"}
      >
        <CSVLink
          disabled={loading}
          filename={"usersList"}
          style={{
            background: colors.blueAccent[500],
            textDecoration: "none",
            color: "white",
            padding: "15px 20px",
            width: isDesktop ? undefined : "100%",
            borderRadius: "5px",
            "&:hover": {
              background: colors.blueAccent[300],
            },
          }}
          headers={[
            { label: "User_First_Name", key: "User_First_Name" },
            { label: "User_Last_Name", key: "User_Last_Name" },
            { label: "User_Email", key: "User_Email" },
            { label: "User_Phone", key: "User_Phone" },
            { label: "User_Gender", key: "User_Gender" },
          ]}
          data={[]}
        >
          Download Template File
        </CSVLink>
        <TextField
          sx={{
            width: isDesktop ? undefined : "100%",
            borderRadius: "5px",
            ml: isDesktop ? "20px" : undefined,
            mt: isDesktop ? undefined : "20px",
          }}
          type="file"
          onChange={handleFileChange}
        />
      </Box>
      {loading ? (
        <ListSuspenseLoader />
      ) : (
        <CustomDataGrid rowClick={rowClick} rows={users} cols={userCols} />
      )}
    </Box>
  );
};

export default UserList;
