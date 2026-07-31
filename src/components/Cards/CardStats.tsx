import React from "react";

export default function CardStats({
  statSubtitle = "Traffic",
  statTitle = "0",
  statArrow = "up",
  statPercent = "3.48",
  statPercentColor = "text-emerald-600",
  statDescripiron = "Since last month",
  statIconName = "far fa-chart-bar",
}: {
  statSubtitle?: string;
  statTitle?: any;
  statArrow?: "up" | "down" | string;
  statPercent?: any;
  // can be any of the text color utilities from tailwindcss
  statPercentColor?: string;
  statDescripiron?: string;
  statIconName?: string;
  // deprecated - icon treatment is now unified across all stat cards
  statIconColor?: string;
}) {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-xl border border-slate-200 shadow-sm mb-6 xl:mb-0">
      <div className="flex-auto p-5">
        <div className="flex flex-wrap">
          <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
            <h5 className="text-slate-400 uppercase font-semibold text-xs tracking-wide">
              {statSubtitle}
            </h5>
            <span className="font-semibold text-2xl text-slate-800">
              {statTitle}
            </span>
          </div>
          <div className="relative w-auto flex-initial">
            <div className="text-brand-600 bg-brand-50 p-3 text-center inline-flex items-center justify-center w-12 h-12 rounded-full">
              <i className={statIconName}></i>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-4">
          <span className={statPercentColor + " mr-2 font-medium"}>
            <i
              className={
                statArrow === "up"
                  ? "fas fa-arrow-up"
                  : statArrow === "down"
                  ? "fas fa-arrow-down"
                  : ""
              }
            ></i>{" "}
            {statPercent}%
          </span>
          <span className="whitespace-nowrap">{statDescripiron}</span>
        </p>
      </div>
    </div>
  );
}
