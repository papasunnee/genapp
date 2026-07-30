"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";

type ResultType = "numeric" | "text";
type ParamRow = {
  id: string;
  name: string;
  resultType: ResultType;
  unit: string;
  range: string;
  cost: number;
};
type SectionRow = { name: string; parameters: ParamRow[] };
type FormState = {
  name: string;
  grouped: boolean;
  parameters: ParamRow[];
  types: SectionRow[];
};

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `p_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function emptyParam(): ParamRow {
  return { id: newId(), name: "", resultType: "numeric", unit: "", range: "", cost: 0 };
}

function emptyForm(): FormState {
  return { name: "", grouped: false, parameters: [emptyParam()], types: [] };
}

function categoryToForm(category: any): FormState {
  const grouped = category.nest === 2;
  const toRow = (p: any): ParamRow => ({
    id: p.id ?? newId(),
    name: p.name,
    resultType: p.resultType === "text" ? "text" : "numeric",
    unit: Array.isArray(p.unit) ? p.unit.join(", ") : "",
    range: p.range ?? "",
    cost: p.cost ?? 0,
  });
  return {
    name: category.name ?? "",
    grouped,
    parameters: grouped ? [] : (category.parameters ?? []).map(toRow),
    types: grouped
      ? (category.type ?? []).map((t: any) => ({
          name: t.name,
          parameters: (t.parameters ?? []).map(toRow),
        }))
      : [],
  };
}

function formToPayload(form: FormState) {
  const toParam = (p: ParamRow) => ({
    id: p.id,
    nested: false,
    name: p.name,
    resultType: p.resultType,
    unit:
      p.resultType === "text"
        ? []
        : p.unit.split(",").map((u) => u.trim()).filter(Boolean),
    range: p.resultType === "text" ? "" : p.range,
    value: "",
    checked: false,
    cost: p.cost,
  });

  if (form.grouped) {
    return {
      name: form.name,
      discrete: true,
      nest: 2,
      type: form.types.map((t) => ({
        name: t.name,
        parameters: t.parameters.map(toParam),
      })),
    };
  }
  return {
    name: form.name,
    discrete: form.parameters.length > 1,
    nest: 0,
    parameters: form.parameters.map(toParam),
  };
}

const FIELD_LABEL_CLASS = "text-xs font-semibold text-gray-500 uppercase";

/* ---------- Parameter editor table ---------- */

function ParameterTable({
  parameters,
  onChange,
  onRemove,
}: {
  parameters: ParamRow[];
  onChange: (index: number, field: keyof ParamRow, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      {parameters.map((p, i) => (
        <div key={p.id} className="border rounded p-2 bg-gray-50">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={p.name}
              onChange={(e) => onChange(i, "name", e.target.value)}
              placeholder="Test name, e.g. Sodium"
              className="border rounded px-2 py-1 flex-grow"
            />
            <select
              value={p.resultType}
              onChange={(e) => onChange(i, "resultType", e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              title="How should the technologist enter this result?"
            >
              <option value="numeric">Numeric</option>
              <option value="text">Text notes</option>
            </select>
            <input
              type="number"
              value={p.cost}
              onChange={(e) => onChange(i, "cost", e.target.value)}
              placeholder="Cost"
              className="border rounded px-2 py-1 w-24"
              title="Cost (NGN)"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              title="Remove this test"
              className="text-red-600 hover:text-red-800 text-sm px-1"
            >
              ✕
            </button>
          </div>

          <div
            className={`grid transition-all duration-200 ease-in-out ${
              p.resultType === "numeric" ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={p.unit}
                  onChange={(e) => onChange(i, "unit", e.target.value)}
                  placeholder="Unit, e.g. mmol/L"
                  title="Comma-separate multiple units, e.g. mmHg, kPa"
                  className="border rounded px-2 py-1 flex-grow text-sm"
                />
                <input
                  type="text"
                  value={p.range}
                  onChange={(e) => onChange(i, "range", e.target.value)}
                  placeholder="Reference range, e.g. 135–145"
                  className="border rounded px-2 py-1 flex-grow text-sm"
                />
              </div>
            </div>
          </div>
          {p.resultType === "text" && (
            <p className="text-xs text-gray-500 mt-1">
              Technologist will write free-text findings - no unit or numeric
              range needed (e.g. ultrasound analysis).
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- Create/edit form ---------- */

function CategoryForm({
  initial,
  submitLabel,
  loading,
  onSubmit,
}: {
  initial: FormState;
  submitLabel: string;
  loading: boolean;
  onSubmit: (form: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const updateParam = (index: number, field: keyof ParamRow, value: string) => {
    setForm((f) => ({
      ...f,
      parameters: f.parameters.map((p, i) =>
        i === index ? { ...p, [field]: field === "cost" ? Number(value) || 0 : value } : p
      ),
    }));
  };

  const updateTypeParam = (
    typeIndex: number,
    paramIndex: number,
    field: keyof ParamRow,
    value: string
  ) => {
    setForm((f) => ({
      ...f,
      types: f.types.map((t, ti) =>
        ti !== typeIndex
          ? t
          : {
              ...t,
              parameters: t.parameters.map((p, pi) =>
                pi === paramIndex
                  ? { ...p, [field]: field === "cost" ? Number(value) || 0 : value }
                  : p
              ),
            }
      ),
    }));
  };

  const totalTests = form.grouped
    ? form.types.reduce((sum, t) => sum + t.parameters.length, 0)
    : form.parameters.length;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div className="flex-grow max-w-sm">
          <label className={FIELD_LABEL_CLASS}>Category name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="border rounded px-2 py-1 w-full mt-1"
            placeholder="e.g. Chemistry"
          />
        </div>
        <div className="text-sm text-gray-500">{totalTests} test(s)</div>
      </div>

      <label className="flex items-start space-x-2 text-sm bg-gray-50 border rounded p-2">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={form.grouped}
          onChange={(e) => {
            const grouped = e.target.checked;
            setForm((f) => ({
              ...f,
              grouped,
              types:
                grouped && f.types.length === 0
                  ? [{ name: "", parameters: [emptyParam()] }]
                  : f.types,
              parameters:
                !grouped && f.parameters.length === 0 ? [emptyParam()] : f.parameters,
            }));
          }}
        />
        <span>
          Organize into sub-sections. Turn this on for categories like{" "}
          <strong>Chemistry</strong>, which groups tests under headings like{" "}
          <em>Renal</em> or <em>Liver</em>. Leave it off for a simple flat
          list of tests (most categories).
        </span>
      </label>

      {!form.grouped && (
        <div>
          <ParameterTable
            parameters={form.parameters}
            onChange={updateParam}
            onRemove={(i) =>
              setForm((f) => ({ ...f, parameters: f.parameters.filter((_, idx) => idx !== i) }))
            }
          />
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, parameters: [...f.parameters, emptyParam()] }))
            }
            className="mt-2 text-blue-600 text-sm underline"
          >
            + Add test
          </button>
        </div>
      )}

      {form.grouped && (
        <div className="space-y-4">
          {form.types.map((t, ti) => (
            <div key={ti} className="border rounded p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      types: f.types.map((tt, i) =>
                        i === ti ? { ...tt, name: e.target.value } : tt
                      ),
                    }))
                  }
                  placeholder="Sub-section name, e.g. Renal/Electrolyte"
                  className="border rounded px-2 py-1 font-medium flex-grow mr-2"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, types: f.types.filter((_, i) => i !== ti) }))
                  }
                  className="text-red-600 text-sm underline whitespace-nowrap"
                >
                  Remove sub-section
                </button>
              </div>
              <ParameterTable
                parameters={t.parameters}
                onChange={(pi, field, value) => updateTypeParam(ti, pi, field, value)}
                onRemove={(pi) =>
                  setForm((f) => ({
                    ...f,
                    types: f.types.map((tt, i) =>
                      i === ti
                        ? { ...tt, parameters: tt.parameters.filter((_, idx) => idx !== pi) }
                        : tt
                    ),
                  }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    types: f.types.map((tt, i) =>
                      i === ti ? { ...tt, parameters: [...tt.parameters, emptyParam()] } : tt
                    ),
                  }))
                }
                className="mt-2 text-blue-600 text-sm underline"
              >
                + Add test to this sub-section
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                types: [...f.types, { name: "", parameters: [emptyParam()] }],
              }))
            }
            className="text-blue-600 text-sm underline"
          >
            + Add sub-section
          </button>
        </div>
      )}

      <div className="pt-2 border-t">
        <button
          type="button"
          disabled={loading || !form.name.trim()}
          onClick={() => onSubmit(form)}
          className="mt-3 bg-emerald-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

