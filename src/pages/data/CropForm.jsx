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
import { useMutation, useQuery } from "react-query";
import {
  ButtonLoadingPlaceholder,
  LargeContentPlaceHolder,
} from "../../components/SuspenseLoader";
import axios from "axios";
import { Environment } from "../../Environment";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";

const animalSchema = yup.object().shape({
  Crop_Name: yup.string().required("required"),
  Crop_Image: yup.string(),
  Crop_Calendar_ID: yup.string(),
});

const CropForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [cropCalendars, setCropCalendars] = useState([]);
  const [dataSaving, setDataSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({
    Crop_Name: "",
    Crop_Image: "",
    Crop_Calendar_ID: "",
  });
  const [photo, setPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const [photoStr, setPhotoStr] = useState("");

  useEffect(() => {
    if (location.state && location.state.crop) {
      const vals = {
        Crop_Name: location.state.crop.Crop_Name,
        Crop_Image: location.state.crop.Crop_Image,
        Crop_Calendar_ID: location.state.crop.Crop_Calendar_ID?._id,
      };
      setPhotoStr(location.state.crop.Crop_Image);
      setInitialValues(vals);
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      fetchCalendars.refetch();
    }
  }, [user]);

  const fetchCalendars = useQuery("calendars", () => {
    return axios
      .get(`${Environment.BaseURL}/api/cropCalendar/readAllCropCalendar`, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            setCropCalendars(res.data);
          }
        },
        (err) => {
          console.error(err);
          if (err.code === "ERR_BAD_REQUEST") {
            console.log("No data found");
          } else {
            notify(
              "An error occured while fetching calendar data\n." + err.message,
              "error"
            );
          }
        }
      );
  });

  const saveMutation = useMutation((data) => {
    return axios({
      url:
        location.state && location.state.crop
          ? `${Environment.BaseURL}/api/crop/updateCrop/${location.state.crop._id}`
          : `${Environment.BaseURL}/api/crop/createCrop`,
      method: location.state && location.state.crop ? "PUT" : "POST",
      data: data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify(`Crop Type saved Successfully`, "success");
          navigate(-1);
        } else notify("Could not save Crop: " + response.data.message, "error");
        setDataSaving(false);
      },
      (error) => {
        notify("Unable to save Crop data.\n" + error.message, "error");
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
            formikProps.setFieldValue("Crop_Image", response.data[0]);
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
      <Box width={"100%"}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack sx={{ fontSize: "18pt" }} />
        </IconButton>
      </Box>
      <Header
        title="Crop FORM"
        subtitle={
          location.state && location.state.crop
            ? "Edit Crop Details"
            : "Create a new Crop Profile"
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
              value={formikProps.values.Crop_Name}
              name="Crop_Name"
              error={
                !!formikProps.touched.Crop_Name &&
                !!formikProps.errors.Crop_Name
              }
              helperText={
                formikProps.touched.Crop_Name && formikProps.errors.Crop_Name
              }
              sx={{ gridColumn: "span 4" }}
            />

            <Box
              display={"flex"}
              flexDirection="column"
              gridColumn="span 2"
              justifyContent="flex-start"
              alignItems={"flex-start"}
            >
              {photoStr !== "" && (
                <img
                  src={
                    photoStr.startsWith("http")
                      ? photoStr
                      : URL.createObjectURL(photo)
                  }
                  style={{
                    width: "300px",
                    maxHeight: "300px",
                    objectFit: "cover",
                    marginBottom: "10px",
                    borderRadius: "4px",
                  }}
                  alt="Crop photo"
                />
              )}
              <FormLabel
                htmlFor="cropPhoto"
                sx={{ display: "flex", justifyContent: "flex-start" }}
              >
                <TextField
                  variant="filled"
                  type="file"
                  onBlur={formikProps.handleBlur}
                  onChange={(evt) =>
                    handleFileSelect(evt.currentTarget.files[0])
                  }
                  inputProps={{ accept: "image/*" }}
                  id="cropPhoto"
                  name="cropPhoto"
                  sx={{ display: "none" }}
                />
                <TextField
                  disabled
                  variant="filled"
                  type="text"
                  onBlur={formikProps.handleBlur}
                  value={photoStr}
                  label="Crop Image"
                  id="cropPhoto"
                  name="cropPhoto"
                  sx={{ gridColumn: "span 4" }}
                />
                <Button
                  disabled={dataSaving}
                  variant="contained"
                  component="span"
                >
                  {dataSaving ? <ButtonLoadingPlaceholder /> : "Choose Image"}
                </Button>
              </FormLabel>
            </Box>
          </Box>
          <FormControl fullWidth sx={{ gridColumn: "span 4", mt: "30px" }}>
            <InputLabel>Crop Calendar</InputLabel>
            <Select
              variant="filled"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.Crop_Calendar_ID}
              name="Crop_Calendar_ID"
              error={
                !!formikProps.touched.Crop_Calendar_ID &&
                !!formikProps.errors.Crop_Calendar_ID
              }
              helperText={
                formikProps.touched.Crop_Calendar_ID &&
                formikProps.errors.Crop_Calendar_ID
              }
            >
              {cropCalendars.map((u, idx) => {
                return (
                  <MenuItem value={u._id} key={idx}>
                    <ol>
                      <li
                        key={0}
                      >{`Propagation Period: ${u.propagationPeriod} weeks`}</li>
                      <li
                        key={1}
                      >{`Transplanting Period: ${u.transplantingperiod} weeks`}</li>
                      <li
                        key={2}
                      >{`Weeding Period: ${u.weedingPeriod} weeks`}</li>
                      <li
                        key={3}
                      >{`Harvesting Period: ${u.harvestingTime} weeks`}</li>
                    </ol>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
            <Button type="submit" color="secondary" variant="contained">
              Save Crop
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default CropForm;
