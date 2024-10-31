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
} from "@mui/material";
import { Formik, useFormik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { notify } from "../../utils/Toast";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import {
  ButtonLoadingPlaceholder,
  LargeContentPlaceHolder,
} from "../../components/SuspenseLoader";
import axios from "axios";
import { Environment } from "../../Environment";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ImagePicker from "../../components/ImagePicker";

const animalSchema = yup.object().shape({
  name: yup.string().required("required"),
  photo: yup.string(),
});

const AnimalForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [users, setUsers] = useState([]);
  const [dataSaving, setDataSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    photo: "",
  });
  const [photo, setPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const [photoStr, setPhotoStr] = useState("");

  useEffect(() => {
    if (location.state && location.state.animal) {
      const vals = {
        name: location.state.animal.name,
        photo: location.state.animal.photo,
      };
      setPhotoStr(location.state.animal.photo);
      setInitialValues(vals);
    }
  }, [location]);

  const saveMutation = useMutation((data) => {
    return axios({
      url:
        location.state && location.state.animal
          ? `${Environment.BaseURL}/api/TypeOfAnimal/updateTypeOfAnimal/${location.state.animal._id}`
          : `${Environment.BaseURL}/api/TypeOfAnimal/createTypeOfAnimal`,
      method: location.state && location.state.animal ? "PUT" : "POST",
      data: data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify(`Animal Type saved Successfully`, "success");
          navigate(-1);
        } else notify("Counld save animal: " + response.data.message, "error");
        setDataSaving(false);
      },
      (error) => {
        notify("Unable to save animal data.\n" + error.message, "error");
        setDataSaving(false);
      }
    );
  });

  const handleFormSubmit = (values) => {
    setDataSaving(true);
    saveMutation.mutate(values);
  };

  const formikProps = useFormik({
    onSubmit: handleFormSubmit,
    initialValues: initialValues,
    validationSchema: animalSchema,
    enableReinitialize: true,
  });

  const uploadFiles = async (file) => {
    setDataSaving(true);
    const formData = new FormData();
    formData.append("images", file);
    uploadFilesMutation.mutate({ formData });
  };

  const uploadFilesMutation = useMutation(({ formData }) => {
    return axios
      .post(
        `
          ${Environment.BaseURL}/api/upload/uploadDocument/Images`,
        formData,
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        }
      )
      .then(
        (response) => {
          if (response.status === 200) {
            notify("Upload Successful", "success");
            setPhotoStr(response.data[0]);
            formikProps.setFieldValue("photo", response.data[0]);
          }
          setDataSaving(false);
        },
        (error) => {
          notify("Unable to upload image.\n" + error.message, "error");
          setDataSaving(false);
        }
      );
  });

  const handleFileSelect = (file) => {
    setPhoto(file);
    setPhotoStr(file.name);
    uploadFiles(file);
  };

  return (
    <Box
      m="20px"
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <Box width="100%">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack sx={{ fontSize: "18pt" }} />
        </IconButton>
      </Box>
      <Header
        title="Type Of Animal FORM"
        subtitle={
          location.state && location.state.user
            ? "Edit Type Of Animal Details"
            : "Create a new Type Of Animal Profile"
        }
      />
      {loading ? (
        <LargeContentPlaceHolder />
      ) : (
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
              label="Name"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.name}
              name="name"
              error={!!formikProps.touched.name && !!formikProps.errors.name}
              helperText={formikProps.touched.name && formikProps.errors.name}
              sx={{ gridColumn: "span 4" }}
            />

            <ImagePicker
              title="Animal Photo"
              valueString={formikProps.values.photo}
              gridColumn="span 2"
              setImageValue={(file) => formikProps.setFieldValue("photo", file)}
              onBlur={formikProps.handleBlur}
              disabled={dataSaving}
            />
          </Box>
          <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
            <Button type="submit" color="secondary" variant="contained">
              Save Type Of Animal
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default AnimalForm;
