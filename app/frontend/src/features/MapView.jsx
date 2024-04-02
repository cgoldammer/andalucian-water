import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetReservoirsJsonQuery } from "./api/apiSlice";

import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap } from "react-leaflet/hooks";
import { ReservoirView } from "./reservoir/ReservoirView";

import { setReservoirUuidSelected } from "../reducers/uiReducer";

// malaga, spain
const position = [36.7213, -4.4216];

function MyComponent(props) {
  const { data } = props;
  const dispatch = useDispatch();
  const map = useMap();

  const callback = (reservoirUuid) => {
    console.log(setReservoirUuidSelected);
    console.log("Callback: ", reservoirUuid);
    dispatch(setReservoirUuidSelected(reservoirUuid));
  };

  useEffect(() => {
    const geoJsonLayer = L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const marker = L.marker(layer.getBounds().getCenter()).addTo(map);
        marker.bindPopup(feature.properties.nombre);
        marker.on("click", () => {
          callback(feature.properties.reservoir_uuid);
        });
      },
    }).addTo(map);
    map.fitBounds(geoJsonLayer.getBounds());
  }, [map]);

  return <div></div>;
}

export const MapView = () => {
  const reservoirUuidSelected = useSelector(
    (state) => state.ui.reservoirUuidSelected
  );
  console.log("Selected: ", reservoirUuidSelected);
  const { data, isLoading, error } = useGetReservoirsJsonQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  var resView = <div></div>;
  if (reservoirUuidSelected) {
    resView = <ReservoirView reservoirUuid={reservoirUuidSelected} />;
  }

  return (
    <div style={{ position: "relative" }}>
      <div>Selected: {reservoirUuidSelected || "nothing"}</div>
      <MapContainer
        center={position}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: "300px", width: "600px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MyComponent data={data} />
      </MapContainer>
      {resView}
    </div>
  );
};
