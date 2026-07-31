"use client";

import React, { useState, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";
import { toast } from "@/components/ui/Toast";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

export default function Create() {
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWR("/api/users", fetcher);
  const { data: roleData }: any = useSWR("/api/role", fetcher);
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const firstname = firstnameRef.current?.value;
    const lastname = lastnameRef.current?.value;
    const email = emailRef.current?.value.toString().toLowerCase();
    const dob = dobRef.current?.value;
    const address = addressRef.current?.value;
    const phone = phoneRef.current?.value;
    const city = cityRef.current?.value;
    const gender = genderRef.current?.value;
    const country = countryRef.current?.value;
    const description = descriptionRef.current?.value;
    const role = roleRef.current?.value;
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          dob,
          address,
          phone,
          city,
          country,
          description,
          gender,
          role,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        mutate();
        if (firstnameRef.current) firstnameRef.current.value = "";
        if (lastnameRef.current) lastnameRef.current.value = "";
        if (emailRef.current) emailRef.current.value = "";
        if (dobRef.current) dobRef.current.value = "";
        if (addressRef.current) addressRef.current.value = "";
        if (phoneRef.current) phoneRef.current.value = "";
        if (cityRef.current) cityRef.current.value = "";
        if (countryRef.current) countryRef.current.value = "";
        if (descriptionRef.current) descriptionRef.current.value = "";
        if (genderRef.current) genderRef.current.value = "Male";
        if (roleRef.current) roleRef.current.value = roleData?.data?.[0]?._id;
        toast.success("New staff member created successfully");
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      if (error.message.includes("dob")) {
        toast.error("Invalid Date of Birth");
      } else {
        toast.error("Error creating staff member");
      }
    }
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h6 className="text-slate-800 text-md md:text-lg font-semibold">
          New Staff
        </h6>
        <Link
          href="/admin/users"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold uppercase px-4 py-2 rounded-lg transition-colors"
        >
          Staff List
        </Link>
      </div>
      <div className="flex-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h6 className="text-slate-400 text-xs mb-4 font-semibold uppercase tracking-wide">
              Staff Information
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="staff-firstname">
                  First Name
                </label>
                <input
                  id="staff-firstname"
                  type="text"
                  required
                  ref={firstnameRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="staff-lastname">
                  Last Name
                </label>
                <input
                  id="staff-lastname"
                  type="text"
                  required
                  ref={lastnameRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="staff-dob">
                  Date of Birth
                </label>
                <input
                  id="staff-dob"
                  type="date"
                  ref={dobRef}
                  required
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="staff-email">
                  Email address
                </label>
                <input id="staff-email" type="email" ref={emailRef} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="staff-phone">
                  Phone Number{" "}
                  <span className="text-slate-400 font-normal normal-case">
                    (e.g. 08023454545)
                  </span>
                </label>
                <input
                  id="staff-phone"
                  type="tel"
                  pattern="[0-9]{11}"
                  ref={phoneRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="staff-gender">
                  Gender
                </label>
                <select id="staff-gender" ref={genderRef} className={INPUT_CLASS}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Non-binary">Non-binary/non-conforming</option>
                  <option value="Prefer not to say">Prefer not to respond</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h6 className="text-slate-400 text-xs mb-4 font-semibold uppercase tracking-wide">
              Contact Information
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={LABEL_CLASS} htmlFor="staff-address">
                  Address
                </label>
                <input id="staff-address" type="text" ref={addressRef} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="staff-city">
                  City
                </label>
                <input id="staff-city" type="text" ref={cityRef} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="staff-country">
                  Country
                </label>
                <input id="staff-country" type="text" ref={countryRef} className={INPUT_CLASS} />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h6 className="text-slate-400 text-xs mb-4 font-semibold uppercase tracking-wide">
              Additional Information
            </h6>
            <label className={LABEL_CLASS} htmlFor="staff-description">
              Description
            </label>
            <textarea
              id="staff-description"
              ref={descriptionRef}
              className={INPUT_CLASS}
              rows={4}
            ></textarea>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h6 className="text-slate-400 text-xs mb-4 font-semibold uppercase tracking-wide">
              Official Setting
            </h6>
            <label className={LABEL_CLASS} htmlFor="staff-role">
              Assign Role
            </label>
            <select id="staff-role" ref={roleRef} className={INPUT_CLASS}>
              {roleData?.data?.map((item: any, index: number) => (
                <option key={index} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              disabled={loading}
              className="mt-4 w-full inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition-colors"
            >
              {loading && (
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 mr-2 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              Create Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
