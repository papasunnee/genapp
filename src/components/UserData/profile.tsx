"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import { useSession } from "next-auth/react";
import { fetcher } from "@/utils/fetcher";
import { getAge, resizeImageToDataUrl } from "@/utils/functions";
import { toast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

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

export default function Profile() {
  const { data: sessionData }: any = useSession();
  const userId = sessionData?.user?._id;
  const { data: userData, isLoading, mutate }: any = useSWR(
    userId ? `/api/users?id=${userId}` : null,
    fetcher
  );
  const user = userData?.data;

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(EMPTY_PROFILE_FORM);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);

  const openEdit = () => {
    setForm({
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      phone: user?.phone || "",
      gender: user?.gender || "Male",
      address: user?.address || "",
      city: user?.city || "",
      country: user?.country || "",
      description: user?.description || "",
    });
    setEditOpen(true);
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
        setEditOpen(false);
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
        setPasswordOpen(false);
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

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-8">
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

        <div className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-slate-800">
                {user?.firstname} {user?.lastname}
              </h3>
              <div className="text-sm text-slate-400 mt-1">
                <i className="fas fa-user-shield mr-1"></i>
                {user?.role?.name}
              </div>
            </>
          )}
        </div>

        {!isLoading && (
          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={openEdit}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Edit Profile
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setPasswordOpen(true)}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Change Password
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3 text-sm max-w-sm mx-auto">
          <div className="flex items-center text-slate-600">
            <i className="fas fa-child mr-3 text-slate-400 w-4"></i>
            {isLoading ? (
              <Skeleton className="h-3 w-32" />
            ) : (
              `${getAge(user?.dob)} · ${user?.gender || "-"}`
            )}
          </div>
          <div className="flex items-center text-slate-600">
            <i className="fas fa-envelope mr-3 text-slate-400 w-4"></i>
            {isLoading ? <Skeleton className="h-3 w-36" /> : user?.email || "-"}
          </div>
          <div className="flex items-center text-slate-600">
            <i className="fas fa-phone mr-3 text-slate-400 w-4"></i>
            {isLoading ? <Skeleton className="h-3 w-28" /> : user?.phone || "-"}
          </div>
          {!isLoading && (user?.address || user?.city || user?.country) && (
            <div className="flex items-center text-slate-600">
              <i className="fas fa-map-marker-alt mr-3 text-slate-400 w-4"></i>
              {[user?.address, user?.city, user?.country].filter(Boolean).join(", ")}
            </div>
          )}
          {!isLoading && user?.createdAt && (
            <div className="flex items-center text-slate-600">
              <i className="fas fa-calendar mr-3 text-slate-400 w-4"></i>
              Member since {moment(user.createdAt).format("MMMM YYYY")}
            </div>
          )}
        </div>

        {user?.description && (
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm leading-relaxed text-slate-600 max-w-md mx-auto">
              {user.description}
            </p>
          </div>
        )}
      </div>

      <Modal open={editOpen} title="Edit Profile" onClose={() => setEditOpen(false)}>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>First Name</label>
              <input
                required
                value={form.firstname}
                onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Last Name</label>
              <input
                required
                value={form.lastname}
                onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Gender</label>
              <select
                value={form.gender}
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
            <label className={LABEL_CLASS}>Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>City</label>
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>About</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <button
              disabled={saving}
              className="mt-4 w-full inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={passwordOpen}
        title="Change Password"
        onClose={() => setPasswordOpen(false)}
        size="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Current Password</label>
            <input
              type="password"
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
              type="password"
              required
              minLength={6}
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
              type="password"
              required
              minLength={6}
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <button
              disabled={changingPassword}
              className="mt-4 w-full inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition-colors"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
