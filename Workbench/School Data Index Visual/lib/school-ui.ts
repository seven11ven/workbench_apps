export const getMetricOptions = [
  { label: "Reading", key: "readingPctProficient" },
  { label: "Math", key: "mathPctProficient" },
  { label: "Biology", key: "biologyPctProficient" },
  { label: "Literature", key: "literaturePctProficient" },
] as const;

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
