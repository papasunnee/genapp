"use client";

import React, { useRef, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

export default function CreateUserPage() {
  const { data, error } = useSWR("/api/role", fetcher);
  const emailRef = useRef<HTMLInputElement>(null);
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const cpasswordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const roleRef = useRef<HTMLSelectElement>(null);
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let email = emailRef.current?.value;
    let firstname = firstnameRef.current?.value;
    let lastname = lastnameRef.current?.value;
    let role = roleRef.current?.value;
    let password = passwordRef.current?.value;
    let cpassword = cpasswordRef.current?.value;
    setLoading(true);
    try {
      if (password != null && password != "" && password !== cpassword) {
        throw new Error("Password does not much");
      }
      const response = await fetch("/api/superadmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstname,
          lastname,
          role,
          password,
        }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error: any) {
      console.log(error.message);
    }
    setLoading(false);
  };
  return (
    <div className="max-w-lg w-full mx-auto my-5">
      <form className="space-y-2 border p-5">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-right">Email</label>
          <input
            type="email"
            ref={emailRef}
            className="border px-2 py-1 outline-none w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-right">Firstname</label>
          <input
            type="text"
            ref={firstnameRef}
            className="border px-2 py-1 outline-none w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-right">Lastname</label>
          <input
            type="text"
            ref={lastnameRef}
            className="border px-2 py-1 outline-none w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-right">Password</label>
          <input
            type="password"
            ref={passwordRef}
            className="border px-2 py-1 outline-none w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-right">Confirm Password</label>
          <input
            type="password"
            ref={cpasswordRef}
            className="border px-2 py-1 outline-none w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-right">Role</label>
          <select
            ref={roleRef}
            className="border px-2 py-1 outline-none w-full"
          >
            {data?.data.map((item: any, index: number) => (
              <option value={item._id} key={index}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg px-4 py-2"
            onClick={handleSubmit}
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
            Create User
          </button>
        </div>
      </form>
    </div>
  );
}
