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
    transform: {
        "^.+\\.(js|jsx)$": "babel-jest"
    },
    transformIgnorePatterns: [
        "!node_modules/"
    ],
  };
