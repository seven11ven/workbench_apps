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

const toNumber = (value: string | undefined): number | null => {
  if (!value || value === "" || value.toUpperCase() === "N/A" || value.toUpperCase() === "EXCLUDED (SELECTION CRITERIA)") {
    return null;
  }

  const normalized = value.replace(/[%,$\s]/g, "").replace(/—/g, "-");
  if (!normalized || normalized === "-") {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const cleanSchoolName = (name: string): string =>
  name
    .replace(/\s+/g, " ")
    .trim();

const extractAbbreviation = (schoolName: string): string | undefined => {
  const name = cleanSchoolName(schoolName);
  const words = name.split(" ").filter(Boolean);

  if (words.length <= 1) {
    return undefined;
  }

  const abbreviation = words
    .map((word) => word.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .join(" ");

  return abbreviation || undefined;
};

const resolveCsvPath = (): string => {
  const possiblePaths = [
    path.resolve(process.cwd(), "../../Data/Elevate-215/Elevate-215_School-Data.csv"),
    path.resolve(process.cwd(), "../Data/Elevate-215/Elevate-215_School-Data.csv"),
    path.resolve(process.cwd(), "Data/Elevate-215/Elevate-215_School-Data.csv"),
  ];

  for (const candidate of possiblePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error("School dataset not found. Expected the CSV under Data/Elevate-215/Elevate-215_School-Data.csv");
};

export const getSchoolRecords = (): SchoolRecord[] => {
  const csvPath = resolveCsvPath();
  const csvText = fs.readFileSync(csvPath, "utf-8");
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1);
  const records: SchoolRecord[] = [];

  for (const line of rows) {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    const schoolNumber = row.SchoolNumber || "";
    const schoolName = cleanSchoolName(row.SchoolName || "");
    if (!schoolNumber || !schoolName) {
      continue;
    }

    records.push({
      schoolNumber,
      districtName: row.DistrictName || "",
      schoolName,
      abbreviation: extractAbbreviation(schoolName),
      schoolType: row.SchoolType || "",
      gradeSpan: row.GradeSpan_2025_26 || "",
      percentBlackHispanic: toNumber(row.PctBlackHispanic_2025_26),
      percentLowIncome: toNumber(row.PctLowIncome_2025_26),
      avgResidual: toNumber(row["Simple Avg Residual"]),
      readingPctProficient: toNumber(row["PSSA Reading — PctProficient_2025"]),
      mathPctProficient: toNumber(row["PSSA Math — PctProficient_2025"]),
      algebraPctProficient: toNumber(row["Keystone Algebra I — PctProficient_2025"]),
      biologyPctProficient: toNumber(row["Keystone Biology — PctProficient_2025"]),
      literaturePctProficient: toNumber(row["Keystone Literature — PctProficient_2025"]),
      enrollment: toNumber(row["Current Enrollment (SY 2025-26)"]),
      authorizedEnrollmentCap: toNumber(row["Authorized Enrollment Cap (SY 2025-26)"]),
      fillTier: row["Fill Tier"] || "",
      eapiTier: row["EAPI Tier"] || "",
    });
  }

  return records;
};

export const formatMetric = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "—";
  }

  return value.toFixed(1);
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

export const getMetricOptions = [
  { label: "Reading", key: "readingPctProficient" },
  { label: "Math", key: "mathPctProficient" },
  { label: "Biology", key: "biologyPctProficient" },
  { label: "Literature", key: "literaturePctProficient" },
] as const;
