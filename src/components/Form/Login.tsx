"use client";

import React, { useState, useRef } from "react";
import { signIn } from "next-auth/react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const res: any = await signIn("credentials", {
        email: emailRef.current?.value,
        password: passwordRef.current?.value,
        redirect: false,
      });
      if (res.error && !res.ok) {
        if (res.error.includes("getaddrinfo")) {
          throw new Error("Please check your network connection");
        } else if (res.error.includes("querySrv")) {
          throw new Error("Cannot Connect to database, please try again later");
        } else throw new Error(res.error);
      }
      if (passwordRef.current) passwordRef.current.value = "";
      if (emailRef.current) emailRef.current.value = "";
      window.location.href = "/admin";
    } catch (error: any) {
      setErrorMessage(error.message);
      if (passwordRef.current) {
        passwordRef.current.value = "";
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Sign in to your lab&apos;s dashboard
      </p>

      {errorMessage && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-6">
          <i className="fas fa-circle-exclamation mt-0.5"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-slate-700 mb-1"
            htmlFor="login-email"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            placeholder="you@yourlab.com"
            required
            ref={emailRef}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-slate-700 mb-1"
            htmlFor="login-password"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            placeholder="********"
            required
            ref={passwordRef}
          />
        </div>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            id="customCheckLogin"
            type="checkbox"
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-600">Remember me</span>
        </label>

        <button
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition-colors"
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
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
