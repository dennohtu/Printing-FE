import { Box, Icon, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { Environment } from "../../Environment";
import { tokens } from "../../Theme";
import { notify } from "../../utils/Toast";
import LineAxisIcon from "@mui/icons-material/LineAxis";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
} from "recharts";

const TimeSelector = ({ selected, setSelected, title }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      display="flex"
      justifyContent={"center"}
      sx={{
        background: selected === title ? colors.greenAccent[500] : "white",
        border: `1px solid ${colors.greenAccent[500]}`,
        cursor: "pointer",
      }}
      onClick={() => setSelected(title)}
      alignItems="center"
      width="100%"
      height="40px"
    >
      <Typography
        sx={{
          fontSize: "17pt",
          fontWeight: "800",
          color: selected === title ? "white" : colors.greenAccent[500],
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

const FarmSales = () => {
  const [sales, setSales] = useState([]);
  const { user } = useSelector((state) => state.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [totalSales, setTotalSales] = useState(0);
  const [selected, setSelected] = useState("Day");
  const [groupedData, setGroupedData] = useState([]);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    if (user) {
      farmSales.refetch();
    }
  }, [user]);

  useEffect(() => {
    if (selected) {
      if (sales.length > 0) {
        groupData(selected);
      }
    }
  }, [sales, selected]);

  const farmSales = useQuery("sales", () => {
    return axios
      .get(`${Environment.BaseURL}/api/marketplace/orders/readAllPaidOrders`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            setSales(res.data);
          } else {
            console.error("Could not Fetch: " + res.data);
          }
        },
        (err) => {
          console.error(err);
          notify("Could not Fetch. Check console for details", "error");
        }
      );
  });

  const formatMpesaDate = (date) => {
    let dateStr = date.split("");
    let count = 0;
    let year = "";
    let day = "";
    let month = "";
    for (let item in dateStr) {
      if (count < 4) {
        year += dateStr[item];
        count += 1;
      } else if (count < 6) {
        month += dateStr[item];
        count += 1;
      } else if (count < 8) {
        day += dateStr[item];
        count += 1;
      } else {
        break;
      }
    }
    return `${month}/${day}/${year}`;
  };

  const groupData = (type = "Day") => {
    const data = [];
    let total = 0;
    if (type === "Day") {
      sales.map((sale) => {
        console.log(sale);
        let saleDate, saleAmount;
        saleDate = sale.updatedAt
          ? new Date(sale.updatedAt).toLocaleDateString()
          : new Date("1/1/2023").toLocaleDateString();
        saleAmount = parseInt(sale.amount);
        total += saleAmount;
        const fil = data.filter((d) => compareDates(saleDate, d.date, "day"));
        if (fil.length > 0) {
          if (!sale.Wallet_Transaction_ID) {
            fil[0].Mpesa += saleAmount;
          } else {
            fil[0].WalletCredit += saleAmount;
          }
        } else {
          let ob;
          if (!sale.Wallet_Transaction_ID) {
            ob = {
              date: saleDate,
              Mpesa: saleAmount,
              WalletCredit: 0,
            };
          } else {
            ob = {
              date: saleDate,
              Mpesa: 0,
              WalletCredit: saleAmount,
            };
          }
          data.push(ob);
        }
      });
    } else if (type === "Month") {
      sales.map((sale) => {
        let saleDate, saleAmount;
        saleDate = sale.updatedAt
          ? new Date(sale.updatedAt)
          : new Date("1/1/2023");
        saleAmount = parseInt(sale.amount);
        total += saleAmount;
        const fil = data.filter((d) =>
          compareDates(months[saleDate.getMonth()], d.date, "month")
        );
        if (fil.length > 0) {
          if (!sale.Wallet_Transaction_ID) {
            fil[0].Mpesa += saleAmount;
          } else {
            fil[0].WalletCredit += saleAmount;
          }
        } else {
          let ob;
          if (!sale.Wallet_Transaction_ID) {
            ob = {
              date: months[saleDate.getMonth()],
              Mpesa: saleAmount,
              WalletCredit: 0,
            };
          } else {
            ob = {
              date: months[saleDate.getMonth()],
              Mpesa: 0,
              WalletCredit: saleAmount,
            };
          }
          data.push(ob);
        }
      });
    } else {
      sales.map((sale) => {
        let saleDate, saleAmount;
        saleDate = sale.updatedAt
          ? new Date(sale.updatedAt)
          : new Date("1/1/2023");
        saleAmount = parseInt(sale.amount);
        total += saleAmount;
        const fil = data.filter((d) =>
          compareDates(saleDate.getFullYear(), d.date, "year")
        );
        if (fil.length > 0) {
          if (!sale.Wallet_Transaction_ID) {
            fil[0].Mpesa += saleAmount;
          } else {
            fil[0].WalletCredit += saleAmount;
          }
        } else {
          let ob;
          if (!sale.Wallet_Transaction_ID) {
            ob = {
              date: saleDate.getFullYear(),
              Mpesa: saleAmount,
              WalletCredit: 0,
            };
          } else {
            ob = {
              date: saleDate.getFullYear(),
              Mpesa: 0,
              WalletCredit: saleAmount,
            };
          }
          data.push(ob);
        }
      });
    }
    setTotalSales(total);
    setGroupedData(data);
  };

  const compareDates = (d1, d2, depth = "day") => {
    if (depth === "day") {
      const date1 = new Date(d1);
      const date2 = new Date(d2);
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDay() === date2.getDay()
      );
    } else return d1 === d2;
  };
  return (
    <Box display={"flex"} width="95%" flexDirection={"column"}>
      <Box width="100%" display="flex" justifyContent="flex-end">
        <Box
          display="flex"
          padding="20px 40px"
          justifyContent={"space-evenly"}
          alignItems="center"
          boxShadow="rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px"
          mt="20px"
        >
          <LineAxisIcon
            sx={{ fontSize: "70pt", color: colors.greenAccent[500] }}
          />
          <Typography
            sx={{
              fontSize: "30pt",
              fontWeight: "800",
              color: colors.grey[700],
            }}
          >{`Kshs ${totalSales}`}</Typography>
        </Box>
      </Box>
      <Box
        mt="30px"
        display="flex"
        width="100%"
        justifyContent={"center"}
        alignItems="center"
      >
        <TimeSelector
          title="Day"
          selected={selected}
          setSelected={setSelected}
        />
        <TimeSelector
          title="Month"
          selected={selected}
          setSelected={setSelected}
        />
        <TimeSelector
          title="Year"
          selected={selected}
          setSelected={setSelected}
        />
      </Box>
      <Box mt="30px" width="100%" textAlign="center">
        <Typography
          sx={{
            fontSize: "16pt",
            fontWeight: "700",
            color: colors.grey[700],
            letterSpacing: "3px",
          }}
        >
          Total Income From Marketplace
        </Typography>
      </Box>
      <Box mt="30px" width={"100%"} justifyContent="center">
        <BarChart width={700} height={500} data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis
            label={{
              value: "Amount (Kshs)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <XAxis dataKey="date" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Mpesa" fill="#8884d8" />
          <Bar dataKey="WalletCredit" fill="#82ca9d" />
        </BarChart>
      </Box>
    </Box>
  );
};

export default FarmSales;
