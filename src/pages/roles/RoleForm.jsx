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

const schema = yup.object().shape({
  role_name: yup.string().required("required"),
  role_description: yup.string().required("required"),
});

const RoleForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [dataSaving, setDataSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({
    role_name: "",
    role_description: "",
  });

  useEffect(() => {
    if (location.state && location.state.role) {
      const vals = {
        role_name: location.state.role.role_name,
        role_description: location.state.role.role_description,
      };
      setInitialValues(vals);
    }
  }, [location]);

  const saveMutation = useMutation((data) => {
    return axios({
      url:
        location.state && location.state.role
          ? `${Environment.BaseURL}/api/role/updateRoles/${location.state.role._id}`
          : `${Environment.BaseURL}/api/role/createRoles`,
      method: location.state && location.state.role ? "PUT" : "POST",
      data: data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify(`Role saved Successfully`, "success");
          navigate(-1);
        } else notify("Counld save Role: " + response.data.message, "error");
        setDataSaving(false);
      },
      (error) => {
        notify("Unable to save role data.\n" + error.message, "error");
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
        title="Roles FORM"
        subtitle={
          location.state && location.state.user
            ? "Edit Roles Details"
            : "Create a new Role Profile"
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
            label="Role Name"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.role_name}
            name="role_name"
            error={
              !!formikProps.touched.role_name && !!formikProps.errors.role_name
            }
            helperText={
              formikProps.touched.role_name && formikProps.errors.role_name
            }
            sx={{ gridColumn: "span 4" }}
          />

          <TextField
            fullWidth
            multiline
            rows={5}
            variant="filled"
            type="text"
            label="Role Description"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.role_description}
            name="role_description"
            error={
              !!formikProps.touched.role_description &&
              !!formikProps.errors.role_description
            }
            helperText={
              formikProps.touched.role_description &&
              formikProps.errors.role_description
            }
            sx={{ gridColumn: "span 4" }}
          />
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

export default RoleForm;
