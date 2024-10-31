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
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
  
  const schema = yup.object().shape({
    Message: yup.string().required("required"),
    Expiry: yup.date().min(dayjs().format('YYYY-MM-DD'), 'Expiry cannot be earlier than today')
  });
  
  const BannerForm = () => {
    const { user } = useSelector((state) => state.user);
    const location = useLocation();
    const navigate = useNavigate();
    const isNoneMobile = useMediaQuery("(min-width: 600px)");
    const [dataSaving, setDataSaving] = useState(false);
    const [initialValues, setInitialValues] = useState({
      Message: "",
      Expiry: dayjs(),
    });
  
    useEffect(() => {
      if (location.state && location.state.banner) {
        const vals = {
          Message: location.state.banner.Message,
          Expiry: dayjs(location.state.banner.Expiry),
        };
        setInitialValues(vals);
      }
    }, [location]);
  
    const saveMutation = useMutation((data) => {
      return axios({
        url:
          location.state && location.state.banner
            ? `${Environment.BaseURL}/api/banners/updateBanner/${location.state.banner._id}`
            : `${Environment.BaseURL}/api/banners/createBanner`,
        method: location.state && location.state.banner ? "PUT" : "POST",
        data: data,
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + user.token,
        },
      }).then(
        (response) => {
          if (response.status === 200) {
            notify(`Banner saved Successfully`, "success");
            navigate(-1);
          } else notify("Counld save Banner: " + response.data.message, "error");
          setDataSaving(false);
        },
        (error) => {
          notify("Unable to save banner data.\n" + error.message, "error");
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
      validationSchema: schema,
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
        <Header
          title="Banners FORM"
          subtitle={
            location.state && location.state.user
              ? "Edit Banner Details"
              : "Create a new Banner"
          }
        />
        <form style={{ width: "100%" }} onSubmit={formikProps.handleSubmit}>
          <Box
            width={"100%"}
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
              label="Message"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.Message}
              name="Message"
              error={
                !!formikProps.touched.Message && !!formikProps.errors.Message
              }
              helperText={
                formikProps.touched.Message && formikProps.errors.Message
              }
              sx={{ gridColumn: "span 4" }}
            />
  
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ke">
                <DatePicker
                    onBlur={formikProps.handleBlur}
                    onChange={(date) => formikProps.setFieldValue('Expiry', date)}
                    value={formikProps.values.Expiry}
                    label="Expiry"
                    name="Expiry"
                    slotProps={{
                        textField: {
                            helperText: formikProps.touched.Expiry && formikProps.errors.Expiry,
                            error: !!formikProps.touched.Expiry && !!formikProps.errors.Expiry
                        }
                    }}
                    sx={{ gridColumn: "span 4" }}
                 />
            </LocalizationProvider>
          </Box>
          <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
            <Button type="submit" color="secondary" variant="contained">
              Save Role
            </Button>
          </Box>
        </form>
      </Box>
    );
  };
  
  export default BannerForm;
  