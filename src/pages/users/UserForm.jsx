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
import generatePassword from "generate-password-browser";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ImagePicker from "../../components/ImagePicker";

const phoneRegex =
  /^(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/;

const userSchema = yup.object().shape({
  User_First_Name: yup.string().required("required"),
  User_Last_Name: yup.string().required("required"),
  User_Email: yup
    .string()
    .email("Enter a valid Email address (xxx@xxx.xxx)")
    .required("required"),
  User_Phone: yup
    .string()
    .matches(phoneRegex, "Enter a valid phone number (2547*********)")
    .required("required"),
  User_Role: yup.string().required("required"),
  User_Gender: yup.string().required("required"),
  User_Passport_Photo: yup.string(),
  User_Id_Card_Front: yup.string(),
  User_Id_Card_Back: yup.string(),
  User_Signed_Contract: yup.string(),
});

const UserForm = () => {
  const { user } = useSelector((state) => state.user);
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [roles, setRoles] = useState([]);
  const location = useLocation();
  const [initialValues, setInitialValues] = useState({
    User_First_Name: "",
    User_Last_Name: "",
    User_Email: "",
    User_Phone: "",
    User_Gender: "",
    User_Passport_Photo: "",
    User_Id_Card_Front: "",
    User_Id_Card_Back: "",
    User_KRA_Pin: "",
    User_Role: "farmer",
  });
  const [dataSaving, setDataSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passport, setPassport] = useState(false);
  const [idFront, setIdFront] = useState(false);
  const [idBack, setIdBack] = useState(false);
  const [kraPin, setKraPin] = useState(false);

  const [passportStr, setPassportStr] = useState("");
  const [idFrontStr, setIdFrontStr] = useState("");
  const [idBackStr, setIdBackStr] = useState("");
  const [kraPinStr, setKraPinStr] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchRolesMutation.mutate();
    }
  }, [user]);

  useEffect(() => {
    if (location.state && location.state.user) {
      const vals = {
        User_First_Name: location.state.user.User_First_Name,
        User_Last_Name: location.state.user.User_Last_Name,
        User_Email: location.state.user.User_Email,
        User_Phone: location.state.user.User_Phone,
        User_Gender: location.state.user.User_Gender,
        User_Passport_Photo: location.state.user.User_Passport_Photo,
        User_Id_Card_Front: location.state.user.User_Id_Card_Front,
        User_Id_Card_Back: location.state.user.User_Id_Card_Back,
        User_KRA_Pin: location.state.user.User_KRA_Pin,
        User_Role: location.state.user.User_Role_ID.role_name,
      };
      setIdFrontStr(location.state.user.User_Id_Card_Front);
      setIdBackStr(location.state.user.User_Id_Card_Back);
      setPassportStr(location.state.user.User_Passport_Photo);
      setKraPinStr(location.state.user.User_KRA_Pin);
      setInitialValues(vals);
    }
  }, [location, user]);

  const fetchRolesMutation = useMutation(() => {
    return axios
      .get(
        `
        ${Environment.BaseURL}/api/role/readAllRoles`,
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
            setRoles(userData);
          }
          setLoading(false);
        },
        (error) => {
          notify("Unable to fetch user data", "error");
          setLoading(false);
        }
      );
  });

  const saveUserMutation = useMutation((data) => {
    let dat;
    const pass = generatePassword.generate({
      length: 8,
      numbers: true,
      uppercase: true,
      lowercase: true,
      exclude: " ",
      strict: true,
    });
    if (!location.state || !location.state.user) {
      dat = { ...data, User_Password: pass };
    } else {
      dat = data;
    }
    const dat2 =
      location.state.type === "farmer"
        ? { ...dat, User_Role: "farm_employee", farmer_ID: location.state.id }
        : location.state.type === "institution"
        ? { ...dat, institution_ID: location.state.id, User_Password: pass }
        : dat;
    return axios({
      url:
        location.state && location.state.user
          ? `${Environment.BaseURL}/api/user/updateUser/${location.state.user._id}`
          : !location.state.type
          ? `${Environment.BaseURL}/api/user/register`
          : `${Environment.BaseURL}/api/user/createUser`,
      method: location.state && location.state.user ? "PUT" : "POST",
      data: dat2,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify("User saved Successfully", "success");
          if (location.state && location.state.type) {
            navigate(-1);
          }
        } else
          notify("Counld not save user: " + response.data.message, "error");
        setDataSaving(false);
      },
      (error) => {
        console.error(error);
        notify(`${error.response.data.message}\n`, "error");
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
            if (response.data.length === 0) {
              notify(
                "Could not complete upload.\n Make sure you upload an image file less than 30mb",
                "error"
              );
              setDataSaving(false);
              return;
            }
            notify("Upload Successful", "success");
            if (type === "idFront") {
              setIdFrontStr(response.data[0]);
              formikProps.setFieldValue("User_Id_Card_Front", response.data[0]);
            } else if (type === "idBack") {
              setIdBackStr(response.data[0]);
              formikProps.setFieldValue("User_Id_Card_Back", response.data[0]);
            } else if (type === "passport") {
              setPassportStr(response.data[0]);
              formikProps.setFieldValue(
                "User_Passport_Photo",
                response.data[0]
              );
            } else if (type === "kraPin") {
              setKraPinStr(response.data[0]);
              formikProps.setFieldValue("User_KRA_Pin", response.data[0]);
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
    if (type === "idFront") {
      setIdFront(file);
      setIdFrontStr(file.name);
      uploadFiles(type, file);
    } else if (type === "idBack") {
      setIdBack(file);
      setIdBackStr(file.name);
      uploadFiles(type, file);
    } else if (type === "passport") {
      setPassport(file);
      setPassportStr(file.name);
      uploadFiles(type, file);
    } else {
      setKraPin(file);
      setKraPinStr(file.name);
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
        title="USER FORM"
        subtitle={
          location.state && location.state.user
            ? "Edit User Details"
            : "Create a new User Profile"
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
              label="First Name"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.User_First_Name}
              name="User_First_Name"
              error={
                !!formikProps.touched.User_First_Name &&
                !!formikProps.errors.User_First_Name
              }
              helperText={
                formikProps.touched.User_First_Name &&
                formikProps.errors.User_First_Name
              }
              sx={{ gridColumn: "span 2" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Last Name"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.User_Last_Name}
              name="User_Last_Name"
              error={
                !!formikProps.touched.User_Last_Name &&
                !!formikProps.errors.User_Last_Name
              }
              helperText={
                formikProps.touched.User_Last_Name &&
                formikProps.errors.User_Last_Name
              }
              sx={{ gridColumn: "span 2" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Email"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.User_Email}
              name="User_Email"
              error={
                !!formikProps.touched.User_Email &&
                !!formikProps.errors.User_Email
              }
              helperText={
                formikProps.touched.User_Email && formikProps.errors.User_Email
              }
              sx={{ gridColumn: "span 2" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Phone"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.User_Phone}
              name="User_Phone"
              error={
                !!formikProps.touched.User_Phone &&
                !!formikProps.errors.User_Phone
              }
              helperText={
                formikProps.touched.User_Phone && formikProps.errors.User_Phone
              }
              sx={{ gridColumn: "span 2" }}
            />

            <FormControl
              fullWidth
              sx={{
                gridColumn: "span 4",
              }}
            >
              <InputLabel>Gender</InputLabel>
              <Select
                variant="filled"
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                value={formikProps.values.User_Gender}
                name="User_Gender"
                error={
                  !!formikProps.touched.User_Gender &&
                  !!formikProps.errors.User_Gender
                }
                helperText={
                  formikProps.touched.User_Gender &&
                  formikProps.errors.User_Gender
                }
              >
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
              </Select>
            </FormControl>

            {user.role === "admin" && (
              <FormControl fullWidth sx={{ gridColumn: "span 4" }}>
                <InputLabel>Role</InputLabel>
                <Select
                  variant="filled"
                  onBlur={formikProps.handleBlur}
                  onChange={formikProps.handleChange}
                  value={formikProps.values.User_Role}
                  name="User_Role"
                  error={
                    !!formikProps.touched.User_Role &&
                    !!formikProps.errors.User_Role
                  }
                  helperText={
                    formikProps.touched.User_Role &&
                    formikProps.errors.User_Role
                  }
                >
                  {roles.map((r, idx) => {
                    return (
                      <MenuItem value={r.role_name} key={idx}>
                        {r.role_name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            <ImagePicker
              title="Id Front Facing Image"
              valueString={idFrontStr}
              gridColumn="span 2"
              setImageValue={(file) =>
                formikProps.setFieldValue("User_Id_Card_Front", file)
              }
              onBlur={formikProps.handleBlur}
              disabled={dataSaving}
              pasteActive={false}
            />

            <ImagePicker
              title="Id Back Facing Image"
              valueString={idBackStr}
              gridColumn="span 2"
              setImageValue={(file) =>
                formikProps.setFieldValue("User_Id_Card_Back", file)
              }
              pasteActive={false}
              onBlur={formikProps.handleBlur}
              disabled={dataSaving}
            />

            <ImagePicker
              title="Passport Image"
              valueString={passportStr}
              gridColumn="span 2"
              setImageValue={(file) =>
                formikProps.setFieldValue("User_Passport_Photo", file)
              }
              pasteActive={false}
              onBlur={formikProps.handleBlur}
              disabled={dataSaving}
            />

            <ImagePicker
              title="KRA Pin Image"
              valueString={kraPinStr}
              gridColumn="span 2"
              setImageValue={(file) =>
                formikProps.setFieldValue("User_KRA_Pin", file)
              }
              pasteActive={false}
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
              Save User
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default UserForm;
