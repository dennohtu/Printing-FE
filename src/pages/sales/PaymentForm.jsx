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
  Order_ID: yup.string().required("required"),
  Transaction_Reference: yup.string().required("required"),
  Amount_Paid: yup.number(),
  Balance: yup.number(),
  Status: yup.string(),
  Total_Cost: 0,
});

const PaymentForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [dataSaving, setDataSaving] = useState(false);
  const [categoryBanner, setCategoryBanner] = useState(null);
  const [categoryBannerStr, setCategoryBannerStr] = useState("");
  const [initialValues, setInitialValues] = useState({
    Order_ID: "",
    Transaction_Reference: "",
    Amount_Paid: 0,
    Balance: 0,
    Status: "",
    Total_Cost: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState();
  const [selectedOrder, setSelectedOrder] = useState();

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

  useEffect(() => {
    fetchOrdersMutation.mutate();
  }, []);

  const fetchOrdersMutation = useMutation(() => {
    return axios
      .get(
        `
        ${Environment.BaseURL}/api/marketplace/orders/readAllOrders`,
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
            setOrders(userData);
          }
          setLoading(false);
        },
        (error) => {
          notify("Unable to fetch user data,\n" + error, "error");
          setLoading(false);
        }
      );
  });

  const saveMutation = useMutation((data) => {
    return axios({
      url:
        location.state && location.state.category
          ? `${Environment.BaseURL}/api/marketplace/orders/payments/${location.state.category._id}`
          : `${Environment.BaseURL}/api/marketplace/orders/pay`,
      method: location.state && location.state.category ? "PUT" : "POST",
      data: data,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify(`Payment saved Successfully`, "success");
          navigate(-1);
        } else
          notify("Could not save payment: " + response.data.message, "error");
        setDataSaving(false);
      },
      (error) => {
        notify("Unable to save payment data.\n" + error.message, "error");
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

  const handleOrderChange = (e) => {
    setSelectedOrderId(e.target.value);
    formikProps.handleChange(e);
  };

  const handleAmountChange = (e) => {
    if (formikProps.values.Total_Cost > 0) {
      formikProps.setFieldValue(
        "Balance",
        formikProps.values.Total_Cost - e.target.valueAsNumber
      );
    }
    formikProps.handleChange(e);
  };

  useEffect(() => {
    if (selectedOrderId) {
      let order = orders.find((x) => x._id === selectedOrderId);
      if (order) {
        setSelectedOrder(order);
        formikProps.setFieldValue(
          "Total_Cost",
          order.Product?.Product_Unit_Price * order.Quantity
        );
      }
    }
  }, [selectedOrderId]);

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
        title="Payment FORM"
        subtitle={
          location.state && location.state.payment
            ? "Edit Payment Details"
            : "Create a new Payment"
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
          <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
            <InputLabel>Order</InputLabel>
            <Select
              variant="filled"
              onBlur={formikProps.handleBlur}
              onChange={handleOrderChange}
              value={formikProps.values.Order_ID}
              name="Order_ID"
              error={
                !!formikProps.touched.Order_ID && !!formikProps.errors.Order_ID
              }
              helperText={
                formikProps.touched.Order_ID && formikProps.errors.Order_ID
              }
            >
              {orders.map((u, idx) => {
                return (
                  <MenuItem value={u._id} key={idx}>
                    {`${u.Order_ID} - ${u.Client?.User_First_Name} ${u.Client?.User_Last_Name}`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            disabled
            fullWidth
            variant="filled"
            type="number"
            label="Total Cost"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Total_Cost}
            name="Total_Cost"
            error={
              !!formikProps.touched.Total_Cost &&
              !!formikProps.errors.Total_Cost
            }
            helperText={
              formikProps.touched.Total_Cost && formikProps.errors.Total_Cost
            }
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Transaction Reference"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Transaction_Reference}
            name="Transaction_Reference"
            error={
              !!formikProps.touched.Transaction_Reference &&
              !!formikProps.errors.Transaction_Reference
            }
            helperText={
              formikProps.touched.Transaction_Reference &&
              formikProps.errors.Transaction_Reference
            }
            sx={{ gridColumn: "span 4" }}
          />

          <TextField
            fullWidth
            variant="filled"
            type="number"
            label="Amount Paid"
            onBlur={formikProps.handleBlur}
            onChange={handleAmountChange}
            value={formikProps.values.Amount_Paid}
            name="Amount_Paid"
            error={
              !!formikProps.touched.Amount_Paid &&
              !!formikProps.errors.Amount_Paid
            }
            helperText={
              formikProps.touched.Amount_Paid && formikProps.errors.Amount_Paid
            }
            sx={{ gridColumn: "span 2" }}
          />

          <TextField
            fullWidth
            disabled
            variant="filled"
            type="number"
            label="Balance"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Balance}
            name="Balance"
            error={
              !!formikProps.touched.Balance && !!formikProps.errors.Balance
            }
            helperText={
              formikProps.touched.Balance && formikProps.errors.Balance
            }
            sx={{ gridColumn: "span 2" }}
          />

          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Status"
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            value={formikProps.values.Status}
            name="Status"
            error={!!formikProps.touched.Status && !!formikProps.errors.Status}
            helperText={formikProps.touched.Status && formikProps.errors.Status}
            sx={{ gridColumn: "span 4" }}
          />
        </Box>
        <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
          <Button type="submit" color="secondary" variant="contained">
            Save Payment
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PaymentForm;
