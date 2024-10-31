import { Pie, PieChart, ResponsiveContainer } from "recharts";

const PieChartView = ({ width, height, data }) => {
  return (
    <ResponsiveContainer
      width="50%"
      height="auto"
      style={{ backgroundColor: "black" }}
    >
      <PieChart width={width} height={height}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="type"
          cx="50%"
          cy="50%"
          outerRadius={50}
          fill="#8884d8"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartView;
