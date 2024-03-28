export const ReservoirSelector = (props) => {
  const { initialReservoirUuid, getReservoir } = props;
  const [reservoirUuid, setReservoirUuid] =
    React.useState(initialReservoirUuid);
  const { data, isLoading } = useGetReservoirsQuery();

  if (isLoading || data == undefined) {
    return <div>Loading...</div>;
  }

  return (
    <FormControl>
      <InputLabel htmlFor="reservoir">Reservoir</InputLabel>
      <Select
        id="reservoir"
        value={reservoirUuid}
        onChange={handleReservoirUuidChange}
        input={<Input />}
      >
        {data.map((row) => (
          <MenuItem key={row.uuid} value={row}>
            {row.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
