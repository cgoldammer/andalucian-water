// eslint-disable-next-line no-unused-vars
var loadedData = undefined;

// eslint-disable-next-line no-unused-vars
const initialize = function (dataFile) {
  fetch(dataFile)
    .then((response) => response.json())
    .then((data) => {
      loadedData = data;
    });
};
