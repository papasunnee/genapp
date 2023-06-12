import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import NotificationDropdown from "../Dropdowns/NotificationDropdown";
import UserDropdown from "../Dropdowns/UserDropdown";
import { signOut, useSession } from "next-auth/react";

export default function Sidebar() {
  const { data, status } = useSession();
  const [collapseShow, setCollapseShow] = useState("hidden");
  const router = useRouter();
  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden pr-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>
          {/* Brand */}
          <Link legacyBehavior href="">
            <a className="md:block text-center md:pb-2 text-slate-600 mr-0 inline-block text-xs  md:text-sm uppercase font-bold p-4 px-0">
              GENESIS MEDICAL DIAGNOSTICS LABORATORY
            </a>
          </Link>
          {/* User */}
          {/* <ul className="md:hidden items-center flex flex-wrap list-none"> */}
          <ul className="hidden items-center flex-wrap list-none">
            <li className="inline-block relative">
              <NotificationDropdown />
            </li>
            <li className="inline-block relative">
              <UserDropdown />
            </li>
          </ul>
          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-slate-200">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <Link legacyBehavior href="">
                    <a className="md:block text-left md:pb-2 text-slate-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0">
                      GENESIS DIAGNOSTICS LABORATORY
                    </a>
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            {/* Form */}
            <form className="mt-6 mb-4 hidden">
              <div className="mb-3 pt-0">
                <input
                  type="text"
                  placeholder="Search"
                  className="px-3 py-2 h-12 border border-solid  border-slate-500 placeholder-slate-300 text-slate-600 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal"
                />
              </div>
            </form>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />
            {/* Heading */}
            <h6 className="md:min-w-full text-slate-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Admin Section
            </h6>
            {/* Navigation */}

            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              <li className="items-center">
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    setCollapseShow("hidden");
                    router.push("/admin");
                  }}
                  className={
                    "text-xs uppercase py-3 font-bold block cursor-pointer " +
                    (router.pathname == "/admin"
                      ? "text-sky-500 hover:text-sky-600"
                      : "text-slate-700 hover:text-slate-500")
                  }
                >
                  <i
                    className={
                      "fas fa-tv mr-2 text-sm " +
                      (router.pathname == "/admin"
                        ? "opacity-75"
                        : "text-slate-300")
                    }
                  ></i>{" "}
                  Dashboard
                </span>
              </li>
              <li className="items-center">
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    setCollapseShow("hidden");
                    router.push("/admin/patients");
                  }}
                  className={
                    "text-xs uppercase py-3 font-bold block cursor-pointer " +
                    (router.pathname.indexOf("/admin/patients") !== -1
                      ? "text-sky-500 hover:text-sky-600"
                      : "text-slate-700 hover:text-slate-500")
                  }
                >
                  <i
                    className={
                      "fas fa-user mr-2 text-sm " +
                      (router.pathname.indexOf("/admin/patients") !== -1
                        ? "opacity-75"
                        : "text-slate-300")
                    }
                  ></i>{" "}
                  Patients
                </span>
              </li>

              <li className="items-center">
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    setCollapseShow("hidden");
                    router.push("/admin/users");
                  }}
                  className={
                    "text-xs uppercase py-3 font-bold block cursor-pointer " +
                    (router.pathname.indexOf("/admin/users") !== -1
                      ? "text-sky-500 hover:text-sky-600"
                      : "text-slate-700 hover:text-slate-500")
                  }
                >
                  <i
                    className={
                      "fas fa-users mr-2 text-sm " +
                      (router.pathname.indexOf("/admin/users") !== -1
                        ? "opacity-75"
                        : "text-slate-300")
                    }
                  ></i>{" "}
                  Staff/Users
                </span>
              </li>

              <li className="items-center">
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    setCollapseShow("hidden");
                    router.push("/admin/results");
                  }}
                  className={
                    "text-xs uppercase py-3 font-bold block cursor-pointer " +
                    (router.pathname.indexOf("/admin/results") !== -1
                      ? "text-sky-500 hover:text-sky-600"
                      : "text-slate-700 hover:text-slate-500")
                  }
                >
                  <i
                    className={
                      "fas fa-list mr-2 text-sm " +
                      (router.pathname.indexOf("/admin/results") !== -1
                        ? "opacity-75"
                        : "text-slate-300")
                    }
                  ></i>{" "}
                  Results
                </span>
              </li>

              <li className="items-center">
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    setCollapseShow("hidden");
                    router.push("/admin/payments");
                  }}
                  className={
                    "text-xs uppercase py-3 font-bold block cursor-pointer " +
                    (router.pathname.indexOf("/admin/payments") !== -1
                      ? "text-sky-500 hover:text-sky-600"
                      : "text-slate-700 hover:text-slate-500")
                  }
                >
                  <i
                    className={
                      "fas fa-fingerprint mr-2 text-sm " +
                      (router.pathname.indexOf("/admin/payments") !== -1
                        ? "opacity-75"
                        : "text-slate-300")
                    }
                  ></i>{" "}
                  Payments
                </span>
              </li>

              <li className="items-center">
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    setCollapseShow("hidden");
                    router.push("/admin/profile");
                  }}
                  className={
                    "text-xs uppercase py-3 font-bold block cursor-pointer " +
                    (router.pathname.indexOf("/admin/profile") !== -1
                      ? "text-sky-500 hover:text-sky-600"
                      : "text-slate-700 hover:text-slate-500")
                  }
                >
                  <i
                    className={
                      "fas fa-user mr-2 text-sm " +
                      (router.pathname.indexOf("/admin/profile") !== -1
                        ? "opacity-75"
                        : "text-slate-300")
                    }
                  ></i>{" "}
                  My Profile
                </span>
              </li>

              {/* 
              
              <li className="items-center">
                <Link legacyBehavior href="/admin/tables">
                  <a
                    href="#"
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (router.pathname.indexOf("/admin/tables") !== -1
                        ? "text-sky-500 hover:text-sky-600"
                        : "text-slate-700 hover:text-slate-500")
                    }
                  >
                    <i
                      className={
                        "fas fa-table mr-2 text-sm " +
                        (router.pathname.indexOf("/admin/tables") !== -1
                          ? "opacity-75"
                          : "text-slate-300")
                      }
                    ></i>{" "}
                    Tables
                  </a>
                </Link>
              </li>

              <li className="items-center">
                <Link legacyBehavior href="/admin/maps">
                  <a
                    href="#"
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (router.pathname.indexOf("/admin/maps") !== -1
                        ? "text-sky-500 hover:text-sky-600"
                        : "text-slate-700 hover:text-slate-500")
                    }
                  >
                    <i
                      className={
                        "fas fa-map-marked mr-2 text-sm " +
                        (router.pathname.indexOf("/admin/maps") !== -1
                          ? "opacity-75"
                          : "text-slate-300")
                      }
                    ></i>{" "}
                    Maps
                  </a>
                </Link>
              </li> */}
            </ul>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />
            {/* Heading */}
            {/* <h6 className="md:min-w-full text-slate-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Auth Layout Pages
            </h6> */}
            {/* Navigation */}

            <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
              <li className="items-center">
                <Link legacyBehavior href="#">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      signOut({
                        callbackUrl: "/",
                      });
                    }}
                    className="text-slate-700 hover:text-slate-500 text-xs uppercase py-3 font-bold block"
                  >
                    <i className="fas fa-power-off text-slate-400 mr-2 text-sm"></i>{" "}
                    Logout
                  </a>
                </Link>
              </li>
            </ul>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />
            {/* Heading */}
            <h6 className="md:min-w-full text-slate-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Logged in As
            </h6>
            {/* Navigation */}

            <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
              <li className="items-center">
                <div className="flex flex-col">
                  <span
                    href="#"
                    className="text-slate-500 text-sm py-1 font-bold block"
                  >
                    {data.user.role.name}
                  </span>
                  <span
                    href="#"
                    className="text-slate-400 text-xs py-1 font-bold block"
                  >
                    {data.user.firstname.toString().toUpperCase()}{" "}
                    {data.user.lastname.toString().toUpperCase()}
                  </span>
                </div>
              </li>

              {/* <li className="items-center">
                <Link legacyBehavior href="/profile">
                  <a
                    href="#"
                    className="text-slate-700 hover:text-slate-500 text-xs uppercase py-3 font-bold block"
                  >
                    <i className="fas fa-user-circle text-slate-400 mr-2 text-sm"></i>{" "}
                    Profile Page
                  </a>
                </Link>
              </li> */}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
