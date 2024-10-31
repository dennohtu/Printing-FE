import { useTheme } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { tokens } from "../../Theme";

const BarChartView = ({ data, width, height, xKey, dataKeys }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const numbers = [500, 700, 300, 200];

  return (
    <BarChart width={width} height={height} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      {dataKeys.map((datakey, idx) => {
        return (
          <Bar
            dataKey={datakey}
            key={idx}
            fill={
              colors.greenAccent[Math.floor(Math.random() * numbers.length)]
            }
          />
        );
      })}
    </BarChart>
  );
};

export default BarChartView;
