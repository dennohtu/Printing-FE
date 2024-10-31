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
  FormControlLabel,
  Checkbox,
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

const userSchema = yup.object().shape({
  User_ID: yup.string().required("Required"),
  ReadOnly: yup.boolean(),
  Marketplace_Management: yup.boolean(),
  Sales_Management: yup.boolean(),
  Farm_Management: yup.boolean(),
  Institution_Management: yup.boolean(),
  User_Management: yup.boolean(),
});

const EmployeeForm = () => {
  const { user } = useSelector((state) => state.user);
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const location = useLocation();
  const [readOnly, setReadOnly] = useState(false);
  const [Marketplace_Management, setMarketplace_Management] = useState(false);
  const [Sales_Management, setSales_Management] = useState(false);
  const [Farm_Management, setFarm_Management] = useState(false);
  const [Institution_Management, setInstitution_Management] = useState(false);
  const [User_Management, setUser_Management] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);
  const [edit, setEdit] = useState(false);
  const [initialValues, setInitialValues] = useState({
    User_ID: "",
    ReadOnly: false,
    Marketplace_Management: false,
    Sales_Management: false,
    Farm_Management: false,
    Institution_Management: false,
    User_Management: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchEmployeesMutation.mutate();
    }
  }, [user]);

  useEffect(() => {
    if (allUsers.length > 0) {
      let others = [];
      allUsers.map((us) => {
        const fil = employees.filter((e) => e.User_ID === us._id);
        if (fil.length === 0) {
          others.push(us);
        }
        return;
      });
      setUsers(others);
    }
  }, [employees, allUsers]);

  useEffect(() => {
    if (location.state && location.state.employee) {
      setEdit(true);
      const vals = {
        User_ID: location.state.employee.User_ID._id,
        ReadOnly: location.state.employee.ReadOnly,
        Marketplace_Management: location.state.employee.Marketplace_Management,
        Sales_Management: location.state.employee.Sales_Management,
        Farm_Management: location.state.employee.Farm_Management,
        Institution_Management: location.state.employee.Institution_Management,
        User_Management: location.state.employee.User_Management,
      };
      setInitialValues(vals);
    }
    if (location.state && location.state.employees) {
      setEmployees(location.state.employees);
    }
  }, [location, user]);

  const fetchEmployeesMutation = useMutation(() => {
    return axios
      .get(
        user.role === "admin"
          ? `
        ${Environment.BaseURL}/api/user/readAllUser`
          : `${Environment.BaseURL}/api/institutions/readMembers/${user.institution._id}`,
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
            setAllUsers(userData);
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
    data.readOnly = readOnly;
    data.Marketplace_Management = Marketplace_Management;
    data.Farm_Management = Farm_Management;
    data.Institution_Management = Institution_Management;
    data.User_Management = User_Management;
    data.Sales_Management = Sales_Management;

    setDataSaving(true);
    return axios({
      url:
        location.state && location.state.employee
          ? `${Environment.BaseURL}/api/employees/updateEmployee/${location.state.employee._id}`
          : `${Environment.BaseURL}/api/employees/createEmployee`,
      method: location.state && location.state.employee ? "PUT" : "POST",
      data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify("Employee saved Successfully", "success");
          navigate(-1);
        } else
          notify("Could not save employee: " + response.data.message, "error");
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
        title="Employee FORM"
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
            <FormControl
              fullWidth
              sx={{
                gridColumn: "span 4",
              }}
            >
              <InputLabel>Name</InputLabel>
              <Select
                disabled={edit}
                variant="filled"
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                value={formikProps.values.User_ID}
                name="User_ID"
                error={
                  !!formikProps.touched.User_ID && !!formikProps.errors.User_ID
                }
                helperText={
                  formikProps.touched.User_ID && formikProps.errors.User_ID
                }
              >
                <MenuItem value={""}>---Select One---</MenuItem>
                {users.map((us) => {
                  return (
                    <MenuItem
                      value={us._id}
                    >{`${us.User_First_Name} ${us.User_Last_Name}`}</MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControlLabel
              sx={{ gridColumn: "span 2" }}
              label="ReadOnly"
              control={
                <Checkbox
                  checked={readOnly}
                  onChange={(e) => setReadOnly(e.target.checked)}
                />
              }
            />
            <FormControlLabel
              sx={{ gridColumn: "span 2" }}
              label="Marketplace Management"
              control={
                <Checkbox
                  checked={Marketplace_Management}
                  onChange={(e) => setMarketplace_Management(e.target.checked)}
                />
              }
            />
            <FormControlLabel
              sx={{ gridColumn: "span 2" }}
              label="Sales Management"
              control={
                <Checkbox
                  checked={Sales_Management}
                  onChange={(e) => setSales_Management(e.target.checked)}
                />
              }
            />
            <FormControlLabel
              sx={{ gridColumn: "span 2" }}
              label="Farm Management"
              control={
                <Checkbox
                  checked={Farm_Management}
                  onChange={(e) => setFarm_Management(e.target.checked)}
                />
              }
            />
            <FormControlLabel
              sx={{ gridColumn: "span 2" }}
              label="Institution Management"
              control={
                <Checkbox
                  checked={Institution_Management}
                  onChange={(e) => setInstitution_Management(e.target.checked)}
                />
              }
            />
            <FormControlLabel
              sx={{ gridColumn: "span 2" }}
              label="User Management"
              control={
                <Checkbox
                  checked={User_Management}
                  onChange={(e) => setUser_Management(e.target.checked)}
                />
              }
            />
          </Box>
          <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
            <Button
              disabled={dataSaving}
              type="submit"
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

export default EmployeeForm;
