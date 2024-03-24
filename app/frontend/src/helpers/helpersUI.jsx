import { ImageOverlay } from "react-leaflet/ImageOverlay";
import { styled } from "@mui/system";
import { createTheme } from "@mui/material";
import { responsiveFontSizes } from "@mui/material/styles";
import { Box, Button } from "@mui/material";

export const NewIm = styled(ImageOverlay)({
  opacity: 0.1,
  borderWidth: "5px",
  borderColor: "red",
});

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

const font = "Helvetica Neue";

export const theme = createTheme({
  typography: {
    fontFamily: [font].join(","),
    h1: {
      fontSize: "3rem",
    },
    h2: {
      fontSize: "2.5rem",
    },
  },
  components: {
    // Name of the component
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          fontSize: "1rem",
        },
      },
    },
  },
});

const styleImage = {
  borderWidth: "5px",
  borderRadius: "20px",
  boxShadow: "0 10px 10px rgba(0,0,0,0.2)",
  opacity: 0.5,
  width: "100%",
};
export const Image = styled(Box)(styleImage);

const styleBorder = {
  borderWidth: "5px",
  borderRadius: "0px",
  boxShadow: "0 10px 10px rgba(0,0,0,0.2)",
  opacity: 0.5,
  border: "5px solid grey", // Add a strong red border
  padding: "20px",
};

export const BorderedBox = styled(Box)(styleBorder);

export const NewButton = styled(Button)({
  backgroundColor: "red",
});
