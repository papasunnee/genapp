import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import useSWR from "swr";
// import _ from lodash;
import TableDropdown from "../Dropdowns/TableDropdown";
import { fetcher } from "@/utils/fetcher";
import { useRouter } from "next/router";

export default function Test({ color }) {
  const TestCategory = [
    {
      name: "Chemistry",
      discrete: "true",
      nest: 2,
      type: [
        {
          name: "Renal/Electrolyte/Bone",
          parameters: [
            { name: "Sodium", unit: [], selected: false, cost: 200 },
            { name: "Potassium", unit: [], selected: false, cost: 200 },
            { name: "Chloride", unit: [], selected: false, cost: 200 },
            { name: "HCO3", unit: [], selected: false, cost: 200 },
            { name: "Urea", unit: [], selected: false, cost: 200 },
            { name: "Creatiine", unit: [], selected: false, cost: 200 },
            { name: "Uric Acid", unit: [], selected: false, cost: 200 },
            { name: "Calcium", unit: [], selected: false, cost: 200 },
            { name: "Magnessium", unit: [], selected: false, cost: 200 },
            { name: "Phosphate", unit: [], selected: false, cost: 200 },
            { name: "Zinc", unit: [], selected: false, cost: 200 },
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
              //     selected: false,
              //     cost: 200,
              //   },
              //   {
              //     name: "Conjugated Bilirubin",
              //     unit: [],
              //     selected: false,
              //     cost: 200,
              //   },
              // ],
              unit: [],
              selected: false,
              cost: 200,
            },
            { name: "Total Protein", unit: [], selected: false, cost: 200 },
            { name: "Albumin", unit: [], selected: false, cost: 200 },
            { name: "Pre-Albumin", unit: [], selected: false, cost: 200 },
            { name: "Globulin", unit: [], selected: false, cost: 200 },
            { name: "AST", unit: [], selected: false, cost: 200 },
            { name: "ALT", unit: [], selected: false, cost: 200 },
            { name: "GGT", unit: [], selected: false, cost: 200 },
            { name: "ALP", unit: [], selected: false, cost: 200 },
            { name: "LDH", unit: [], selected: false, cost: 200 },
            { name: "LPS", unit: [], selected: false, cost: 200 },
            { name: "AMS", unit: [], selected: false, cost: 200 },
          ],
        },
        {
          name: "Cardiac Markers",
          parameters: [
            { name: "Myoglobin", unit: [], selected: false, cost: 200 },
            { name: "HS-CRP", unit: [], selected: false, cost: 200 },
            { name: "CK", unit: [], selected: false, cost: 200 },
            { name: "CK-MB", unit: [], selected: false, cost: 200 },
            { name: "Troponin I", unit: [], selected: false, cost: 200 },
          ],
        },
        {
          name: "CSF",
          parameters: [
            { name: "Protein", unit: [], selected: false, cost: 200 },
            { name: "Glucose", unit: [], selected: false, cost: 200 },
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
            { name: "PCV", unit: [], selected: false, cost: 200 },
            { name: "FBC", unit: [], selected: false, cost: 200 },
            { name: "WBC", unit: [], selected: false, cost: 200 },
            { name: "ESR", unit: [], selected: false, cost: 200 },
            { name: "Genotype", unit: [], selected: false, cost: 200 },
            { name: "Blood Grouping", unit: [], selected: false, cost: 200 },
            {
              name: "Coombs Test",
              type: [
                { name: "Direct", unit: [], selected: false, cost: 200 },
                { name: "Indirect", unit: [], selected: false, cost: 200 },
              ],
            },
            { name: "Iron", unit: [], selected: false, cost: 200 },
            { name: "G6PD", unit: [], selected: false, cost: 200 },
            { name: "TIBC", unit: [], selected: false, cost: 200 },
          ],
        },
        {
          name: "Coagulation",
          parameters: [
            { name: "PT + INR", unit: [], selected: false, cost: 200 },
            { name: "PTTK", unit: [], selected: false, cost: 200 },
            { name: "FIBRINOGEN", unit: [], selected: false, cost: 200 },
            { name: "D-DIMER", unit: [], selected: false, cost: 200 },
            { name: "THROMBIN TIME", unit: [], selected: false, cost: 200 },
            { name: "FACTOR ASSAY", unit: [], selected: false, cost: 200 },
          ],
        },
        {
          name: "Serelogy",
          parameters: [
            { name: "Hepatitis B", unit: [], selected: false, cost: 200 },
            { name: "Hepatitis C", unit: [], selected: false, cost: 200 },
            { name: "HIV", unit: [], selected: false, cost: 200 },
            { name: "VDRL", unit: [], selected: false, cost: 200 },
            { name: "H-Pylopy-Serum", unit: [], selected: false, cost: 200 },
            {
              name: "C-Reactive Protein",
              unit: [],
              selected: false,
              cost: 200,
            },
            { name: "Hepatitis Profile", unit: [], selected: false, cost: 200 },
          ],
        },
        {
          name: "Lipids",
          parameters: [
            { name: "Cholesterol", unit: [], selected: false, cost: 200 },
            { name: "Triglycerides", unit: [], selected: false, cost: 200 },
            { name: "HDL-C", unit: [], selected: false, cost: 200 },
            { name: "LDL-C", unit: [], selected: false, cost: 200 },
          ],
        },
        {
          name: "Diabetes",
          parameters: [
            { name: "Glucose", unit: [], selected: false, cost: 200 },
            { name: "2HR PP, Glucose", unit: [], selected: false, cost: 200 },
            { name: "HbAIC", unit: [], selected: false, cost: 200 },
            {
              name: "Microalbumin (Urine)",
              unit: [],
              selected: false,
              cost: 200,
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
            { name: "T3", unit: [], selected: false, cost: 200 },
            { name: "T4", unit: [], selected: false, cost: 200 },
            { name: "TSH", unit: [], selected: false, cost: 200 },
          ],
        },
        {
          name: "Reproductive",
          parameters: [
            { name: "FSH", unit: [], selected: false, cost: 200 },
            { name: "LH", unit: [], selected: false, cost: 200 },
            {
              name: "Oestrogen / Oestradiol",
              unit: [],
              selected: false,
              cost: 200,
            },
            { name: "Progesterone", unit: [], selected: false, cost: 200 },
            { name: "Testosterone", unit: [], selected: false, cost: 200 },
            { name: "HCG", unit: [], selected: false, cost: 200 },
            { name: "Prolactin", unit: [], selected: false, cost: 200 },
            { name: "AMH", unit: [], selected: false, cost: 200 },
          ],
        },
        {
          name: "Others",
          parameters: [{ name: "Cortisol", unit: [] }],
        },
        {
          name: "Tumor Markers",
          parameters: [
            { name: "PSA", unit: [], selected: false, cost: 200 },
            { name: "AFB", unit: [], selected: false, cost: 200 },
            { name: "CEA", unit: [], selected: false, cost: 200 },
            { name: "IFOB", unit: [], selected: false, cost: 200 },
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
            { name: "MP", unit: [], selected: false, cost: 200 },
            { name: "Stool MCS", unit: [], selected: false, cost: 200 },
            { name: "Stool Microscopy", unit: [], selected: false, cost: 200 },
            { name: "Urine Microscopy", unit: [], selected: false, cost: 200 },
            { name: "Urine MCS", unit: [], selected: false, cost: 200 },
            { name: "Swab MCS", unit: [], selected: false, cost: 200 },
            {
              name: "Hvs / Endocervical MCS",
              unit: [],
              selected: false,
              cost: 200,
            },
            { name: "Blood Culture", unit: [], selected: false, cost: 200 },
            { name: "Semen Analysis", unit: [], selected: false, cost: 200 },
            { name: "Semen MCS", unit: [], selected: false, cost: 200 },
            { name: "Pregnancy Test", unit: [], selected: false, cost: 200 },
            {
              name: "CSF Analysis & Culture",
              unit: [],
              selected: false,
              cost: 200,
            },
            { name: "TB Screening", unit: [], selected: false, cost: 200 },
            { name: "Urinalysis", unit: [], selected: false, cost: 200 },
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
          name: "Select this test",
          unit: [],
          selected: false,
          cost: 200,
        },
      ],
    },
    {
      name: "Ultrasound Services",
      discrete: false,
      nest: 0,
      parameters: [
        {
          name: "Select this test",
          unit: [],
          selected: false,
          cost: 200,
        },
      ],
    },
    {
      name: "ECG",
      discrete: false,
      nest: 0,
      parameters: [
        {
          name: "Select this test",
          unit: [],
          selected: false,
          cost: 200,
        },
      ],
    },
    {
      name: "EEG",
      discrete: false,
      nest: 0,
      parameters: [
        {
          name: "Select this test",
          unit: [],
          selected: false,
          cost: 200,
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
          selected: false,
          cost: 200,
        },
        { name: "FNAC Direct", unit: [], selected: false, cost: 200 },
      ],
    },
  ];
  const selectRef = useRef();
  const select2Ref = useRef();
  const [testState, setTestState] = useState([...TestCategory]);
  const [currentTest, setCurrentTest] = useState(testState[0]);
  const [currentTestType, setCurrentTestType] = useState(testState[0]?.type[0]);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef();
  const router = useRouter();
  const { data: patientData } = useSWR(
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
    const selectedTestIndex = testState.findIndex(
      (item) => item.name === currentTest.name
    );
    const selectedTestData = testState[selectedTestIndex];
    const testCopy = [...testState];
    const nest = currentTest.nest;
    if (nest == 2) {
      const selectedTestType = selectedTestData.type.findIndex(
        (item) => item.name === currentTestType.name
      );
      console.log({ selectedTestType });
      if (selectedTestType > -1) {
        selectedTestData.type[selectedTestType].parameters[index].selected =
          !selectedTestData.type[selectedTestType].parameters[index].selected;
      }
    }
    if (nest == 1) {
      selectedTestData.parameters[index].selected =
        !selectedTestData.parameters[index].selected;
    }
    if (nest == 0) {
      selectedTestData.parameters[index].selected =
        !selectedTestData.parameters[index].selected;
    }
    testCopy.splice(selectedTestIndex, 1, selectedTestData);
    setTestState(testCopy);
  };

  const handleCancelModal = (e) => {
    e.preventDefault();
    setTestState([...TestCategory]);
    setCurrentTest(testState[0]);
    setCurrentTestType(testState[0]?.type[0]);
    selectRef.current.value = 0;
    select2Ref.current.value = 0;
    setShowModal(false);
  };
  const handleShowModal = () => {
    // setTestState([...TestCategory]);
    // setCurrentTest(testState[0]);
    // setCurrentTestType(testState[0]?.type[0]);
    setShowModal(true);
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
                {`${patientData?.data?.firstname}  ${patientData?.data?.lastname}`}
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
                  Cost
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
              <tr>
                <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                  <span
                    className={
                      "ml-3 font-bold " +
                      +(color === "light" ? "text-slate-600" : "text-white")
                    }
                  >
                    Argon Design System
                  </span>
                </th>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  $2,500 USD
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <i className="fas fa-circle text-orange-500 mr-2"></i> pending
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="flex items-center">
                    <span className="mr-2">60%</span>
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
                onClick={() => setShowModal(false)}
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
                for="countries"
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
                {TestCategory.map((item, index) => {
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
                          <label className="whitespace-nowrap inline-block m-4 cursor-pointer">
                            <input
                              checked={item.selected}
                              id={item.name}
                              type="checkbox"
                              key={index}
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
                          <label className="whitespace-nowrap inline-block m-4 cursor-pointer">
                            <input
                              checked={item.selected}
                              id={item.name}
                              type="checkbox"
                              key={index}
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
                          <label className="whitespace-nowrap inline-block m-4 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              id={item.name}
                              key={index}
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
                data-modal-hide="staticModal"
                type="button"
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
