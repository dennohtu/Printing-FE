import { Box } from "@mui/material";
import PlaceholderLoading from "react-placeholder-loading";

export const ListSuspenseLoader = () => {
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      justifyContent="space-between"
      alignItems={"center"}
      width={"90%"}
      height={"80%"}
    >
      <PlaceholderLoading shape="rect" width={"95%"} height={50} />
      <Box height="30px"></Box>
      <PlaceholderLoading shape="rect" width={"95%"} height={50} />
      <Box height="30px"></Box>
      <PlaceholderLoading shape="rect" width={"95%"} height={50} />
      <Box height="30px"></Box>
      <PlaceholderLoading shape="rect" width={"95%"} height={50} />
      <Box height="30px"></Box>
      <PlaceholderLoading shape="rect" width={"95%"} height={50} />
      <Box height="30px"></Box>
      <PlaceholderLoading shape="rect" width={"95%"} height={50} />
    </Box>
  );
};

export const LargeContentPlaceHolder = () => {
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      justifyContent="space-between"
      alignItems={"center"}
      width={"90%"}
      height={"80%"}
    >
      <PlaceholderLoading shape="rect" width={600} height={700} />
    </Box>
  );
};

export const SmallContentPlaceHolder = () => {
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      justifyContent="space-between"
      alignItems={"center"}
      width={"90%"}
      height={"80%"}
    >
      <PlaceholderLoading shape="rect" width={150} height={150} />
    </Box>
  );
};

export const ButtonLoadingPlaceholder = () => {
  return (
    <Box
      display="flex"
      justifyContent={"space-between"}
      alignItems="center"
      width={"70%"}
      height="80%"
    >
      <PlaceholderLoading shape="circle" width={5} height={5} />
      <PlaceholderLoading shape="circle" width={5} height={5} />
      <PlaceholderLoading shape="circle" width={5} height={5} />
    </Box>
  );
};
