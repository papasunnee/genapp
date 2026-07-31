"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DatePicker from "react-date-picker";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import { toast } from "@/components/ui/Toast";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

type CatalogParameter = {
  id: string;
  name: string;
  resultType: "numeric" | "text";
  unit?: string[];
  range?: string;
  cost: number;
};

type FlatTest = {
  key: string;
  categoryName: string;
  discrete: boolean;
  nest: 0 | 1 | 2;
  typeName?: string;
  parameter: CatalogParameter;
};

function flattenCatalog(categories: any[]): FlatTest[] {
  const flat: FlatTest[] = [];
  (categories ?? []).forEach((cat: any) => {
    if (cat.nest === 2) {
      (cat.type ?? []).forEach((type: any) => {
        (type.parameters ?? []).forEach((p: CatalogParameter) => {
          flat.push({
            key: p.id,
            categoryName: cat.name,
            discrete: cat.discrete,
            nest: 2,
            typeName: type.name,
            parameter: p,
          });
        });
      });
    } else {
      (cat.parameters ?? []).forEach((p: CatalogParameter) => {
        flat.push({
          key: p.id,
          categoryName: cat.name,
          discrete: cat.discrete,
          nest: cat.nest,
          parameter: p,
        });
      });
    }
  });
  return flat;
}

const EMPTY_NEW_PATIENT = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  gender: "Male",
  description: "",
};

