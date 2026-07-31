"use client";

import React from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

export default function FooterAdmin() {
  const { data } = useSWR("/api/time", fetcher);
  return (
    <>
      <footer className="block py-4">
        <div className="container mx-auto px-4">
          <hr className="mb-4 border-b-1 border-slate-200" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4">
              <div className="text-sm text-slate-500 font-semibold py-1 text-center md:text-left">
                Copyright © {data?.currentYear || new Date().getFullYear()}{" "}
                <a
                  href="https://www.creative-tim.com?ref=nnjs-footer-admin"
                  className="text-slate-500 hover:text-slate-700 text-sm font-semibold py-1"
                >
                  Cradle of Innovation
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
