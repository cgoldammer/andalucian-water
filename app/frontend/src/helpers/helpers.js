/* A hack for a weird problem: The import is handled differently
when running in webpack-dev-server and through jest. 
Just importing twice, and using the one version that works */

export const runMode = process.env.RUNMODE;
export const RUNMODE_DEV = "devLocal";
export const RUNMODE_MOCK = "devMock";
export const isDev = runMode == RUNMODE_DEV || runMode == RUNMODE_MOCK;

// export const theme = responsiveFontSizes(theme1);

export const listToDictByKey = (xList, key) => {
  return xList.reduce((acc, x) => {
    acc[x[key]] = x;
    return acc;
  }, {});
};

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
};

export const TimeOptions = {
  DAY: "day",
  YEAR: "year",
};

const fetchStub = "simple";

const fetchApis = [
  "http://127.0.0.1:8000/api/",
  "http://127.0.0.1:8001/api/",
  "http://127.0.0.1:8002/api/",
  "http://52.22.180.212:8002/api/",
  "http://52.22.180.212/api/api/",
  "https://water.chrisgoldammer.com/api/api/",
];

const fetchTest = async (fetchApi) => {
  const urlTest = fetchApi + fetchStub;
  // Run a fetch request and whether it's 200
  // The response is simply  string, not json
  const results = {};
  try {
    const response = await fetch(urlTest);
    const text = await response.text();
    return `${urlTest}: Succeeded`;
  } catch (error) {
    return `${urlTest}: Failed`;
  }
};

export const fetchTestSuite = async () => {
  const res = await Promise.all(
    fetchApis.map((fetchApi) => fetchTest(fetchApi))
  );
  return res;
};

export const valueFormatter = (value) => `${(value * 100).toFixed(0)}%`;
