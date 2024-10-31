import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../Theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EmojiPeople from "@mui/icons-material/EmojiPeople";
import LogoutIcon from "@mui/icons-material/Logout";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { deleteState } from "../utils/LocalStorage";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/Toast";
import { logout } from "../stores/UserSlice";

const Topbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { user } = useSelector((state) => state.user);
  const isDesktop = useMediaQuery("(min-width:600px)");

  const handleLogout = () => {
    dispatch(logout());
    deleteState("auth");
    navigate("/");
    notify("Logged out", "success");
  };

  return (
    <Box
      display="flex"
      justifyContent={isDesktop ? "space-between" : "flex-end"}
      p={2}
      width={"100%"}
      backgroundColor={colors.primary[400]}
    >
      {/* Name */}
      <Box display={isDesktop ? "flex" : "none"}>
        Howdy, {user.name}
        <EmojiPeople />
      </Box>

      {/**nav items */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        {/* <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton> */}
        {/* <IconButton>
          <PersonOutlinedIcon />
        </IconButton> */}
        <IconButton onClick={() => navigate("/wallet")}>
          <AccountBalanceWalletIcon />
        </IconButton>
        <IconButton onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
