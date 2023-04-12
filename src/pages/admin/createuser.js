import React, { useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

function Createuser() {
  const { data, error } = useSWR("/api/role", fetcher);
  console.log(data?.data);
  const emailRef = useRef();
  const firstnameRef = useRef();
  const lastnameRef = useRef();
  const passwordRef = useRef();
  const cpasswordRef = useRef();
  const roleRef = useRef(data?.data[0]?._id);
  const handleSubmit = async (e) => {
    e.preventDefault();
    let email = emailRef.current.value;
    let firstname = firstnameRef.current.value;
    let lastname = lastnameRef.current.value;
    let role = roleRef.current.value;
    let password = passwordRef.current.value;
    let cpassword = cpasswordRef.current.value;
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
    } catch (error) {
      console.log(error.message);
    }
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
            {data?.data.map((item, index) => (
              <option value={item._id} key={index}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            className="bg-blue-600 text-white rounded-lg px-4 py-2"
            onClick={handleSubmit}
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  );
}

export default Createuser;
