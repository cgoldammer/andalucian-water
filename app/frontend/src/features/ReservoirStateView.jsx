import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import { useGetReservoirStatesQuery } from "./api/apiSlice";
import { ThemeProvider, Box, Container, Button, CardMedia, FormControl, Input, InputLabel, FormHelperText, TextField } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid";
import { LineChart } from '@mui/x-charts/LineChart'

export const getChartData = (data) => {
    console.log(data)
    const ids = [...new Set(data.map((row) => row.reservoirUuid))];
    const datesUnique = [...new Set(data.map((row) => row.date))].sort();
    console.log("ids: ");
    console.log(ids);
    console.log("datesUnique: ", datesUnique);

    const getValuesForUuid = (uuid) => {
        const rows = data.filter((row) => row.reservoirUuid == uuid);
        var values = [];
        for (let i = 0; i < datesUnique.length; i++) {
            const date = datesUnique[i];
            const row = rows.find((row) => row.date == date);
            if (row == undefined) {
                values.push(null);
            } else {
                values.push(row.volume / row.capacity * 100);
            } 
        }
        // console.log("rows: ", values);

        return {
            type: 'line',
            data: values,
            id: uuid,
            label: rows[0].reservoirName
        }
    }

    const series = ids.map((uuid) => getValuesForUuid(uuid));

    return {
        series: series,
        xvalues: datesUnique
    }
}

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
            capacity: row.reservoir.capacity,
            reservoirName: row.reservoir.name,
            reservoirUuid: row.reservoir.uuid
        };
    });

    console.log("ReservoirStateView dataCleaned: ", dataCleaned);

    const columns = [
        { field: "id", headerName: "ID", width: 150 },
        { field: "date", headerName: "Date", width: 150 },
        { field: "volume", headerName: "Current Volume", width: 200 },
        { field: "capacity", headerName: "Capacity", width: 200},
        { field: "reservoirName", headerName: "Reservoir", width: 200 },
        { field: "reservoirUuid", headerName: "Reservoir UUID", width: 200 }
    ];

    const {series, xvalues} = getChartData(dataCleaned);
    


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
            
                series={series} width={800} height={600}/>
            <DataGrid rows={dataCleaned} columns={columns}/>
            
        </div>
    );

    


    
    


    

};