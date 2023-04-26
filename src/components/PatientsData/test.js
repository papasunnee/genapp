import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import useSWR from "swr";
// import _ from lodash;
import { fetcher } from "@/utils/fetcher";
import { useRouter } from "next/router";
import TableDropdown from "../Dropdowns/TableDropdown";

const TestCategory = [
  {
    name: "Chemistry",
    discrete: "true",
    nest: 2,
    type: [
      {
        name: "Renal/Electrolyte/Bone",
        parameters: [
          { name: "Sodium", unit: [], checked: false, cost: 1200 },
          { name: "Potassium", unit: [], checked: false, cost: 1300 },
          { name: "Chloride", unit: [], checked: false, cost: 1400 },
          { name: "HCO3", unit: [], checked: false, cost: 1500 },
          { name: "Urea", unit: [], checked: false, cost: 1500 },
          { name: "Creatine", unit: [], checked: false, cost: 1700 },
          { name: "Uric Acid", unit: [], checked: false, cost: 1800 },
          { name: "Calcium", unit: [], checked: false, cost: 1900 },
          { name: "Magnessium", unit: [], checked: false, cost: 2000 },
          { name: "Phosphate", unit: [], checked: false, cost: 2100 },
          { name: "Zinc", unit: [], checked: false, cost: 2200 },
        ],
      },
      {
        name: "Liver/Pancreas",
        parameters: [
          {
            name: "Bilirubin",
            // type: [
            //   {
            //     name: "Total Bilirubin",
            //     unit: [],
            //     checked: false,
            //     cost: 200,
            //   },
            //   {
            //     name: "Conjugated Bilirubin",
            //     unit: [],
            //     checked: false,
            //     cost: 200,
            //   },
            // ],
            unit: [],
            checked: false,
            cost: 200,
          },
          { name: "Total Protein", unit: [], checked: false, cost: 2000 },
          { name: "Albumin", unit: [], checked: false, cost: 1000 },
          { name: "Pre-Albumin", unit: [], checked: false, cost: 2200 },
          { name: "Globulin", unit: [], checked: false, cost: 1200 },
          { name: "AST", unit: [], checked: false, cost: 5000 },
          { name: "ALT", unit: [], checked: false, cost: 2200 },
          { name: "GGT", unit: [], checked: false, cost: 3500 },
          { name: "ALP", unit: [], checked: false, cost: 1500 },
          { name: "LDH", unit: [], checked: false, cost: 2500 },
          { name: "LPS", unit: [], checked: false, cost: 2800 },
          { name: "AMS", unit: [], checked: false, cost: 2900 },
        ],
      },
      {
        name: "Cardiac Markers",
        parameters: [
          { name: "Myoglobin", unit: [], checked: false, cost: 2100 },
          { name: "HS-CRP", unit: [], checked: false, cost: 2200 },
          { name: "CK", unit: [], checked: false, cost: 2300 },
          { name: "CK-MB", unit: [], checked: false, cost: 2400 },
          { name: "Troponin I", unit: [], checked: false, cost: 2500 },
        ],
      },
      {
        name: "CSF",
        parameters: [
          { name: "Protein", unit: [], checked: false, cost: 1200 },
          { name: "Glucose", unit: [], checked: false, cost: 2200 },
        ],
      },
    ],
  },
  {
    name: "Haematology",
    discrete: "true",
    nest: 2,
    type: [
      {
        name: "General",
        parameters: [
          { name: "PCV", unit: [], checked: false, cost: 2000 },
          { name: "FBC", unit: [], checked: false, cost: 3000 },
          { name: "WBC", unit: [], checked: false, cost: 4000 },
          { name: "ESR", unit: [], checked: false, cost: 5000 },
          { name: "Genotype", unit: [], checked: false, cost: 6000 },
          { name: "Blood Grouping", unit: [], checked: false, cost: 7000 },
          {
            name: "Coombs Test",
            type: [
              { name: "Direct", unit: [], checked: false, cost: 1200 },
              { name: "Indirect", unit: [], checked: false, cost: 2200 },
            ],
          },
          { name: "Iron", unit: [], checked: false, cost: 2500 },
          { name: "G6PD", unit: [], checked: false, cost: 2300 },
          { name: "TIBC", unit: [], checked: false, cost: 2400 },
        ],
      },
      {
        name: "Coagulation",
        parameters: [
          { name: "PT + INR", unit: [], checked: false, cost: 1200 },
          { name: "PTTK", unit: [], checked: false, cost: 1200 },
          { name: "FIBRINOGEN", unit: [], checked: false, cost: 1200 },
          { name: "D-DIMER", unit: [], checked: false, cost: 1500 },
          { name: "THROMBIN TIME", unit: [], checked: false, cost: 1600 },
          { name: "FACTOR ASSAY", unit: [], checked: false, cost: 1700 },
        ],
      },
      {
        name: "Serelogy",
        parameters: [
          { name: "Hepatitis B", unit: [], checked: false, cost: 1800 },
          { name: "Hepatitis C", unit: [], checked: false, cost: 1900 },
          { name: "HIV", unit: [], checked: false, cost: 3000 },
          { name: "VDRL", unit: [], checked: false, cost: 3100 },
          { name: "H-Pylopy-Serum", unit: [], checked: false, cost: 3100 },
          {
            name: "C-Reactive Protein",
            unit: [],
            checked: false,
            cost: 3300,
          },
          { name: "Hepatitis Profile", unit: [], checked: false, cost: 3400 },
        ],
      },
      {
        name: "Lipids",
        parameters: [
          { name: "Cholesterol", unit: [], checked: false, cost: 3500 },
          { name: "Triglycerides", unit: [], checked: false, cost: 3600 },
          { name: "HDL-C", unit: [], checked: false, cost: 3700 },
          { name: "LDL-C", unit: [], checked: false, cost: 3800 },
        ],
      },
      {
        name: "Diabetes",
        parameters: [
          { name: "Glucose", unit: [], checked: false, cost: 3900 },
          { name: "2HR PP, Glucose", unit: [], checked: false, cost: 4000 },
          { name: "HbAIC", unit: [], checked: false, cost: 4100 },
          {
            name: "Microalbumin (Urine)",
            unit: [],
            checked: false,
            cost: 4200,
          },
        ],
      },
    ],
  },
  {
    name: "Endocrinology",
    discrete: "true",
    nest: 2,
    type: [
      {
        name: "Thyroid",
        parameters: [
          { name: "T3", unit: [], checked: false, cost: 4400 },
          { name: "T4", unit: [], checked: false, cost: 4500 },
          { name: "TSH", unit: [], checked: false, cost: 4600 },
        ],
      },
      {
        name: "Reproductive",
        parameters: [
          { name: "FSH", unit: [], checked: false, cost: 4700 },
          { name: "LH", unit: [], checked: false, cost: 4800 },
          {
            name: "Oestrogen / Oestradiol",
            unit: [],
            checked: false,
            cost: 200,
          },
          { name: "Progesterone", unit: [], checked: false, cost: 4900 },
          { name: "Testosterone", unit: [], checked: false, cost: 5000 },
          { name: "HCG", unit: [], checked: false, cost: 1000 },
          { name: "Prolactin", unit: [], checked: false, cost: 1200 },
          { name: "AMH", unit: [], checked: false, cost: 1100 },
        ],
      },
      {
        name: "Others",
        parameters: [
          { name: "Cortisol", unit: [], checked: false, cost: 1300 },
        ],
      },
      {
        name: "Tumor Markers",
        parameters: [
          { name: "PSA", unit: [], checked: false, cost: 1400 },
          { name: "AFB", unit: [], checked: false, cost: 1600 },
          { name: "CEA", unit: [], checked: false, cost: 1500 },
          { name: "IFOB", unit: [], checked: false, cost: 1800 },
        ],
      },
    ],
  },
  {
    name: "Microbiology",
    discrete: "true",
    nest: 2,
    type: [
      {
        name: "Widal Test",
        parameters: [
          { name: "MP", unit: [], checked: false, cost: 1900 },
          { name: "Stool MCS", unit: [], checked: false, cost: 2000 },
          { name: "Stool Microscopy", unit: [], checked: false, cost: 2100 },
          { name: "Urine Microscopy", unit: [], checked: false, cost: 2200 },
          { name: "Urine MCS", unit: [], checked: false, cost: 2300 },
          { name: "Swab MCS", unit: [], checked: false, cost: 2400 },
          {
            name: "Hvs / Endocervical MCS",
            unit: [],
            checked: false,
            cost: 200,
          },
          { name: "Blood Culture", unit: [], checked: false, cost: 2500 },
          { name: "Semen Analysis", unit: [], checked: false, cost: 2600 },
          { name: "Semen MCS", unit: [], checked: false, cost: 2700 },
          { name: "Pregnancy Test", unit: [], checked: false, cost: 2800 },
          {
            name: "CSF Analysis & Culture",
            unit: [],
            checked: false,
            cost: 200,
          },
          { name: "TB Screening", unit: [], checked: false, cost: 2900 },
          { name: "Urinalysis", unit: [], checked: false, cost: 3000 },
        ],
      },
    ],
  },
  {
    name: "Histology",
    discrete: false,
    nest: 0,
    parameters: [
      {
        name: "Histology",
        unit: [],
        checked: false,
        cost: 3200,
      },
    ],
  },
  {
    name: "Ultrasound Services",
    discrete: false,
    nest: 0,
    parameters: [
      {
        name: "Ultrasound Services",
        unit: [],
        checked: false,
        cost: 3100,
      },
    ],
  },
  {
    name: "ECG",
    discrete: false,
    nest: 0,
    parameters: [
      {
        name: "ECG",
        unit: [],
        checked: false,
        cost: 3300,
      },
    ],
  },
  {
    name: "EEG",
    discrete: false,
    nest: 0,
    parameters: [
      {
        name: "EEG",
        unit: [],
        checked: false,
        cost: 3400,
      },
    ],
  },
  {
    name: "Cytology",
    discrete: "true",
    nest: 1,
    parameters: [
      {
        name: "Pap Smear (Cervical)",
        unit: [],
        checked: false,
        cost: 3500,
      },
      { name: "FNAC Direct", unit: [], checked: false, cost: 3600 },
    ],
  },
];

