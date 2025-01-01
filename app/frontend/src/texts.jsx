import { prepareTexts } from "./helpers/textHelpers";

const projectDescription = `
An overview of water reservoir levels in Andalucia, Spain.

Andalucia is going through an extended drought, and has seen
a dramatic depletion of water reservoirs. Here, we track publicly
available data on reservoir levels, and allow you to understand
the long-term trends.
`;

const projectWarnings = `
April 8, 2024: Data is not fully validated, 
so don't share results. If you find errors, let us know!
`;

const projectFeatures = [
  {
    name: "Overview",
    description: "Total Fill rates for Andalucia",
    linkLocation: "/overview",
  },
  {
    name: "Reservoirs",
    description: "View the historical trends for a reservoir",
    linkLocation: "/reservoirs",
  },
  {
    name: "Shortfall",
    description: "Understand the expected shortfall in reservoir levels",
    linkLocation: "/shortfall",
  },
];

const featuresAdded = [
  "Dec 31, 2024: Overview page",
  "Nov 11, 2024: Latest data",
];

const featuresComing = [
  "Impact of current investments",
  "Spanish language support",
];

const descriptionGap = `
Given the relative rainfall, we can predict the shortfall, which is
the expected reduction in overall reservoir levels (all in HM3). For now, we are using
a simple cubic prediction, but are working on making this more precise.`;

const descriptionScatter = `
The more it rains (as % of historical average, x-axis), the more the
        reservoir fills up (change in fill rate compared to last year=YOY,
        y-axis). We are using this relationship to predict the shortfall that is
        displayed above.
`;

const chartLabels = {
  labels: {
    rain: "Yearly rainfall (% of historical average)",
    fill: "Annual change in fill as % of full capacity",
  },
  legend: {
    rain: "Rainfall",
    fill: "Fill Rate",
  },
  buttons: {
    reservoirs: "Reservoirs",
    regions: "Water Regions",
  },
};

const dataPrepText = "Data Preparation: ";
const about = {
  linkRepo: { text: dataPrepText, linkName: "GitHub repo" },
  linkRawData: { text: "Data source:", linkName: "REDIAM" },
};

const namesRegionsShort = {
  Guadalquivir: "Guadalquivir",
  "Cuencas Mediterráneas Andaluzas": "Cuencas M.",
  "Guadalete Y Barbate": "Guad. Barb.",
  "Tinto, Odiel Y Piedras": "Tinto Odiel Piedras",
  Guadiana: "Guadiana",
};

export const timeOptions = {
  DAY: "day",
  MONTH: "month",
  YEAR: "year",
};

const getLevelsTextRel = (direction, value) => {
  const directionString = direction > 0 ? "increase" : "decrease";
  return `Reservoir levels ${directionString} by ${value} of capacity`;
};

const getLevelsTextAbs = (direction, value) => {
  const directionString = direction > 0 ? "Increase" : "Shortfall";
  return `${directionString} of ${value} HM3/year`;
};

const chartNames = {
  total: "Total for Andalucia",
  region: "Region",
};

const textsStub = {
  projectName: "AndaluciaWater",
  projectTag: "Water in Andalucia",
  projectDescription,
  projectFeatures,
  featuresComing,
  featuresComingHeader: "Features coming up:",
  featuresAdded,
  featuresAddedHeader: "New features:",
  timeOption: "Time Option",
  projectWarnings,
  descriptionGap,
  analysisName: "See Analysis notebook for details.",
  descriptionScatter: descriptionScatter,
  titleScatter: "The input: Rainfall and fill rates",
  chartLabels,
  rainSlider: "Rain (% of historical)",
  labelYAxisTotalChange: "Change (HM3/year)",
  titleRainfallAll: "Change given the rainfall",
  getLevelsTextRel: getLevelsTextRel,
  getLevelsTextAbs: getLevelsTextAbs,
  levelsStub: "Summary Estimate: ",
  namesRegionsShort,
  about,
  chartNames,
  timeOptions,
};

export const texts = prepareTexts(textsStub);
