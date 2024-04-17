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
  "April 13, 2024: Added Hydrographic regions",
  "April 16, 2024: Improved shortfall predictions",
];

const featuresComing = [
  "Daily resolution for reservoir levels",
  "Understanding the impact of current investments",
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

export const texts = {
  projectName: "AndaluciaWater",
  projectTag: "Water in Andalucia",
  projectDescription: projectDescription,
  projectFeatures: projectFeatures,
  featuresComing: featuresComing,
  featuresComingHeader: "Features coming up:",
  featuresAdded: featuresAdded,
  featuresAddedHeader: "New features:",
  timeOption: "Time Option",
  projectWarnings: projectWarnings,
  descriptionGap: descriptionGap,
  analysisName: "See Analysis notebook for details.",
  descriptionScatter: descriptionScatter,
  titleScatter: "The input: Rainfall and fill rates",
  labelRainFallYear: "Yearly rainfall (% of historical average)",
  labelRainFall: "Rainfall (mm)",
  labelFillRate: "Annual change in fill as % of full capacity",
  rainSlider: "Rain (% of historical)",
  labelYAxisTotalChange: "Change (HM3/year)",
  titleRainfallAll: "Change given the rainfall",
  getLevelsTextRel: (direction, value) => {
    const directionString = direction > 0 ? "increase" : "decrease";
    return `Reservoir levels ${directionString} by ${value} of capacity`;
  },
  getLevelsTextAbs: (direction, value) => {
    const directionString = direction > 0 ? "Shortfall" : "Increase";
    return `${directionString} of ${value} HM3/year`;
  },
};

export const positionAndalucia = [36.7213, -4.4214];

export const namesRegionsShort = {
  Guadalquivir: "Guadalquivir",
  "Cuencas Mediterráneas Andaluzas": "Cuencas M.",
  "Guadalete Y Barbate": "Guad. Barb.",
  "Tinto, Odiel Y Piedras": "Tinto Odiel Piedras",
  Guadiana: "Guadiana",
};
