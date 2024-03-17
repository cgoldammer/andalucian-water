import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import { useGetReservoirStatesQuery } from "./api/apiSlice";
import { ThemeProvider, Box, Container, Button, CardMedia, FormControl, Input, InputLabel, FormHelperText, TextField } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid";
import { LineChart } from '@mui/x-charts/LineChart'

export const ReservoirStateView = () => {
    const { data, error, isLoading } = useGetReservoirStatesQuery(true);
    if (isLoading || data == undefined) {
        return <div>Loading...</div>;
    }
    /* Console log the data */
    console.log("ReservoirStateView data: ", data);

    const dataCleaned = data.map((row, index) => {
        return {
            id: row.uuid,
            date: row.date,
            volume: row.volume,
            reservoirName: row.reservoir.name,
            reservoirUuid: row.reservoir.uuid
        };
    });

    console.log("ReservoirStateView dataCleaned: ", dataCleaned);

    const columns = [
        { field: "id", headerName: "ID", width: 150 },
        { field: "date", headerName: "Date", width: 150 },
        { field: "volume", headerName: "Current Volume", width: 200 },
        { field: "reservoirName", headerName: "Reservoir", width: 200 },
        { field: "reservoirUuid", headerName: "Reservoir UUID", width: 200 }
    ];

    // Add a chart using x-charts for the first reservoir
    const firstReservoirUuid = dataCleaned[0].reservoirUuid;
    const firstReservoirData = dataCleaned.filter((row) => row.reservoirUuid == firstReservoirUuid);
    console.log("ReservoirStateView firstReservoirData: ", firstReservoirData)
    const series = [
        {
            type: 'line',
            data: firstReservoirData.map((row) => row.volume)
        }
    ];
    const xvalues = firstReservoirData.map((row) => row.date);


    return (
        <div>
            <h1>Reservoir State</h1>
            <LineChart 
                xAxis={[{
                      id: 'years',
                      data: xvalues,
                      scaleType: 'band',
                      valueFormatter: (value) => value.toString(),
}]}
            
                series={series} width={500} height={300}/>
            <DataGrid rows={dataCleaned} columns={columns}/>
            
        </div>
    );

    


    
    


    

};