"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { resizeImageToDataUrl } from "@/utils/functions";
import { toast } from "@/components/ui/Toast";
import Skeleton from "@/components/ui/Skeleton";
import UpgradeNotice from "@/components/ui/UpgradeNotice";
import { TABLE_CARD_CLASS, TABLE_HEADER_CLASS } from "@/components/ui/table";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

const EMPTY_FORM = {
  logo: "",
  tagline: "",
  address: "",
  phone: "",
  contactEmail: "",
};

export default function OrgBranding() {
  const { data, isLoading, mutate }: any = useSWR("/api/organization/branding", fetcher);
  const { data: planData }: any = useSWR("/api/organization/plan", fetcher);
  const canEditBranding = planData?.data?.limits?.branding ?? true;
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data?.data) {
      setForm({
        logo: data.data.logo || "",
        tagline: data.data.tagline || "",
        address: data.data.address || "",
        phone: data.data.phone || "",
        contactEmail: data.data.contactEmail || "",
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image is too large - please choose a file under 15MB");
      return;
    }
    setUploadingLogo(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 240);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, type: "logo" }),
      });
      const json = await res.json();
      if (json.success) {
        setForm((prev) => ({ ...prev, logo: json.data.url }));
      } else {
        toast.error(json.error || "Failed to upload logo");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setUploadingLogo(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/organization/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Letterhead details saved");
        mutate();
      } else {
        toast.error(json.error || "Failed to save");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className={TABLE_CARD_CLASS}>
        <div className="px-6 py-8 space-y-4">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={TABLE_CARD_CLASS}>
      <div className={TABLE_HEADER_CLASS}>
        <h3 className="text-base font-semibold text-slate-800">Report Letterhead</h3>
        <p className="text-sm text-slate-500 mt-1">
          This appears on the header and footer of every printed test result.
        </p>
      </div>

      {!canEditBranding && (
        <div className="px-6 pt-4">
          <UpgradeNotice
            title="Letterhead branding is a Pro feature"
            message="Upgrade to Pro to set a logo, tagline, and contact details for your printed reports."
          />
        </div>
      )}

      <fieldset disabled={!canEditBranding} className="px-6 py-6 space-y-6 disabled:opacity-60">
        <div className="flex items-center gap-4">
          {form.logo ? (
            <img
              src={form.logo}
              alt="Organization logo"
              className="h-20 w-20 rounded-lg object-contain border border-slate-200 bg-white"
            />
          ) : (
            <div className="h-20 w-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
              <i className="fas fa-image text-2xl"></i>
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 transition-colors disabled:opacity-60"
            >
              <i className={`fas ${uploadingLogo ? "fa-spinner fa-spin" : "fa-upload"}`}></i>
              {uploadingLogo ? "Uploading..." : "Upload Logo"}
            </button>
            {form.logo && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, logo: "" }))}
                className="ml-3 text-sm font-semibold text-slate-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Tagline</label>
          <input
            name="tagline"
            value={form.tagline}
            onChange={handleChange}
            placeholder="...your health our priority"
            maxLength={150}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            placeholder="Street, City, State"
            maxLength={200}
            className={INPUT_CLASS}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234 803 000 0000"
              maxLength={60}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Contact Email</label>
            <input
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={handleChange}
              placeholder="labs@example.com"
              maxLength={100}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            {saving && <i className="fas fa-spinner fa-spin"></i>}
            {saving ? "Saving..." : "Save Letterhead"}
          </button>
        </div>
      </fieldset>
    </div>
  );
}
