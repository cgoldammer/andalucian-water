# Add a minimal streamlit app

import streamlit as st
import pandas as pd
import altair as alt
import parse

texts_english = {
    'title': 'Water In Andalusia',
    'rel_capacity': 'Relative Capacity (%)',
    'province': "province",
    'cap_header': 'Relative capacity over time',
    'tab_names': ['Reservoirs', 'Rainfall']
}

texts_spanish = {
    'title': 'Agua en Andalucía',
    'rel_capacity': 'Capacidad relativa (%)',
    'province': "provincia",
    'cap_header': 'Capacidad relativa en el tiempo',
    'tab_names': ['Embalses', 'Lluvia']
}

texts_all = {
    'english': texts_english,
    'spanish': texts_spanish
}


language = st.radio('Idioma / Language', list(texts_all.keys()), format_func=lambda x: x.capitalize())
texts = texts_all[language]
st.title(texts['title'])

folder_data = './data/datasets'


tab_options = texts['tab_names']
# Add tabs
tab_main, tab_rainfall = st.tabs(tab_options)


with tab_main:
    options = {
        'monthly': 'Monthly data since 2013',
        'recent': 'Last 60 days'
    }

    # Create buttons for each option
    option = st.radio('Select dataset', list(options.keys()), format_func=lambda x: options[x])

    filename = f"{folder_data}/{option}_cleaned.csv"

    df = pd.read_csv(filename)

    with st.expander('Show raw data'):   
        st.write(df)

    st.markdown(f'# {texts["cap_header"]}')
    df['date'] = pd.to_datetime(df['ds'])
    df['year'] = df['date'].dt.year
    df['relative_capacity'] = df['stored_hm3'] / df['capacity_hm3']
    agg = df.groupby(['date', 'province']).agg({'relative_capacity': 'mean'})

    chart = alt.Chart(agg.reset_index()).mark_line().encode(
        x='date',
        y=alt.Y('relative_capacity', axis=alt.Axis(title=texts['rel_capacity'], format='%')),
        color='province'
    ).properties(
        width=600
    )
    st.write(chart)

with tab_rainfall:
    st.write('Rainfall data')
    option = 'monthly'
    filename = f"{folder_data}/{option}_cleaned.csv"
    df = pd.read_csv(filename)
    
    df = parse.add_cols(df)
    
    df_yearly = df.groupby(['year_climatic', 'province', 'reservoir']).last()
    cols = ['rainfallsince', 'avgrainfall1971_2000']
    with st.expander('Show raw data'):
        st.write(df_yearly[cols])
        
    df_province = df_yearly.groupby(['date', 'province']).agg({'rainfallsince': 'mean', 'avgrainfall1971_2000': 'mean'}).reset_index()
    df_province['rainfall_rel'] = df_province['rainfallsince'] / df_province['avgrainfall1971_2000']
    
    # Add an altair chart
    chart = alt.Chart(df_province).mark_line().encode(
        x='date',
        y=alt.Y('rainfall_rel', axis=alt.Axis(title='Relative rainfall', format='%')),
        color='province'
    ).properties(
        width=600
    )
    st.write(chart)