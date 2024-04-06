import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { CenteredGrid, Image } from "../helpers/helpersUI";
import { texts } from "../texts";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import { useNavigate } from "react-router-dom";

global.$RefreshReg$ = () => {};
global.$RefreshSig$ = () => () => {};

const FeatureCard = (props) => {
  const { name, description, linkLocation } = props;
  const navigate = useNavigate();
  // One react-router-dom to go to the link
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

import PropTypes from "prop-types";

IntroView.propTypes = {
  // Add prop types here
};

FeatureCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  linkLocation: PropTypes.string.isRequired,
};

export const IntroView = () => {
  return (
    <Grid container spacing={1}>
      <Grid xs={7}>
        <CenteredGrid xs={12}>
          <Typography>{texts.projectDescription}</Typography>
        </CenteredGrid>
        <CenteredGrid xs={12}>
          {texts.projectFeatures.map((feature) => FeatureCard(feature))}
        </CenteredGrid>
        {/* <Grid xs={12}>
          <Typography>{texts.featuresComingHeader}</Typography>
        </Grid> */}
        {/* <Grid xs={12}>
          <ul>
            {texts.featuresComing.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </Grid> */}
      </Grid>
      <Grid xs={5}>
        <Image
          component="img"
          alt="Something"
          src={
            "https://streetsinformed-public.s3.amazonaws.com/images/sectionHome.jpeg"
          }
        />
      </Grid>
    </Grid>
  );
};
