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
  LinearProgress,
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
  SmallContentPlaceHolder,
} from "../../components/SuspenseLoader";
import axios from "axios";
import { Environment } from "../../Environment";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const userSchema = yup.object().shape({
  Date: yup.string(),
  Total_Amount: yup.number().required("required"),
  Institution_ID: yup.string().required("required"),
});

const DisbursementForm = () => {
  const { user } = useSelector((state) => state.user);
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const location = useLocation();
  const [initialValues, setInitialValues] = useState({
    Date: "",
    Total_Amount: "",
    Institution_ID: "",
  });
  const [dataSaving, setDataSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [institution, setInstitution] = useState();
  const [institutions, setInstitutions] = useState([]);
  const [selectedDate, setSelecetedDate] = useState(dayjs(new Date()));

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.item) {
      const vals = {
        Date: location.state.item.Date,
        Total_Amount: location.state.item.Total_Amount,
        Institution_ID: location.state.item.Institution_ID._id,
      };
      setInitialValues(vals);
      setSelecetedDate(dayjs(location.state.item.Date));
    }
  }, [location]);

  useEffect(() => {
    if (user && user.role === "institution") {
      setInstitution(user.institution);
    } else if (user && user.role === "admin") {
      fetchInstitutions.refetch();
    }
  }, [user]);

  const fetchInstitutions = useQuery("get institutions", () => {
    return axios
      .get(`${Environment.BaseURL}/api/institutions/readAllInstitutions`, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) setInstitutions(res.data);
        },
        (err) => console.log(err.message)
      );
  });

  const saveUserMutation = useMutation((data) => {
    return axios({
      url:
        location.state && location.state.item
          ? `${Environment.BaseURL}/api/institutions/disbursement/updateDisbursement/${location.state.item._id}`
          : `${Environment.BaseURL}/api/institutions/disbursement/createDisbursement`,
      method: location.state && location.state.item ? "PUT" : "POST",
      data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify("Disbursement saved Successfully", "success");
          navigate(-1);
        } else
          notify(
            "Could not save Disbursement: " + response.data.message,
            "error"
          );
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

  const handleDateChange = (value) => {
    formikProps.setFieldValue("Date", new Date(value).toISOString());
    setSelecetedDate(value);
  };

  return (
    <Box
      m="20px"
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      {dataSaving && <LinearProgress />}
      <Box width="100%">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack sx={{ fontSize: "18pt" }} />
        </IconButton>
      </Box>
      <Header
        title="DISBURSEMENT FORM"
        subtitle={
          user.role === "institution"
            ? "View DIsbursement Details"
            : location.state && location.state.user
            ? "Edit Disbursement Details"
            : "Create a new Disbursement"
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                autofocus
                fullWidth
                disabled={user.role === "institution"}
                variant="filled"
                label="Date"
                onBlur={formikProps.handleBlur}
                onChange={handleDateChange}
                value={selectedDate}
                name="Date"
                sx={{ gridColumn: "span 4" }}
              />
            </LocalizationProvider>

            <FormControl fullWidth sx={{ gridColumn: "span 4" }}>
              <InputLabel>Institution</InputLabel>
              <Select
                variant="filled"
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                value={formikProps.values.Institution_ID}
                name="Institution_ID"
                error={
                  !!formikProps.touched.Institution_ID &&
                  !!formikProps.errors.Institution_ID
                }
                helperText={
                  formikProps.touched.Institution_ID &&
                  formikProps.errors.Institution_ID
                }
              >
                {institutions.map((r, idx) => {
                  return (
                    <MenuItem value={r._id} key={idx}>
                      {r.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              variant="filled"
              type="number"
              disabled={user.role === "institution"}
              label="Total Amount"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.Total_Amount}
              name="Total_Amount"
              error={
                !!formikProps.touched.Total_Amount &&
                !!formikProps.errors.Total_Amount
              }
              helperText={
                formikProps.touched.Total_Amount &&
                formikProps.errors.Total_Amount
              }
              sx={{ gridColumn: "span 4" }}
            />
          </Box>
          {user.role === "admin" && (
            <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
              <Button
                disabled={dataSaving}
                type="submit"
                color="secondary"
                variant="contained"
                sx={{ p: "15px 45px" }}
              >
                {dataSaving ? <ButtonLoadingPlaceholder /> : "Save Data"}
              </Button>
            </Box>
          )}
        </form>
      )}
    </Box>
  );
};

export default DisbursementForm;
