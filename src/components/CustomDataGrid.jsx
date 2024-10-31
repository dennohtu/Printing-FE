import { useTheme } from "@emotion/react";
import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../Theme";
import { notify } from "../utils/Toast";

const CustomDataGrid = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const rowClick = (row) => {
    if (!props.rowClick) {
    } else {
      props.rowClick(row.row);
    }
  };
  return (
    <Box
      height="75vh"
      width="100%"
      display={"flex"}
      justifyContent="center"
      sx={{
        ...props.sx,
        "& .MuiDataGrid-root": {
          border: "none",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "none",
          whiteSpace: "normal !important",
          wordWrap: "break-word !important",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: colors.greenAccent[500],
          color: "#ffffff",
          borderBottom: "none",
          fontSize: "12pt",
        },
        "& .MuiDataGrid-virtualScroller": {
          backgroundColor: "primary",
          fontSize: "12pt",
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "none",
          backgroundColor: colors.greenAccent[400],
          color: `#ffffff !important`,
        },
        "& .MuiToolbar-root": {
          color: "#ffffff",
          fontSize: "12pt",
        },
        "& .MuiSvgIcon-root": {
          color: "#ffffff",
          fontSize: "10pt",
        },
        "& .MuiDataGrid-toolbarContainer": {
          color: colors.primary[500],
        },
      }}
    >
      <DataGrid
        getRowId={(row) => row._id}
        rows={props.rows}
        columns={props.cols}
        rowsPerPageOptions={[10, 20, 50, 100]}
        components={{ Toolbar: GridToolbar }}
        onRowClick={rowClick}
        getRowHeight={() => "auto"}
      />
    </Box>
  );
};

export default CustomDataGrid;
