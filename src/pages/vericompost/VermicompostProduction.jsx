import { Box, useTheme, IconButton, Button } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useMutation } from "react-query";
import { useSelector } from "react-redux";
import { Environment } from "../../Environment";
import { notify } from "../../utils/Toast";
import { tokens } from "../../Theme";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListSuspenseLoader } from "../../components/SuspenseLoader";
import NoData from "../../components/NoData";
import CustomDataGrid from "../../components/CustomDataGrid";

const VermicompostProduction = ({ VermicompostId }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    if (user.token && VermicompostId) {
      setLoading(true);
      mutation.mutate();
    }
  }, [user, VermicompostId]);

  const cols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    {
      field: "Vermicompost_Amount",
      headerName: "Vermicompost Amount",
      flex: 1,
      renderCell: ({ row }) => {
        if (row.Vermicompost_Amount) return `${row.Vermicompost_Amount} kgs`;
        else return " ";
      },
    },
    {
      field: "Vermiliquid_Amount",
      headerName: "Vermiliquid Amount",
      flex: 1,
      renderCell: ({ row }) => {
        if (row.Vermiliquid_Amount) return `${row.Vermiliquid_Amount} litres`;
        else return " ";
      },
    },
    {
      field: "photo",
      headerName: "Photo",
      renderCell: ({ row }) => {
        return (
          <img
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
            src={row.photo ? row.photo : "/assets/images/thorium-main.png"}
          />
        );
      },
    },
  ];

  const mutation = useMutation(() => {
    return axios
      .get(
        `
        ${Environment.BaseURL}/api/vermicompost/production/readAllVermicompostProduction?Vermicompost_ID=${VermicompostId}`,
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
            setItems(userData);
          }
          setLoading(false);
        },
        (error) => {
          if (error.response.status === 403) {
            notify("No farm Data found", "error");
          } else {
            notify("Unable to fetch farm data", "error");
          }
          setLoading(false);
        }
      );
  });

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      justifyContent={"center"}
      width={"95%"}
    >
      {loading ? (
        <ListSuspenseLoader />
      ) : items.length === 0 ? (
        <NoData />
      ) : (
        <CustomDataGrid rows={items} cols={cols} />
      )}
    </Box>
  );
};

export default VermicompostProduction;
