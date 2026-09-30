"use client";

import { useMemo, useState } from "react";

import type { SchoolRecord } from "@/types/school";

const formatMetric = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value.toFixed(1)}`;
};

const getMetricTone = (value: number | null | undefined): "good" | "warn" | "bad" => {
  if (value === null || value === undefined) {
    return "warn";
  }

  if (value >= 5) {
    return "good";
  }

  if (value <= -5) {
    return "bad";
  }

  return "warn";
};

export function SchoolTable({ schools }: { schools: SchoolRecord[] }) {
  const [query, setQuery] = useState("");

  const filteredSchools = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    if (!lowerQuery) {
      return schools;
    }

    return schools.filter((school) => {
      const haystack = [
        school.schoolNumber,
        school.schoolName,
        school.districtName,
        school.schoolType,
        school.gradeSpan,
        school.eapiTier,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(lowerQuery);
    });
  }, [query, schools]);

  const refreshTable = () => {
    setQuery("");
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>School records</h2>
        <div className="toolbar">
          <input
            className="search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search school, district, or ID"
            aria-label="Search schools"
          />
          <button className="button" type="button" onClick={refreshTable}>
            Refresh list
          </button>
        </div>
      </div>

      <div className="results-meta">
        Showing {filteredSchools.length} of {schools.length} school records
      </div>

      <div className="table-wrap">
        {filteredSchools.length === 0 ? (
          <div className="empty-state">No matching records found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>School #</th>
                <th>School</th>
                <th>District</th>
                <th>Enrollment</th>
                <th>Avg residual</th>
                <th>Reading</th>
                <th>Math</th>
                <th>Algebra I</th>
                <th>Biology</th>
                <th>Literature</th>
                <th>EAPI</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school) => {
                const tone = getMetricTone(school.avgResidual);
                const residualLabel = school.avgResidual === null ? "—" : formatMetric(school.avgResidual);

                return (
                  <tr key={`${school.schoolNumber}-${school.schoolName}`}>
                    <td>{school.schoolNumber || "—"}</td>
                    <td>
                      <div className="school-name">{school.schoolName || "Unknown school"}</div>
                      <div className="muted">{school.abbreviation || "Official name"}</div>
                    </td>
                    <td>{school.districtName || "—"}</td>
                    <td>{school.enrollment === null ? "—" : formatMetric(school.enrollment)}</td>
                    <td>
                      <span className={`pill ${tone}`}>{residualLabel}</span>
                    </td>
                    <td>{school.readingPctProficient === null ? "—" : `${formatMetric(school.readingPctProficient)}%`}</td>
                    <td>{school.mathPctProficient === null ? "—" : `${formatMetric(school.mathPctProficient)}%`}</td>
                    <td>{school.algebraPctProficient === null ? "—" : `${formatMetric(school.algebraPctProficient)}%`}</td>
                    <td>{school.biologyPctProficient === null ? "—" : `${formatMetric(school.biologyPctProficient)}%`}</td>
                    <td>{school.literaturePctProficient === null ? "—" : `${formatMetric(school.literaturePctProficient)}%`}</td>
                    <td>{school.eapiTier || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
