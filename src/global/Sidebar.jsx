import { useState } from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  sidebarClasses,
  menuClasses,
} from "react-pro-sidebar";
import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../Theme";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useDispatch, useSelector } from "react-redux";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import { useEffect } from "react";
import LockIcon from "@mui/icons-material/Lock";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import NotesIcon from "@mui/icons-material/Notes";

const Item = ({ title, to, icon, selected, setSelected }) => {
  return (
    <MenuItem
      active={selected === title}
      icon={icon}
      component={<Link to={to} />}
      onClick={() => setSelected(title)}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const MySidebar = () => {
  const { user } = useSelector((state) => state.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState("dashboard");
  const [employee, setEmployee] = useState(false);
  const isDesktop = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    if (!isDesktop) {
      setCollapsed(true);
    }
  }, [isDesktop]);

  return (
    <Box m="0">
      <Sidebar
        rootStyles={{
          [`.${sidebarClasses.container}`]: {
            background: `${colors.primary[400]}`,
          },
          [`.${menuClasses.icon}`]: {
            backgroundColor: "transparent",
          },
        }}
        defaultCollapsed={collapsed}
      >
        <Menu
          menuItemStyles={{
            button: ({ level, active, disabled }) => {
              // only apply styles on first level elements of the tree
              if (level === 0)
                return {
                  color: disabled
                    ? "#f5d9ff"
                    : active
                    ? "#ffffff"
                    : colors.greenAccent[100],
                  backgroundColor: active
                    ? colors.greenAccent[500]
                    : colors.primary[400],
                  "&:hover": {
                    backgroundColor: colors.greenAccent[500],
                    color: "#ffffff",
                  },
                };
            },
          }}
        >
          <MenuItem
            icon={collapsed ? <MenuOutlinedIcon /> : undefined}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!collapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  PORTAL
                </Typography>
                <IconButton onClick={() => setCollapsed(!collapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>
          {!collapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profileUser"
                  width="100px"
                  height="100px"
                  src={
                    user.role === "institution"
                      ? user.institution.logo
                      : user.User_Passport_Photo
                      ? user.User_Passport_Photo
                      : `../../assets/images/thorium-main.png`
                  }
                  style={{
                    cursor: "pointer",
                    objectPosition: "center",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user.name}
                </Typography>
                <Typography variant="h5" color={colors.grey[500]}>
                  {user.role}
                </Typography>
              </Box>
            </Box>
          )}
          {/* Menu items */}
          <Box>
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Management
            </Typography>
            <Item
              title={user.role === "admin" ? "Users" : "Farmers"}
              to="/users"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <Item
              title={"Banners"}
              to="/banners/view"
              icon={<ViewCarouselIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Writeups"
              to="/writeups/view"
              icon={<NotesIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Marketplace
            </Typography>
            <Item
              title="Products"
              to="/products"
              icon={<ShoppingBagIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Orders"
              to="/orders/view"
              icon={<LocalShippingIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Product Categories"
              to="/categories/view"
              icon={<AccountTreeIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Sales
            </Typography>

            <Item
              title="Marketplace Payments"
              to="/payments/marketplace"
              icon={<LocalGroceryStoreIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Other
            </Typography>

            <Item
              title="Roles"
              to="/roles"
              icon={<LockIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default MySidebar;
