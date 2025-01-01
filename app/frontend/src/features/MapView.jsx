import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetReservoirsJsonQuery,
  useGetReservoirsQuery,
  useGetRegionsJsonQuery,
} from "./api/apiSlice";
import Grid from "@mui/material/Unstable_Grid2";

import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { ReservoirView } from "./reservoir/ReservoirView";
import { GeoJSON } from "react-leaflet";
import { setReservoirUuidSelected } from "../reducers/uiReducer";
import { Marker, Popup, SVGOverlay } from "react-leaflet";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { CenteredGrid } from "../helpers/helpersUI";
import { Typography } from "@mui/material";
import { BoxLoading } from "../helpers/Components";

// malaga, spain
const position = [37.4213, -4.816];

import PropTypes from "prop-types";
import { texts } from "../texts";

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

const getLabel = (properties, dataReservoirs) => {
  const id = properties.reservoir_uuid;
  if (!dataReservoirs[id]) {
    return "No data";
  }
  const dataReservoir = dataReservoirs[id];
  const regionText =
    dataReservoir.region != undefined ? ` (${dataReservoir.region.name})` : "";

  const latestVolume = dataReservoir.volume_latest;
  const capacity = dataReservoir.capacity;
  const fillRate = latestVolume / capacity;
  return `${properties.name_full} ${regionText}: ${(fillRate * 100).toFixed(
    0
  )}% filled - ${latestVolume.toFixed(2)} m3 / ${capacity.toFixed(2)} m3`;
};

const getDefaultPoint = (feature) => feature.geometry.coordinates[0][0][0];

function MyComponent(props) {
  const { data, dataReservoirs } = props;
  const dispatch = useDispatch();

  const markers = data.features.map((feature) => (
    <Marker
      key={feature.properties.reservoir_uuid}
      position={invertXY(getDefaultPoint(feature))}
      eventHandlers={{
        click: () => {
          dispatch(setReservoirUuidSelected(feature.properties.reservoir_uuid));
        },
      }}
      opacity={1} // Add this line to make the marker invisible
    >
      <Popup>{getLabel(feature.properties, dataReservoirs)}</Popup>
    </Marker>
  ));

  const featureSVG = (feature) => {
    const id = feature.properties.reservoir_uuid;
    const coord = getDefaultPoint(feature);
    const scaler = 3;
    if (!dataReservoirs[id]) {
      return null;
    }
    const size = dataReservoirs[id].capacity * scaler;
    const volume = dataReservoirs[id].volume_latest * scaler;

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
  dataReservoirs: PropTypes.object.isRequired,
};

const defaultShowValues = ["reservoir", "region"];

export const MapView = () => {
  const [showValues, setShowValues] = React.useState(defaultShowValues);
  const [selectedRegion, setSelectedRegion] = React.useState(null);
  const reservoirUuidSelected = useSelector(
    (state) => state.ui.reservoirUuidSelected
  );
  const {
    data: dataGeo,
    isLoading: isLoadingGeo,
    isFetching: isFetchingGeo,
  } = useGetReservoirsJsonQuery();
  const {
    data: dataRegions,
    isLoading: isLoadingRegions,
    isFetching: isFetchingRegions,
  } = useGetRegionsJsonQuery();

  const handleToggle = (event, newShowValues) => {
    setShowValues(newShowValues);
  };

  const {
    data: dataReservoirs,
    isLoading: isLoadingReservoirs,
    isFetching: isFetchingReservoirs,
  } = useGetReservoirsQuery();

  if (
    isLoadingGeo ||
    isLoadingReservoirs ||
    isLoadingRegions ||
    isFetchingGeo ||
    isFetchingRegions ||
    isFetchingReservoirs
  ) {
    return <BoxLoading />;
  }

  const toggleButtonGroup = (
    <ToggleButtonGroup value={showValues} onChange={handleToggle}>
      <ToggleButton value={"reservoir"}>
        {texts.chartLabels.buttons.reservoirs}
      </ToggleButton>
      <ToggleButton value={"region"}>
        {texts.chartLabels.buttons.regions}
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const isShow = (value) => showValues.includes(value);

  var resView = <div></div>;
  if (reservoirUuidSelected) {
    const reservoirName = dataReservoirs[reservoirUuidSelected].name_full;
    resView = (
      <ReservoirView
        reservoirUuid={reservoirUuidSelected}
        reservoirName={reservoirName}
        showDateControls={false}
      />
    );
  }

  const regionView =
    isShow("region") && selectedRegion ? (
      <div>
        <Typography variant="h4">
          {texts.chartNames.region} {selectedRegion}
        </Typography>
      </div>
    ) : (
      <div></div>
    );

  return (
    <Grid container justifyContent="center" alignItems="center" xs={12}>
      <CenteredGrid style={{ margin: "20px" }}>
        <Grid xs={12}>{toggleButtonGroup}</Grid>
      </CenteredGrid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <MapContainer
          center={position}
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: "300px", width: "600px", opacity: 0.9 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {isShow("reservoir") && (
            <div>
              <GeoJSON data={dataGeo} style={{ color: "green" }} />
              <MyComponent data={dataGeo} dataReservoirs={dataReservoirs} />
            </div>
          )}
          {isShow("region") && (
            <GeoJSON
              data={dataRegions}
              style={(feature) => ({
                fillOpacity: 0.1,
                opacity: 0.2,
                color:
                  feature.properties.name == selectedRegion ? "blue" : "green",
              })}
              onEachFeature={(feature, layer) => {
                layer.on({
                  mouseover: () => {
                    setSelectedRegion(feature.properties.name);
                  },
                });
              }}
            />
          )}
        </MapContainer>
      </Grid>
      <CenteredGrid style={{ margin: "20px" }}>
        <Grid xs={12}>{regionView}</Grid>
      </CenteredGrid>

      {isShow("reservoir") && resView}
    </Grid>
  );
};
