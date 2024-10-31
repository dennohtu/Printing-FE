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
  Input,
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

const schema = yup.object().shape({
  Product_Name: yup.string().required("required"),
  Product_Description: yup.string().required("required"),
  Product_Stock_Quantity: yup.number(),
  Product_Unit_Price: yup.number().required("required"),
  Product_Unit: yup.string(),
  Product_Image: yup.string(),
  Category_ID: yup.string().required("required"),
});

const ProductForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [dataSaving, setDataSaving] = useState(false);
  const [productImage, setProductImage] = useState(null);
  const [productImageStr, setProductImageStr] = useState("");
  const [category, setCategory] = useState([]);
  const [initialValues, setInitialValues] = useState({
    Product_Image: "",
    Product_Name: "",
    Product_Stock_Quantity: 0,
    Product_Unit_Price: 0,
    Product_Description: "",
    Product_Unit: "",
    Category_ID: null,
  });

  useEffect(() => {
    if (user) {
      fetchCategories.mutate();
    }
  }, [user]);

  useEffect(() => {
    if (location.state && location.state.product) {
      const vals = {
        Product_Image: location.state.product.Product_Image,
        Product_Name: location.state.product.Product_Name,
        Product_Stock_Quantity:
          location.state.product.Product_Stock_Quantity,
        Product_Unit_Price: location.state.product.Product_Unit_Price,
        Product_Description: location.state.product.Product_Description,
        Category_ID: location.state.product.Category_ID
          ? location.state.product.Category_ID._id
          : "",
        Product_Unit: location.state.product.Product_Unit,
      };
      setInitialValues(vals);
      setProductImageStr(location.state.product.Product_Image);
    }
  }, [location]);

  const fetchCategories = useMutation(() => {
    return axios
      .get(`${Environment.BaseURL}/api/category/readAllCategory`, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (response) => {
          if (response.status === 200) {
            setCategory(response.data);
          }
        },
        (error) => {
          notify(
            "Could not fetch categories. This form might not work correctly",
            "error"
          );
          console.log(error.message);
        }
      );
  });

  const saveMutation = useMutation((data) => {
    return axios({
      url:
        location.state && location.state.product
          ? `${Environment.BaseURL}/api/marketplace/products/updateProducts/${location.state.product._id}`
          : `${Environment.BaseURL}/api/marketplace/products/createProduct`,
      method: location.state && location.state.product ? "PUT" : "POST",
      data: data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify(`Product saved Successfully`, "success");
          navigate(-1);
        } else notify("Could save Product: " + response.data.message, "error");
        setDataSaving(false);
      },
      (error) => {
        notify("Unable to save Product data.\n" + error.message, "error");
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
            if (response.data.length === 0) {
              notify(
                "Could not complete upload.\n Make sure you upload an image file less than 10mb",
                "error"
              );
              setDataSaving(false);
              return;
            }
            notify("Upload Successful", "success");
            setProductImageStr(response.data[0]);
            formikProps.setFieldValue("Product_Image", response.data[0]);
          }
          setDataSaving(false);
        },
        (error) => {
          notify("Unable to upload image.\n" + error.message, "error");
          setDataSaving(false);
        }
      );
  });

  const handleFileSelect = (fileStr) => {
    formikProps.setFieldValue("Product_Image", fileStr);
  };

  return (
    <Box
      m="20px"
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <Box display="flex" width="100%">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack sx={{ fontSize: "18pt" }} />
        </IconButton>
      </Box>
      <Header
        title="PRODUCTS FORM"
        subtitle={
          location.state && location.state.product
            ? "Edit Product Details"
            : "Create a new Product"
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
            label="Product Name"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Product_Name}
            name="Product_Name"
            error={
              !!formikProps.touched.Product_Name &&
              !!formikProps.errors.Product_Name
            }
            helperText={
              formikProps.touched.Product_Name &&
              formikProps.errors.Product_Name
            }
            sx={{ gridColumn: "span 2" }}
          />

          <TextField
            fullWidth
            multiline
            rows={5}
            variant="filled"
            type="text"
            label="Product Description"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Product_Description}
            name="Product_Description"
            error={
              !!formikProps.touched.Product_Description &&
              !!formikProps.errors.Product_Description
            }
            helperText={
              formikProps.touched.Product_Description &&
              formikProps.errors.Product_Description
            }
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            fullWidth
            variant="filled"
            type="number"
            label="Unit Cost (Kshs)"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Product_Unit_Price}
            name="Product_Unit_Price"
            error={
              !!formikProps.touched.Product_Unit_Price &&
              !!formikProps.errors.Product_Unit_Price
            }
            helperText={
              formikProps.touched.Product_Unit_Price &&
              formikProps.errors.Product_Unit_Price
            }
            sx={{ gridColumn: "span 2" }}
          />

          <TextField
            fullWidth
            variant="filled"
            type="number"
            label="Quantity"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Product_Stock_Quantity}
            name="Product_Stock_Quantity"
            error={
              !!formikProps.touched.Product_Stock_Quantity &&
              !!formikProps.errors.Product_Stock_Quantity
            }
            helperText={
              formikProps.touched.Product_Stock_Quantity &&
              formikProps.errors.Product_Stock_Quantity
            }
            sx={{ gridColumn: "span 2" }}
          />

          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Unit"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Product_Unit}
            name="Product_Unit"
            error={
              !!formikProps.touched.Product_Unit &&
              !!formikProps.errors.Product_Unit
            }
            helperText={
              formikProps.touched.Product_Unit &&
              formikProps.errors.Product_Unit
            }
            sx={{ gridColumn: "span 2" }}
          />

          <FormControl
            fullWidth
            sx={{
              gridColumn: "span 2",
            }}
          >
            <InputLabel htmlFor="Category_ID">Category</InputLabel>
            <Select
              variant="filled"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.Category_ID}
              name="Category_ID"
              id="Category_ID"
              error={
                !!formikProps.touched.Category_ID &&
                !!formikProps.errors.Category_ID
              }
              helperText={
                formikProps.touched.Category_ID &&
                formikProps.errors.Category_ID
              }
            >
              <MenuItem value="">---Select One---</MenuItem>
              {category.map((c, idx) => {
                return (
                  <MenuItem value={c._id} key={idx}>
                    {c.Category_Name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Box
            display={"flex"}
            flexDirection="column"
            gridColumn="span 4"
            justifyContent="flex-start"
            alignItems={"center"}
          >
            <ImagePicker
              title="Product Image"
              value={productImage}
              valueString={productImageStr}
              gridColumn="span 4"
              setImageValue={(file) => handleFileSelect(file)}
              onBlur={formikProps.handleBlur}
            />
          </Box>
        </Box>
        <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
          <Button
            type="submit"
            sx={{ color: "white", fontWeight: "600" }}
            color="secondary"
            variant="contained"
          >
            Save Product
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ProductForm;
