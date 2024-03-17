import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import { useGetReservoirStatesQuery } from "./api/apiSlice";
import { ThemeProvider, Box, Container, Button, CardMedia, FormControl, Input, InputLabel, FormHelperText, TextField } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid";

export const ReservoirStateView = () => {
    const { data, error, isLoading } = useGetReservoirStatesQuery();
    if (isLoading || data == undefined) {
        return <div>Loading...</div>;
    }
    /* Console log the data */
    console.log("ReservoirStateView data: ", data);

    const dataCleaned = data.map((row, index) => {
        return {
            ...row,
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

    return (
        <div>
            <h1>Reservoir State</h1>
            <DataGrid rows={dataCleaned} columns={columns}/>
        </div>
    );

};