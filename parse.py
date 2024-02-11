import pandas as pd
import camelot
import os
import numpy as np

folder_input = './data/input/cleaned'
folder_output = './data/output'

headers = {
    'EMBALSE': 'Reservoir',
    'PROVINCIA': 'Province',
    'LLUVIA ACUMULADA DESDE EL': 'RainfallSince',
    '(1)LLUVIA ACUMULADA PROMEDIO 1971-2000': 'AvgRainfall1971_2000',
    'CAPACIDAD (HM3)': 'Capacity_HM3',
    'EMBALSADA (HM3)': 'Stored_HM3',
    'VARIACION (HM3)_EN 24H': 'Variation24H_HM3',
    'EN UNA SEMANA': 'WeekChange',
    'EN UN AÑO': 'YearChange',
    '% LLENADO_HOY': 'FillingPctToday',
    'HACE UNA SEMANA': 'WeekAgo',
    'HACE UN AÑO': 'YearAgo',
    'RESERVA (HM3)_MEDIA DE LOS ÚLTIMOS 5 AÑOS': 'AvgReserve5Yrs_HM3'
}

cols_all = [c.lower() for c in headers.values()]
cols_non_text = cols_all[2:]

replace_spanish_to_ascii = {
    'á': 'a',
    'é': 'e',
    'í': 'i',
    'ó': 'o',
    'ú': 'u',
    'ñ': 'nn',
}

df_headers = pd.DataFrame(pd.Series(headers))
df_headers.columns = ['english']
df_headers.english = df_headers.english.str.lower()

def get_tables(filename):
    tables = camelot.read_pdf(filename, pages='all')
    return tables

def get_df(tables):
    start_row = -1
    end_row = -1

    dfs_good = []

    for i, table in enumerate(tables):
        df = table.df.copy()
        
        if 'ALMODÓVAR' in df.iloc[:, 0].values:
            start_row = i
        
        if df.iloc[:, 0].str.contains('TOTAL').any():
            end_row = i
            # Remove the last row
            df = df.iloc[:-1, :]
        
        if start_row > -1:  
            dfs_good.append(df)
            
        if end_row > -1:
            break
    
    assert start_row > -1
    assert end_row > -1
    
    df = pd.concat(dfs_good, axis=0)
    df.columns = df_headers.english.values
    return df

def clean_df(df_raw):
    df = df_raw.copy()

    cols_text = ['reservoir', 'province']
    for col in cols_text:
        df[col] = df[col].str.lower()
        for k, v in replace_spanish_to_ascii.items():
            df[col] = df[col].str.replace(k, v)
            
    cols_non_text = df.columns.drop(cols_text)
       
    # Remove any row that has "TOTAL"
    # in the reservoir column
    rows_total = df.reservoir.str.contains('total')
    df = df.loc[~rows_total, :]   
        
    reservoir = df.reservoir
    assert 'almodovar' in reservoir.head(5).values
    assert reservoir.iloc[-1] == 'piedras'
    
    # Remove any row where df.reservoir=="embalse"
    rows_embalse = df.reservoir == 'embalse'
    df = df.loc[~rows_embalse, :]
    
    # Remove any row where any column reads "HOY"
    to_find = 'HOY'
    has_hoy = df.apply(lambda x: x.str.contains(to_find)).any(axis=1)
    df = df.loc[~has_hoy, :]
    
    replace_none = ['S/D', '']
    for col in cols_non_text:
        df[col] = df[col].replace(replace_none, None)
    
    
    # In numeric columns, replace ',' with '.' and parse as
    # float
    for col in cols_non_text:
        df[col] = df[col].str.replace(',', '.').astype(float)
    return df

def get_full_df(filenames):
    dfs = []
    for filename in filenames:
        df = pd.read_csv(os.path.join(folder_output, filename))
        
        df['ds'] = filename[:10].replace('_', '-')
        
        # Reorder columns to put ds in front
        cols = df.columns.tolist()
        cols = cols[-1:] + cols[:-1]
        df = df[cols]
        
        dfs.append(df)

    return pd.concat(dfs)

def add_cols(df_all_raw):
    df_all = df_all_raw.copy()
    df_all['year'] = df_all['ds'].str.slice(0, 4).astype(int)
    df_all['month'] = df_all['ds'].str.slice(5, 7).astype(int)
    df_all['month_climatic_full'] = df_all['month'] + 3
    df_all['year_climatic'] = df_all.year + (df_all.month_climatic_full > 12).astype(int)
    df_all['month_climatic'] = (df_all.month_climatic_full % 12)
    df_all.loc[df_all.month_climatic == 0, 'month_climatic'] = 12
    df_all['is_month_start'] = df_all['month_climatic'] == 1
    df_all['date'] = pd.to_datetime(df_all['ds'])
    return df_all

def filter_weekly(filename):
    filename_without_extension = filename.split('.')[0]
    return filename_without_extension.endswith('1') 

def filter_monthly(filename):
    filename_without_extension = filename.split('.')[0]
    return filename_without_extension.endswith('01')

def filter_function(filename, f):
    filename_without_extension = filename.split('.')[0]
    return f(filename_without_extension)

def correct_issues(df):
    
    val_bad = -9999.0
    
    # Find all numeric columns in the df
    cols_numeric = df.select_dtypes(include='number').columns
    df[cols_numeric] = df[cols_numeric].replace(val_bad, np.nan)
    
    # TODO: There are many cases where the historical rainfall is not reset
    # at the end of the water-year, but instead at the end of the calendar year.
    # In that case, it's probably best to replace the unknown months with missing values.
    
    return(df)