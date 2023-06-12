import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { useRouter } from "next/router";
import TableDropdown from "../Dropdowns/TableDropdown";
import {
  assignValuesToTest,
  displayTestResult,
  filterRegisteredTestOnly,
} from "@/utils/functions";
import TestCategory from "@/data/TestCategory";
import { useSession } from "next-auth/react";
import Pagination from "react-js-pagination";
import PatientsData from ".";

const TestStatus = {
  "Awaiting Payment": {
    value: 0,
    lightcolor: "bg-red-200",
    deepcolor: "bg-red-500",
    textcolor: "text-red-500",
  },
  "Awaiting Result": {
    value: 50,
    lightcolor: "bg-orange-200",
    deepcolor: "bg-orange-500",
    textcolor: "text-orange-500",
  },
  "Test Completed": {
    value: 100,
    lightcolor: "bg-green-200",
    deepcolor: "bg-green-500",
    textcolor: "text-green-500",
  },
};

export default function Test({ color }) {
  const { data: sessionData } = useSession();
  const resPerPage = 5;
  const selectRef = useRef();
  const select2Ref = useRef();
  const testTitleRef = useRef();
  const specimenRef = useRef();
  const clinicalAddressRef = useRef();
  const clinicalDiagnosisRef = useRef();
  const test_result_form = useRef();
  const [testState, setTestState] = useState(
    JSON.parse(JSON.stringify(TestCategory))
  );
  const [currentTest, setCurrentTest] = useState(testState[0]);
  const [totalCost, setTotalCost] = useState(0);
  const [currentTestType, setCurrentTestType] = useState(testState[0]?.type[0]);
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testData, setTestData] = useState({});
  const [resultForm, setResultForm] = useState({});
  const [proceedState, setProceedState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testStatsDisplay, setTestStatsDisplay] = useState(false);
  const [testAddonDisplay, setTestAddonDisplay] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [paymentOption, setPaymentOption] = useState("cash");
  const [testPage, setTestPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(resPerPage);

  const invoiceRef = useRef();
  const amountPaidRef = useRef();
  const modalRef = useRef();
  const testModalRef = useRef();

  const router = useRouter();
  const { data: patientData, mutate: mutatePatient } = useSWR(
    `/api/patients?id=${router.query?.id}`,
    fetcher
  );

  useEffect(() => {}, [testPage]);

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
  const handleCancelTestModal = (e) => {
    e.preventDefault();
    setTestData({});
    setShowTestModal(false);
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
  const handleTestModal = (item) => {
    setCurrentTab(0);
    const itemCopy = {
      ...item,
      test_data: JSON.parse(item.test_data),
    };
    setTestData(itemCopy);
    setShowTestModal(true);
  };
  const handlePaymentOption = (e) => {
    const { value } = e.target;
    setPaymentOption(value);
  };
  const handleSavePayment = async () => {
    setLoading(true);
    const invoice = invoiceRef.current.value;
    const amountPaid = amountPaidRef.current.value;
    if (amountPaid == testData.total_cost) {
      try {
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoice,
            amount_paid: amountPaid,
            test: testData._id,
            payment_option: paymentOption,
          }),
        });
        const data = await res.json();
        if (data.success) {
          await mutatePatient();
          const itemCopy = {
            ...data.data,
            test_data: JSON.parse(data.data.test_data),
          };
          setTestData(itemCopy);
        }
      } catch (error) {}
    } else {
      console.log("Amount Invalid");
    }
    setLoading(false);
  };
  const handleSaveModal = (e) => {
    setProceedState(false);
    setTestAddonDisplay(true);
    setTestStatsDisplay(false);
    e.preventDefault();
  };
  const handleFinish = async (e) => {
    e.preventDefault();
    setLoading(true);
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
          test_data: JSON.stringify(filterRegisteredTestOnly(testState)),
          specimen,
          clinical_address,
          clinical_diagnosis,
          user_id: router.query.id,
          total_cost: totalCost,
        }),
      });
      const data = await res.json();
      if (data.success) {
        mutatePatient();
        handleCancelModal(e);
      } else {
        console.log({ data });
      }
    } catch (error) {
      console.log(error.message);
    }
    setLoading(false);
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
              return t_ + parameter.cost;
            } else {
              return t_;
            }
          }, init0);
          return acc + t_0;
        }
        return acc;
      }, init);
      setTotalCost(total);
    }
  };
  const handleResultFormChange = (e) => {
    const { name, value } = e.target;
    setResultForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleTestDataForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formElements = Array.from(test_result_form.current.elements);
    const formObject = {};
    formElements.forEach((element) => {
      formObject[element.name] = element.value;
    });
    let nullTestValuesCount = 0;
    Object.values(formElements).forEach((item) => {
      if (item == "" || item == null || item == "undefined") {
        ++nullTestValuesCount;
      }
    });
    const resp = assignValuesToTest(testData.test_data, formObject);
    setTestData((prev) => ({
      ...prev,
      test_data: resp,
      nullTestValuesCount,
    }));
    try {
      const res = await fetch("/api/diagnosis", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          put_id: testData._id,
          test_data: JSON.stringify(resp),
        }),
      });
      const data = await res.json();
      if (data.success) {
        mutatePatient();
        setTestData({
          ...data.data,
          test_data: JSON.parse(data.data.test_data),
        });
        // handleCancelModal(e);
      } else {
        console.log({ data });
      }
    } catch (error) {
      console.log(error.message);
    }
    setLoading(false);
  };

  const handlePageChange = (currentPage) => {
    setTestPage(currentPage);
    setStartIndex((currentPage - 1) * resPerPage);
    setEndIndex(currentPage * resPerPage);
  };

  return (
    <>
      <div
        className={
          "relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded " +
          (color === "light" ? "bg-white" : "bg-slate-700 text-white")
        }
      >
        <div className="rounded-t mb-0 px-4 py-6 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-medium text-md text-slate-700">
                Test(s) Taken By{" "}
                {patientData ? (
                  patientData?.data?.firstname +
                  " (" +
                  patientData?.data?.tests?.length +
                  ")"
                ) : (
                  <span className="inline-block shadow animate-pulse h-3 bg-gray-300 rounded-full  w-32">
                    sss
                  </span>
                )}
              </h3>
            </div>
            {[100, 200, 500].includes(sessionData?.user?.role?.weight) && (
              <div>
                <button
                  type="button"
                  title="Add New Test"
                  onClick={handleShowModal}
                  className="bg-emerald-500 text-white active:bg-emerald-600 text-xs font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 space-x-1"
                >
                  <i className="fas fa-plus"></i>
                  <span className="hidden sm:inline-block"> Add New Test</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {/* Projects table */}
          {patientData?.data?.tests?.length > 0 ? (
            <>
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
                  </tr>
                </thead>
                <tbody>
                  {patientData?.data?.tests
                    ?.slice(startIndex, endIndex)
                    .map((item, index) => {
                      return (
                        <tr
                          key={index}
                          className="transition duration-300 ease-in-out hover:bg-gray-200"
                        >
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                            <span
                              onClick={(e) => handleTestModal(item)}
                              className={
                                "font-bold cursor-pointer underline " +
                                +(color === "light"
                                  ? "text-slate-600"
                                  : "text-white")
                              }
                            >
                              {item.test_title}
                            </span>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            NGN {item.total_cost}.00
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <i
                              className={`fas fa-circle ${
                                TestStatus[item.status].textcolor
                              } mr-2`}
                            ></i>{" "}
                            {item.status}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex items-center">
                              <span className="mr-2">
                                {TestStatus[item.status].value + "%"}
                              </span>
                              <div className="relative w-full">
                                <div
                                  className={`overflow-hidden h-2 text-xs flex rounded ${
                                    TestStatus[item.status].lightcolor
                                  }`}
                                >
                                  <div
                                    style={{
                                      width: `${
                                        TestStatus[item.status].value
                                      }%`,
                                    }}
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                      TestStatus[item.status].deepcolor
                                    }`}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <div className="flex justify-center my-5">
                <Pagination
                  activePage={testPage}
                  itemsCountPerPage={resPerPage}
                  totalItemsCount={patientData?.data?.tests?.length}
                  pageRangeDisplayed={4}
                  nextPageText={"Next"}
                  prevPageText={"Prev"}
                  firstPageText={"First"}
                  lastPageText={"Last"}
                  onChange={handlePageChange}
                  itemClass="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-200 focus:z-20"
                  activeLinkClassName="z-10 inline-flex items-center border border-indigo-500 bg-indigo-200 text-sm font-medium text-indigo-600 focus:z-20"
                  activeClass="z-10 inline-flex items-center border border-indigo-500 bg-indigo-200 text-sm font-medium text-indigo-600 focus:z-20"
                />
              </div>
            </>
          ) : (
            <div className="my-5">
              <p className="text-center">
                You have not added a test, please click on add new test to begin
              </p>
            </div>
          )}
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
                              Nature of Specimen
                            </label>
                            <input
                              type="text"
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
                    disabled={loading}
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
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
      <div
        ref={testModalRef}
        id="staticTestModal"
        tabIndex="-1"
        className={`${
          showTestModal ? "block" : "hidden"
        } bg-gray-900/80 flex items-center justify-center fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%)] max-h-full`}
      >
        <div className="relative w-full max-w-2xl max-h-full">
          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow">
            {/* Modal header */}
            <div className="flex items-start justify-between p-4 border-b rounded-t">
              <div className="flex flex-grow flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex-grow">
                  {testData.test_title}
                </h3>
                <div className="text-2xl font-bold">
                  Total Cost :{" "}
                  <span
                    className={
                      testData.status == "Awaiting Payment"
                        ? "text-red-700"
                        : "text-emerald-700"
                    }
                  >
                    NGN {testData.total_cost}.00
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelTestModal}
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

            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200  px-8">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2 flex-grow">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentTab(0);
                    }}
                    className={
                      currentTab == 0 ? "active_tab" : "non_active_tab"
                    }
                  >
                    Payment
                  </a>
                </li>
                <li className="mr-2 flex-grow">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentTab(1);
                    }}
                    href="#"
                    className={
                      currentTab == 1 ? "active_tab" : "non_active_tab"
                    }
                  >
                    Test Result
                  </a>
                </li>
                {/* <li className="mr-2 flex-grow">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentTab(2);
                    }}
                    href="#"
                    className={
                      currentTab == 2 ? "active_tab" : "non_active_tab"
                    }
                  >
                    Settings
                  </a>
                </li>
                <li className="mr-2 flex-grow">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentTab(3);
                    }}
                    href="#"
                    className={
                      currentTab == 3 ? "active_tab" : "non_active_tab"
                    }
                  >
                    Contacts
                  </a>
                </li> */}
              </ul>
              {currentTab == 0 && testData.status === "Awaiting Payment" && (
                <form className="border flex flex-col my-3 p-4 items-start space-y-4">
                  <div className="flex flex-col w-full items-start">
                    <label
                      for="paymentOption"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Select payment option
                    </label>
                    <select
                      onChange={handlePaymentOption}
                      id="paymentOption"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card Payment</option>
                    </select>
                  </div>
                  {paymentOption == "cash" && (
                    <>
                      <div className="flex flex-col w-full items-start">
                        <label
                          for="paymentOption"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Invoice No.
                        </label>
                        <input
                          ref={invoiceRef}
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                        />
                      </div>
                      <div className="flex flex-col w-full items-start">
                        <label
                          for="paymentOption"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Amount Paid
                        </label>
                        <input
                          ref={amountPaidRef}
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                        />
                      </div>
                      <button
                        disabled={loading}
                        type="button"
                        onClick={handleSavePayment}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
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
                        Save Payment
                      </button>
                    </>
                  )}
                  {paymentOption == "card" && (
                    <>
                      <button
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
                      >
                        Paystack Option
                      </button>
                    </>
                  )}
                </form>
              )}
              {currentTab == 0 && testData.status !== "Awaiting Payment" && (
                <div className="flex flex-col items-start my-4 space-y-2">
                  <div className="grid grid-cols-2 gap-5 text-left">
                    <span className="font-bold">Invoice Number : </span>
                    <span>{testData?.payment?.invoice}</span>
                    <span className="font-bold">Amount Paid : </span>
                    <span>{testData?.payment?.amount_paid}</span>
                    <span className="font-bold">Date Paid : </span>
                    <span>{testData?.payment?.createdAt}</span>
                    <span className="font-bold">Received by : </span>
                    <span>
                      {testData?.payment?.user?.firstname}{" "}
                      {testData?.payment?.user?.lastname}
                    </span>
                  </div>
                </div>
              )}

              {currentTab == 1 && testData.status === "Awaiting Result" && (
                <form
                  ref={test_result_form}
                  onSubmit={handleTestDataForm}
                  className="w-full border p-6"
                >
                  <table className="w-full p-4">
                    {testData?.test_data?.map((test, i) => {
                      let { parameter = {} } = test;
                      return (
                        <tr className="text-left mb-6 w-full" key={i}>
                          <td className="w-1/2">
                            <label
                              for="unit"
                              className="block mb-2 text-sm font-medium text-gray-900"
                            >
                              Select unit for {parameter.name}
                            </label>
                            <select
                              name={`select${parameter.id}`}
                              className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                              <option>mmHg</option>
                              {parameter.unit.map((val, index) => (
                                <option key={index}>{val}</option>
                              ))}
                            </select>
                          </td>
                          <td className="w-1/2">
                            <label
                              for="unit"
                              className="block mb-2 text-sm font-medium text-gray-900"
                            >
                              Enter Value for {parameter.name}
                            </label>
                            {test.discrete ? (
                              <input
                                type="number"
                                required
                                name={parameter.id}
                                value={resultForm[parameter.name]}
                                onChange={handleResultFormChange}
                                className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                              />
                            ) : (
                              <textarea className="h-full w-full"></textarea>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="text-left">
                        <button
                          disabled={loading}
                          type="submit"
                          name="submitbutton"
                          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
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
                          Save Test Value/Result
                        </button>
                      </td>
                    </tr>
                  </table>
                </form>
              )}

              {currentTab == 1 &&
                testData.status === "Test Completed" &&
                displayTestResult(testData, patientData)}
              {currentTab == 2 && (
                <div className="border flex flex-col my-3">Tab 3</div>
              )}
              {currentTab == 3 && (
                <div className="border flex flex-col my-3">Tab 4</div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b ">
              <button
                onClick={handleCancelTestModal}
                className="text-white bg-emerald-600 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 "
              >
                Close
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
