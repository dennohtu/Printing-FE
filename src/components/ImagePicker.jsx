import {
  Box,
  Button,
  FormLabel,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../Theme";
import { ButtonLoadingPlaceholder } from "./SuspenseLoader";
import { useState } from "react";
import { createRef } from "react";
import { useEffect } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import { useMutation } from "react-query";
import { notify } from "../utils/Toast";
import axios from "axios";
import { Environment } from "../Environment";
import { useSelector } from "react-redux";

const ImagePicker = ({
  title,
  setImageValue,
  gridColumn,
  onBlur,
  valueString = "",
  disabled = false,
  pasteActive = true,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const inputRef = createRef();
  const [imgValue, setImgValue] = useState("");
  const [displayImage, setDisplayImage] = useState(valueString);
  const [isUploading, setUploading] = useState(false);
  // drag state
  const [dragActive, setDragActive] = useState(false);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (pasteActive) {
      const handlePasteAnywhere = (event) => {
        if (event.clipboardData.files[0]) {
          setImgValue(event.clipboardData.files[0]);
          const formData = new FormData();
          formData.append("images", event.clipboardData.files[0]);
          uploadFilesMutation.mutate({ formData });
        }
      };

      window.addEventListener("paste", handlePasteAnywhere);

      return () => {
        window.removeEventListener("paste", handlePasteAnywhere);
      };
    }
  }, []);

  useEffect(() => {
    if (imgValue !== "") {
      const img = URL.createObjectURL(imgValue);
      setDisplayImage(img);
    }
  }, [imgValue]);

  useEffect(() => {
    setDisplayImage(valueString);
  }, [valueString]);
  // handle drag events
  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // triggers when file is dropped
  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImgValue(e.dataTransfer.files[0]);
      const formData = new FormData();
      formData.append("images", e.dataTransfer.files[0]);
      uploadFilesMutation.mutate({ formData });
    }
  };

  // triggers when file is selected with click
  const handleChange = function (e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setImgValue(e.target.files[0]);
      const formData = new FormData();
      formData.append("images", e.target.files[0]);
      uploadFilesMutation.mutate({ formData });
    }
  };

  // triggers the input when the button is clicked
  const onButtonClick = (e) => {
    e.preventDefault();
    inputRef.current.click();
  };

  const uploadFilesMutation = useMutation(({ formData }) => {
    setUploading(true);
    return axios
      .post(
        `
          ${Environment.BaseURL}/api/upload/uploadDocument/Images`,
        formData,
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        }
      )
      .then(
        (response) => {
          if (response.status === 200) {
            if (response.data.length === 0) {
              notify(
                "Could not complete upload.\n Make sure you upload an image file less than 50mb",
                "error"
              );
              setUploading(false);
              return;
            }
            notify("Upload Successful", "success");
            setImageValue(response.data[0]);
            setDisplayImage(response.data[0]);
          }
          setUploading(false);
        },
        (error) => {
          notify("Unable to upload image.\n" + error.message, "error");
          setUploading(false);
        }
      );
  });

  return (
    <form
      id={`form-file-upload-${title.replaceAll(" ", "-")}`}
      onDragEnter={handleDrag}
      onSubmit={(e) => e.preventDefault()}
      onBlur={onBlur}
      style={{
        height: "16rem",
        width: "28rem",
        maxWidth: "100%",
        textAlign: "center",
        position: "relative",
        gridColumn: gridColumn,
        overflow: "hidden",
      }}
    >
      {isUploading && (
        <LinearProgress sx={{ background: "white" }} color="secondary" />
      )}
      <input
        ref={inputRef}
        type="file"
        id={`input-file-upload-${title.replaceAll(" ", "-")}`}
        style={{ display: "none" }}
        onChange={handleChange}
        disabled={disabled || isUploading}
      />
      <label
        id={`label-file-upload-${title.replaceAll(" ", "-")}`}
        htmlFor={`input-file-upload-${title.replaceAll(" ", "-")}`}
        className={dragActive ? "drag-active" : ""}
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: "2px",
          borderRadius: "1rem",
          borderStyle: "dashed",
          borderColor: `${colors.greenAccent[500]}`,
          backgroundColor: `${dragActive ? "#ffffff" : "#f8fafc"}`,
          cursor: "pointer",
        }}
      >
        <div style={{ cursor: "pointer" }}>
          <img
            src={displayImage}
            alt={title}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              objectFit: "cover",
              height: "90%",
            }}
          />
          <p
            style={{
              position: "absolute",
              top: "3px",
              left: "10px",
              color: colors.greenAccent[500],
              fontWeight: "600",
              letterSpacing: "1px",
              fontSize: "14pt",
              zIndex: "10",
              background: "white",
            }}
          >
            {title}
          </p>
          <p style={{ zIndex: "10" }}>Drag and drop your file here or</p>
          <button
            className="upload-button"
            onClick={onButtonClick}
            style={{
              zIndex: "10",
              cursor: "pointer",
              padding: "0.25rem",
              fontSize: "1rem",
              border: "none",
              fontFamily: "Oswald, sans-serif",
              backgroundColor: "transparent",
              "&:hover": {
                textDecorationLine: "underline",
              },
            }}
          >
            Upload a file
          </button>
        </div>
      </label>
      {dragActive && (
        <div
          id={`drag-file-element-${title.replaceAll(" ", "-")}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "1rem",
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          }}
        ></div>
      )}
    </form>
  );
};

export default ImagePicker;
