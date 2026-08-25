"use client";

import { useEffect, useState } from "react";
import { savedAddresses, type SavedAddress } from "@/lib/account";

const TYPES = ["Home", "Work", "Other"];

const PINCODES: Record<string, { city: string; state: string }> = {
  "226010": { city: "Lucknow", state: "Uttar Pradesh" },
  "226003": { city: "Lucknow", state: "Uttar Pradesh" },
  "412207": { city: "Pune", state: "Maharashtra" },
  "560038": { city: "Bengaluru", state: "Karnataka" },
  "110024": { city: "New Delhi", state: "Delhi" },
};

const ADDRESS_KEY = "printengine.addresses";

export default function AddressesView() {
  const [list, setList] = useState<SavedAddress[]>(savedAddresses);
  const [hydrated, setHydrated] = useState(false);

  // Saved addresses live in localStorage, readable only after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADDRESS_KEY);
      if (raw) setList(JSON.parse(raw) as SavedAddress[]);
    } catch {
      // keep the defaults
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ADDRESS_KEY, JSON.stringify(list));
    } catch {
      // storage unavailable
    }
  }, [list, hydrated]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    pincode: "",
    line1: "",
    line2: "",
    landmark: "",
    label: "Home",
    makeDefault: false,
  });
  const [error, setError] = useState<string | null>(null);

  const resolved = PINCODES[form.pincode.trim()] ?? null;

  const setDefault = (id: string) =>
    setList((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));

  const remove = (id: string) => setList((prev) => prev.filter((a) => a.id !== id));

  const save = () => {
    if (!form.name.trim() || !form.line1.trim()) {
      setError("Enter a name and a building or flat.");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }
    if (!resolved) {
      setError("We do not deliver to that pincode yet.");
      return;
    }
    const id = "ad" + (list.length + 1);
    const next: SavedAddress = {
      id,
      label: form.label,
      name: form.name,
      line1: form.line1,
      line2: [form.line2, form.landmark].filter(Boolean).join(", "),
      city: resolved.city,
      state: resolved.state,
      pincode: form.pincode.trim(),
      phone: form.phone || "+91 00000 00000",
      isDefault: form.makeDefault,
    };
    setList((prev) =>
      form.makeDefault
        ? [...prev.map((a) => ({ ...a, isDefault: false })), next]
        : [...prev, next]
    );
    setForm({
      name: "",
      phone: "",
      pincode: "",
      line1: "",
      line2: "",
      landmark: "",
      label: "Home",
      makeDefault: false,
    });
    setError(null);
    setOpen(false);
  };

  const field =
    "h-11 w-full border border-line bg-white px-3 text-[14px] focus:border-ink focus:outline-none";

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {list.length} saved addresses
      </p>

      <ul className="grid gap-5 lg:grid-cols-2">
        {list.map((a) => (
          <li
            key={a.id}
            className={"border p-5 " + (a.isDefault ? "border-2 border-lime" : "border-line")}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-medium">{a.label}</p>
              {a.isDefault && (
                <span className="bg-lime px-2 py-0.5 text-[11px] font-medium text-ink">
                  Default
                </span>
              )}
            </div>
            <p className="mt-3 text-[14px]">{a.name}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">
              {a.line1}
              <br />
              {a.line2}
              <br />
              {a.city}, {a.state} {a.pincode}
            </p>
            <p className="mt-3 text-[14px] text-muted">{a.phone}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4 text-[13px]">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    name: a.name,
                    phone: a.phone,
                    pincode: a.pincode,
                    line1: a.line1,
                    line2: a.line2,
                    landmark: "",
                    label: a.label,
                    makeDefault: a.isDefault,
                  });
                  setList((prev) => prev.filter((x) => x.id !== a.id));
                  setOpen(true);
                }}
                className="underline underline-offset-4"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="underline underline-offset-4"
              >
                Delete
              </button>
              {!a.isDefault && (
                <button
                  type="button"
                  onClick={() => setDefault(a.id)}
                  className="ml-auto underline underline-offset-4"
                >
                  Set as default
                </button>
              )}
            </div>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 border border-dashed border-muted p-5 transition-colors hover:border-ink"
          >
            <span className="text-[24px] leading-none" aria-hidden>
              +
            </span>
            <span className="text-[14px]">Add a new address</span>
          </button>
        </li>
      </ul>

      {open && (
        <section className="mt-8 border border-line bg-alt p-5 lg:p-6">
          <h2 className="text-[16px] font-medium">Add a new address</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[13px] text-muted">Full name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={field}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-muted">Phone number</span>
              <input
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={field}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] text-muted">Pincode</span>
              <input
                inputMode="numeric"
                value={form.pincode}
                onChange={(e) => {
                  setForm({ ...form, pincode: e.target.value });
                  if (error) setError(null);
                }}
                className={field}
              />
              <span className="mt-1.5 block text-[12px] text-muted">
                City and state fill in automatically
              </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-[13px] text-muted">City</span>
                <input readOnly value={resolved?.city ?? ""} className={field + " bg-alt text-muted"} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] text-muted">State</span>
                <input readOnly value={resolved?.state ?? ""} className={field + " bg-alt text-muted"} />
              </label>
            </div>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[13px] text-muted">Flat, house or building</span>
              <input
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                className={field}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[13px] text-muted">Area, street or locality</span>
              <input
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                className={field}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[13px] text-muted">Landmark (optional)</span>
              <input
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                className={field}
              />
            </label>
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-[13px] text-muted">Address type</span>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={form.label === t}
                  onClick={() => setForm({ ...form, label: t })}
                  className={
                    "border px-4 py-2 text-[13px] transition-colors " +
                    (form.label === t
                      ? "border-lime bg-lime text-ink"
                      : "border-line bg-white hover:border-ink")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.makeDefault}
              onChange={() => setForm({ ...form, makeDefault: !form.makeDefault })}
              className="sr-only"
            />
            <span
              aria-hidden
              className={
                "flex h-4 w-4 items-center justify-center border " +
                (form.makeDefault ? "border-ink bg-ink" : "border-muted bg-white")
              }
            >
              {form.makeDefault && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
                  <path d="M2 6l3 3 5-6" fill="none" stroke="#b8f20a" strokeWidth="2" />
                </svg>
              )}
            </span>
            <span className="text-[14px]">Make this my default address</span>
          </label>

          {error && <p className="mt-3 text-[13px] text-[#a32d2d]">{error}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={save} className="h-11 bg-ink px-6 text-btn text-white">
              Save address
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="h-11 border border-ink px-6 text-btn"
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </>
  );
}
