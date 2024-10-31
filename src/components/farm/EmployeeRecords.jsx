import {
  Box,
  Button,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material";
import NoData from "../NoData";
import { useEffect, useState } from "react";
import { tokens } from "../../Theme";
import moment from "moment";
import { useMutation } from "react-query";
import axios from "axios";
import { Environment } from "../../Environment";
import { useSelector } from "react-redux";
import { notify } from "../../utils/Toast";
import CustomDataGrid from "../CustomDataGrid";

const EmployeeRecords = (props) => {
  const { user } = useSelector((state) => state.user);
  const [dateValue, setDateValue] = useState();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [employeeToAdd, setEmployeeToAdd] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (props.userID) {
      fetchWorkRecords();
      fetchEmployeeRecords();
    }
  }, []);

  useEffect(() => {
    if (dateValue) {
      const begin = moment().isoWeek(dateValue).startOf("week");
      const end = moment().isoWeek(dateValue).endOf("week");
    }
  }, [dateValue]);

  const fetchWorkRecords = () => {
    fetchMutation.mutate();
  };
  const fetchEmployeeRecords = () => {
    fetchEmployees.mutate();
  };

  const fetchMutation = useMutation(() => {
    return axios
      .get(
        `${Environment.BaseURL}/api/farm/readEmployeesByFarm/${props.farmID}`,
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
            setData(response.data);
          } else {
            setData([]);
          }
        },
        (error) => {
          if (error.response.status === 404) {
            notify("No data for segment found");
            console.log("No Data found");
          } else {
            console.error(error);
            notify("Could not fetch data. Check console for details", error);
          }
        }
      );
  });

  const fetchEmployees = useMutation(() => {
    return axios
      .get(
        `${Environment.BaseURL}/api/user/getFarmerEmployees/${props.userID}`,
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
            setEmployees(response.data);
          } else {
            setEmployees([]);
          }
        },
        (error) => {
          console.error(error);
          notify("Could not fetch data. Check console for details", error);
        }
      );
  });

  const changeWeek = (value) => {
    console.log(value);
    setDateValue(value);
  };

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "User_First_Name",
      headerName: "Name",
      flex: 2,
      minWidth: 150,
      renderCell: ({ row }) => {
        return `${row.User_First_Name} ${row.User_Last_Name}`;
      },
    },
    {
      field: "createdAt",
      headerName: "Employment Date",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return new Date(row.createdAt).toDateString();
      },
    },
  ];
  return (
    <Box>
      {data.length === 0 ? (
        <NoData />
      ) : (
        <CustomDataGrid rows={data} cols={cols} />
      )}
    </Box>
  );
};

export default EmployeeRecords;
