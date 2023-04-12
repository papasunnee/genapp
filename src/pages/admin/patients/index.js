import React from "react";

// components
import CardTable from "@/components/Cards/CardTable";
import PatientsData from "@/components/PatientsData";

// layout for page
import Admin from "@/components/Layout/Admin";

export default function Index() {
  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <PatientsData addButton />
        </div>
        <div className="w-full mb-12 px-4">
          <CardTable color="dark" />
        </div>
      </div>
    </>
  );
}

Index.layout = Admin;
