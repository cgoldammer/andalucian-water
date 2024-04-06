export const ReservoirStateChart = (props) => {
  const { series, xvalues } = props;

  const yAxis = [
    {
      id: "fill",
      scaleType: "linear",
      label: "Percentage",
      valueFormatter: (value) => `${(value * 100).toFixed(1)}%`,
    },
    {
      id: "rain",
      scaleType: "linear",
      label: "Rainfall",
      valueFormatter: (value) => value.toFixed(1),
    },
  ];

  const xAxis = [
    {
      id: "years",
      data: xvalues,
      scaleType: "band",
      valueFormatter: (value) => value.toString(),
    },
  ];

  return (
    <LineChart
      xAxis={xAxis}
      yAxis={yAxis}
      series={series}
      leftAxis="fill"
      rightAxis="rain"
      width={800}
      height={600}
    />
  );
};
