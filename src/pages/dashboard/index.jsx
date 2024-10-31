import { Box } from "@mui/material";
import IncomeModule from "../../components/chartviews/IncomeModule";
import Header from "../../components/Header";
import PendingFulfillmentList from "../../components/Orders";

const Dashboard = () => {
  return (
    <Box
      m="20px"
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <Box
        display="flex"
        flexDirection={"column"}
        justifyContent="space-between"
        alignItems="center"
      >
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>
      <IncomeModule />
      <Box width={"100%"} mt="30px">
        <PendingFulfillmentList />
      </Box>
    </Box>
  );
};

export default Dashboard;
