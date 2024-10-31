import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
import { useLocation } from "react-router-dom";
import ModalDialog from "../../components/Modal";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { CSVLink } from "react-csv";
import Papa from "papaparse";
// Allowed extensions for input file
const allowedExtensions = ["csv"];

const FarmerDisbursementList = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const [toDelete, setToDelete] = useState();
  const [data, setData] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [institution, setInstitution] = useState();
  const [selectedFarmers, setSelectedFarmers] = useState([]);
  const [uploadData, setUploadData] = useState();
  const [uploadFile, setUploadFile] = useState();
  const [saveOpen, setSaveOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const isDesktop = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    if (user && location) {
      if (user.token) {
        setLoading(true);
        mutation.mutate();
      }
    }
  }, [user, location]);

  useEffect(() => {
    if (data) {
      getFarmers.mutate();
    }
  }, [data]);

  useEffect(() => {
    if (uploadData) {
      uploadMutation.mutate();
    }
  }, [uploadData]);

  useEffect(() => {
    if (uploadFile) {
      console.log("parsing");
      handleParse(uploadFile);
    } else {
      console.log("No file to parse");
    }
  }, [uploadFile]);

  const mutation = useMutation(() => {
    return axios
      .get(
        `${Environment.BaseURL}/api/institutions/disbursement/farmers/readAllFarmerDisbursement`,
        {
          params: {
            Disbursement_ID: location.state.disbursement._id,
          },
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
          console.error(error);
          if (error.response.status === 403) {
            console.log("No data found");
          }
        }
      );
  });

  const getFarmers = useMutation(() => {
    return axios
      .get(
        user.role === "institution"
          ? `${Environment.BaseURL}/api/institutions/readMembers/${user.institution._id}`
          : `${Environment.BaseURL}/api/institutions/readMembers/${location.state.disbursement.Institution_ID._id}`,
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
            const list = [];
            userData.map((dat) => {
              const contains = data.filter((d) => d.User_ID._id === dat._id);
              if (contains.length === 0) {
                list.push(dat);
              }
            });
            setFarmers(list);
          }
          setLoading(false);
        },
        (error) => {
          console.error(error);
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
        `${Environment.BaseURL}/api/institutions/disbursement/farmers/deleteFarmerDisbursement/${toDelete}`,
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
      field: "User_ID",
      headerName: "Farmer Name",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.User_ID) {
          return `${row.User_ID.User_First_Name} ${row.User_ID.User_Last_Name}`;
        } else {
          return "";
        }
      },
    },
    {
      field: "Amount",
      headerName: "Amount",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return `Kshs ${row.Amount}`;
      },
    },
    {
      headerName: "Actions",
      flex: 2,
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
                onClick={(evt) => deleteItem(evt, row)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        } else return "";
      },
    },
  ];

  const handleFarmersChange = (evt) => {
    setSelectedFarmers(evt.target.value);
  };

  const uploadMutation = useMutation(() => {
    return axios
      .post(
        `${Environment.BaseURL}/api/institutions/disbursement/farmers/createMultipleFarmerDisbursements`,
        uploadData,
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
          console.log(res.data);
          if (res.status === 200) {
            notify("Farmers added successfully", "success");
            mutation.mutate();
            setSaveOpen(false);
          }
        },
        (err) => {
          if (err.response.status === 403) {
            notify(err.response.data.message, "error");
          } else {
            console.error(err);
            notify(err.message, "error");
          }
        }
      );
  });
  const handleSaveEvent = () => {
    if (amount === 0) {
      notify("Kindly fill an amount to fund the farmer", "error");
      return;
    }
    if (!selectedFarmers) {
      notify("Kindly select a farmer to fund", "error");
      return;
    }
    const obj = {
      farmers: selectedFarmers,
      Disbursement_ID: location.state.disbursement._id,
      Amount: amount,
    };
    setUploadData(obj);
  };

  const validatePhone = (phone) => {
    return String(phone)
      .toLowerCase()
      .match(/^[\]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/);
  };

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
        columns[3] !== "User_Phone" ||
        columns[4] !== "Amount"
      ) {
        notify(`Allowed Columns are: ${columns.join()} `, "error");
        return;
      }
      let data = [];
      let PhoneError = [];
      for (const item in parsedData) {
        if (
          !parsedData[item].User_Phone ||
          !parsedData[item].User_First_Name ||
          !parsedData[item].User_Last_Name ||
          !parsedData[item].Amount
        ) {
          console.log("skipping non filled row");
        } else if (!validatePhone(parsedData[item].User_Phone)) {
          PhoneError.push(parsedData[item].User_Phone);
        } else {
          const farmer = {
            User_First_Name: parsedData[item].User_First_Name,
            User_Last_Name: parsedData[item].User_Last_Name,
            User_Phone: parsedData[item].User_Phone,
            Amount: parsedData[item].Amount,
          };
          data.push(farmer);
        }
      }
      if (PhoneError.length > 0) {
        notify(
          `All phone numbers must start with 254 and have 12 digits total. Check th following: ${PhoneError.join()}`,
          "error"
        );
      } else {
        const obj = {
          uploadedFarmers: data,
          Disbursement_ID: location.state.disbursement._id,
        };
        setUploadData(obj);
      }
    };
    reader.readAsText(inputFile);
  };

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection={"column"}
      alignItems="center"
      mt="30px"
    >
      <ModalDialog
        open={saveOpen}
        handleClose={() => setSaveOpen(false)}
        title={"Select Farmers to Fund"}
      >
        <Box
          width="100%"
          display="flex"
          flexDirection="column"
          alignItems={"center"}
        >
          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="multiple-farmer-select-label">
              Select Farmer
            </InputLabel>
            <Select
              labelId="multiple-farmer-select-label"
              id="multiple-farmer-select"
              value={selectedFarmers}
              multiple
              onChange={handleFarmersChange}
              input={<OutlinedInput label="Name" />}
            >
              {farmers.map((f, idx) => (
                <MenuItem key={idx} value={f._id}>
                  {`${f.User_First_Name} ${f.User_Last_Name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            variant="filled"
            type="number"
            label="Amount"
            onChange={(evt) => setAmount(evt.target.value)}
            value={amount}
            name="Amount"
            sx={{ mt: "20px" }}
          />
          <Box display="flex" width="100%" justifyContent={"space-evenly"}>
            <Button
              sx={{
                mt: "20px",
                backgroundColor: colors.greenAccent[500],
                color: "white",
                "&:hover": { backgroundColor: colors.greenAccent[300] },
              }}
              onClick={handleSaveEvent}
            >
              Save
            </Button>

            <Button
              sx={{
                mt: "20px",
                backgroundColor: colors.grey[500],
                color: "white",
                "&:hover": { backgroundColor: colors.grey[300] },
              }}
              onClick={() => setSaveOpen(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </ModalDialog>
      <DeleteDialog
        open={open}
        setOpen={setOpen}
        delete={handleDelete}
        handleClose={() => setOpen(false)}
      ></DeleteDialog>
      <Box width="95%" mt="20px">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
      </Box>
      <Box width="95%">
        <Header
          title={"FUNDS DISBURSEMENTS"}
          subtitle={"Manage Disbursements To Farmers"}
        />
        <Box display="flex" justifyContent={"start"} alignItems={"center"}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "800",
              color: colors.grey[700],
              fontSize: "18pt",
            }}
          >
            Bulk Upload
          </Typography>
        </Box>
        <Box display="flex" justifyContent={"space-between"} width="90%">
          <Box
            display={"flex"}
            justifyContent={isDesktop ? "flex-start" : "center"}
            flexDirection={isDesktop ? undefined : "column"}
            width="100%"
            alignItems={"center"}
          >
            <CSVLink
              filename="farmersList"
              disabled={loading}
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
                { label: "User_Phone", key: "User_Phone" },
                { label: "Amount", key: "Amount" },
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
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.greenAccent[500],
              "&:hover": { backgroundColor: colors.greenAccent[300] },
            }}
            onClick={() => setSaveOpen(true)}
          >
            Add New Farmer To List
          </Button>
        </Box>
        {loading ? (
          <ListSuspenseLoader />
        ) : (
          <CustomDataGrid rows={data} cols={userCols} />
        )}
      </Box>
    </Box>
  );
};

export default FarmerDisbursementList;
