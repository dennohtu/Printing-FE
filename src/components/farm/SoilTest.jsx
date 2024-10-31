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

const SoilTest = (props) => {
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
      .get(`${Environment.BaseURL}/api/SoilTests/readAllSoilTests`, {
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

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "soilTestDocumentUrl",
      headerName: "Soil Test Document Url",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        return (
          <a href={row.soilTestDocumentUrl} target="_blank">
            {row.soilTestDocumentUrl}
          </a>
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

export default SoilTest;
