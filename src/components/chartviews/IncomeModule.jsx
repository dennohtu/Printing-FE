import { useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { Environment } from "../../Environment";
import { notify } from "../../utils/Toast";
import { useEffect } from "react";
import PieChartView from "../charts/PieChart";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { tokens } from "../../Theme";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const IncomeModule = () => {
  const { user } = useSelector((state) => state.user);
  const [farmPayments, setFarmPayments] = useState([]);
  const [marketPayments, setMarketPayments] = useState([]);
  const [data, setData] = useState([]);
  const [totalMarket, setTotalMarket] = useState(0);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDesktop = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    if (user) {
      fetchFarmPayments.refetch();
      fetchMarketPayments.refetch();
    }
  }, [user]);

  const fetchFarmPayments = useQuery("farmPayments", () => {
    return axios
      .get(`${Environment.BaseURL}/api/farm/readAllFarmPayments`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            setFarmPayments(res.data);
          } else {
            notify("Unable to fetch farm payment history");
          }
        },
        (err) => {
          console.error(err);
          if (err.code !== "ERR_BAD_REQUEST") {
            notify("Could not complete request. Contact admin", "error");
          }
        }
      );
  });
  const fetchMarketPayments = useQuery("marketPayments", () => {
    return axios
      .get(`${Environment.BaseURL}/api/marketplace/orders/readAllPaidOrders`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            console.log(res.data);
            setMarketPayments(res.data);
          } else {
            notify("Unable to fetch marketplace payment history");
          }
        },
        (err) => {
          console.error(err);
          if (err.code !== "ERR_BAD_REQUEST") {
            notify("Could not complete request. Contact admin", "error");
          }
        }
      );
  });

  const totalFarmPayments = () => {
    let totalFarm = 0;
    farmPayments.map((f) => {
      if (f.amount) totalFarm += parseFloat(f.amount);
      return;
    });
    return totalFarm;
  };

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = (p) => {
    const radius = p.innerRadius + (p.outerRadius - p.innerRadius) * 0.5;
    const x = p.cx + radius * Math.cos(-p.midAngle * RADIAN);
    const y = p.cy + radius * Math.sin(-p.midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > p.cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(p.percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const totalMarketPayments = () => {
    let totalFarm = 0;

    marketPayments.map((m) => {
      if (m.amount) totalFarm += parseInt(m.amount);

      return;
    });
    return totalFarm;
  };

  const groupedMarketplaceData = () => {
    let data = [];
    marketPayments.map((payment) => {
      if (payment.Order_ID && payment.Order_ID.Products) {
        payment.Order_ID.Products.map((prod) => {
          if (prod.Product_ID && prod.Product_ID.Category_ID) {
            const cat = prod.Product_ID.Category_ID.Category_Name;
            let fil = data.filter((dat) => dat.type === cat);
            if (fil.length === 0) {
              const obj = {
                type: cat,
                value: parseInt(prod.Total_Cost),
              };
              data.push(obj);
            } else {
              let idx = data.findIndex((dat) => dat.type === cat);
              data[idx].value += parseInt(prod.Total_Cost);
            }
          } else {
            let fil = data.filter((dat) => dat.type === "other");
            if (fil.length === 0) {
              let obj = {
                type: "other",
                value: parseInt(prod.Total_Cost),
              };

              data.push(obj);
            } else {
              let idx = data.findIndex((dat) => dat.type === "other");
              data[idx].value += parseInt(prod.Total_Cost);
            }
          }
          return;
        });
      }

      return;
    });
    console.log(data);
    return data;
  };

  return (
    <Box
      display={"flex"}
      width="95%"
      flexDirection={isDesktop ? undefined : "column"}
      justifyContent={isDesktop ? "space-around" : "center"}
      alignItems={isDesktop ? undefined : "center"}
    >
      <Box
        display={"flex"}
        flexDirection="column"
        mt="50px"
        padding={"20px 40px"}
        borderRadius="15px"
        boxShadow={`rgba(100, 100, 111, 0.2) 0px 7px 29px 0px`}
        width={isDesktop ? undefined : "80%"}
      >
        <Box>
          <Typography sx={{ color: colors.greenAccent[500] }}>
            Total Farm Payments
          </Typography>
          <Typography
            vairant="h1"
            sx={{ fontWeight: "800", fontSize: "28pt" }}
          >{`Kshs ${totalFarmPayments()}`}</Typography>
        </Box>
        <Box mt="30px">
          <Typography sx={{ color: colors.greenAccent[500] }}>
            Total Marketplace Payments
          </Typography>
          <Typography
            vairant="h1"
            sx={{ fontWeight: "800", fontSize: "28pt" }}
          >{`Kshs ${totalMarketPayments()}`}</Typography>
        </Box>
      </Box>
      <PieChart width={400} height={400}>
        <Legend />
        <Tooltip />
        <Pie
          data={[
            { type: "Farm Payments", value: totalFarmPayments() },
            ...groupedMarketplaceData(),
          ]}
          dataKey="value"
          nameKey="type"
          cx="50%"
          cy="50%"
          label={renderCustomizedLabel}
          fill="#8884d8"
        >
          {[
            { type: "Farm Payments", value: totalFarmPayments() },
            { type: "Marketplace Payments", value: totalMarketPayments() },
          ].map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </Box>
  );
};

export default IncomeModule;