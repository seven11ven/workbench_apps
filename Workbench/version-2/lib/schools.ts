import fs from "fs";
import path from "path";

import type { SchoolRecord } from "@/types/school";

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

const safelyParseNumber = (value: string | undefined): number | null => {
  if (!value || value === "" || value.toUpperCase() === "N/A") {
    return null;
  }

  const normalized = value.replace(/[%,$\s]/g, "").replace(/—/g, "-");
  if (normalized === "") {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const toDisplayValue = (value: string | undefined): string => {
  const parsed = safelyParseNumber(value);
  return parsed === null ? "—" : parsed.toString();
};

const extractAbbreviation = (schoolName: string): string | undefined => {
  const cleaned = schoolName
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return undefined;
  }

  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length <= 1) {
    return undefined;
  }

  const compact = parts
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .join(" ");

  return compact.length > 0 ? compact : undefined;
};

const resolveCsvPath = (): string => {
  const candidatePaths = [
    path.resolve(process.cwd(), "../../Data/Elevate-215/Elevate-215_School-Data.csv"),
    path.resolve(process.cwd(), "../Data/Elevate-215/Elevate-215_School-Data.csv"),
    path.resolve(process.cwd(), "Data/Elevate-215/Elevate-215_School-Data.csv"),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error("School dataset not found. Expected the CSV under Data/Elevate-215/Elevate-215_School-Data.csv");
};

export const getSchoolRecords = (): SchoolRecord[] => {
  const csvPath = resolveCsvPath();
  const csvText = fs.readFileSync(csvPath, "utf-8");
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const records: SchoolRecord[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = parseCsvLine(lines[index]);
    const record: Record<string, string> = {};

    headers.forEach((header, headerIndex) => {
      record[header] = values[headerIndex] ?? "";
    });

    const schoolName = record.SchoolName || "";
    const avgResidual = safelyParseNumber(record["Simple Avg Residual"]);
    const enrollment = safelyParseNumber(record["Current Enrollment (SY 2025-26)"]);
    const readingPct = safelyParseNumber(record["PSSA Reading — PctProficient_2025"]);
    const mathPct = safelyParseNumber(record["PSSA Math — PctProficient_2025"]);
    const algebraPct = safelyParseNumber(record["Keystone Algebra I — PctProficient_2025"]);
    const biologyPct = safelyParseNumber(record["Keystone Biology — PctProficient_2025"]);
    const literaturePct = safelyParseNumber(record["Keystone Literature — PctProficient_2025"]);

    records.push({
      schoolNumber: record.SchoolNumber || "",
      districtName: record.DistrictName || "",
      schoolName,
      abbreviation: extractAbbreviation(schoolName),
      schoolType: record.SchoolType || "",
      gradeSpan: record.GradeSpan_2025_26 || "",
      percentBlackHispanic: safelyParseNumber(record.PctBlackHispanic_2025_26),
      percentLowIncome: safelyParseNumber(record.PctLowIncome_2025_26),
      avgResidual,
      readingPctProficient: readingPct,
      mathPctProficient: mathPct,
      algebraPctProficient: algebraPct,
      biologyPctProficient: biologyPct,
      literaturePctProficient: literaturePct,
      enrollment,
      authorizedEnrollmentCap: safelyParseNumber(record["Authorized Enrollment Cap (SY 2025-26)"]),
      fillTier: record["Fill Tier"] || "",
      eapiTier: record["EAPI Tier"] || "",
    });
  }

  return records.filter((school) => school.schoolName && school.schoolNumber);
};

export const formatMetric = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value.toFixed(1)}`;
};

export const getMetricTone = (value: number | null | undefined): "good" | "warn" | "bad" => {
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

export const getSchoolSummary = (school: SchoolRecord): string => {
  const values = [
    school.readingPctProficient === null ? null : `Reading ${toDisplayValue(String(school.readingPctProficient))}%`,
    school.mathPctProficient === null ? null : `Math ${toDisplayValue(String(school.mathPctProficient))}%`,
    school.eapiTier ? `EAPI ${school.eapiTier}` : null,
  ].filter(Boolean);

  return values.length > 0 ? values.join(" • ") : "No metric snapshot available";
};
