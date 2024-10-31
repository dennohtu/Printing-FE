import { Box, Button, Modal, Typography, useTheme } from "@mui/material";
import { tokens } from "../Theme";

const ModalDialog = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const style = {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    bgcolor: "rgba(0,0,0,0.2)",
    border: "none",
    boxShadow: 24,
    p: 4,
  };

  const typographyStyle = {
    width: "90%",
    padding: "10px",
    fontSize: "18pt",
  };
  const handleClose = () => {
    props.handleClose();
  };
  return (
    <Box width={props.width ? props.width : undefined}>
      <Modal
        open={props.open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={style}
      >
        <Box
          display={"flex"}
          flexDirection="column"
          justifyContent={"center"}
          backgroundColor="#ffffff"
          borderRadius="5px"
          padding="40px"
          width="350px"
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={typographyStyle}
          >
            {props.title}
          </Typography>
          <Box
            id="modal-modal-description"
            sx={{
              width: "90%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {props.children}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ModalDialog;
