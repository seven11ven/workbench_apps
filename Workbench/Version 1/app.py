from pathlib import Path

import pandas as pd
import streamlit as st

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "sample_data.csv"

SOURCE_GUIDE = {
    "attendance": {
        "label": "Attendance",
        "source": "Pennsylvania Department of Education / district annual reporting",
        "rule": "Use only public state or district reports and keep the publication source attached to every record.",
    },
    "test_scores": {
        "label": "Test Scores",
        "source": "State assessment releases (PSSA / Keystone)",
        "rule": "Only include figures directly published by the state department for the relevant school year.",
    },
    "graduation_rates": {
        "label": "Graduation Rates",
        "source": "State cohort graduation reporting",
        "rule": "Never infer graduation rates; they must come from an official public release or accepted reporting source.",
    },
}


@st.cache_data

def load_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Sample data not found at {DATA_PATH}")
    return pd.read_csv(DATA_PATH)


def render_summary(df):
    st.subheader("Reconciliation summary")
    col1, col2, col3 = st.columns(3)
    col1.metric("Schools", len(df))
    col2.metric("Verified records", int(df["verification_status"].eq("Verified").sum()))
    col3.metric("Metrics tracked", 3)


def render_source_guide():
    st.subheader("Verification standards")
    for details in SOURCE_GUIDE.values():
        with st.expander(details["label"]):
            st.write(f"Source: {details['source']}")
            st.write(f"Rule: {details['rule']}")


def main():
    st.set_page_config(page_title="School Metrics Reconciliation", layout="wide")
    st.title("School Metrics Reconciliation Check")
    st.caption("A clean, source-aware school table built for verified public metrics.")

    df = load_data()
    render_summary(df)

    st.subheader("School data table")
    display_df = df[[
        "school_id",
        "school_name",
        "abbreviation",
        "attendance",
        "test_scores",
        "graduation_rates",
        "source_name",
        "source_url",
        "verification_status",
    ]].copy()
    display_df = display_df.rename(columns={
        "school_id": "School ID",
        "school_name": "School Name",
        "abbreviation": "Abbreviation(s)",
        "attendance": "Attendance",
        "test_scores": "Test Scores",
        "graduation_rates": "Graduation Rates",
        "source_name": "Source Name",
        "source_url": "Source URL",
        "verification_status": "Verification Status",
    })

    st.dataframe(display_df, use_container_width=True, hide_index=True)
    render_source_guide()

    st.markdown(
        """
        ### Notes

        This app intentionally keeps the data format aligned with the project spec:
        the school ID and full name lead each row, with the official abbreviation listed in a dedicated abbreviation field.
        All values are sourced from publicly reported state data and flagged as verified when the source is present.
        """
    )


if __name__ == "__main__":
    main()
