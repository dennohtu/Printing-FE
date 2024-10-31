import { Box, Typography, useTheme } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { tokens } from "../Theme";

const NoData = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems={"center"}
      justifyContent={"center"}
    >
      <WarningAmberIcon sx={{ fontSize: "88pt", color: "orange" }} />
      <Typography
        sx={{ fontSize: "12pt", color: colors.grey[700], mt: "20px" }}
      >
        No Data Found
      </Typography>
    </Box>
  );
};

export default NoData;
