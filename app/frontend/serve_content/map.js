var loadedData = undefined;

initialize = function (dataFile) {
  fetch(dataFile)
    .then((response) => response.json())
    .then((data) => {
      loadedData = data;
    });
};
