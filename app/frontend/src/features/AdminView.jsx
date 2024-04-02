import React, { useReducer, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setMatchResponseSeconds,
  getMatchResponseSecondsSelector,
  setViewsVisible,
} from "../reducers/settingsReducer";
import {
  runMode,
  RUNMODE_DEV,
  RUNMODE_MOCK,
  fetchTestSuite,
} from "../helpers/helpers";
import { BorderedBox } from "../helpers/helpersUI";

import {
  Slider,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export const AdminView = () => {
  const dispatch = useDispatch();
  const matchResponseSeconds = useSelector(getMatchResponseSecondsSelector);
  const viewsVisible = useSelector((state) => state.settings.viewsVisible);
  const [infoState, setInfoState] = useState([""]);
  // const [reorderedViewsVisible, setReorderedViewsVisible] = useState(viewsVisible);

  const handleSliderChange = (event, value) => {
    dispatch(setMatchResponseSeconds(value));
  };

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event, index) => {
    const draggedIndex = event.dataTransfer.getData("text/plain");
    const updatedViewsVisible = [...viewsVisible];
    const [draggedItem] = updatedViewsVisible.splice(draggedIndex, 1);
    updatedViewsVisible.splice(index, 0, draggedItem);
    dispatch(setViewsVisible(updatedViewsVisible));
  };

  const slider = (
    <Grid container spacing={2} alignItems="center">
      <Grid item>API response seconds: {matchResponseSeconds}</Grid>
      <Grid item xs>
        <Slider
          value={matchResponseSeconds}
          min={0}
          max={10}
          step={1}
          onChange={handleSliderChange}
          aria-labelledby="match-response-seconds-slider"
        />
      </Grid>
    </Grid>
  );

  const sliderVisible = runMode === RUNMODE_MOCK ? slider : <div />;

  const style = {
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "8px",
    backgroundColor: "#f0f0f0",
  };

  const handleButtonClick = async () => {
    const res = await fetchTestSuite();
    setInfoState(res);
  };

  const reorderViews = (
    <div>
      <List
        onDragOver={handleDragOver}
        style={{ display: "flex", flexDirection: "row" }}
      >
        {viewsVisible.map((view, index) => (
          <ListItem
            style={style}
            key={view}
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            onDrop={(event) => handleDrop(event, index)}
          >
            <ListItemText primary={view} />
          </ListItem>
        ))}
      </List>
      <Button onClick={() => handleButtonClick()}>
        Spin off fetch requests
      </Button>
      <List>
        {infoState.map((s) => (
          <ListItem>{s}</ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <BorderedBox>
      <Grid container spacing={2} alignItems="center">
        {sliderVisible}
        {reorderViews}
      </Grid>
    </BorderedBox>
  );
};
