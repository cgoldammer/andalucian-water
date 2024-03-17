/* A hack for a weird problem: The import is handled differently
when running in webpack-dev-server and through jest. 
Just importing twice, and using the one version that works */

import { createTheme } from "@mui/material";
import { responsiveFontSizes } from "@mui/material/styles";
import { styled } from '@mui/system';
import { Box, Button } from "@mui/material";
import { ImageOverlay } from "react-leaflet/ImageOverlay";

export const runMode = process.env.RUNMODE;
export const RUNMODE_DEV = "devLocal";
export const RUNMODE_MOCK = "devMock";
export const isDev = runMode == RUNMODE_DEV || runMode == RUNMODE_MOCK;

export const getGradient = (start_color, end_color, percent) => {
  const start_r = parseInt(start_color.slice(1, 3), 16);
  const start_g = parseInt(start_color.slice(3, 5), 16);
  const start_b = parseInt(start_color.slice(5, 7), 16);

  const end_r = parseInt(end_color.slice(1, 3), 16);
  const end_g = parseInt(end_color.slice(3, 5), 16);
  const end_b = parseInt(end_color.slice(5, 7), 16);

  const r = Math.round(start_r + (end_r - start_r) * percent);
  const g = Math.round(start_g + (end_g - start_g) * percent);
  const b = Math.round(start_b + (end_b - start_b) * percent);
  const gradient_color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return gradient_color;
};

export const boxFormat = {
  display: "grid",
  boxShadow: 2,
  marginTop: 2,
  marginBottom: 2,
  padding: 2,
  ":hover": {
    cursor: "pointer",
  },
};

export const boxImgFormat = {
  width: 100,
  height: 100,
  borderRight: 1,
  borderColor: "grey.500",
};

const font = "Helvetica Neue"

export const theme = createTheme({
  typography: {
    fontFamily: [font].join(","),
    h1: {
      fontSize: "3rem"
    },
    h2: {
      fontSize: "2.5rem"
    }
  },
  components: {
    // Name of the component
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          fontSize: '1rem',
        },
      },
    },
  },
});

const styleImage = {
  borderWidth: '5px',
  borderRadius: '20px',
  boxShadow: '0 10px 10px rgba(0,0,0,0.2)',
  opacity: 0.5,
  width: '100%'
}
export const Image = styled(Box)(styleImage);

const styleBorder = {
  borderWidth: '5px',
  borderRadius: '0px',
  boxShadow: '0 10px 10px rgba(0,0,0,0.2)',
  opacity: 0.5,
  border: '5px solid grey', // Add a strong red border
  padding: '20px',
}

export const BorderedBox = styled(Box)(styleBorder);

export const NewButton = styled(Button)({
  backgroundColor: "red",
})

export const NewIm = styled(ImageOverlay)({
  opacity: 0.1,
  borderWidth: '5px',
  borderColor: 'red',
})

// export const theme = responsiveFontSizes(theme1);

export const getRange = (max) => Array.from(Array(max), (n, index) => index);

export const getRandomSample = (arr, size) => {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }

  return shuffled.slice(0, size);
};

export const getRandomSampleShare = (arr, share) =>
  getRandomSample(arr, Math.floor(arr.length * share));

const valuesNotFoundInRight = (a, b) => a.filter((e) => !b.includes(e));

export const listElementsAreIdentical = (a, b) => {
  const valuesNotFound =
    a.length > b.length
      ? valuesNotFoundInRight(a, b)
      : valuesNotFoundInRight(b, a);
  return valuesNotFound.length == 0;
};

export const listToDict = (xList, idVal) => {
  return xList.reduce((acc, x) => {
    acc[x[idVal]] = x;
    return acc;
  }, {});
};

export const listOfListToList = (listOfList) => {
  return listOfList.reduce((acc, x) => {
    acc.push(...x);
    return acc;
  }, []);
}
