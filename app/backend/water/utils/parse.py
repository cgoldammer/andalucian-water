import pandas as pd
import camelot
import os
import numpy as np

cd_water = os.getenv("CD_WATER")

folder_data = f"{cd_water}/data"
folder_new = f"{folder_data}/input/cleaned"
folder_raw = f"{folder_data}/input/reserva"
folder_base = f"{folder_data}/datasets"
folder_input = f"{folder_data}/input/cleaned"
folder_output = f"{folder_data}/output"


def get_filename_output(filename):
    filename_output = filename.replace("pdf", "csv")
    filename_output = os.path.join(folder_output, filename_output)
    return filename_output


def parse_file(filename):
    full_filename = os.path.join(folder_new, filename)
    filename_output = get_filename_output(filename)
    if not os.path.exists(filename_output):
        try:
            tables = get_tables(full_filename)
            df_raw = get_df(tables)
            df = clean_df(df_raw)
            df.to_csv(filename_output, index=False)
        except Exception as e:
            print(full_filename)
            print(e)
            pass


def parse_full(overwrite=False, nums_last=300):

    filenames_raw = sorted(os.listdir(folder_input))
    filenames = filenames_raw[-nums_last:][::-1]
    filenames

    filenames_to_parse = []

    for i, filename in enumerate(filenames):
        filename_output = get_filename_output(filename)

        filename_input_size = os.path.getsize(os.path.join(folder_new, filename))

        if (
            not os.path.exists(filename_output) or overwrite
        ) and filename_input_size > 10240:
            filenames_to_parse.append(filename)

    if len(filenames_to_parse) == 0:
        return

    print(
        f"Files to parse: {len(filenames_to_parse)} | Latest: {filenames_to_parse[0]}"
    )

    for i, filename in enumerate(filenames_to_parse):
        if i % 50 == 0:
            print(
                f"{i} of {len(filenames_to_parse)}: {filename} / share completed: {round(i/len(filenames_to_parse)*100, 2)}%"
            )

        parse_file(filename)


headers = {
    "EMBALSE": "Reservoir",
    "PROVINCIA": "Province",
    "LLUVIA ACUMULADA DESDE EL": "RainfallSince",
    "(1)LLUVIA ACUMULADA PROMEDIO 1971-2000": "AvgRainfall1971_2000",
    "CAPACIDAD (HM3)": "Capacity_HM3",
    "EMBALSADA (HM3)": "Stored_HM3",
    "VARIACION (HM3)_EN 24H": "Variation24H_HM3",
    "EN UNA SEMANA": "WeekChange",
    "EN UN AÑO": "YearChange",
    "% LLENADO_HOY": "FillingPctToday",
    "HACE UNA SEMANA": "WeekAgo",
    "HACE UN AÑO": "YearAgo",
    "RESERVA (HM3)_MEDIA DE LOS ÚLTIMOS 5 AÑOS": "AvgReserve5Yrs_HM3",
}

cols_all = [c.lower() for c in headers.values()]
cols_non_text = cols_all[2:]

replace_spanish_to_ascii = {
    "á": "a",
    "é": "e",
    "í": "i",
    "ó": "o",
    "ú": "u",
    "ñ": "nn",
}

df_headers = pd.DataFrame(pd.Series(headers))
df_headers.columns = ["english"]
df_headers.english = df_headers.english.str.lower()


def get_tables(filename):
    tables = camelot.read_pdf(filename, pages="all")
    return tables


def get_df(tables):
    start_row = -1
    end_row = -1

    dfs_good = []

    for i, table in enumerate(tables):
        df = table.df.copy()

        if "ALMODÓVAR" in df.iloc[:, 0].values:
            start_row = i

        if df.iloc[:, 0].str.contains("TOTAL").any():
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

    cols_text = ["reservoir", "province"]
    for col in cols_text:
        df[col] = df[col].str.lower()
        for k, v in replace_spanish_to_ascii.items():
            df[col] = df[col].str.replace(k, v)

    cols_non_text = df.columns.drop(cols_text)

    # Remove any row that has "TOTAL"
    # in the reservoir column
    rows_total = df.reservoir.str.contains("total")
    df = df.loc[~rows_total, :]

    reservoir = df.reservoir
    assert "almodovar" in reservoir.head(5).values
    assert reservoir.iloc[-1] == "piedras"

    # Remove any row where df.reservoir=="embalse"
    rows_embalse = df.reservoir == "embalse"
    df = df.loc[~rows_embalse, :]

    # Remove any row where any column reads "HOY"
    to_find = "HOY"
    has_hoy = df.apply(lambda x: x.str.contains(to_find)).any(axis=1)
    df = df.loc[~has_hoy, :]

    replace_none = ["S/D", ""]
    for col in cols_non_text:
        df[col] = df[col].replace(replace_none, None)

    # In numeric columns, replace ',' with '.' and parse as
    # float
    for col in cols_non_text:
        df[col] = df[col].str.replace(",", ".").astype(float)
    return df


def get_full_df(filenames):
    dfs = []
    for filename in filenames:
        df = pd.read_csv(os.path.join(folder_output, filename))

        df["ds"] = filename[:10].replace("_", "-")

        # Reorder columns to put ds in front
        cols = df.columns.tolist()
        cols = cols[-1:] + cols[:-1]
        df = df[cols]

        dfs.append(df)

    return pd.concat(dfs)


