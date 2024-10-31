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

const FarmLocationsModule = () => {
  const { user } = useSelector((state) => state.user);
  const [farms, setFarms] = useState([]);
  const [groupedFarms, setGroupedFarms] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    if (user) {
      fetchFarms.refetch();
    }
  }, [user]);

  const fetchFarms = useQuery("farms", () => {
    return axios
      .get(
        `${Environment.BaseURL}/api/farm/readAllFarmsForInstitution/${user.institution._id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then(
        (res) => {
          if (res.status === 200) {
            setFarms(res.data);
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

  useEffect(() => {
    if (farms) {
      groupedFarm();
    }
  }, [farms]);

  const groupedFarm = () => {
    let data = [];
    if (farms.length === 0) {
      data.push({ type: "None", value: 1 });
    } else {
      farms.map((farm) => {
        const county = farm.Farm_Location_County.split(" ")[1].split(",")[0];
        const f = data.filter((d) => d.type === county);
        if (f.length > 0) {
          f[0].value += 1;
        } else {
          data.push({ type: county, value: 1 });
        }
      });
    }
    setGroupedFarms(data);
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
    <Box display={"flex"} width="100%" justifyContent={"space-around"}>
      <PieChart width={400} height={400}>
        <Legend />
        <Tooltip />
        <Pie
          data={groupedFarms}
          dataKey="value"
          nameKey="type"
          cx="50%"
          cy="50%"
          label={renderCustomizedLabel}
          fill="#8884d8"
        >
          {groupedFarms.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </Box>
  );
};

export default FarmLocationsModule;
