import { SchoolTable } from "@/components/SchoolTable";
import { getSchoolRecords } from "@/lib/schools";

export default function Home() {
  const schools = getSchoolRecords();

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Elevate-215</p>
          <h1>School Reconciliation Dashboard</h1>
        </div>
        <div className="summary-card">
          <span>School records</span>
          <strong>{schools.length}</strong>
        </div>
      </header>

      <SchoolTable schools={schools} />
    </main>
  );
}
