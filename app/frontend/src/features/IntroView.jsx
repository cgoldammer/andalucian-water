import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { CenteredGrid, Image } from "../helpers/helpersUI";
import { texts } from "../texts";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// global.$RefreshReg$ = () => {};
// global.$RefreshSig$ = () => () => {};

const FeatureCard = (props) => {
  const { name, description, linkLocation } = props;
  const navigate = useNavigate();
  const onClick = () => {
    navigate(linkLocation);
  };

  return (
    <Card sx={{ width: "100%", maxWidth: 500, margin: "20px" }}>
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

export const IntroView = () => (
  <Grid container spacing={1}>
    <Grid xs={6}>
      <CenteredGrid xs={12}>
        <Typography variant="h1" role="title" style={{ textAlign: "justify" }}>
          {texts.projectTag}
        </Typography>
      </CenteredGrid>
      <CenteredGrid xs={12}>
        <Typography
          role="description"
          style={{ textAlign: "justify", padding: "20px" }}
        >
          {texts.projectDescription}
        </Typography>
      </CenteredGrid>
    </Grid>
    <Grid xs={5}>
      <Image
        component="img"
        alt="Something"
        src={"https://andalucianwater.s3.amazonaws.com/images/reservoir.jpg"}
      />
    </Grid>
    <Grid xs={12}>
      <CenteredGrid xs={12}>
        {texts.projectFeatures.map((feature) => (
          <FeatureCard key={feature.name} {...feature} />
        ))}
      </CenteredGrid>
    </Grid>
  </Grid>
);
