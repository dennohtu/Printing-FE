import {
  Box,
  TextField,
  Button,
  FormLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  TextareaAutosize,
} from "@mui/material";
import { Formik, useFormik } from "formik";
import * as yup from "yup";
import YupPassword from "yup-password";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { notify } from "../../utils/Toast";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import {
  ButtonLoadingPlaceholder,
  LargeContentPlaceHolder,
} from "../../components/SuspenseLoader";
import axios from "axios";
import { Environment } from "../../Environment";
import { useSelector } from "react-redux";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ImagePicker from "../../components/ImagePicker";
import useFetch from "../../hooks/useFetch";
import { toast } from "react-toastify";
import CustomDataGrid from "../../components/CustomDataGrid";
import ModalDialog from "../../components/Modal";

const tableItemSchema = yup.object().shape({
  stage: yup.string().required("required"),
  pd: yup.string().required("required"),
  prevention: yup.string().required("required"),
  treatment: yup.string().required("required"),
});

const WriteupTableItem = ({
  open,
  handleClose,
  tableItems,
  setTableItems,
  currentTableItem,
  setCurrentTableItem,
}) => {
  let tableItemsList = [...tableItems];
  const isNoneMobile = useMediaQuery("(min-width: 600px)");

  const handleCloseForm = () => {
    setCurrentTableItem(null);
    if (handleClose) handleClose();
  };

  const handleSubmit = (values) => {
    const data = { ...values, _id: tableItemsList.length };
    const idx = tableItemsList.findIndex(
      (el) => el.stage === currentTableItem.stage
    );
    if (idx !== -1) {
      tableItemsList.splice(idx, 1);
    }
    tableItemsList.push(data);
    if (setTableItems) {
      setTableItems(tableItemsList);
    }
    handleCloseForm();
    setCurrentTableItem(null);
  };

  const deleteTableItem = () => {
    if (!currentTableItem) {
      toast.warn("Select a table item to delete");
    } else {
      const idx = tableItemsList.findIndex(
        (el) => el.stage === currentTableItem.stage
      );
      if (idx !== -1) {
        tableItemsList.splice(idx, 1);
        if (setTableItems) {
          setTableItems(tableItemsList);
        }
      }
    }
    handleCloseForm();
    setCurrentTableItem(null);
  };

  const formikPropsT = useFormik({
    onSubmit: handleSubmit,
    initialValues: currentTableItem
      ? currentTableItem
      : {
          stage: "",
          pd: "",
          prevention: "",
          treatment: "",
        },
    validationSchema: tableItemSchema,
    enableReinitialize: true,
  });

  return (
    <ModalDialog
      title={
        currentTableItem
          ? `Edit stage: ${currentTableItem.stage} data`
          : "Add New Stage"
      }
      open={open}
      handleClose={handleCloseForm}
      style={{ width: "40vw" }}
    >
      <form style={{ width: "100%" }} onSubmit={formikPropsT.handleSubmit}>
        <Box
          display={"grid"}
          gap={"30px"}
          gridTemplateColumns="repeat(4,minmax(0,1fr))"
          sx={{
            "& > div": {
              gridColumn: isNoneMobile ? undefined : "span 4",
            },
            overflowY: "auto",
          }}
        >
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Stage"
            onBlur={formikPropsT.handleBlur}
            onChange={formikPropsT.handleChange}
            value={formikPropsT.values.stage}
            name="stage"
            error={!!formikPropsT.touched.stage && !!formikPropsT.errors.stage}
            helperText={formikPropsT.touched.stage && formikPropsT.errors.stage}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Pests & Diseases"
            onBlur={formikPropsT.handleBlur}
            onChange={formikPropsT.handleChange}
            value={formikPropsT.values.pd}
            name="pd"
            error={!!formikPropsT.touched.pd && !!formikPropsT.errors.pd}
            helperText={formikPropsT.touched.pd && formikPropsT.errors.pd}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            multiline
            rows={4}
            maxRows={Infinity}
            fullWidth
            variant="filled"
            type="text"
            label="Prevention"
            onBlur={formikPropsT.handleBlur}
            onChange={formikPropsT.handleChange}
            value={formikPropsT.values.prevention}
            name="prevention"
            error={
              !!formikPropsT.touched.prevention &&
              !!formikPropsT.errors.prevention
            }
            helperText={
              formikPropsT.touched.prevention && formikPropsT.errors.prevention
            }
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            maxRows={Infinity}
            variant="filled"
            type="text"
            label="Treatment"
            onBlur={formikPropsT.handleBlur}
            onChange={formikPropsT.handleChange}
            value={formikPropsT.values.treatment}
            name="treatment"
            error={
              !!formikPropsT.touched.treatment &&
              !!formikPropsT.errors.treatment
            }
            helperText={
              formikPropsT.touched.treatment && formikPropsT.errors.treatment
            }
            sx={{ gridColumn: "span 4" }}
          />
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{ gridColumn: "span 4" }}
          >
            <Button variant="contained" color="success" type="submit">
              Save
            </Button>
            <Button variant="contained" color="warning" type="reset">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              type="button"
              disabled={!currentTableItem}
              onClick={() => deleteTableItem()}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </form>
    </ModalDialog>
  );
};

const userSchema = yup.object().shape({
  title: yup.string().required("required"),
  crop_ID: yup.string().required("required"),
  text: yup.string().required("required"),
  photo: yup.string(),
});

const WriteupForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [crops, setCrops] = useState([]);
  const [tableItems, setTableItems] = useState([]);
  let tableItemsCopy = [];
  const [initialValues, setInitialValues] = useState({
    title: "",
    crop_ID: "",
    text: "",
    photo: "",
  });
  const { loading, runFetch } = useFetch();
  const [photo, setPhoto] = useState(false);

  const [photoStr, setPhotoStr] = useState("");
  const [openTableItem, setOpenTableItem] = useState(false);
  const [currentTableItem, setCurrentTableItem] = useState(null);

  const cols = [
    {
      field: "_id",
      headerName: "Id",
    },
    {
      field: "stage",
      headerName: "Stage",
      flex: 1,
    },
    {
      field: "pd",
      headerName: "Pests & Diseases",
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

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    if (location.state && location.state.writeup) {
      console.log(location.state.writeup);
      const vals = {
        title: location.state.writeup.title,
        crop_ID: location.state.writeup.crop_ID?._id,
        text: location.state.writeup.text,
        photo: location.state.writeup.photo,
      };
      setPhotoStr(location.state.writeup.photo);
      setTableItems(location.state.writeup.table);
      tableItemsCopy = location.state.writeup.table;
      setInitialValues(vals);
    }
  }, [location]);

  const fetchCrops = async () => {
    const { data, error } = await runFetch({
      url: "/crop/readAllCrops",
      method: "GET",
    });
    if (data) {
      setCrops(data);
    } else {
      toast.error(
        "Could not Fetch Crop information. Check console for details"
      );
      console.error(error);
    }
  };

  const saveWriteup = async (dataBody) => {
    const dataBodyC = { ...dataBody, table: tableItems };
    const { data, error } = await runFetch({
      url: `/writeups/createwriteup`,
      method: "POST",
      body: dataBodyC,
    });
    if (data) {
      toast.success(data);
      navigate(-1);
    } else {
      toast.error(error);
    }
  };

  const handleFormSubmit = (values) => {
    console.log("Saving");
    saveWriteup(values);
  };

  const formikProps = useFormik({
    onSubmit: handleFormSubmit,
    initialValues: initialValues,
    validationSchema: userSchema,
    enableReinitialize: true,
  });

  const uploadFiles = async ({ type, formData }) => {
    const { data, error } = await runFetch({
      url: "/upload/uploadDocument/Images",
      body: formData,
      method: "POST",
    });
    if (data) {
      notify("Upload Successful", "success");
      if (type === "photo") {
        setPhotoStr(data.data[0]);
        formikProps.setFieldValue("photo", data.data[0]);
      }
    } else {
      notify(`Could not upload Image.\n${error}`, "error");
    }
  };

  const handleFileSelect = (type, file) => {
    if (type === "photo") {
      setPhoto(file);
      setPhotoStr(file.name);
      uploadFiles({
        type: type,
        formData: file,
      });
    }
  };

  return (
    <Box
      m="20px"
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <WriteupTableItem
        handleClose={() => setOpenTableItem(false)}
        open={openTableItem}
        setTableItems={setTableItems}
        tableItems={tableItems}
        currentTableItem={currentTableItem}
        setCurrentTableItem={setCurrentTableItem}
      />
      <Box width="100%">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack sx={{ fontSize: "18pt" }} />
        </IconButton>
      </Box>
      <Header
        title="Writeup FORM"
        subtitle={
          location.state && location.state.user
            ? "Edit Writeup Details"
            : "Create a new Writeup Profile"
        }
      />
      <form style={{ width: "100%" }} onSubmit={formikProps.handleSubmit}>
        <Box
          display={"grid"}
          gap={"30px"}
          gridTemplateColumns="repeat(4,minmax(0,1fr))"
          sx={{
            "& > div": {
              gridColumn: isNoneMobile ? undefined : "span 4",
            },
          }}
        >
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Title"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.title}
            name="title"
            error={!!formikProps.touched.title && !!formikProps.errors.title}
            helperText={formikProps.touched.title && formikProps.errors.title}
            sx={{ gridColumn: "span 4" }}
          />

          <FormControl fullWidth sx={{ gridColumn: "span 4" }}>
            <InputLabel>Crop</InputLabel>
            <Select
              variant="filled"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.crop_ID}
              name="crop_ID"
              error={
                !!formikProps.touched.crop_ID && !!formikProps.errors.crop_ID
              }
              helperText={
                formikProps.touched.crop_ID && formikProps.errors.crop_ID
              }
            >
              {crops.map((r, idx) => {
                return (
                  <MenuItem value={r._id} key={idx}>
                    {r.Crop_Name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <TextField
            multiline
            minRows={4}
            fullWidth
            variant="filled"
            type="text"
            label="Content"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.text}
            name="text"
            error={!!formikProps.touched.text && !!formikProps.errors.text}
            helperText={formikProps.touched.text && formikProps.errors.text}
            sx={{ gridColumn: "span 4" }}
          />

          <ImagePicker
            title="Photo"
            valueString={photoStr}
            gridColumn="span 2"
            setImageValue={(file) => formikProps.setFieldValue("photo", file)}
            onBlur={formikProps.handleBlur}
            disabled={loading}
          />
          <CustomDataGrid
            rows={tableItems}
            cols={cols}
            sx={{ gridColumn: "span 4" }}
            rowClick={(row) => {
              setCurrentTableItem(row);
              setOpenTableItem(true);
            }}
          />
        </Box>
        <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
          <Button
            type="button"
            sx={{ color: "white", fontWeight: "600", marginRight: "20px" }}
            color="warning"
            variant="contained"
            onClick={() => setOpenTableItem(true)}
          >
            Add New Stage Data
          </Button>
          <Button
            type="submit"
            sx={{ color: "white", fontWeight: "600" }}
            color="secondary"
            variant="contained"
          >
            Save Writeup
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default WriteupForm;
