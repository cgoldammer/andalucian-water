# Andalucia Water reservoir data

## Overview

If you just want to use the data, it's probably easiest to work with pre-cleaned CSV datasets,
probably [a cleaned version of the raw data](data/datasets/monthly_corrected.csv). And then look
at the [analysis.ipynb notebook](analysis.ipynb) to see examples how this data can get used.

At a high level, this data contains the fill status for the water reservoirs in Andalucia, Spain.
Andalucia is (as of 2024) going through an extended drought, with many reservoirs running low,
and wide-spread water cuts being expected. This data is likely useful for understanding and predicting
the biggest issues.

## Data preparation

The raw data is available [here](https://portalrediam.cica.es/geonetwork/srv/spa/catalog.search#/metadata/a730254e-b0b3-43f2-a8b1-81332b99c409) from 
"Rediam", an environmental data platform. This provides daily data on reservoir status, but the only ways of accessing this
are either (1) pdf files with tables, and (2) an online tool with limited download ability.

Here, I work with the PDF files. These can be [downloaded in bulk](https://portalrediam.cica.es/descargas?path=%2F04_RECURSOS_NATURALES%2F04_AGUAS%2F01_SUPERFICIALES%2F00_SUPERFICIALES%2FEmbalses_al_dia%2FDocumentos%2Fpdf%2Freserva), but they require a fair bit of processing to extract data in cleaned format.

To the providers of public data: Thank you, but... this data already exists in a parseable form in your system, if you can add this to the download folder it's easier to read and also dramatically more space efficient. 
But I take anything I can get!

The [parse.ipynb notebook](parse.ipynb) contains the code for parsing the pdf docs, turning it into a dataframe with simplified column names and some data cleaning.