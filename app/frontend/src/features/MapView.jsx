import React, { useRef, useEffect } from "react";
import { useState } from "react";

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
import { Popup } from "react-leaflet/Popup";
import { Polyline } from "react-leaflet/Polyline";
import { ImageOverlay } from "react-leaflet/ImageOverlay";
import { LatLngBounds } from "leaflet";
import { Circle } from "react-leaflet/Circle";

console.log("Number of reservoirs: ", reservoirs.features.length);

const position = [37.3891, -5.9845]; // Sevilla, Spain

const callback = (reservoirName) => {
  console.log("Callback: ", reservoirName);
};

function MyComponent() {
  const map = useMap();

  useEffect(() => {
    const geoJsonLayer = L.geoJSON(reservoirs, {
      onEachFeature: (feature, layer) => {
        layer.bindPopup(feature.properties.name);
        callback(feature.properties.nombre);
        const label = L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: "label",
            html: feature.properties.nombre,
          }),
        }).addTo(map);
        layer.on("mouseover", () => {
          label.addTo(map);
        });
        layer.on("mouseout", () => {
          map.removeLayer(label);
        });
      },
    }).addTo(map);

    map.fitBounds(geoJsonLayer.getBounds());
  }, [map]);

  return null;
}

export const MapView = () => {
  return (
    <div style={{ position: "relative" }}>
      <div>HI</div>
      <MapContainer
        center={position}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "300px", width: "600px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MyComponent />
      </MapContainer>
    </div>
  );
};
