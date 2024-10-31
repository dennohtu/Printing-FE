import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useMutation } from "react-query";
import { useSelector } from "react-redux";
import CustomDataGrid from "../../components/CustomDataGrid";
import DeleteDialog from "../../components/DeleteDialog";
import Header from "../../components/Header";
import { ListSuspenseLoader } from "../../components/SuspenseLoader";
import { Environment } from "../../Environment";
import { tokens } from "../../Theme";
import { notify } from "../../utils/Toast";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";

const AnimalList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user);
  const [animals, setAnimals] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedAnimalBreeds, setSelectedAnimalBreeds] = useState([]);
  const [deleteAOpen, setDeleteAOpen] = useState(false);
  const [deleteBOpen, setDeleteBOpen] = useState(false);
  const [toDelete, setToDelete] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchAnimals.mutate();
      fetchBreeds.mutate();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAnimal != null) {
      const breedL = breeds.filter((br) => br.type_ID === selectedAnimal._id);
      console.log(breedL);
      setSelectedAnimalBreeds(breedL);
    }
  }, [selectedAnimal]);

  const animalCols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    { field: "name", headerName: "Name", minWidth: 150 },
    {
      field: "photo",
      headerName: "Photo",
      minWidth: 150,
      renderCell: ({ row: { photo } }) => {
        return (
          <img
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
            src={photo}
            alt="animal"
          />
        );
      },
    },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if ((user.employee && !user.employee.ReadOnly) || !user.employee) {
          return (
            <Box
              width="90%"
              m="0 auto"
              display={"flex"}
              justifyContent="space-evenly"
            >
              <IconButton
                sx={{
                  backgroundColor: colors.blueAccent[500],
                  "&:hover": {
                    backgroundColor: colors.blueAccent[300],
                  },
                }}
                onClick={(e) => editAnmal(e, row)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: colors.redAccent[500],
                  "&:hover": {
                    backgroundColor: colors.redAccent[300],
                  },
                }}
                onClick={(e) => deleteAnimal(e, row)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        } else return "";
      },
    },
  ];

  const breedCols = [
    {
      field: "_id",
      headerName: "ID",
      renderCell: (index) => {
        return index.api.getRowIndex(index.row._id) + 1;
      },
    },
    { field: "name", headerName: "Name", minWidth: 150 },
    {
      field: "photo",
      headerName: "Photo",
      minWidth: 150,
      renderCell: ({ row: { photo } }) => {
        return (
          <img
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
            src={photo}
            alt="animal"
          />
        );
      },
    },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        if ((user.employee && !user.employee.ReadOnly) || !user.employee) {
          return (
            <Box
              width="90%"
              m="0 auto"
              display={"flex"}
              justifyContent="space-evenly"
            >
              <IconButton
                sx={{
                  backgroundColor: colors.blueAccent[500],
                  "&:hover": {
                    backgroundColor: colors.blueAccent[300],
                  },
                }}
                onClick={(e) => editBreed(e, row)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: colors.redAccent[500],
                  "&:hover": {
                    backgroundColor: colors.redAccent[300],
                  },
                }}
                onClick={(e) => deleteBreed(e, row)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        } else return "";
      },
    },
  ];

  const fetchAnimals = useMutation(() => {
    setAnimals([]);
    return axios
      .get(`${Environment.BaseURL}/api/TypeOfAnimal/readAllTypeOfAnimal`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (response) => {
          if (response.status === 200) {
            setAnimals(response.data);
          } else notify("Could not fetch Data", "error");
          setLoading(false);
        },
        (error) => {
          console.error(error);
          if (error.code === "ERR_BAD_REQUEST") {
            console.log("No data");
          } else {
            notify("An error occured.\n" + error.data.message, "error");
          }
          setLoading(false);
        }
      );
  });

  const fetchBreeds = useMutation(() => {
    setBreeds([]);
    return axios
      .get(`${Environment.BaseURL}/api/animalBreed/readAllBreedDetails`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      })
      .then(
        (response) => {
          if (response.status === 200) {
            setBreeds(response.data);
            console.log(response.data);
          } else notify("Could not fetch Data", "error");
          setLoading(false);
        },
        (error) => {
          console.error(error);
          if (error.code === "ERR_BAD_REQUEST") {
            console.log("No data");
          } else {
            notify("An error occured.\n" + error.data.message, "error");
          }
          setLoading(false);
        }
      );
  });

  const deleteAnimalMutation = useMutation(() => {
    return axios
      .delete(
        `${Environment.BaseURL}/api/TypeOfAnimal/deleteTypeOfAnimal/${toDelete}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      )
      .then(
        (res) => {
          if (res.status === 200) {
            console.log(res.data);
            notify("Deleted Successfully", "success");
            setDeleteAOpen(false);
            setLoading(true);
            fetchAnimals.mutate();
          } else {
            notify("Could not delete.\n" + res.data.message, "error");
          }
        },
        (err) => {
          console.error(err);
          notify("An error occured.\n" + err.message, "error");
        }
      );
  });

  const deleteBreedMutation = useMutation(() => {
    return axios
      .delete(
        `${Environment.BaseURL}/api/animalBreed/deleteBreed/${toDelete}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      )
      .then(
        (res) => {
          if (res.status === 200) {
            notify("Deleted Successfully", "success");
            setDeleteBOpen(false);
            setLoading(true);
            fetchBreeds.mutate();
          } else {
            notify("Could not delete.\n" + res.data.message, "error");
          }
        },
        (err) => {
          notify(
            "An error occured. This is probably on our end. contact admin.\n" +
              err.message,
            "error"
          );
        }
      );
  });

  const editAnmal = (e, item) => {
    e.stopPropagation();
    navigate("/typeOfAnimal/Edit", {
      state: { animal: item },
    });
  };

  const deleteAnimal = (e, item) => {
    e.stopPropagation();
    setToDelete(item._id);
    setDeleteAOpen(true);
  };

  const editBreed = (e, item) => {
    e.stopPropagation();
    navigate("/animalBreed/Edit", { state: { breed: item } });
  };

  const deleteBreed = (e, item) => {
    e.stopPropagation();
    setToDelete(item._id);
    setDeleteBOpen(true);
  };

  const closeDelAnim = () => {
    setDeleteAOpen(false);
  };

  const closeDelBreed = () => {
    setDeleteBOpen(false);
  };

  const handleAnimDelete = () => {
    deleteAnimalMutation.mutate();
  };

  const handleBreedDelete = () => {
    deleteBreedMutation.mutate();
  };

  const rowClick = (row) => {
    setSelectedAnimal(row);
  };

  const addNewTypeOfAnimal = () => {
    navigate("/typeOfAnimal/Edit");
  };
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      width={"95%"}
    >
      <DeleteDialog
        open={deleteAOpen}
        handleClose={closeDelAnim}
        delete={handleAnimDelete}
      ></DeleteDialog>
      <DeleteDialog
        open={deleteBOpen}
        handleClose={closeDelBreed}
        delete={handleBreedDelete}
      ></DeleteDialog>
      <Header title={"Animals"} subtitle={"Manage Animals"} />
      <Box
        display={"flex"}
        flexDirection="column"
        width="100%"
        justifyContent="space-evenly"
      >
        <Box>
          {!user.employee?.ReadOnly && (
            <Box display="flex" justifyContent={"flex-end"} width="90%">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  "&:hover": { backgroundColor: colors.greenAccent[300] },
                }}
                onClick={addNewTypeOfAnimal}
              >
                Add New
              </Button>
            </Box>
          )}
          {loading ? (
            <ListSuspenseLoader />
          ) : (
            <CustomDataGrid
              rowClick={rowClick}
              rows={animals}
              cols={animalCols}
            />
          )}
        </Box>
        <Box>
          {selectedAnimal && (
            <Box mt="100px">
              <Typography variant="h4" sx={{ fontWeight: "bold", mt: "20px" }}>
                Breeds
              </Typography>
              {!user.employee?.ReadOnly && (
                <Box display="flex" justifyContent={"flex-end"} width="90%">
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: colors.greenAccent[500],
                      "&:hover": { backgroundColor: colors.greenAccent[300] },
                    }}
                    onClick={() =>
                      navigate("/animalBreed/Edit", {
                        state: { type: selectedAnimal },
                      })
                    }
                  >
                    Add New
                  </Button>
                </Box>
              )}
              <CustomDataGrid rows={selectedAnimalBreeds} cols={breedCols} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AnimalList;