/* ---------- Accordion category card (read view) ---------- */

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const grouped = category.nest === 2;
  const testCount = grouped
    ? (category.type ?? []).reduce((s: number, t: any) => s + (t.parameters?.length ?? 0), 0)
    : category.parameters?.length ?? 0;

  const renderParam = (p: any) => (
    <div key={p.id} className="flex items-center justify-between text-sm py-1 border-b last:border-b-0">
      <span>{p.name}</span>
      <span className="text-gray-500 text-xs">
        {p.resultType === "text"
          ? "Text notes"
          : [p.unit?.join(", "), p.range && `range ${p.range}`].filter(Boolean).join(" · ") ||
            "Numeric"}{" "}
        · NGN {p.cost}
      </span>
    </div>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center space-x-2 flex-grow text-left"
        >
          <i
            className={`fas fa-chevron-right text-xs text-gray-400 transition-transform duration-200 ${
              expanded ? "rotate-90" : ""
            }`}
          ></i>
          <span className="font-semibold">{category.name}</span>
          <span className="text-xs text-gray-500">
            {testCount} test{testCount === 1 ? "" : "s"}
            {grouped ? ` · ${category.type?.length ?? 0} sub-sections` : ""}
          </span>
        </button>
        <div className="space-x-3 flex-shrink-0">
          <button onClick={onEdit} className="text-blue-600 text-sm underline">
            Edit
          </button>
          <button onClick={onDelete} className="text-red-600 text-sm underline">
            Delete
          </button>
        </div>
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-3 border-t bg-gray-50">
            {grouped
              ? (category.type ?? []).map((t: any, ti: number) => (
                  <div key={ti} className="mb-3 last:mb-0">
                    <div className="text-xs font-semibold uppercase text-gray-500 mb-1">
                      {t.name}
                    </div>
                    {(t.parameters ?? []).map(renderParam)}
                  </div>
                ))
              : (category.parameters ?? []).map(renderParam)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main component ---------- */

export default function TestCatalogData() {
  const { data, mutate }: any = useSWR("/api/test-catalog", fetcher);
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; category: any }>(
    null
  );
  const [loading, setLoading] = useState(false);

  const categories = data?.data ?? [];

  const handleCreate = async (form: FormState) => {
    setLoading(true);
    try {
      const res = await fetch("/api/test-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Category created");
        setModal(null);
        mutate();
      } else {
        toast.error(json.error || "Failed to create category");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string, form: FormState) => {
    setLoading(true);
    try {
      const res = await fetch("/api/test-catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formToPayload(form), put_id: id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Category updated");
        setModal(null);
        mutate();
      } else {
        toast.error(json.error || "Failed to update category");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirmDialog({
      title: "Delete category",
      message: `Delete "${name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed) return;
    try {
      const res = await fetch("/api/test-catalog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_id: id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Category deleted");
        mutate();
      } else {
        toast.error(json.error || "Failed to delete category");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold mb-1">Test Catalog</h2>
          <p className="text-sm text-gray-600">
            The tests your lab offers: cost, unit, and normal reference
            range for numeric tests, or free-text notes for tests like
            ultrasound that need a technologist&apos;s written analysis.
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm whitespace-nowrap transition-colors self-start"
        >
          + Add Category
        </button>
      </div>

      <div className="space-y-3">
        {categories.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No categories yet - loading defaults, or add your first one above.
          </p>
        )}
        {categories.map((category: any) => (
          <CategoryCard
            key={category._id}
            category={category}
            onEdit={() => setModal({ mode: "edit", category })}
            onDelete={() => handleDelete(category._id, category.name)}
          />
        ))}
      </div>

      <Modal
        open={modal !== null}
        title={modal?.mode === "edit" ? `Edit ${modal.category.name}` : "Add Category"}
        onClose={() => setModal(null)}
      >
        {modal?.mode === "edit" && (
          <CategoryForm
            key={modal.category._id}
            initial={categoryToForm(modal.category)}
            submitLabel="Save Changes"
            loading={loading}
            onSubmit={(form) => handleUpdate(modal.category._id, form)}
          />
        )}
        {modal?.mode === "create" && (
          <CategoryForm
            initial={emptyForm()}
            submitLabel="Create Category"
            loading={loading}
            onSubmit={handleCreate}
          />
        )}
      </Modal>
    </div>
  );
}
