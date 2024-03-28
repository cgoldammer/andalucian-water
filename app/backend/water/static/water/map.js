// position from midtown
var position = [40.7549, -73.984];
var map = L.map("map", {
  zoomControl: false,
  dragging: false,
}).setView(position, 16);

map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();

var LeafIcon = L.Icon.extend({
  options: {
    shadowUrl: "leaf-shadow.png",
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76],
  },
});

var greenIcon = new LeafIcon({ iconUrl: "leaf-green.png" });

const attribution =
  'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';
const tiles = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: attribution,
    maxZoom: 18,
    opacity: 0.5,
  }
);

const categories = {
  trash: "Trash",
  seating: "Seating",
  trees: "Trees",
};

var selectedCategory = Object.keys(categories)[0];

function getColor(trash) {
  // Trash is an integer between 0 and 100
  // Return a color based on the trash value
  return trash > 90
    ? "#800026"
    : trash > 80
    ? "#BD0026"
    : trash > 70
    ? "#E31A1C"
    : trash > 60
    ? "#FC4E2A"
    : trash > 50
    ? "#FD8D3C"
    : trash > 40
    ? "#FEB24C"
    : trash > 30
    ? "#FED976"
    : "#FFEDA0";
}

var loadedData = undefined;

const updateMap = () => {
  if (loadedData == undefined) {
    return;
  }

  L.geoJSON(loadedData, {
    style: function (feature) {
      const trash = feature.properties[selectedCategory];
      return {
        weight: 3,
        opacity: 1,
        color: getColor(trash),
      };
    },
  }).addTo(map);
};

tiles.addTo(map);

const initialize = (dataFile) => {
  fetch(dataFile)
    .then((response) => response.json())
    .then((data) => {
      loadedData = data;
      console.log("Data loaded: ", data);
    });
};
