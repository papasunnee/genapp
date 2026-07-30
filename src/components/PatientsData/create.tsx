"use client";

import React, { useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { toast } from "react-toastify";
import DatePicker from "react-date-picker";
import { fetcher } from "@/utils/fetcher";

// components

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
    // const dob = dobRef.current.value;
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
        toast.success("🦄 New Patient successfully created");
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
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-slate-100 border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-slate-700 text-md md:text-lg font-semibold">
              New Patient
            </h6>
            <Link href="/admin/patients" legacyBehavior>
              <a
                className="bg-slate-700 active:bg-slate-600 text-white text-md font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 space-x-1"
                type="button"
              >
                <i className="fas fa-list"></i>
                <span className="hidden sm:inline-block">Patients List</span>
              </a>
            </Link>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleSubmit}>
            <h6 className="text-slate-400 text-sm mt-3 mb-6 font-bold uppercase">
              User Information
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    ref={firstnameRef}
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    ref={lastnameRef}
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-dob"
                  >
                    Date of Birth
                  </label>
                  {/* <input
                    type="date"
                    ref={dobRef}
                    max={new Date()}
                    required
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  /> */}
                  <DatePicker
                    onChange={onChange}
                    value={dob}
                    maxDate={new Date()}
                    required
                    format="dd-MM-yyyy"
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-gender"
                  >
                    GENDER
                  </label>
                  <select
                    ref={genderRef}
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-slate-300" />

            <h6 className="text-slate-400 text-sm mt-3 mb-6 font-bold uppercase">
              Contact Information
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-address"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    ref={addressRef}
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    ref={emailRef}
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-phone-number"
                  >
                    Phone Number{" "}
                    <small className="text-slate-400 lowercase">
                      <i>eg. 08023454545</i>
                    </small>
                  </label>
                  <input
                    type="tel"
                    pattern="[0-9]{11}"
                    ref={phoneRef}
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-city"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    ref={cityRef}
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-country"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    ref={countryRef}
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-slate-300" />

            <h6 className="text-slate-400 text-sm mt-3 mb-6 font-bold uppercase">
              Patient Additional Info
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-slate-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    About Patient
                  </label>
                  <textarea
                    ref={descriptionRef}
                    className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    rows={4}
                  ></textarea>
                  <hr className="my-6 border-b-1 border-slate-300" />
                  <div className="text-center flex justify-between">
                    <button
                      disabled={loading}
                      className="bg-slate-700 active:bg-slate-600 disabled:bg-slate-400 text-white font-bold uppercase text-xs p-4 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 flex-grow"
                    >
                      {loading && (
                        <svg
                          aria-hidden="true"
                          role="status"
                          className="inline w-4 h-4 mr-3 text-white animate-spin"
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
                      CREATE PATIENT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
