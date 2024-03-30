console.log("jest.config.js");

module.exports = {
    setupFiles: ['./jest.polyfills.js'],
    verbose: true,
    testEnvironment: "jest-environment-jsdom",
    testEnvironmentOptions: {
        customExportConditions: [""],
    },
    setupFilesAfterEnv: [
    "<rootDir>/src/jsdomSetup.js"
    ],
    "transform": {
        "\\.[jt]sx?$": "babel-jest"
      },
    transformIgnorePatterns: [
        // 'node_modules/(?!@mui/x-charts|@mui/material|@babel/runtime|@faker-js/faker|d3-(color|format|interpolate|scale|shape|time|time-format|path|array)|internmap)',
        "!node_modules/(?!@src/*.)"
      ],
  };
