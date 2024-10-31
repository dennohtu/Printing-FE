import { Box, useTheme } from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { useSelector } from "react-redux";
import { tokens } from "../../Theme";
import { notify } from "../../utils/Toast";
import CustomDataGrid from "../CustomDataGrid";
import NoData from "../NoData";
import axios from "axios";
import { Environment } from "../../Environment";

const MaintenanceRecords = (props) => {
  const { user } = useSelector((state) => state.user);
  const [dateValue, setDateValue] = useState();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchWorkRecords();
  }, []);

  const fetchWorkRecords = () => {
    fetchMutation.mutate();
  };

  const fetchMutation = useMutation(() => {
    return axios
      .get(
        `${Environment.BaseURL}/api/MaintenanceRecords/readAllMaintenanceRecords`,
        {
          params: {
            Farm_ID: props.farmID,
          },
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

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "itemName",
      headerName: "Item Name",
      minWidth: 150,
    },
    {
      field: "reason",
      headerName: "Reason",
      minWidth: 150,
    },
    {
      field: "date",
      headerName: "Date",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.date) {
          return new Date(row.date).toLocaleDateString();
        } else {
          return " ";
        }
      },
    },
    {
      field: "maintenanceBy",
      headerName: "Maintenance By",
      minWidth: 150,
      renderCell: ({ row }) => {
        if (row.maintenanceBy)
          return `${row.maintenanceBy.User_First_Name} ${row.maintenanceBy.User_Last_Name}`;
        else return " ";
      },
    },
    {
      field: "photo",
      headerName: "Photo",
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <img
            src={row.photo ? row.photo : "/assets/images/thorium-main.png"}
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        );
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

export default MaintenanceRecords;
