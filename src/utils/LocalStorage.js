export const loadState = (name = "appState") => {
  try {
    const serialState = localStorage.getItem(name);
    if (serialState === null) {
      return undefined;
    }
    return JSON.parse(serialState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (name = "appState", state) => {
  try {
    const serialState = JSON.stringify(state);
    localStorage.setItem(name, serialState);
  } catch (err) {
    console.log(err);
  }
};

export const deleteState = (name = "appState") => {
  try {
    localStorage.removeItem(name);
  } catch (err) {
    console.log(err);
  }
};
