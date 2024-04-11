const projectDescription = `
An overview of water reservoir levels in Andalucia, Spain.

Andalucia is going through an extended drought, and has seen
a dramatic depletion of water reservoirs. Here, we track publicly
available data on reservoir levels, and allow you to understand
the long-term trends.
`;

const projectWarnings = `
April 8, 2024: This is now publicly available, but not fully released.
We believe numbers are sensible,
but the parsing is tricky. If you find errors, let us know!
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

const featuresComing = [
  "Daily resolution for reservoir levels",
  "Understanding the impact of current investments",
  "Hydrographic regions",
  "Spanish language support",
];

const descriptionGap = `
Given the relative rainfall, we can predict the shortfall, which is
the expected reduction in overall reservoir levels (all in HM3).`;

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
  timeOption: "Time Option",
  projectWarnings: projectWarnings,
  descriptionGap: descriptionGap,
  analysisName: "Analysis notebook",
  descriptionScatter: descriptionScatter,
  titleScatter: "The input: Rainfall and fill rates",
};

export const positionAndalucia = [36.7213, -4.4214];
