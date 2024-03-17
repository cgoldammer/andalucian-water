import React, {useRef, useEffect} from "react";
import { useState } from "react";

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
  TextField, CircularProgress
} from "@mui/material";
import Typography from "@mui/material/Typography";

import { texts, positionMidtown, positionBlock, getS3Filename } from "../texts";
import { theme, Image, NewButton, listOfListToList, getGradient, NewIm } from "../helpers/helpers";

import {useMapEvents} from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap } from "react-leaflet/hooks";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { Polyline } from "react-leaflet/Polyline";
import { ImageOverlay } from "react-leaflet/ImageOverlay";
import { LatLngBounds } from "leaflet";
import { Circle } from "react-leaflet/Circle"; 




export const MapView = (props) => {
  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={position}
        zoom={startZoom}
        scrollWheelZoom={false}
        style={{ height: "400px", width: "400px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MyComponent {...props} />
      </MapContainer>
    </div>
  );
};


const invertXY = (locationArr) => {
  const [x, y] = locationArr;
  return [y, x]
}

const getWeight = (zoomLevel) => 2 ** (zoomLevel-12);
