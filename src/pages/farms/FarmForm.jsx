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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ImagePicker from "../../components/ImagePicker";

const farmSchema = yup.object().shape({
  Farm_Location_Country: yup.string().required("required"),
  Farm_Location_County: yup.string().required("required"),
  Farm_Name: yup.string().required("required"),
  Farm_Size: yup.string(),
  isSubscriptionFeePaid: yup.boolean(),
  Title_Deed_Verified: yup.boolean(),
  User_ID: yup.string(),
  Farm_Location_Latitude: yup.string(),
  Farm_Location_Longitude: yup.string(),
  Farm_Image: yup.string(),
  Title_Deed: yup.string(),
});

const FarmForm = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const isNoneMobile = useMediaQuery("(min-width: 600px)");
  const [users, setUsers] = useState([]);
  const [dataSaving, setDataSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({
    Farm_Location_Country: "",
    Farm_Location_County: "",
    Farm_Name: "",
    Farm_Size: "",
    Farm_Image: "",
    isSubscriptionFeePaid: false,
    User_ID: "",
    Title_Deed: "",
    Title_Deed_Verified: false,
    Farm_Location_Latitude: "",
    Farm_Location_Longitude: "",
  });
  const [titleDeed, setTitleDeed] = useState(false);
  const [farmImage, setFarmImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [titleDeedStr, setTitleDeedStr] = useState("");
  const [farmImageStr, setFarmImageStr] = useState("");

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchUsersMutation.mutate();
    }
  }, [user]);

  useEffect(() => {
    if (location.state && location.state.farm) {
      const vals = {
        Farm_Location_Country: location.state.farm.Farm_Location_Country,
        Farm_Location_County: location.state.farm.Farm_Location_County,
        Farm_Name: location.state.farm.Farm_Name,
        Farm_Size: location.state.farm.Farm_Size,
        isSubscriptionFeePaid: location.state.farm.isSubscriptionFeePaid,
        User_ID: location.state.farm.User_ID
          ? location.state.farm.User_ID._id
          : "",
        Title_Deed_Verified: location.state.farm.Title_Deed_Verified,
        Farm_Location_Latitude: location.state.farm.Farm_Location_Latitude,
        Farm_Location_Longitude: location.state.farm.Farm_Location_Longitude,
      };
      setTitleDeedStr(location.state.farm.Title_Deed);
      setFarmImageStr(location.state.farm.Farm_Image);
      setInitialValues(vals);
    }
  }, [location]);

  const fetchUsersMutation = useMutation(() => {
    return axios
      .get(
        `
        ${Environment.BaseURL}/api/user/readAllUser`,
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
            setUsers(userData);
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
        location.state && location.state.farm
          ? `${Environment.BaseURL}/api/farm/updateFarm/${location.state.farm._id}`
          : `${Environment.BaseURL}/api/farm/createFarm`,
      method: location.state && location.state.farm ? "PUT" : "POST",
      data: data,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      },
    }).then(
      (response) => {
        if (response.status === 200) {
          notify(`Farm saved Successfully`, "success");
          navigate(-1);
        } else notify("Counld save farm: " + response.data.message, "error");
        setDataSaving(false);
      },
      (error) => {
        notify("Unable to save farm data.\n" + error.message, "error");
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
    validationSchema: farmSchema,
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
            if (type === "titleDeed") {
              setTitleDeedStr(response.data[0]);
              formikProps.setFieldValue("Title_Deed", response.data[0]);
            } else if (type === "farmImage") {
              setFarmImageStr(response.data[0]);
              formikProps.setFieldValue("Farm_Image", response.data[0]);
            }
          }
          setDataSaving(false);
        },
        (error) => {
          notify("Unable to save farm data.\n" + error.message, "error");
          setDataSaving(false);
        }
      );
  });

  const handleFileSelect = (type, file) => {
    if (type === "titleDeed") {
      setTitleDeed(file);
      setTitleDeedStr(file.name);
      uploadFiles(type, file);
    } else if (type === "farmImage") {
      setFarmImage(file);
      setFarmImageStr(file.name);
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
        title="FARM FORM"
        subtitle={
          location.state && location.state.user
            ? "Edit Farm Details"
            : "Create a new Farm Profile"
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
              label="Farm Name"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.Farm_Name}
              name="Farm_Name"
              error={
                !!formikProps.touched.Farm_Name &&
                !!formikProps.errors.Farm_Name
              }
              helperText={
                formikProps.touched.Farm_Name && formikProps.errors.Farm_Name
              }
              sx={{ gridColumn: "span 2" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Farm Size"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.Farm_Size}
              name="Farm_Size"
              error={
                !!formikProps.touched.Farm_Size &&
                !!formikProps.errors.Farm_Size
              }
              helperText={
                formikProps.touched.Farm_Size && formikProps.errors.Farm_Size
              }
              sx={{ gridColumn: "span 2" }}
            />

            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Country"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.Farm_Location_Country}
              name="Farm_Location_Country"
              error={
                !!formikProps.touched.Farm_Location_Country &&
                !!formikProps.errors.Farm_Location_Country
              }
              helperText={
                formikProps.touched.Farm_Location_Country &&
                formikProps.errors.Farm_Location_Country
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
              value={formikProps.values.Farm_Location_County}
              name="Farm_Location_County"
              error={
                !!formikProps.touched.Farm_Location_County &&
                !!formikProps.errors.Farm_Location_County
              }
              helperText={
                formikProps.touched.Farm_Location_County &&
                formikProps.errors.Farm_Location_County
              }
              sx={{ gridColumn: "span 2" }}
            />

            <FormControl fullWidth sx={{ gridColumn: "span 4" }}>
              <InputLabel>Farm Owner</InputLabel>
              <Select
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
                {users.map((u, idx) => {
                  return (
                    <MenuItem value={u._id} key={idx}>
                      {`${u.User_First_Name} ${u.User_Last_Name}`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <ImagePicker
              title="Title Deed"
              valueString={titleDeedStr}
              gridColumn="span 2"
              setImageValue={(file) =>
                formikProps.setFieldValue("Title_Deed", file)
              }
              onBlur={formikProps.handleBlur}
              disabled={dataSaving}
              pasteActive={false}
            />

            <ImagePicker
              title="Farm Image"
              valueString={farmImageStr}
              gridColumn="span 2"
              setImageValue={(file) =>
                formikProps.setFieldValue("Farm_Image", file)
              }
              onBlur={formikProps.handleBlur}
              disabled={dataSaving}
              pasteActive={false}
            />
          </Box>
          <Box display="flex" justifyContent={"flex-end"} mt="20px" mb="20px">
            <Button type="submit" color="secondary" variant="contained">
              Save User
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default FarmForm;
