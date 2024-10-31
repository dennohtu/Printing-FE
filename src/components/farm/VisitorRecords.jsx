import { Box, Typography, useTheme } from "@mui/material";
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

const VisitorRecords = (props) => {
  const { user } = useSelector((state) => state.user);
  const [dateValue, setDateValue] = useState();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchWorkRecords();
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

  const fetchMutation = useMutation(() => {
    return axios
      .get(`${Environment.BaseURL}/api/visitorrecords/readAllVisitorRecords`, {
        params: {
          Farm_ID: props.farmID,
        },
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (response) => {
          if (response.status === 200) {
            setData(response.data);
          } else {
            setData([]);
          }
        },
        (error) => {
          if (error.response.status === 403) {
            notify("No data for farm found");
            console.log("No Data found");
          } else {
            console.error(error);
            notify("Could not fetch data. Check console for details", error);
          }
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
      field: "visitingDate",
      headerName: "Date",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return new Date(row.date).toDateString();
      },
    },
    {
      field: "segmentToVisit",
      headerName: "Segment",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return row.segmentToVisit.segmentName;
      },
    },
    {
      field: "durationOfVisit",
      headerName: "Duration",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return `${row.durationOfVisit} hours`;
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

export default VisitorRecords;
