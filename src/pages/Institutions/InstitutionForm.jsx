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
import YupPassword from "yup-password";
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ImagePicker from "../../components/ImagePicker";
YupPassword(yup);

const phoneRegex =
  /^(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/;

const userSchema = yup.object().shape({
  name: yup.string().required("required"),
  email: yup
    .string()
    .email("Enter a valid Email address (xxx@xxx.xxx)")
    .required("required"),
  phone: yup
    .string()
    .matches(phoneRegex, "Enter a valid phone number (2547*********)")
    .required("required"),
  country: yup.string().required("required"),
  county: yup.string().required("required"),
  password: yup
    .string()
    .required("required")
    .min(8, "Password should be atleast 8 characters long")
    .minLowercase(1, "Password should conain atleast 1 lowercase letter")
    .minUppercase(1, "Password should conain atleast 1 uppercase letter")
    .minNumbers(2, "Password should contain atleast 2 digits"),
  bio: yup.string(),
  logo: yup.string(),
});

const InstitutionForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [roles, setRoles] = useState([]);
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    county: "",
    password: "",
    bio: "",
    logo: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(false);

  const [logoStr, setLogoStr] = useState("");

  useEffect(() => {
    if (location.state && location.state.user) {
      console.log(location.state.user);
      const vals = {
        name: location.state.user.name,
        email: location.state.user.User_ID.User_Email,
        phone: location.state.user.User_ID.User_Phone,
        country: location.state.user.country,
        county: location.state.user.county,
        bio: location.state.user.bio,
        logo: location.state.user.logo,
        password: location.state.user.User_ID.User_Password,
      };
      setLogoStr(location.state.user.logo);
      setInitialValues(vals);
    }
  }, [location]);

  const saveUserMutation = useMutation((data) => {
    const vals =
      location.state && location.state.user ? { ...data, password: "" } : data;
    return location.state && location.state.user
      ? axios
          .put(
            `${Environment.BaseURL}/api/institutions/updateInstitutionDetails/${location.state.user._id}`,
            vals,
            {
              headers: {
                Accept: "application/json",
                Authorization: "Bearer " + user.token,
              },
            }
          )
          .then(
            (response) => {
              if (response.status === 200) {
                notify("Institution saved Successfully", "success");
                navigate(-1);
              } else
                notify(
                  "Could not create Institution: " + response.data.message,
                  "error"
                );
              setDataSaving(false);
            },
            (error) => {
              notify(
                "Unable to save Institution data.\n" + error.message,
                "error"
              );
              setDataSaving(false);
            }
          )
      : axios
          .post(
            `${Environment.BaseURL}/api/institutions/createInstitution`,
            vals,
            {
              headers: {
                Accept: "application/json",
                Authorization: "Bearer " + user.token,
              },
            }
          )
          .then(
            (response) => {
              if (response.status === 200) {
                notify("Institution created Successfully", "success");
                navigate(-1);
              } else
                notify(
                  "Could not save Institution: " + response.data.message,
                  "error"
                );
              setDataSaving(false);
            },
            (error) => {
              notify(
                "Unable to save Institution data.\n" + error.message,
                "error"
              );
              setDataSaving(false);
            }
          );
  });

  const handleFormSubmit = (values) => {
    setDataSaving(true);
    saveUserMutation.mutate(values);
  };

  const formikProps = useFormik({
    onSubmit: handleFormSubmit,
    initialValues: initialValues,
    validationSchema: userSchema,
    enableReinitialize: true,
  });

  const uploadFiles = async (type, file) => {
    setDataSaving(true);
    const formData = new FormData();
    formData.append("images", file);
    uploadFilesMutation.mutate({ type, formData });
  };

  const uploadFilesMutation = useMutation(({ type, formData }) => {
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
            if (type === "logo") {
              setLogoStr(response.data[0]);
              formikProps.setFieldValue("logo", response.data[0]);
            }
          }
          setDataSaving(false);
        },
        (error) => {
          notify("Unable to save user data.\n" + error.message, "error");
          setDataSaving(false);
        }
      );
  });

  const handleFileSelect = (type, file) => {
    if (type === "logo") {
      setLogo(file);
      setLogoStr(file.name);
      uploadFiles(type, file);
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
      <Box width="100%">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack sx={{ fontSize: "18pt" }} />
        </IconButton>
      </Box>
      <Header
        title="INSTITUTION FORM"
        subtitle={
          location.state && location.state.user
            ? "Edit Institution Details"
            : "Create a new Institution Profile"
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

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Email"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.email}
              name="email"
              error={!!formikProps.touched.email && !!formikProps.errors.email}
              helperText={formikProps.touched.email && formikProps.errors.email}
              sx={{ gridColumn: "span 2" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Phone"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.phone}
              name="phone"
              error={!!formikProps.touched.phone && !!formikProps.errors.phone}
              helperText={formikProps.touched.phone && formikProps.errors.phone}
              sx={{ gridColumn: "span 2" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Country"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.country}
              name="country"
              error={
                !!formikProps.touched.country && !!formikProps.errors.country
              }
              helperText={
                formikProps.touched.country && formikProps.errors.country
              }
              sx={{ gridColumn: "span 2" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="County"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.county}
              name="county"
              error={
                !!formikProps.touched.county && !!formikProps.errors.county
              }
              helperText={
                formikProps.touched.county && formikProps.errors.county
              }
              sx={{ gridColumn: "span 2" }}
            />

            {(!location.state || !location.state.user) && (
              <TextField
                fullWidth
                variant="filled"
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <VisibilityIcon
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ cursor: "pointer" }}
                      />
                    </InputAdornment>
                  ),
                }}
                label="Password for the Institution"
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                value={formikProps.values.password}
                name="password"
                error={
                  !!formikProps.touched.password &&
                  !!formikProps.errors.password
                }
                helperText={
                  formikProps.touched.password && formikProps.errors.password
                }
                sx={{ gridColumn: "span 2" }}
              />
            )}

            <TextField
              fullWidth
              multiline
              rows={5}
              variant="filled"
              type="text"
              label="Bio"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.bio}
              name="bio"
              error={!!formikProps.touched.bio && !!formikProps.errors.bio}
              helperText={formikProps.touched.bio && formikProps.errors.bio}
              sx={{ gridColumn: "span 2" }}
            />

            <ImagePicker
              title="Logo"
              valueString={logoStr}
              gridColumn="span 2"
              setImageValue={(file) => formikProps.setFieldValue("logo", file)}
              onBlur={formikProps.handleBlur}
              disabled={dataSaving}
            />
          </Box>
          <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
            <Button
              type="submit"
              sx={{ color: "white", fontWeight: "600" }}
              color="secondary"
              variant="contained"
            >
              Save Institution
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default InstitutionForm;