export default function Test({ color }) {
  const selectRef = useRef();
  const select2Ref = useRef();
  const testTitleRef = useRef();
  const specimenRef = useRef();
  const clinicalAddressRef = useRef();
  const clinicalDiagnosisRef = useRef();
  const [testState, setTestState] = useState(
    JSON.parse(JSON.stringify(TestCategory))
  );
  const [currentTest, setCurrentTest] = useState(testState[0]);
  const [totalCost, setTotalCost] = useState(0);
  const [currentTestType, setCurrentTestType] = useState(testState[0]?.type[0]);
  const [showModal, setShowModal] = useState(false);
  const [proceedState, setProceedState] = useState(false);
  const [testStatsDisplay, setTestStatsDisplay] = useState(false);
  const [testAddonDisplay, setTestAddonDisplay] = useState(false);

  const modalRef = useRef();
  const router = useRouter();
  const { data: patientData, mutate: mutatePatient } = useSWR(
    `/api/patients?id=${router.query?.id}`,
    fetcher
  );

  const handleChange = (e) => {
    setCurrentTest(testState[e.target.value]);
    if (testState[e.target.value]?.nest == 2) {
      setCurrentTestType(testState[e.target.value]?.type[0]);
      if (currentTest?.discrete && currentTest?.nest == 2) {
        select2Ref.current.value = 0;
      }
    } else if (testState[e.target.value]?.nest == 1) {
      setCurrentTestType(testState[e.target.value]);
    }
  };

  const handleChange2 = (e) => {
    setCurrentTestType(currentTest.type[e.target.value]);
  };

  const handleCheckbox = (args) => {
    const { currentTest, currentTestType, index } = args;
    const testCopy = [...testState];
    const selectedTestIndex = testState.findIndex(
      (item) => item.name === currentTest.name
    );
    const selectedTestData = testState[selectedTestIndex];
    const nest = currentTest.nest;

    if (nest == 2) {
      const selectedTestTypeIndex = selectedTestData.type.findIndex(
        (item) => item.name === currentTestType.name
      );
      if (selectedTestTypeIndex > -1) {
        selectedTestData.type[selectedTestTypeIndex].parameters[index].checked =
          !selectedTestData.type[selectedTestTypeIndex].parameters[index]
            .checked;
      }
      setCurrentTestType(selectedTestData.type[selectedTestTypeIndex]);
    } else if (nest == 1) {
      selectedTestData.parameters[index].checked =
        !selectedTestData.parameters[index].checked;
      // setCurrentTest(selectedTestData[selectedTestIndex]);
    } else if (nest == 0) {
      selectedTestData.parameters[index].checked =
        !selectedTestData.parameters[index].checked;
      // setCurrentTest(selectedTestData[selectedTestIndex]);
    }
    testCopy.splice(selectedTestIndex, 1, selectedTestData);
    setTestState(testCopy);
  };

  const handleCancelModal = (e) => {
    e.preventDefault();
    setProceedState(false);
    setTestStatsDisplay(false);
    setTestAddonDisplay(false);
    setTestState(JSON.parse(JSON.stringify(TestCategory)));
    setCurrentTest(testState[0]);
    setCurrentTestType(testState[0]?.type[0]);
    if (selectRef?.current?.value) selectRef.current.value = 0;
    if (select2Ref?.current?.value) select2Ref.current.value = 0;
    setShowModal(false);
  };
  const handleShowModal = (e) => {
    e.preventDefault();
    setTestState(JSON.parse(JSON.stringify(TestCategory)));
    setCurrentTest(testState[0]);
    setCurrentTestType(testState[0]?.type[0]);
    setProceedState(false);
    setTestAddonDisplay(false);
    setTestStatsDisplay(true);
    setShowModal(true);
  };
  const handleSaveModal = (e) => {
    setProceedState(false);
    setTestAddonDisplay(true);
    setTestStatsDisplay(false);
    e.preventDefault();
  };
  const handleFinish = async (e) => {
    e.preventDefault();
    const test_title = testTitleRef.current.value;
    const specimen = specimenRef.current.value;
    const clinical_address = clinicalAddressRef.current.value;
    const clinical_diagnosis = clinicalDiagnosisRef.current.value;
    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_title,
          test_data: JSON.stringify(testState),
          specimen,
          clinical_address,
          clinical_diagnosis,
          user_id: router.query.id,
          total_cost: totalCost,
        }),
      });
      const data = await res.json();
      if (data.success) {
        console.log(data);
        mutatePatient();
        handleCancelModal(e);
      } else {
        console.log({ data });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleProceed = (e) => {
    e.preventDefault();

    if (proceedState) {
      setProceedState(false);
      setTestStatsDisplay(true);
      setTestAddonDisplay(false);
      setTestState(testState);
      setCurrentTest(testState[0]);
      setCurrentTestType(testState[0]?.type[0]);
    } else {
      setProceedState(() => true);
      setTestStatsDisplay(false);
      setTestAddonDisplay(false);
      const init = 0;
      const total = testState.reduce((acc, test) => {
        if (test.nest == 2) {
          const init1 = 0;
          const t_1 = test.type.reduce((t1, type) => {
            const init2 = 0;
            const t_2 = type.parameters.reduce((t12, parameter) => {
              if (parameter.checked) {
                return t12 + parameter.cost;
              }
              return t12;
            }, init2);
            return t_2 + t1;
          }, init1);
          return acc + t_1;
        } else if (test.nest == 1 || test.nest == 0) {
          const init0 = 0;
          const t_0 = test.parameters.reduce((t_, parameter) => {
            if (parameter.checked) {
              console.log(t_, parameter.cost, "nest1 or 0");
              return t_ + parameter.cost;
            } else {
              return t_;
            }
          }, init0);
          console.log({ t_0 });
          return acc + t_0;
        }
        return acc;
      }, init);
      setTotalCost(total);
    }
  };

  return (
    <>
      <div
        className={
          "relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded " +
          (color === "light" ? "bg-white" : "bg-slate-700 text-white")
        }
      >
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3
                className={
                  "font-semibold text-lg " +
                  (color === "light" ? "text-slate-700" : "text-white")
                }
              >
                Test Taken By{" "}
                {patientData ? (
                  patientData.data?.firstname +
                  " " +
                  patientData?.data?.lastname
                ) : (
                  <span className="inline-block shadow animate-pulse h-3 bg-gray-300 rounded-full dark:bg-gray-700 w-32"></span>
                )}
                {/* {`${patientData?.data?.firstname}  ${patientData?.data?.lastname}`} */}
              </h3>
            </div>
            <div>
              <button
                type="button"
                onClick={handleShowModal}
                className="text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 font-medium rounded-full text-sm px-5 py-2 text-center mr-2 mb-2 "
              >
                Add New Test
              </button>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {/* Projects table */}
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-slate-50 text-slate-500 border-slate-100"
                      : "bg-slate-600 text-slate-200 border-slate-500")
                  }
                >
                  Name
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-slate-50 text-slate-500 border-slate-100"
                      : "bg-slate-600 text-slate-200 border-slate-500")
                  }
                >
                  Total Cost
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-slate-50 text-slate-500 border-slate-100"
                      : "bg-slate-600 text-slate-200 border-slate-500")
                  }
                >
                  Status
                </th>

                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-slate-50 text-slate-500 border-slate-100"
                      : "bg-slate-600 text-slate-200 border-slate-500")
                  }
                >
                  Completion
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-slate-50 text-slate-500 border-slate-100"
                      : "bg-slate-600 text-slate-200 border-slate-500")
                  }
                ></th>
              </tr>
            </thead>
            <tbody>
              {patientData?.data?.tests?.map((item, index) => {
                return (
                  <tr key={index}>
                    <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                      <span
                        className={
                          "ml-3 font-bold " +
                          +(color === "light" ? "text-slate-600" : "text-white")
                        }
                      >
                        {item.test_title}
                      </span>
                    </th>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      NGN {item.total_cost}.00
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <i className="fas fa-circle text-orange-500 mr-2"></i>{" "}
                      {item.status}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <span className="mr-2">0%</span>
                        <div className="relative w-full">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-red-200">
                            <div
                              style={{ width: "60%" }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                      <TableDropdown />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div
        ref={modalRef}
        id="staticModal"
        tabIndex="-1"
        className={`${
          showModal ? "block" : "hidden"
        } bg-gray-900/80 flex items-center justify-center fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%)] max-h-full`}
      >
        {proceedState && (
          <div className="relative w-full max-w-2xl max-h-full">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow">
              {/* Modal header */}
              <div className="flex items-start justify-between p-4 border-b rounded-t">
                <div className="flex flex-grow flex-col items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex-grow">
                    Selected Test Summary
                  </h3>
                  <div className="text-2xl font-bold">
                    Total Cost :{" "}
                    <span className="text-emerald-700">NGN {totalCost}.00</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                  data-modal-hide="staticModal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
              {/* Modal body */}
              <div className="p-6 space-y-6">
                <table className="items-center w-full bg-transparent border">
                  <thead>
                    <tr>
                      <th
                        className={
                          "px-3 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                          (color === "light"
                            ? "bg-slate-50 text-slate-500 border-slate-100"
                            : "bg-slate-600 text-slate-200 border-slate-500")
                        }
                      >
                        Name
                      </th>
                      <th
                        className={
                          "px-3 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                          (color === "light"
                            ? "bg-slate-50 text-slate-500 border-slate-100"
                            : "bg-slate-600 text-slate-200 border-slate-500")
                        }
                      >
                        Cost
                      </th>
                      {/* <th
                        className={
                          "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                          (color === "light"
                            ? "bg-slate-50 text-slate-500 border-slate-100"
                            : "bg-slate-600 text-slate-200 border-slate-500")
                        }
                      >
                        Status
                      </th>
                      <th
                        className={
                          "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                          (color === "light"
                            ? "bg-slate-50 text-slate-500 border-slate-100"
                            : "bg-slate-600 text-slate-200 border-slate-500")
                        }
                      >
                        Completion
                      </th>
                      <th
                        className={
                          "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                          (color === "light"
                            ? "bg-slate-50 text-slate-500 border-slate-100"
                            : "bg-slate-600 text-slate-200 border-slate-500")
                        }
                      ></th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {testState.map((item, index) => {
                      let display = "";
                      if (item.nest == 2) {
                        display = item.type.map((type) => {
                          return type.parameters.map((parameter, pIndex) => {
                            if (parameter.checked) {
                              return (
                                <tr
                                  key={pIndex}
                                  className="hover:bg-slate-100/40"
                                >
                                  <th className="border align-middle py-1 text-xs whitespace-nowrap text-left">
                                    <span
                                      className={
                                        "ml-3 font-bold " +
                                        +(color === "light"
                                          ? "text-slate-600"
                                          : "text-white")
                                      }
                                    >
                                      {parameter.name} -
                                      <span className="font-light">
                                        {" "}
                                        ({item.name} - {type.name} )
                                      </span>
                                    </span>
                                  </th>
                                  <td className="border text-xs font-semibold pl-3">
                                    NGN {parameter.cost}.00
                                  </td>
                                </tr>
                              );
                            }
                          });
                        });
                      }
                      if (item.nest == 1) {
                        display = item.parameters.map((parameter, pIndex2) => {
                          if (parameter.checked) {
                            return (
                              <tr
                                key={pIndex2}
                                className="hover:bg-slate-100/40"
                              >
                                <th className="border py-1 align-middle text-xs whitespace-nowrap text-left">
                                  <span
                                    className={
                                      "ml-3 font-bold " +
                                      +(color === "light"
                                        ? "text-slate-600"
                                        : "text-white")
                                    }
                                  >
                                    {parameter.name}{" "}
                                    <span className="font-light">
                                      {" "}
                                      ({item.name})
                                    </span>
                                  </span>
                                </th>
                                <td className="border text-xs font-semibold pl-3">
                                  NGN {parameter.cost}.00
                                </td>
                              </tr>
                            );
                          }
                        });
                      }
                      if (item.nest == 0) {
                        display = item.parameters.map((parameter, pIndex3) => {
                          if (parameter.checked) {
                            return (
                              <tr
                                key={pIndex3}
                                className="hover:bg-slate-100/40"
                              >
                                <th className="border py-1 align-middle text-xs whitespace-nowrap text-left">
                                  <span
                                    className={
                                      "ml-3 font-bold " +
                                      +(color === "light"
                                        ? "text-slate-600"
                                        : "text-white")
                                    }
                                  >
                                    {parameter.name}{" "}
                                    <span className="font-light">
                                      {" "}
                                      ({item.name})
                                    </span>
                                  </span>
                                </th>
                                <td className="border text-xs font-semibold pl-3">
                                  NGN {parameter.cost}.00
                                </td>
                              </tr>
                            );
                          }
                        });
                      }
                      return display;
                    })}
                  </tbody>
                </table>
              </div>
              {/* Modal footer */}
              <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b ">
                <button
                  onClick={handleProceed}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                >
                  Back
                </button>
                <button
                  onClick={handleSaveModal}
                  disabled={totalCost > 0 ? false : true}
                  className="text-white bg-emerald-600 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 "
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
        {testAddonDisplay && (
          <div className="relative w-full max-w-2xl max-h-full">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow">
              {/* Modal header */}
              <div className="flex items-start justify-between p-4 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">
                  Additional Test Information
                </h3>
                <button
                  type="button"
                  onClick={handleCancelModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                  data-modal-hide="staticModal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
              {/* Modal body */}
              <form onSubmit={handleFinish}>
                <div className="py-6 space-y-6">
                  <div className="relative flex flex-col min-w-0 break-words w-full mb-6">
                    <div className="flex-auto lg:px-10 py-10 pt-0">
                      <div className="flex flex-wrap">
                        <div className="w-full px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block text-slate-600 text-sm font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Test Title
                            </label>
                            <input
                              type="text"
                              required
                              ref={testTitleRef}
                              className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            />
                          </div>
                        </div>
                        <div className="w-full px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block text-slate-600 text-sm font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Nature Specimen
                            </label>
                            <input
                              type="email"
                              ref={specimenRef}
                              className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            />
                          </div>
                        </div>
                        <div className="w-full px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block text-slate-600 text-sm font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Clinical Address
                            </label>
                            <input
                              type="text"
                              ref={clinicalAddressRef}
                              className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            />
                          </div>
                        </div>
                        <div className="w-full px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block text-slate-600 text-sm font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Clinical Diagnosis
                            </label>
                            <input
                              type="text"
                              ref={clinicalDiagnosisRef}
                              className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Modal footer */}
                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b ">
                  <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelModal}
                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 "
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {testStatsDisplay && (
          <div className="relative w-full max-w-2xl max-h-full">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow">
              {/* Modal header */}
              <div className="flex items-start justify-between p-4 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">
                  Select Test(s)
                </h3>
                <button
                  type="button"
                  onClick={handleCancelModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                  data-modal-hide="staticModal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
              {/* Modal body */}
              <div className="p-6 space-y-6">
                <label
                  htmlFor="countries"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Select a Test Category
                </label>
                <select
                  id="countries"
                  defaultValue={0}
                  ref={selectRef}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                >
                  {testState.map((item, index) => {
                    return (
                      <option value={index} key={index}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
                <div className="text-base leading-relaxed text-gray-500 space-x-4">
                  {currentTest?.discrete && currentTest.nest == 2 && (
                    <>
                      <select
                        onChange={handleChange2}
                        ref={select2Ref}
                        defaultValue={0}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      >
                        {currentTest?.type.map((item, index) => {
                          return (
                            <option value={index} key={index}>
                              {item.name}
                            </option>
                          );
                        })}
                      </select>
                      <div className="border" style={{ marginLeft: "0px" }}>
                        {currentTestType?.parameters?.map((item, index) => {
                          return (
                            <label
                              className="whitespace-nowrap inline-block m-4 cursor-pointer"
                              key={index}
                            >
                              <input
                                checked={item.checked}
                                id={item.name}
                                type="checkbox"
                                onChange={(e) =>
                                  handleCheckbox({
                                    e,
                                    currentTest,
                                    currentTestType,
                                    index,
                                  })
                                }
                              />{" "}
                              {item.name}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {currentTest?.discrete && currentTest.nest == 1 && (
                    <>
                      <div className="border" style={{ marginLeft: "0px" }}>
                        {currentTest?.parameters?.map((item, index) => {
                          return (
                            <label
                              className="whitespace-nowrap inline-block m-4 cursor-pointer"
                              key={index}
                            >
                              <input
                                checked={item.checked}
                                id={item.name}
                                type="checkbox"
                                onChange={(e) =>
                                  handleCheckbox({ e, currentTest, index })
                                }
                              />{" "}
                              {item.name}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {!currentTest?.discrete && currentTest?.nest == 0 && (
                    <>
                      <div className="border" style={{ marginLeft: "0px" }}>
                        {currentTest?.parameters?.map((item, index) => {
                          return (
                            <label
                              className="whitespace-nowrap inline-block m-4 cursor-pointer"
                              key={index}
                            >
                              <input
                                type="checkbox"
                                checked={item.checked}
                                id={item.name}
                                onChange={(e) =>
                                  handleCheckbox({ e, currentTest, index })
                                }
                              />{" "}
                              {item.name}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* <div className="text-base leading-relaxed text-gray-500 space-x-4">
               
              </div> */}

                {/* <p className="text-base leading-relaxed text-gray-500 ">
                The European Union’s General Data Protection Regulation
                (G.D.P.R.) goes into effect on May 25 and is meant to ensure a
                common set of data rights in the European Union. It requires
                organizations to notify users as soon as possible of high-risk
                data breaches that could personally affect them.
              </p> */}
              </div>
              {/* Modal footer */}
              <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b ">
                <button
                  onClick={handleProceed}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                >
                  Proceed
                </button>
                <button
                  onClick={handleCancelModal}
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 "
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

Test.defaultProps = {
  color: "light",
};

Test.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};