def add_cols(df_all_raw):
    df_all = df_all_raw.copy()
    df_all["year"] = df_all["ds"].str.slice(0, 4).astype(int)
    df_all["month"] = df_all["ds"].str.slice(5, 7).astype(int)
    df_all["month_climatic_full"] = df_all["month"] + 3
    df_all["year_climatic"] = df_all.year + (df_all.month_climatic_full > 12).astype(
        int
    )
    df_all["month_climatic"] = df_all.month_climatic_full % 12
    df_all.loc[df_all.month_climatic == 0, "month_climatic"] = 12
    df_all["is_month_start"] = df_all["month_climatic"] == 1
    df_all["date"] = pd.to_datetime(df_all["ds"])
    return df_all


def filter_weekly(filename):
    filename_without_extension = filename.split(".")[0]
    return filename_without_extension.endswith("1")


def filter_monthly(filename):
    filename_without_extension = filename.split(".")[0]
    return filename_without_extension.endswith("01")


def filter_function(filename, f):
    filename_without_extension = filename.split(".")[0]
    return f(filename_without_extension)


def correct_issues(df):

    val_bad = -9999.0

    # Find all numeric columns in the df
    cols_numeric = df.select_dtypes(include="number").columns
    df[cols_numeric] = df[cols_numeric].replace(val_bad, np.nan)

    # TODO: There are many cases where the historical rainfall is not reset
    # at the end of the water-year, but instead at the end of the calendar year.
    # In that case, it's probably best to replace the unknown months with missing values.

    return df


def remove_bad_rows(df):
    df_all = add_cols(df)

    df_all["date_lag"] = df_all.groupby(["province", "reservoir"])["date"].shift(1)

    cols = ["rainfallsince", "stored_hm3", "capacity_hm3"]
    for var in ["rainfallsince", "stored_hm3"]:
        df_all[f"{var}_diff"] = df_all.groupby(["province", "reservoir"])[var].diff()
        df_all[f"{var}_diff_0"] = df_all[f"{var}_diff"]
        for lags in range(1, 10):
            df_all[f"{var}_diff_{lags}"] = df_all.groupby(["province", "reservoir"])[
                f"{var}_diff"
            ].shift(lags)

    df_all["bad_data"] = df_all.rainfallsince_diff_0 < -10
    df_all["bad_data_for_year"] = df_all.groupby(
        ["province", "reservoir", "year_climatic"]
    )["bad_data"].transform("any")
    df_all["problem_month"] = df_all.month.isin([1, 10, 11, 12])
    df_all["bad_data_and_month"] = df_all.bad_data & df_all.problem_month

    df_all["stored_hm3_diff_relative"] = df_all.stored_hm3_diff / df_all.capacity_hm3
    df_reg = df_all.query("~bad_data_and_month").query("rainfallsince_diff >=0").copy()

    df_reg["bad_data_for_year"] = df_reg.groupby(
        ["province", "reservoir", "year_climatic"]
    )["bad_data"].transform("any")
    df_reg = df_reg.sort_values(["province", "reservoir", "date"])
    df_reg["date_diff"] = (df_reg.date - df_reg.date_lag).dt.days
    df_reg[["province", "reservoir", "date"]].head(10)

    df_reg["bad_data_for_year"] = df_reg.groupby(
        ["province", "reservoir", "year_climatic"]
    )["bad_data"].transform("any")
    assert df_reg.bad_data_for_year.sum() == 0

    def add_lags(df, var_name, lags=np.arange(-5, 5), groups=["province", "reservoir"]):
        for lag in lags:
            df[f"{var_name}_lag_{lag}"] = df.groupby(groups)[var_name].shift(lag)

        lag_vars = [f"{var_name}_lag_{lag}" for lag in lags]
        return df, lag_vars

    df_reg["suspicious_storage"] = (np.abs(df_reg["stored_hm3_diff"]) > 2) & (
        np.abs(df_reg["stored_hm3_diff_relative"]) > 0.05
    )
    df_reg["high_rain"] = (df_reg.rainfallsince_diff > 10) | (
        df_reg.rainfallsince_diff_1 > 10
    )
    df_reg["bad_storage"] = df_reg.suspicious_storage & (~df_reg.high_rain)
    df_reg, lag_vars = add_lags(df_reg, "bad_storage")

    df_reg["surrounding_bad_storage"] = df_reg[lag_vars].max(axis=1)
    df_reg = df_reg.query("surrounding_bad_storage==0").copy()
    return df_reg


def pick_monthly(df):
    df_monthly = df[df.ds.str.slice(8, 10) == "01"].copy()
    return df_monthly


filename_csv_all = f"{folder_base}/all_parsed_cleaned.csv"


def cleaned_data_to_csv():
    filenames_all = sorted(os.listdir(folder_output))
    df_all = get_full_df(filenames_all)
    df_all.to_csv(f"{folder_base}/all_parsed.csv", index=False)
    df_all = correct_issues(df_all).sort_values(["ds", "province", "reservoir"])
    df_removed = remove_bad_rows(df_all).sort_values(["ds", "province", "reservoir"])
    df_removed = df_removed[df_all.columns].sort_values(["reservoir", "ds"])
    len(df_removed), len(df_all)
    df_removed.to_csv(filename_csv_all, index=False)

    df_monthly = pick_monthly(df_all)
    df_monthly_cleaned = pick_monthly(df_removed)

    df_monthly.to_csv(f"{folder_base}/monthly.csv", index=False)
    df_monthly_cleaned.to_csv(f"{folder_base}//monthly_cleaned.csv", index=False)

    num_tail = 60
    ds_recent = df_all.ds.unique()[-num_tail:]
    df_recent = df_all[df_all.ds.isin(ds_recent)].copy()
    df_recent_cleaned = df_removed[df_removed.ds.isin(ds_recent)].copy()

    df_recent.to_csv(f"{folder_base}/recent.csv", index=False)
    df_recent_cleaned.to_csv(f"{folder_base}/recent_cleaned.csv", index=False)
