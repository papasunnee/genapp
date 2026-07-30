"use client";

import React, { useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";
import DatePicker from "react-date-picker";
import { fetcher } from "@/utils/fetcher";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

export default function Create() {
  const [loading, setLoading] = useState(false);
  const [dob, onChange] = useState<any>(new Date("1/1/2020"));
  const { mutate } = useSWR("/api/patients", fetcher);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const firstname = firstnameRef.current?.value;
    const lastname = lastnameRef.current?.value;
    const email = emailRef.current?.value;
    const address = addressRef.current?.value;
    const phone = phoneRef.current?.value;
    const city = cityRef.current?.value;
    const gender = genderRef.current?.value;
    const country = countryRef.current?.value;
    const description = descriptionRef.current?.value;

    try {
      const res = await fetch("/api/patients", {
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
        }),
      });
      const data = await res.json();
      if (data?.success) {
        mutate();
        if (firstnameRef.current) firstnameRef.current.value = "";
        if (lastnameRef.current) lastnameRef.current.value = "";
        if (emailRef.current) emailRef.current.value = "";
        if (addressRef.current) addressRef.current.value = "";
        if (phoneRef.current) phoneRef.current.value = "";
        if (cityRef.current) cityRef.current.value = "";
        if (countryRef.current) countryRef.current.value = "";
        if (descriptionRef.current) descriptionRef.current.value = "";
        onChange(new Date("1/1/2020"));
        toast.success("New patient created successfully");
      } else {
        if (data?.error?.includes("getaddrinfo ENOTFOUND")) {
          throw new Error(
            "Something went wrong, please check your internet connection!"
          );
        }

        throw new Error("Something went wrong, please try again!");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h6 className="text-slate-800 text-md md:text-lg font-semibold">
          New Patient
        </h6>
        <Link
          href="/admin/patients"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold uppercase px-4 py-2 rounded-lg transition-colors space-x-1"
        >
          <i className="fas fa-list"></i>
          <span className="hidden sm:inline-block">Patients List</span>
        </Link>
      </div>
      <div className="flex-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h6 className="text-slate-400 text-xs mb-4 font-semibold uppercase tracking-wide">
              Patient Information
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="patient-firstname">
                  First Name
                </label>
                <input
                  id="patient-firstname"
                  type="text"
                  required
                  ref={firstnameRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="patient-lastname">
                  Last Name
                </label>
                <input
                  id="patient-lastname"
                  type="text"
                  required
                  ref={lastnameRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="patient-dob">
                  Date of Birth
                </label>
                <DatePicker
                  onChange={onChange}
                  value={dob}
                  maxDate={new Date()}
                  required
                  format="dd-MM-yyyy"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="patient-gender">
                  Gender
                </label>
                <select
                  id="patient-gender"
                  ref={genderRef}
                  className={INPUT_CLASS}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Prefer not to say</option>
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
                <label className={LABEL_CLASS} htmlFor="patient-address">
                  Address
                </label>
                <input
                  id="patient-address"
                  type="text"
                  ref={addressRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="patient-email">
                  Email
                </label>
                <input
                  id="patient-email"
                  type="email"
                  ref={emailRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="patient-phone">
                  Phone Number{" "}
                  <span className="text-slate-400 font-normal normal-case">
                    (e.g. 08023454545)
                  </span>
                </label>
                <input
                  id="patient-phone"
                  type="tel"
                  pattern="[0-9]{11}"
                  ref={phoneRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="patient-city">
                  City
                </label>
                <input
                  id="patient-city"
                  type="text"
                  ref={cityRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="patient-country">
                  Country
                </label>
                <input
                  id="patient-country"
                  type="text"
                  ref={countryRef}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h6 className="text-slate-400 text-xs mb-4 font-semibold uppercase tracking-wide">
              Additional Info
            </h6>
            <label className={LABEL_CLASS} htmlFor="patient-description">
              About Patient
            </label>
            <textarea
              id="patient-description"
              ref={descriptionRef}
              className={INPUT_CLASS}
              rows={4}
            ></textarea>
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
              Create Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