export default function OrderTest() {
  const router = useRouter();

  const { data: catalogData }: any = useSWR("/api/test-catalog", fetcher);
  const { data: patientsData }: any = useSWR("/api/patients", fetcher);

  const flatCatalog = useMemo(
    () => flattenCatalog(catalogData?.data ?? []),
    [catalogData]
  );

  const [testSearch, setTestSearch] = useState("");
  const [selected, setSelected] = useState<FlatTest[]>([]);

  const [patientMode, setPatientMode] = useState<"existing" | "new">("existing");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [newPatient, setNewPatient] = useState(EMPTY_NEW_PATIENT);
  const [newPatientDob, setNewPatientDob] = useState<any>(new Date("1/1/2000"));

  const [testTitle, setTestTitle] = useState("");
  const [specimen, setSpecimen] = useState("");
  const [clinicalAddress, setClinicalAddress] = useState("");
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedKeys = useMemo(() => new Set(selected.map((t) => t.key)), [selected]);

  const searchResults = useMemo(() => {
    const q = testSearch.trim().toLowerCase();
    if (!q) return [];
    return flatCatalog
      .filter((t) => !selectedKeys.has(t.key))
      .filter(
        (t) =>
          t.parameter.name.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q) ||
          t.typeName?.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [flatCatalog, testSearch, selectedKeys]);

  const totalCost = selected.reduce((sum, t) => sum + (t.parameter.cost || 0), 0);

  const patientResults = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    const list = patientsData?.data ?? [];
    if (!q) return list.slice(0, 8);
    return list
      .filter((p: any) =>
        `${p.firstname} ${p.lastname}`.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [patientsData, patientSearch]);

  const addTest = (test: FlatTest) => {
    setSelected((prev) => [...prev, test]);
    setTestSearch("");
  };

  const removeTest = (key: string) => {
    setSelected((prev) => prev.filter((t) => t.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("Select at least one test");
      return;
    }
    if (!testTitle.trim()) {
      toast.error("Test title is required");
      return;
    }
    if (patientMode === "existing" && !selectedPatient) {
      toast.error("Select a patient");
      return;
    }

    setSubmitting(true);
    try {
      let patientId = selectedPatient?._id;

      if (patientMode === "new") {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newPatient, dob: newPatientDob }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to create patient");
        patientId = json.data._id;
      }

      const test_data = selected.map((t) => ({
        name: t.categoryName,
        discrete: t.discrete,
        nest: t.nest,
        ...(t.nest === 2 ? { type: t.typeName } : {}),
        parameter: { ...t.parameter, value: "", checked: true },
      }));

      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_title: testTitle,
          specimen,
          clinical_address: clinicalAddress,
          clinical_diagnosis: clinicalDiagnosis,
          test_data: JSON.stringify(test_data),
          patient: patientId,
          total_cost: totalCost,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create test order");

      toast.success("Test order created");
      router.push(`/admin/patients/${patientId}`);
    } catch (error: any) {
      toast.error(error.message);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap -mx-4">
      {/* Test search + cart */}
      <div className="w-full xl:w-8/12 px-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h6 className="text-slate-800 text-md md:text-lg font-semibold mb-1">
            Search Tests
          </h6>
          <p className="text-sm text-slate-500 mb-4">
            Search by test name or category, then add it to the order.
          </p>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={testSearch}
              onChange={(e) => setTestSearch(e.target.value)}
              placeholder="e.g. Sodium, FBC, Malaria..."
              className={INPUT_CLASS + " pl-8"}
            />
          </div>

          {testSearch && (
            <div className="mt-3 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => addTest(t)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {t.parameter.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {t.categoryName}
                        {t.typeName ? ` · ${t.typeName}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-600">
                        {formatCurrency(t.parameter.cost)}
                      </span>
                      <i className="fas fa-plus-circle text-brand-600"></i>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500 px-3 py-3">No matching tests found.</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h6 className="text-slate-800 text-md md:text-lg font-semibold">
              Selected Tests ({selected.length})
            </h6>
            <div className="text-right">
              <p className="text-xs uppercase text-slate-400 font-semibold">Total</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(totalCost)}
              </p>
            </div>
          </div>

          {selected.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {selected.map((t) => (
                <li key={t.key} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {t.parameter.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {t.categoryName}
                      {t.typeName ? ` · ${t.typeName}` : ""}
                      {t.parameter.resultType === "text"
                        ? " · Text notes"
                        : t.parameter.unit?.length
                        ? ` · ${t.parameter.unit.join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-semibold text-slate-600">
                      {formatCurrency(t.parameter.cost)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTest(t.key)}
                      title="Remove"
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic py-4">
              No tests selected yet. Search above to add tests.
            </p>
          )}
        </div>
      </div>

      {/* Patient + additional info + submit */}
      <div className="w-full xl:w-4/12 px-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h6 className="text-slate-800 text-md md:text-lg font-semibold mb-4">Patient</h6>

          <div className="flex rounded-lg border border-slate-200 p-1 mb-4">
            <button
              type="button"
              onClick={() => setPatientMode("existing")}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                patientMode === "existing"
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Existing Patient
            </button>
            <button
              type="button"
              onClick={() => setPatientMode("new")}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                patientMode === "new"
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              New Patient
            </button>
          </div>

          {patientMode === "existing" ? (
            selectedPatient ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-brand-50 border border-brand-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedPatient.firstname} {selectedPatient.lastname}
                  </p>
                  <p className="text-xs text-slate-500">{selectedPatient.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patient by name..."
                  className={INPUT_CLASS}
                />
                <div className="mt-2 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {patientResults.length > 0 ? (
                    patientResults.map((p: any) => (
                      <button
                        type="button"
                        key={p._id}
                        onClick={() => setSelectedPatient(p)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-slate-700">
                          {p.firstname} {p.lastname}
                        </p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 px-3 py-3">No patients found.</p>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>First Name</label>
                  <input
                    required
                    value={newPatient.firstname}
                    onChange={(e) =>
                      setNewPatient((f) => ({ ...f, firstname: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Last Name</label>
                  <input
                    required
                    value={newPatient.lastname}
                    onChange={(e) =>
                      setNewPatient((f) => ({ ...f, lastname: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>Date of Birth</label>
                <DatePicker
                  onChange={setNewPatientDob}
                  value={newPatientDob}
                  maxDate={new Date()}
                  format="dd-MM-yyyy"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Gender</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient((f) => ({ ...f, gender: e.target.value }))}
                  className={INPUT_CLASS}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Email</label>
                <input
                  type="email"
                  required
                  value={newPatient.email}
                  onChange={(e) => setNewPatient((f) => ({ ...f, email: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Phone</label>
                <input
                  required
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient((f) => ({ ...f, phone: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Address</label>
                <input
                  required
                  value={newPatient.address}
                  onChange={(e) => setNewPatient((f) => ({ ...f, address: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>City</label>
                  <input
                    required
                    value={newPatient.city}
                    onChange={(e) => setNewPatient((f) => ({ ...f, city: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Country</label>
                  <input
                    required
                    value={newPatient.country}
                    onChange={(e) =>
                      setNewPatient((f) => ({ ...f, country: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h6 className="text-slate-800 text-md md:text-lg font-semibold mb-4">
            Test Details
          </h6>
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLASS}>Test Title</label>
              <input
                required
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. Routine Checkup Panel"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Nature of Specimen</label>
              <input
                value={specimen}
                onChange={(e) => setSpecimen(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Clinical Address</label>
              <input
                value={clinicalAddress}
                onChange={(e) => setClinicalAddress(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Clinical Diagnosis</label>
              <input
                value={clinicalDiagnosis}
                onChange={(e) => setClinicalDiagnosis(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        <button
          disabled={submitting || selected.length === 0}
          className="w-full inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-3 transition-colors"
        >
          {submitting ? "Creating Order..." : `Create Order · ${formatCurrency(totalCost)}`}
        </button>
      </div>
    </form>
  );
}
