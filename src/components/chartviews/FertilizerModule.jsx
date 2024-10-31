import { useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { Environment } from "../../Environment";
import { notify } from "../../utils/Toast";
import { useEffect } from "react";
import PieChartView from "../charts/PieChart";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../Theme";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const FertilizerModule = () => {
  const { user } = useSelector((state) => state.user);
  const [farms, setFarms] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    if (user) {
      fetchFarms.refetch();
    }
  }, [user]);

  const fetchFarms = useQuery("institution farms", () => {
    return axios
      .get(`${Environment.BaseURL}/api/farm/readAllFarmsForInstitution`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then(
        (res) => {
          if (res.status === 200) {
            console.log(res.data);
            setFarms(res.data);
            const dd = [];
            res.data.map((farm) => {
              return fetchFertilizer({ farm, dd });
            });
            console.log("Chart Data", dd);
          } else {
            notify("Unable to fetch farms");
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

  const fetchFertilizer = async ({ farm, displayData }) => {
    await axios
      .get(
        `${Environment.BaseURL}/api/manureAndFertiliser/readAllManureAndFertilisers?Farm_ID=${farm._id}`,
        {
          heders: {
            Accept: "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then(
        (response) => {
          if (response.status === 200) {
            const fertz = [];
            response.data.map((fertilizer) => {
              const filt = fertz.findIndex((f) => f.name === fertilizer.name);
              if (filt === -1) {
                const f = {
                  name: fertilizer.name,
                  quantity: fertilizer.quantity,
                };
                fertz.push(f);
              } else {
                fertz[filt].quantity += fertilizer.quantity;
              }
              return;
            });
            displayData.push({
              name: farm.Farm_Name,
              data: fertz,
            });
          }
        },
        (error) => {
          console.error(error);
        }
      );
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

  return (
    <Box display={"flex"} width="100%" justifyContent={"space-around"}></Box>
  );
};

export default FertilizerModule;
