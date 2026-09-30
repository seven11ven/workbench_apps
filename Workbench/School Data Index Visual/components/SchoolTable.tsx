"use client";

import { useMemo, useState } from "react";

import { formatMetric, getMetricOptions, getMetricTone } from "@/lib/school-ui";
import type { SchoolRecord } from "@/types/school";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function SchoolTable({ schools }: { schools: SchoolRecord[] }) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [chartMetric, setChartMetric] = useState<(typeof getMetricOptions)[number]["key"]>("readingPctProficient");

  const filteredSchools = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return schools;
    }

    return schools.filter((school) => {
      const haystack = [
        school.schoolNumber,
        school.schoolName,
        school.districtName,
        school.abbreviation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(value);
    });
  }, [query, schools]);

  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const visibleSchools = filteredSchools.slice(pageStart, pageStart + pageSize);

  const chartData = useMemo(() => {
    return [...filteredSchools]
      .sort((a, b) => {
        const valueA = a[chartMetric] ?? -Infinity;
        const valueB = b[chartMetric] ?? -Infinity;
        return valueB - valueA;
      })
      .slice(0, 8)
      .map((school) => ({
        label: school.schoolName,
        value: school[chartMetric] ?? 0,
      }));
  }, [chartMetric, filteredSchools]);

  const metricLabel = getMetricOptions.find((option) => option.key === chartMetric)?.label ?? "Reading";

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>School record table</h2>
        <div className="toolbar">
          <input
            type="search"
            className="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by school ID or name"
            aria-label="Search schools"
          />
          <button
            type="button"
            className="button"
            onClick={() => {
              setQuery("");
              setPage(1);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="results-meta">
        Showing {filteredSchools.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageSize, filteredSchools.length)} of {filteredSchools.length} schools
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h3>Performance snapshot</h3>
          <div className="chart-toggle-group" aria-label="Metric selector">
            {getMetricOptions.map((metric) => (
              <button
                key={metric.key}
                type="button"
                className={chartMetric === metric.key ? "chart-toggle active" : "chart-toggle"}
                onClick={() => setChartMetric(metric.key)}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-wrapper" aria-label={`${metricLabel} performance chart`}>
          {chartData.length === 0 ? (
            <div className="empty-state compact">No chart data available.</div>
          ) : (
            <div className="bars">
              {chartData.map((point) => (
                <div key={point.label} className="bar-group">
                  <div className="bar-label">{point.label}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${Math.max(8, Math.min(point.value, 100))}%` }}
                    />
                  </div>
                  <div className="bar-value">{formatMetric(point.value)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="table-wrap">
        {filteredSchools.length === 0 ? (
          <div className="empty-state">No matching schools were found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>School ID</th>
                <th>School</th>
                <th>District</th>
                <th>Type</th>
                <th>Grade span</th>
                <th>Avg residual</th>
                <th>Reading</th>
                <th>Math</th>
                <th>Biology</th>
                <th>Literature</th>
                <th>EAPI</th>
              </tr>
            </thead>
            <tbody>
              {visibleSchools.map((school) => (
                <tr key={`${school.schoolNumber}-${school.schoolName}`}>
                  <td>{school.schoolNumber}</td>
                  <td>
                    <div className="school-name">{school.schoolName}</div>
                    {school.abbreviation ? <div className="muted">{school.abbreviation}</div> : null}
                  </td>
                  <td>{school.districtName || "—"}</td>
                  <td>{school.schoolType || "—"}</td>
                  <td>{school.gradeSpan || "—"}</td>
                  <td>
                    <span className={`pill ${getMetricTone(school.avgResidual)}`}>
                      {school.avgResidual === null ? "—" : `${formatMetric(school.avgResidual)}`}
                    </span>
                  </td>
                  <td>{school.readingPctProficient === null ? "—" : `${formatMetric(school.readingPctProficient)}%`}</td>
                  <td>{school.mathPctProficient === null ? "—" : `${formatMetric(school.mathPctProficient)}%`}</td>
                  <td>{school.biologyPctProficient === null ? "—" : `${formatMetric(school.biologyPctProficient)}%`}</td>
                  <td>{school.literaturePctProficient === null ? "—" : `${formatMetric(school.literaturePctProficient)}%`}</td>
                  <td>{school.eapiTier || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="footer-controls">
        <div className="page-selector">
          <label htmlFor="rowsPerPage">Rows per page</label>
          <select
            id="rowsPerPage"
            value={pageSize}
            onChange={(event) => {
              const nextSize = Number(event.target.value);
              setPageSize(nextSize);
              setPage(1);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="pagination">
          <button type="button" className="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Previous
          </button>
          <span>
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            className="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      </div>

      <div className="source-note">
        Source: Data/Elevate-215/Elevate-215_School-Data.csv
      </div>
    </section>
  );
}
