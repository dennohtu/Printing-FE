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

const DebtorRecords = (props) => {
  const { user } = useSelector((state) => state.user);
  const [dateValue, setDateValue] = useState();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchDebtorRecords();
  }, []);

  useEffect(() => {
    if (dateValue) {
      const begin = moment().isoWeek(dateValue).startOf("week");
      const end = moment().isoWeek(dateValue).endOf("week");
    }
  }, [dateValue]);

  const fetchDebtorRecords = () => {
    fetchMutation.mutate();
  };

  const fetchMutation = useMutation(() => {
    return axios
      .get(`${Environment.BaseURL}/api/debtorsRecords/readAllDebtorsRecords`, {
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
            notify("No data for segment found");
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
      field: "date",
      headerName: "Date",
      minWidth: 150,
      renderCell: ({ row }) => {
        return new Date(row.date).toLocaleDateString();
      },
    },
    {
      field: "debtorName",
      headerName: "Name",
      minWidth: 150,
    },
    {
      field: "itemSold",
      headerName: "Item Sold",
      minWidth: 150,
    },
    {
      field: "qtySold",
      headerName: "Quantity",
      minWidth: 150,
    },
    {
      field: "sellingPrice",
      headerName: "Selling Price",
      minWidth: 150,
      renderCell: ({ row }) => {
        return `Kshs ${row.sellingPrice}`;
      },
    },
    {
      field: "Total",
      headerName: "Total",
      minWidth: 150,
      renderCell: ({ row }) => {
        return `Kshs ${row.Total}`;
      },
    },
    {
      field: "amountPaid",
      headerName: "Paid",
      minWidth: 150,
      renderCell: ({ row }) => {
        return `Kshs ${row.amountPaid}`;
      },
    },
    {
      field: "balance",
      headerName: "Balance",
      minWidth: 150,
      renderCell: ({ row }) => {
        return `Kshs ${row.balance}`;
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

export default DebtorRecords;
