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

const animalSchema = yup.object().shape({
  cropCalendarFor: yup.string().required("required"),
  propagationPeriod: yup.number().required("required"),
  transplantingperiod: yup.number(),
  weedingPeriod: yup.number(),
  harvestingTime: yup.number(),
  sprayingTime: yup.number(),
});

const CropCalendarForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [dataSaving, setDataSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({
    cropCalendarFor: "",
    propagationPeriod: 0,
    transplantingperiod: 0,
    weedingPeriod: 0,
    harvestingTime: 0,
    sprayingTime: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.cropCalendar) {
      const vals = {
        propagationPeriod: location.state.cropCalendar.propagationPeriod,
        transplantingperiod: location.state.cropCalendar.transplantingperiod,
        weedingPeriod: location.state.cropCalendar.weedingPeriod,
        harvestingTime: location.state.cropCalendar.harvestingTime,
        sprayingTime: location.state.cropCalendar.sprayingTime,
        cropCalendarFor: location.state.cropCalendar.cropCalendarFor,
      };
      setInitialValues(vals);
    }
  }, [location]);

  const saveMutation = useMutation((data) => {
    return axios({
      url:
        location.state && location.state.cropCalendar
          ? `${Environment.BaseURL}/api/cropCalendar/updateCropCalendar/${location.state.cropCalendar._id}`
          : `${Environment.BaseURL}/api/cropCalendar/createCropCalendar`,
      method: location.state && location.state.cropCalendar ? "PUT" : "POST",
      data: data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify(`Crop Calendar saved Successfully`, "success");
          navigate(-1);
        } else
          notify(
            "Could not save crop calendar: " + response.data.message,
            "error"
          );
        setDataSaving(false);
      },
      (error) => {
        notify("Unable to save crop calendar data.\n" + error.message, "error");
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
        title="Crop Calendar FORM"
        subtitle={
          location.state && location.state.user
            ? "Edit Crop Calendar Details"
            : "Create a new Crop Calendar Profile"
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
              label="Crop Calendar For"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.cropCalendarFor}
              name="cropCalendarFor"
              error={
                !!formikProps.touched.cropCalendarFor &&
                !!formikProps.errors.cropCalendarFor
              }
              helperText={
                formikProps.touched.cropCalendarFor &&
                formikProps.errors.cropCalendarFor
              }
              sx={{ gridColumn: "span 4" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="number"
              label="Propagation Period"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.propagationPeriod}
              name="propagationPeriod"
              error={
                !!formikProps.touched.propagationPeriod &&
                !!formikProps.errors.propagationPeriod
              }
              helperText={
                formikProps.touched.propagationPeriod &&
                formikProps.errors.propagationPeriod
              }
              sx={{ gridColumn: "span 4" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="number"
              label="Transplanting Period"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.transplantingperiod}
              name="transplantingperiod"
              error={
                !!formikProps.touched.transplantingperiod &&
                !!formikProps.errors.transplantingperiod
              }
              helperText={
                formikProps.touched.transplantingperiod &&
                formikProps.errors.transplantingperiod
              }
              sx={{ gridColumn: "span 4" }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="number"
              label="Weeding Period"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.weedingPeriod}
              name="weedingPeriod"
              error={
                !!formikProps.touched.weedingPeriod &&
                !!formikProps.errors.weedingPeriod
              }
              helperText={
                formikProps.touched.weedingPeriod &&
                formikProps.errors.weedingPeriod
              }
              sx={{ gridColumn: "span 4" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="number"
              label="Spraying Period"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.sprayingTime}
              name="sprayingTime"
              error={
                !!formikProps.touched.sprayingTime &&
                !!formikProps.errors.sprayingTime
              }
              helperText={
                formikProps.touched.sprayingTime &&
                formikProps.errors.sprayingTime
              }
              sx={{ gridColumn: "span 4" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="number"
              label="HarvestingTime"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.harvestingTime}
              name="harvestingTime"
              error={
                !!formikProps.touched.harvestingTime &&
                !!formikProps.errors.harvestingTime
              }
              helperText={
                formikProps.touched.harvestingTime &&
                formikProps.errors.harvestingTime
              }
              sx={{ gridColumn: "span 4" }}
            />
          </Box>
          <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
            <Button
              disabled={dataSaving}
              type="submit"
              color="secondary"
              variant="contained"
            >
              Save Crop Calendar
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default CropCalendarForm;
