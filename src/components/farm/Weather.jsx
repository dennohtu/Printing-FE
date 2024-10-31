import { Box, Typography, useTheme } from "@mui/material";
import {
  WiDaySunnyOvercast,
  WiDaySunny,
  WiDayWindy,
  WiDayRain,
  WiCelsius,
  WiDayCloudy,
} from "react-icons/wi";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DeviceThermostatOutlinedIcon from "@mui/icons-material/DeviceThermostatOutlined";
import { tokens } from "../../Theme";

const Weather = (props) => {
  const [weather, setWeather] = useState(null);
  const { loading, runFetch } = useFetch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    fetchDaysData();
  }, []);

  const fetchDaysData = async () => {
    const { data, error } = await runFetch({
      method: "GET",
      url: `/MorningWeather/readDaysWeather/${props.farmId}`,
    });
    if (data) {
      setWeather(data[0]);
    } else {
      toast.warn(error);
    }
  };
  return (
    <Box
      display={"flex"}
      justifyContent="space-evenly"
      alignItems={"center"}
      width="100%"
    >
      <Typography sx={{ fontWeight: "bold" }}>
        {days[new Date().getDay()]}
      </Typography>
      <Box
        display="flex"
        justifyContent={"center"}
        alignItems="center"
        width="60%"
      >
        {weather ? weather.generalweather : "N/A"}
      </Box>
      <Typography
        sx={{
          display: "flex",
          fontSize: "14pt",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DeviceThermostatOutlinedIcon sx={{ color: colors.redAccent[400] }} />
        {weather ? weather.degreeCelcius : "N/A"}
        <WiCelsius style={{ fontSize: "28pt" }} />
      </Typography>
    </Box>
  );
};

export default Weather;
