var loadedData = undefined;

initialize = function (dataFile) {
  console.log("Initializing");
  fetch(dataFile)
    .then((response) => response.json())
    .then((data) => {
      loadedData = data;
      console.log("Data loaded: ", data);
    });
};
