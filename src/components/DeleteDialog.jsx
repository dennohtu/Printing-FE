import { Box, Button, Modal, Typography, useTheme } from "@mui/material";
import { tokens } from "../Theme";

const DeleteDialog = (props) => {
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
    props.setOpen(false);
  };
  return (
    <Box>
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
            Confirm Action
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ width: "90%", textAlign: "center" }}
          >
            Delete this item?
          </Typography>
          <Box
            display={"flex"}
            justifyContent="space-evenly"
            marginTop="10px"
            width={"100%"}
          >
            <Button
              sx={{
                background: colors.redAccent[500],
                color: "white",
                "&:hover": {
                  background: colors.redAccent[400],
                  color: "white",
                },
              }}
              onClick={props.delete}
            >
              Delete
            </Button>
            <Button
              sx={{
                background: colors.primary[500],
                color: "white",
                "&:hover": {
                  background: colors.primary[300],
                  color: "white",
                },
              }}
              onClick={handleClose}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DeleteDialog;
