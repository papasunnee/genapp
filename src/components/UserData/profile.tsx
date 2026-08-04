"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import { useSession } from "next-auth/react";
import { fetcher } from "@/utils/fetcher";
import { getAge, resizeImageToDataUrl } from "@/utils/functions";
import { toast } from "@/components/ui/Toast";
import Skeleton from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500";
const LABEL_CLASS = "block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1";
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

const EMPTY_PROFILE_FORM = {
  firstname: "",
  lastname: "",
  phone: "",
  gender: "Male",
  address: "",
  city: "",
  country: "",
  description: "",
};

const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type Tab = "profile" | "security";

function fieldsFromUser(user: any) {
  return {
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    phone: user?.phone || "",
    gender: user?.gender || "Male",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
    description: user?.description || "",
  };
}

export default function Profile() {
  const { data: sessionData }: any = useSession();
  const userId = sessionData?.user?._id;
  const { data: userData, isLoading, mutate }: any = useSWR(
    userId ? `/api/users?id=${userId}` : null,
    fetcher
  );
  const user = userData?.data;

  const [tab, setTab] = useState<Tab>("profile");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(EMPTY_PROFILE_FORM);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);

  const startEditing = () => {
    setForm(fieldsFromUser(user));
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Profile updated");
        setEditing(false);
        mutate();
      } else {
        toast.error(json.error || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Password changed");
        setPasswordForm(EMPTY_PASSWORD_FORM);
      } else {
        toast.error(json.error || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setChangingPassword(false);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Image is too large - please choose a file under 15MB");
      return;
    }
    setUploadingPhoto(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, type: "avatar" }),
      });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) {
        toast.error(uploadJson.error || "Failed to upload photo");
        setUploadingPhoto(false);
        return;
      }

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: uploadJson.data.url }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Photo updated");
        mutate();
      } else {
        toast.error(json.error || "Failed to update photo");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setUploadingPhoto(false);
  };

  const passwordCriteria = [
    { label: "At least 6 characters", met: passwordForm.newPassword.length >= 6 },
    {
      label: "Matches confirmation",
      met:
        passwordForm.newPassword.length > 0 &&
        passwordForm.newPassword === passwordForm.confirmPassword,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left: identity summary card */}
      <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
              <Avatar
                firstname={user?.firstname}
                lastname={user?.lastname}
                imageUrl={user?.image_url}
                size="xl"
              />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              title="Change photo"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white flex items-center justify-center shadow-md transition-colors"
            >
              <i
                className={`fas ${uploadingPhoto ? "fa-spinner fa-spin" : "fa-camera"} text-xs`}
              ></i>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900">
              {user?.firstname} {user?.lastname}
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full mt-2">
              <i className="fas fa-user-shield"></i>
              {user?.role?.name}
            </span>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm text-left">
          <div className="flex items-center text-slate-600">
            <i className="fas fa-envelope mr-3 text-slate-400 w-4 flex-shrink-0"></i>
            <span className="truncate">{isLoading ? "" : user?.email || "-"}</span>
          </div>
          <div className="flex items-center text-slate-600">
            <i className="fas fa-phone mr-3 text-slate-400 w-4 flex-shrink-0"></i>
            {isLoading ? <Skeleton className="h-3 w-28" /> : user?.phone || "-"}
          </div>
          <div className="flex items-center text-slate-600">
            <i className="fas fa-child mr-3 text-slate-400 w-4 flex-shrink-0"></i>
            {isLoading ? <Skeleton className="h-3 w-32" /> : `${getAge(user?.dob)} · ${user?.gender || "-"}`}
          </div>
          {!isLoading && (user?.address || user?.city || user?.country) && (
            <div className="flex items-start text-slate-600">
              <i className="fas fa-map-marker-alt mr-3 text-slate-400 w-4 flex-shrink-0 mt-0.5"></i>
              <span>{[user?.address, user?.city, user?.country].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {!isLoading && user?.createdAt && (
            <div className="flex items-center text-slate-600">
              <i className="fas fa-calendar mr-3 text-slate-400 w-4 flex-shrink-0"></i>
              Member since {moment(user.createdAt).format("MMMM YYYY")}
            </div>
          )}
        </div>

        {!isLoading && user?.description && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-left">
            <p className={LABEL_CLASS}>About</p>
            <p className="text-sm leading-relaxed text-slate-600">{user.description}</p>
          </div>
        )}
      </div>

      {/* Right: tabbed content */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-100 px-6">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`py-4 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors ${
              tab === "profile"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <i className="fas fa-id-card mr-1.5"></i>
            Profile Information
          </button>
          <button
            type="button"
            onClick={() => setTab("security")}
            className={`py-4 px-1 text-sm font-semibold border-b-2 transition-colors ${
              tab === "security"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <i className="fas fa-lock mr-1.5"></i>
            Security
          </button>
        </div>

        {tab === "profile" && (
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {editing
                      ? "Update your details below."
                      : "Your personal details, visible to admins in your organization."}
                  </p>
                  {!editing && (
                    <button
                      type="button"
                      onClick={startEditing}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors flex-shrink-0"
                    >
                      <i className="fas fa-pen text-xs"></i>
                      Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>First Name</label>
                    <input
                      required
                      maxLength={60}
                      disabled={!editing}
                      value={editing ? form.firstname : user?.firstname || ""}
                      onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Last Name</label>
                    <input
                      required
                      maxLength={60}
                      disabled={!editing}
                      value={editing ? form.lastname : user?.lastname || ""}
                      onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Phone</label>
                    <input
                      pattern="[0-9]{11}"
                      title="11-digit phone number"
                      disabled={!editing}
                      value={editing ? form.phone : user?.phone || ""}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Gender</label>
                    <select
                      disabled={!editing}
                      value={editing ? form.gender : user?.gender || "Male"}
                      onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                      className={INPUT_CLASS}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Non-binary">Non-binary/non-conforming</option>
                      <option value="Prefer not to say">Prefer not to respond</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Email</label>
                  <input
                    disabled
                    value={user?.email || ""}
                    className={INPUT_CLASS}
                    title="Contact an admin to change your email"
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Address</label>
                  <input
                    disabled={!editing}
                    value={editing ? form.address : user?.address || ""}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>City</label>
                    <input
                      disabled={!editing}
                      value={editing ? form.city : user?.city || ""}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Country</label>
                    <input
                      disabled={!editing}
                      value={editing ? form.country : user?.country || ""}
                      onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>About</label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    disabled={!editing}
                    value={editing ? form.description : user?.description || ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  {editing && (
                    <p className="text-xs text-slate-400 mt-1 text-right">
                      {form.description.length}/500
                    </p>
                  )}
                </div>

                {editing && (
                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                    >
                      {saving && <i className="fas fa-spinner fa-spin"></i>}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {tab === "security" && (
          <div className="p-6 max-w-sm">
            <p className="text-sm text-slate-500 mb-5">
              Choose a password you don&apos;t use anywhere else.
            </p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>Current Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  minLength={6}
                  maxLength={128}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Confirm New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  minLength={6}
                  maxLength={128}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  className={INPUT_CLASS}
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                />
                Show passwords
              </label>

              {passwordForm.newPassword && (
                <ul className="space-y-1">
                  {passwordCriteria.map((c) => (
                    <li
                      key={c.label}
                      className={`text-xs flex items-center gap-1.5 ${
                        c.met ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      <i className={`fas ${c.met ? "fa-check-circle" : "fa-circle"} text-[10px]`}></i>
                      {c.label}
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                >
                  {changingPassword && <i className="fas fa-spinner fa-spin"></i>}
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
