"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import { fileToDataUrl } from "@/utils/functions";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import Skeleton from "@/components/ui/Skeleton";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function Documents({ id }: { id?: string }) {
  const { data: patientData, isLoading, mutate }: any = useSWR(
    `/api/patients?id=${id}`,
    fetcher
  );
  const documents: any[] = patientData?.data?.documents ?? [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!(file.type === "application/pdf" || file.type.startsWith("image/"))) {
      toast.error("Please select an image or PDF file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large - please choose a file under 10MB");
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, type: "document", name: file.name }),
      });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) {
        toast.error(uploadJson.error || "Upload failed");
        return;
      }

      const attachRes = await fetch(`/api/patients/${id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          url: uploadJson.data.url,
          publicId: uploadJson.data.publicId,
          resourceType: uploadJson.data.resourceType,
        }),
      });
      const attachJson = await attachRes.json();
      if (attachJson.success) {
        toast.success("Document uploaded");
        mutate();
      } else {
        toast.error(attachJson.error || "Failed to attach document");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setUploading(false);
  };

  const handleRemove = async (doc: any) => {
    const confirmed = await confirmDialog({
      title: "Remove document",
      message: `Remove "${doc.name}" from this patient's record? This can't be undone.`,
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed || removingId) return;

    setRemovingId(doc._id);
    try {
      const res = await fetch(`/api/patients/${id}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc._id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Document removed");
        mutate();
      } else {
        toast.error(json.error || "Failed to remove document");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setRemovingId(null);
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <h6 className="text-slate-800 text-sm font-semibold">Documents</h6>
          <p className="text-xs text-slate-400 mt-0.5">
            Consent forms, referral letters, and other attachments
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50"
          >
            <i className={`fas ${uploading ? "fa-spinner fa-spin" : "fa-upload"}`}></i>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : documents.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {documents.map((doc: any) => (
              <li key={doc._id} className="flex items-center justify-between gap-3 py-3">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 min-w-0 group"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <i
                      className={`fas ${
                        doc.resourceType === "raw" ? "fa-file-pdf" : "fa-file-image"
                      } text-slate-500`}
                    ></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-brand-600 group-hover:underline">
                      {doc.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {doc.uploadedByLabel ? `${doc.uploadedByLabel} · ` : ""}
                      {moment(doc.uploadedAt).format("Do MMM YYYY, h:mm a")}
                    </p>
                  </div>
                </a>
                <button
                  type="button"
                  onClick={() => handleRemove(doc)}
                  disabled={removingId === doc._id}
                  aria-label={`Remove ${doc.name}`}
                  className="flex-shrink-0 h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <i className={`fas ${removingId === doc._id ? "fa-spinner fa-spin" : "fa-trash-alt"} text-xs`}></i>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No documents attached yet.</p>
        )}
      </div>
    </div>
  );
}
