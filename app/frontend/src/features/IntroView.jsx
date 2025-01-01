import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { CenteredGrid } from "../helpers/helpersUI";
import { texts } from "../texts";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Alert } from "@mui/material";

const FeatureCard = (props) => {
  const { name, description, linkLocation } = props;
  const navigate = useNavigate();
  const onClick = () => {
    navigate(linkLocation);
  };

  return (
    <Card sx={{ width: "100%", maxWidth: 500, margin: "10px" }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

FeatureCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  linkLocation: PropTypes.string.isRequired,
};

const totalChange = -125;
const totalChangeAbs = totalChange < 0 ? -totalChange : totalChange;

export const IntroView = () => (
  <Grid container spacing={2}>
    <CenteredGrid xs={12}>
      <Typography variant="h1" role="title" style={{ textAlign: "justify" }}>
        {texts.projectTag}
      </Typography>
    </CenteredGrid>

    <CenteredGrid xs={12}>
      {texts.featuresAdded.map((feature) => (
        <Alert severity="success" key={feature} sx={{ margin: "5px" }}>
          {feature}
        </Alert>
      ))}
    </CenteredGrid>
    <CenteredGrid xs={12}>
      <Typography variant="h3">
        {texts.levelsStub}
        {texts.getLevelsTextAbs(totalChange > 0, totalChangeAbs.toFixed(0))}
      </Typography>
    </CenteredGrid>

    <Grid md={4}>
      <CenteredGrid xs={12}>
        <Typography
          role="description"
          style={{ textAlign: "justify", padding: "20px" }}
        >
          {texts.projectDescription}
        </Typography>
      </CenteredGrid>
    </Grid>
    <Grid md={6}>
      <CenteredGrid xs={12}>
        {texts.projectFeatures.map((feature) => (
          <FeatureCard key={feature.name} {...feature} />
        ))}
      </CenteredGrid>
    </Grid>
  </Grid>
);
