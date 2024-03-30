import React, { useRef, useEffect } from "react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import reservoirs from "../data/reservoirs.json";

// import CircularProgress from '@mui/material/CircularProgress';
import Grid from "@mui/material/Unstable_Grid2";
import CssBaseline from "@mui/material/CssBaseline";
import { Route, Routes } from "react-router-dom";
import {
  ThemeProvider,
  Box,
  Container,
  Button,
  CardMedia,
  FormControl,
  Input,
  InputLabel,
  FormHelperText,
  TextField,
  CircularProgress,
} from "@mui/material";
import Typography from "@mui/material/Typography";

import { texts, positionMidtown, positionBlock, getS3Filename } from "../texts";
import {
  theme,
  Image,
  NewButton,
  listOfListToList,
  getGradient,
  NewIm,
} from "../helpers/helpers";

import { useMapEvents } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap } from "react-leaflet/hooks";
import { Marker } from "react-leaflet/Marker";
import { ReservoirView } from "./reservoir/ReservoirView";

import { setReservoirUuidSelected } from "../reducers/uiReducer";

console.log("Number of reservoirs: ", reservoirs.features.length);

const position = [37.3891, -5.9845]; // Sevilla, Spain

function MyComponent() {
  const map = useMap();
  const dispatch = useDispatch();

  const callback = (reservoirUuid) => {
    console.log(setReservoirUuidSelected);
    console.log("Callback: ", reservoirUuid);
    dispatch(setReservoirUuidSelected(reservoirUuid));
  };

  useEffect(() => {
    const geoJsonLayer = L.geoJSON(reservoirs, {
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

  return null;
}

export const MapView = () => {
  const reservoirUuidSelected = useSelector(
    (state) => state.ui.reservoirUuidSelected
  );
  console.log("Selected: ", reservoirUuidSelected);

  var resView = <div></div>;
  if (reservoirUuidSelected) {
    resView = <ReservoirView reservoirUuid={reservoirUuidSelected} />;
  }

  return (
    <div style={{ position: "relative" }}>
      <div>Selected: {reservoirUuidSelected || "nothing"}</div>
      <MapContainer
        center={position}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "300px", width: "600px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MyComponent />
      </MapContainer>
      {resView}
    </div>
  );
};
