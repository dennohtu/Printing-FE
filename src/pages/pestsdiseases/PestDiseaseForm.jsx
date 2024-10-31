import {
  Box,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Formik, useFormik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ImagePicker from "../../components/ImagePicker";
import useFetch from "../../hooks/useFetch";
import { toast } from "react-toastify";

const userSchema = yup.object().shape({
  name: yup.string().required("required"),
  type: yup.string().required("required"),
  photo: yup.string(),
});

const PestDiseaseForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [initialValues, setInitialValues] = useState({
    name: "",
    type: "",
    photo: "",
  });
  const { loading, runFetch } = useFetch();

  const [photoStr, setPhotoStr] = useState("");

  useEffect(() => {
    if (location.state && location.state.pd) {
      const vals = {
        name: location.state.pd.name,
        type: location.state.pd.type,
      };
      setPhotoStr(location.state.pd.photo);
      setInitialValues(vals);
    }
  }, [location]);

  const savePd = async (dataBody) => {
    const { data, error } = await runFetch({
      url:
        location.state && location.state.pd
          ? `/pestdiseases/updatepestdisease/${location.state.pd._id}`
          : `/pestdiseases/createpestdisease`,
      method: location.state && location.state.pd ? "PUT" : "POST",
      body: dataBody,
    });
    if (data) {
      toast.success(data);
      navigate(-1);
    } else {
      toast.error(error);
    }
  };

  const handleFormSubmit = (values) => {
    savePd(values);
  };

  const formikProps = useFormik({
    onSubmit: handleFormSubmit,
    initialValues: initialValues,
    validationSchema: userSchema,
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
        title="Pests & Diseases Form"
        subtitle={
          location.state && location.state.pd
            ? "Edit pest & disease Details"
            : "Create a new Pest & Disease Profile"
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
            label="Name"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.name}
            name="name"
            error={!!formikProps.touched.name && !!formikProps.errors.name}
            helperText={formikProps.touched.name && formikProps.errors.name}
            sx={{ gridColumn: "span 4" }}
          />

          <FormControl
            fullWidth
            sx={{
              gridColumn: "span 4",
            }}
          >
            <InputLabel>Type</InputLabel>
            <Select
              variant="filled"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.type}
              name="type"
              error={!!formikProps.touched.type && !!formikProps.errors.type}
              helperText={formikProps.touched.type && formikProps.errors.type}
            >
              <MenuItem value="pest">Pest</MenuItem>
              <MenuItem value="disease">Disease</MenuItem>
            </Select>
          </FormControl>

          <ImagePicker
            title="Photo"
            valueString={photoStr}
            gridColumn="span 2"
            setImageValue={(file) => formikProps.setFieldValue("photo", file)}
            onBlur={formikProps.handleBlur}
            disabled={loading}
          />
        </Box>
        <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
          <Button
            type="submit"
            sx={{ color: "white", fontWeight: "600" }}
            color="secondary"
            variant="contained"
            disabled={loading}
          >
            Save Pest & Disease
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PestDiseaseForm;
