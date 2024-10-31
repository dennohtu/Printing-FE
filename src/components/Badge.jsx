import { Box, Typography, useTheme } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import VerifiedIcon from "@mui/icons-material/Verified";
import YardIcon from "@mui/icons-material/Yard";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { tokens } from "../Theme";

const Badge = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems={"center"}
      padding="10px 20px"
    >
      {props.organicFarmer ? (
        <YardIcon sx={{ color: colors.greenAccent[500], fontSize: "40pt" }} />
      ) : props.thoriumFarmer ? (
        <VerifiedUserIcon
          sx={{ color: colors.greenAccent[500], fontSize: "40pt" }}
        />
      ) : props.userVerified ? (
        <VerifiedIcon
          sx={{ color: colors.greenAccent[500], fontSize: "40pt" }}
        />
      ) : (
        <WarningAmberIcon sx={{ color: "#ffa500", fontSize: "40pt" }} />
      )}
      <Typography variant="h6" sx={{ fontStyle: "italic" }}>
        {props.organicFarmer
          ? "Organic Produce"
          : props.thoriumFarmer
          ? "Thorium Certified"
          : props.userVerified
          ? "Verified User"
          : "No badges yet"}
      </Typography>
    </Box>
  );
};

export default Badge;
