import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetReservoirsJsonQuery,
  useGetReservoirsQuery,
} from "./api/apiSlice";
import Grid from "@mui/material/Unstable_Grid2";

import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { ReservoirView } from "./reservoir/ReservoirView";

import { setReservoirUuidSelected } from "../reducers/uiReducer";
import { Marker, Popup, SVGOverlay } from "react-leaflet";

// malaga, spain
const position = [37.4213, -4.816];

import PropTypes from "prop-types";

const invertXY = (coordinates) => {
  return [coordinates[1], coordinates[0]];
};

const shiftPoint = (point, shiftX = 0, shiftY = 0) => {
  return [point[0] + shiftX, point[1] + shiftY];
};

const getBounds = (coordinates) => {
  const coordsStart = invertXY(coordinates);
  const shiftWidth = 0.5;
  return [
    shiftPoint(coordsStart, -shiftWidth, -shiftWidth),
    shiftPoint(coordsStart, shiftWidth, shiftWidth),
  ];
};

const getLabel = (properties, byId) => {
  const id = properties.reservoir_uuid;
  if (!byId[id]) {
    return "No data";
  }

  const latestVolume = byId[id].volume_latest;
  const capacity = byId[id].capacity;
  const fillRate = latestVolume / capacity;
  return `${properties.nombre}: ${(fillRate * 100).toFixed(
    0
  )}% filled - ${latestVolume.toFixed(2)} m3 / ${capacity.toFixed(2)} m3`;
};

function MyComponent(props) {
  const { data, byId } = props;
  const dispatch = useDispatch();

  const markers = data.features.map((feature) => (
    <Marker
      key={feature.properties.reservoir_uuid}
      position={invertXY(feature.geometry.coordinates[0])}
      eventHandlers={{
        click: () => {
          dispatch(setReservoirUuidSelected(feature.properties.reservoir_uuid));
        },
      }}
      opacity={1} // Add this line to make the marker invisible
    >
      <Popup>{getLabel(feature.properties, byId)}</Popup>
    </Marker>
  ));

  const featureSVG = (feature) => {
    const id = feature.properties.reservoir_uuid;
    const coord = feature.geometry.coordinates[0];
    const scaler = 3;
    if (!byId[id]) {
      return null;
    }
    const size = byId[id].capacity * scaler;
    const volume = byId[id].volume_latest * scaler;

    /* The sizeRadius and volumeRadius are set so that the circles occupy the area of the size and volume correspondingly */
    const sizeRadius = Math.sqrt(size) * 0.5;
    const volumeRadius = Math.sqrt(volume) * 0.5;

    return (
      <SVGOverlay
        key={id}
        attributes={{ stroke: "grey" }}
        bounds={getBounds(coord)}
      >
        <circle r={sizeRadius} cx="50%" cy="50%" fill="lightgrey" />
        <circle r={volumeRadius} cx="50%" cy="50%" fill="green" />
      </SVGOverlay>
    );
  };

  const circles = data.features.map(featureSVG);

  return (
    <div>
      <div>{markers}</div>
      <div>{circles}</div>
    </div>
  );
}

MyComponent.propTypes = {
  data: PropTypes.object.isRequired,
  byId: PropTypes.object.isRequired,
};

const reservorDictByUuid = (reservoirList) => {
  const res = reservoirList.reduce((acc, row) => {
    acc[row.uuid] = row;
    return acc;
  }, {});
  return res;
};

export const MapView = () => {
  const reservoirUuidSelected = useSelector(
    (state) => state.ui.reservoirUuidSelected
  );
  const { data, isLoading, error } = useGetReservoirsJsonQuery();

  const { data: dataReservoirs, isLoading: isLoadingReservoirs } =
    useGetReservoirsQuery();

  if (isLoading || isLoadingReservoirs) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  const byId = reservorDictByUuid(dataReservoirs);

  const reservoirName = dataReservoirs
    .filter((row) => row.uuid == reservoirUuidSelected)
    .map((row) => row.name_full);

  var resView = <div></div>;
  if (reservoirUuidSelected) {
    resView = (
      <ReservoirView
        reservoirUuid={reservoirUuidSelected}
        reservoirName={reservoirName}
        showDateControls={false}
      />
    );
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      xs={12}
      style={{ margin: "20px" }}
    >
      <MapContainer
        center={position}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: "300px", width: "600px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MyComponent data={data} byId={byId} />
      </MapContainer>
      {resView}
    </Grid>
  );
};
