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
import ImagePicker from "../../components/ImagePicker";
import ArrowBack from "@mui/icons-material/ArrowBack";

const schema = yup.object().shape({
  Category_Name: yup.string().required("required"),
  Category_Description: yup.string().required("required"),
  Category_Banner: yup.string(),
});

const CategoryForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [dataSaving, setDataSaving] = useState(false);
  const [categoryBanner, setCategoryBanner] = useState(null);
  const [categoryBannerStr, setCategoryBannerStr] = useState("");
  const [initialValues, setInitialValues] = useState({
    Category_Name: "",
    Category_Description: "",
    Category_Banner: "",
  });

  useEffect(() => {
    if (location.state && location.state.category) {
      const vals = {
        Category_Name: location.state.category.Category_Name,
        Category_Description: location.state.category.Category_Description,
        Category_Banner: location.state.category.Category_Banner,
      };
      setInitialValues(vals);
      setCategoryBannerStr(location.state.category.Category_Banner);
    }
  }, [location]);

  const saveMutation = useMutation((data) => {
    return axios({
      url:
        location.state && location.state.category
          ? `${Environment.BaseURL}/api/category/updateCategory/${location.state.category._id}`
          : `${Environment.BaseURL}/api/category/createCategory`,
      method: location.state && location.state.category ? "PUT" : "POST",
      data: data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify(`Category saved Successfully`, "success");
          navigate(-1);
        } else
          notify("Counld save Category: " + response.data.message, "error");
        setDataSaving(false);
      },
      (error) => {
        notify("Unable to save Category data.\n" + error.message, "error");
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
            if (response.data.length === 0) {
              notify(
                "Could not complete upload.\n Make sure you upload an image file less than 10mb",
                "error"
              );
              setDataSaving(false);
              return;
            }
            notify("Upload Successful", "success");
            setCategoryBannerStr(response.data[0]);
            formikProps.setFieldValue("Category_Banner", response.data[0]);
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
    setCategoryBanner(file);
    setCategoryBannerStr(file.name);
    uploadFiles(file);
  };

  const uploadFiles = async (file) => {
    setDataSaving(true);
    const formData = new FormData();
    formData.append("images", file);
    uploadFilesMutation.mutate({ formData });
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
        title="Category FORM"
        subtitle={
          location.state && location.state.category
            ? "Edit Category Details"
            : "Create a new Category"
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
            label="Category Name"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Category_Name}
            name="Category_Name"
            error={
              !!formikProps.touched.Category_Name &&
              !!formikProps.errors.Category_Name
            }
            helperText={
              formikProps.touched.Category_Name &&
              formikProps.errors.Category_Name
            }
            sx={{ gridColumn: "span 4" }}
          />

          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Category Description"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Category_Description}
            name="Category_Description"
            error={
              !!formikProps.touched.Category_Description &&
              !!formikProps.errors.Category_Description
            }
            helperText={
              formikProps.touched.Category_Description &&
              formikProps.errors.Category_Description
            }
            sx={{ gridColumn: "span 4" }}
          />
          <Box
            display={"flex"}
            flexDirection="column"
            gridColumn="span 4"
            justifyContent="flex-start"
            alignItems={"center"}
          >
            <ImagePicker
              title="Category Banner"
              id="categoryBanner"
              name="categoryBanner"
              value={categoryBanner}
              valueString={categoryBannerStr}
              gridColumn="span 4"
              handleFileSelect={(evt) =>
                handleFileSelect(evt.currentTarget.files[0])
              }
              onBlur={formikProps.handleBlur}
              disabled={dataSaving}
            />
          </Box>
        </Box>
        <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
          <Button type="submit" color="secondary" variant="contained">
            Save Category
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CategoryForm;
