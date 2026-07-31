"use client";

import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import {
  assignValuesToTest,
  displayTestResult,
  filterRegisteredTestOnly,
  formatCurrency,
} from "@/utils/functions";
import { useSession } from "next-auth/react";
import Pagination from "@/components/ui/Pagination";
import { toast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import TableSkeleton from "./TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

const MODAL_INPUT_CLASS =
  "bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 transition-colors";
const MODAL_PRIMARY_BUTTON =
  "text-white bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed focus:ring-4 focus:outline-none focus:ring-brand-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors";
const MODAL_SECONDARY_BUTTON =
  "text-slate-600 bg-white hover:bg-slate-50 focus:ring-4 focus:outline-none focus:ring-slate-200 rounded-lg border border-slate-300 text-sm font-medium px-5 py-2.5 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

function Spinner() {
  return (
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
  );
}

const TestStatus: Record<
  string,
  {
    value: number;
    lightcolor: string;
    deepcolor: string;
    textcolor: string;
  }
> = {
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

const STATUS_BADGE: Record<string, string> = {
  "Awaiting Payment": "bg-red-50 text-red-700",
  "Awaiting Result": "bg-orange-50 text-orange-700",
  "Test Completed": "bg-emerald-50 text-emerald-700",
};

export default function Test({ id }: { id?: string }) {
  const { data: sessionData }: any = useSession();
  const resPerPage = 5;
  const selectRef = useRef<HTMLSelectElement>(null);
  const select2Ref = useRef<HTMLSelectElement>(null);
  const testTitleRef = useRef<HTMLInputElement>(null);
  const specimenRef = useRef<HTMLInputElement>(null);
  const clinicalAddressRef = useRef<HTMLInputElement>(null);
  const clinicalDiagnosisRef = useRef<HTMLInputElement>(null);
  const test_result_form = useRef<HTMLFormElement>(null);
  const [testState, setTestState] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState<any>(undefined);
  const [totalCost, setTotalCost] = useState(0);
  const [currentTestType, setCurrentTestType] = useState<any>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testData, setTestData] = useState<any>({});
  const [resultForm, setResultForm] = useState<any>({});
  const [proceedState, setProceedState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testStatsDisplay, setTestStatsDisplay] = useState(false);
  const [testAddonDisplay, setTestAddonDisplay] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [paymentOption, setPaymentOption] = useState("cash");
  const [testPage, setTestPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(resPerPage);

  const invoiceRef = useRef<HTMLInputElement>(null);
  const amountPaidRef = useRef<HTMLInputElement>(null);

  const {
    data: patientData,
    mutate: mutatePatient,
    isLoading: patientLoading,
  }: any = useSWR(`/api/patients?id=${id}`, fetcher);
  const { mutate } = useSWR(`/api/patients`, fetcher);
  const { data: catalogData }: any = useSWR("/api/test-catalog", fetcher);
  const testCategory = catalogData?.data ?? [];

  useEffect(() => {}, [testPage]);

  useEffect(() => {
    if (testCategory.length > 0 && testState.length === 0) {
      const initial = JSON.parse(JSON.stringify(testCategory));
      setTestState(initial);
      setCurrentTest(initial[0]);
      setCurrentTestType(initial[0]?.type?.[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogData]);

  const handleChange = (e: any) => {
    setCurrentTest(testState[e.target.value]);
    if (testState[e.target.value]?.nest == 2) {
      setCurrentTestType(testState[e.target.value]?.type[0]);
      if (currentTest?.discrete && currentTest?.nest == 2 && select2Ref.current) {
        select2Ref.current.value = "0";
      }
    } else if (testState[e.target.value]?.nest == 1) {
      setCurrentTestType(testState[e.target.value]);
    }
  };
  const handleChange2 = (e: any) => {
    setCurrentTestType(currentTest.type[e.target.value]);
  };
  const handleCheckbox = (args: any) => {
    const { currentTest, currentTestType, index } = args;
    const testCopy = [...testState];
    const selectedTestIndex = testState.findIndex(
      (item) => item.name === currentTest.name
    );
    const selectedTestData = testState[selectedTestIndex];
    const nest = currentTest.nest;

    if (nest == 2) {
      const selectedTestTypeIndex = selectedTestData.type.findIndex(
        (item: any) => item.name === currentTestType.name
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
  const handleCancelModal = (e?: any) => {
    e?.preventDefault();
    setProceedState(false);
    setTestStatsDisplay(false);
    setTestAddonDisplay(false);
    setTestState(JSON.parse(JSON.stringify(testCategory)));
    setCurrentTest(testState[0]);
    setCurrentTestType(testState[0]?.type[0]);
    if (selectRef?.current?.value) selectRef.current.value = "0";
    if (select2Ref?.current?.value) select2Ref.current.value = "0";
    setShowModal(false);
  };
  const handleCancelTestModal = (e?: any) => {
    e?.preventDefault();
    setTestData({});
    setShowTestModal(false);
  };
  const handleShowModal = (e: any) => {
    e.preventDefault();
    setTestState(JSON.parse(JSON.stringify(testCategory)));
    setCurrentTest(testState[0]);
    setCurrentTestType(testState[0]?.type[0]);
    setProceedState(false);
    setTestAddonDisplay(false);
    setTestStatsDisplay(true);
    setShowModal(true);
  };
  const handleTestModal = (item: any) => {
    setCurrentTab(0);
    const itemCopy = {
      ...item,
      test_data: JSON.parse(item.test_data),
    };
    setTestData(itemCopy);
    setShowTestModal(true);
  };
  const handleSavePayment = async () => {
    setLoading(true);
    const invoice = invoiceRef.current?.value;
    const amountPaid = amountPaidRef.current?.value;
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
          toast.success("Payment for test successful");
        } else {
          if (data?.error?.includes("getaddrinfo ENOTFOUND")) {
            throw new Error(
              "Something went wrong, please check your internet connection!"
            );
          }

          throw new Error("Something went wrong, please try again!");
        }
      } catch (error: any) {
        console.log(error.message);
        toast.error(error.message);
      }
    } else {
      console.log("Amount Invalid");
      toast.error("Invalid Amount for this test");
    }
    setLoading(false);
  };
  const handleSaveModal = (e: any) => {
    setProceedState(false);
    setTestAddonDisplay(true);
    setTestStatsDisplay(false);
    e.preventDefault();
  };
  const handleFinish = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const test_title = testTitleRef.current?.value;
    const specimen = specimenRef.current?.value;
    const clinical_address = clinicalAddressRef.current?.value;
    const clinical_diagnosis = clinicalDiagnosisRef.current?.value;
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
          patient: id,
          total_cost: totalCost,
        }),
      });
      const data = await res.json();
      if (data.success) {
        mutatePatient();
        mutate();
        handleCancelModal(e);
        toast.success("Test successfully created");
      } else {
        if (data?.error?.includes("getaddrinfo ENOTFOUND")) {
          throw new Error(
            "Something went wrong, please check your internet connection!"
          );
        }

        throw new Error("Something went wrong, please try again!");
      }
    } catch (error: any) {
      toast.error(error.message);
      console.log(error.message);
    }
    setLoading(false);
  };
  const handleProceed = (e: any) => {
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
          const t_1 = test.type.reduce((t1: number, type: any) => {
            const init2 = 0;
            const t_2 = type.parameters.reduce((t12: number, parameter: any) => {
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
          const t_0 = test.parameters.reduce((t_: number, parameter: any) => {
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
  const handleResultFormChange = (e: any) => {
    const { name, value } = e.target;
    setResultForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleTestDataForm = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formElements = Array.from(test_result_form.current?.elements ?? []);
    const formObject: Record<string, any> = {};
    formElements.forEach((element: any) => {
      formObject[element.name] = element.value;
    });
    let nullTestValuesCount = 0;
    Object.values(formElements).forEach((item: any) => {
      if (item == "" || item == null || item == "undefined") {
        ++nullTestValuesCount;
      }
    });
    const resp = assignValuesToTest(testData.test_data, formObject);
    setTestData((prev: any) => ({
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
    } catch (error: any) {
      console.log(error.message);
    }
    setLoading(false);
  };

  const handlePageChange = (currentPage: number) => {
    setTestPage(currentPage);
    setStartIndex((currentPage - 1) * resPerPage);
    setEndIndex(currentPage * resPerPage);
  };

  return (
    <>
      <div className={TABLE_CARD_CLASS}>
        <div className={TABLE_HEADER_CLASS}>
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-md text-slate-800">
                {patientLoading ? (
                  <Skeleton className="h-3 w-48" />
                ) : (
                  `Test(s) Taken By ${patientData?.data?.firstname} (${patientData?.data?.tests?.length || 0})`
                )}
              </h3>
            </div>
            {[100, 200, 500].includes(sessionData?.user?.role?.weight) && (
              <div>
                <button
                  type="button"
                  title="Add New Test"
                  onClick={handleShowModal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white active:bg-emerald-700 text-xs font-semibold uppercase px-3 py-2 rounded-lg outline-none focus:outline-none transition-colors space-x-1"
                >
                  <i className="fas fa-plus"></i>
                  <span className="hidden sm:inline-block"> Add New Test</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {patientLoading ? (
          <TableSkeleton columns={4} />
        ) : patientData?.data?.tests?.length > 0 ? (
          <>
            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className={TABLE_TH_CLASS}>Name</th>
                    <th className={TABLE_TH_CLASS}>Total Cost</th>
                    <th className={TABLE_TH_CLASS}>Status</th>
                    <th className={TABLE_TH_CLASS}>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {patientData?.data?.tests
                    ?.slice(startIndex, endIndex)
                    .map((item: any, index: number) => {
                      return (
                        <tr key={index} className={TABLE_TR_CLASS}>
                          <th className="px-6 align-middle text-sm whitespace-nowrap p-3 text-left flex items-center">
                            <span
                              onClick={(e) => handleTestModal(item)}
                              className="font-semibold cursor-pointer hover:underline text-slate-700"
                            >
                              {item.test_title}
                            </span>
                          </th>
                          <td className={TABLE_TD_CLASS}>
                            {formatCurrency(item.total_cost)}
                          </td>
                          <td className="px-6 align-middle text-sm whitespace-nowrap p-3">
                            <i
                              className={`fas fa-circle ${
                                TestStatus[item.status].textcolor
                              } mr-2 text-xs`}
                            ></i>
                            <span className="text-slate-600">{item.status}</span>
                          </td>
                          <td className="px-6 align-middle text-sm whitespace-nowrap p-3">
                            <div className="flex items-center">
                              <span className="mr-2 text-slate-500 text-xs">
                                {TestStatus[item.status].value + "%"}
                              </span>
                              <div className="relative w-full">
                                <div
                                  className={`overflow-hidden h-2 text-xs flex rounded-full ${
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
            </div>
            <div className="flex justify-center my-5 px-2">
              <Pagination
                activePage={testPage}
                itemsCountPerPage={resPerPage}
                totalItemsCount={patientData?.data?.tests?.length}
                onChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className="block w-full overflow-x-auto">
            <div className="my-8">
              <p className="text-center text-sm text-slate-500">
                You have not added a test, please click on add new test to begin
              </p>
            </div>
          </div>
        )}
      </div>
      <Modal
        open={showModal}
        onClose={handleCancelModal}
        size="lg"
        title={
          proceedState
            ? "Selected Test Summary"
            : testAddonDisplay
            ? "Additional Test Information"
            : "Select Test(s)"
        }
      >
        {proceedState && (
          <div className="space-y-4">
            <div className="text-xl font-semibold text-slate-800">
              Total Cost:{" "}
              <span className="text-emerald-600">{formatCurrency(totalCost)}</span>
            </div>
            <table className="items-center w-full bg-transparent border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <th className="px-3 align-middle border-b border-slate-100 py-2 text-xs uppercase whitespace-nowrap font-semibold text-left bg-slate-50 text-slate-500 tracking-wide">
                    Name
                  </th>
                  <th className="px-3 align-middle border-b border-slate-100 py-2 text-xs uppercase whitespace-nowrap font-semibold text-left bg-slate-50 text-slate-500 tracking-wide">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {testState.map((item: any, index: number) => {
                  let display: any = "";
                  if (item.nest == 2) {
                    display = item.type.map((type: any) => {
                      return type.parameters.map((parameter: any, pIndex: number) => {
                        if (parameter.checked) {
                          return (
                            <tr key={pIndex} className="hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                              <th className="py-2 px-3 align-middle text-xs whitespace-nowrap text-left">
                                <span className="font-semibold text-slate-700">
                                  {parameter.name} -
                                  <span className="font-normal">
                                    {" "}
                                    ({item.name} - {type.name} )
                                  </span>
                                </span>
                              </th>
                              <td className="text-xs font-semibold px-3 text-slate-600">
                                {formatCurrency(parameter.cost)}
                              </td>
                            </tr>
                          );
                        }
                      });
                    });
                  }
                  if (item.nest == 1) {
                    display = item.parameters.map((parameter: any, pIndex2: number) => {
                      if (parameter.checked) {
                        return (
                          <tr key={pIndex2} className="hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                            <th className="py-2 px-3 align-middle text-xs whitespace-nowrap text-left">
                              <span className="font-semibold text-slate-700">
                                {parameter.name}{" "}
                                <span className="font-normal"> ({item.name})</span>
                              </span>
                            </th>
                            <td className="text-xs font-semibold px-3 text-slate-600">
                              {formatCurrency(parameter.cost)}
                            </td>
                          </tr>
                        );
                      }
                    });
                  }
                  if (item.nest == 0) {
                    display = item.parameters.map((parameter: any, pIndex3: number) => {
                      if (parameter.checked) {
                        return (
                          <tr key={pIndex3} className="hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                            <th className="py-2 px-3 align-middle text-xs whitespace-nowrap text-left">
                              <span className="font-semibold text-slate-700">
                                {parameter.name}{" "}
                                <span className="font-normal"> ({item.name})</span>
                              </span>
                            </th>
                            <td className="text-xs font-semibold px-3 text-slate-600">
                              {formatCurrency(parameter.cost)}
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
            <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
              <button onClick={handleProceed} className={MODAL_SECONDARY_BUTTON}>
                Back
              </button>
              <button
                onClick={handleSaveModal}
                disabled={totalCost <= 0}
                className="text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg text-sm font-medium px-5 py-2.5 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {testAddonDisplay && (
          <form onSubmit={handleFinish} className="space-y-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="test-title">
                Test Title
              </label>
              <input
                id="test-title"
                type="text"
                required
                ref={testTitleRef}
                className={MODAL_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="test-specimen">
                Nature of Specimen
              </label>
              <input
                id="test-specimen"
                type="text"
                ref={specimenRef}
                className={MODAL_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="test-clinical-address">
                Clinical Address
              </label>
              <input
                id="test-clinical-address"
                type="text"
                ref={clinicalAddressRef}
                className={MODAL_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="test-clinical-diagnosis">
                Clinical Diagnosis
              </label>
              <input
                id="test-clinical-diagnosis"
                type="text"
                ref={clinicalDiagnosisRef}
                className={MODAL_INPUT_CLASS}
              />
            </div>
            <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
              <button disabled={loading} type="submit" className={MODAL_PRIMARY_BUTTON}>
                {loading && <Spinner />}
                Save
              </button>
              <button type="button" onClick={handleCancelModal} className={MODAL_SECONDARY_BUTTON}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {testStatsDisplay && (
          <div className="space-y-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="test-category">
                Select a Test Category
              </label>
              <select
                id="test-category"
                defaultValue={0}
                ref={selectRef}
                onChange={handleChange}
                className={MODAL_INPUT_CLASS}
              >
                {testState.map((item: any, index: number) => {
                  return (
                    <option value={index} key={index}>
                      {item.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="text-sm text-slate-600">
              {currentTest?.discrete && currentTest.nest == 2 && (
                <>
                  <select
                    onChange={handleChange2}
                    ref={select2Ref}
                    defaultValue={0}
                    className={MODAL_INPUT_CLASS + " mb-3"}
                  >
                    {currentTest?.type.map((item: any, index: number) => {
                      return (
                        <option value={index} key={index}>
                          {item.name}
                        </option>
                      );
                    })}
                  </select>
                  <div className="border border-slate-200 rounded-lg p-2 flex flex-wrap">
                    {currentTestType?.parameters?.map((item: any, index: number) => {
                      return (
                        <label
                          className="whitespace-nowrap inline-block m-2 cursor-pointer"
                          key={index}
                        >
                          <input
                            checked={item.checked}
                            id={item.name}
                            type="checkbox"
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 mr-1"
                            onChange={(e) =>
                              handleCheckbox({
                                e,
                                currentTest,
                                currentTestType,
                                index,
                              })
                            }
                          />
                          {item.name}
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
              {currentTest?.discrete && currentTest.nest == 1 && (
                <div className="border border-slate-200 rounded-lg p-2 flex flex-wrap">
                  {currentTest?.parameters?.map((item: any, index: number) => {
                    return (
                      <label
                        className="whitespace-nowrap inline-block m-2 cursor-pointer"
                        key={index}
                      >
                        <input
                          checked={item.checked}
                          id={item.name}
                          type="checkbox"
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 mr-1"
                          onChange={(e) => handleCheckbox({ e, currentTest, index })}
                        />
                        {item.name}
                      </label>
                    );
                  })}
                </div>
              )}
              {!currentTest?.discrete && currentTest?.nest == 0 && (
                <div className="border border-slate-200 rounded-lg p-2 flex flex-wrap">
                  {currentTest?.parameters?.map((item: any, index: number) => {
                    return (
                      <label
                        className="whitespace-nowrap inline-block m-2 cursor-pointer"
                        key={index}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          id={item.name}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 mr-1"
                          onChange={(e) => handleCheckbox({ e, currentTest, index })}
                        />
                        {item.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
              <button onClick={handleProceed} className={MODAL_PRIMARY_BUTTON}>
                Proceed
              </button>
              <button onClick={handleCancelModal} className={MODAL_SECONDARY_BUTTON}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={showTestModal}
        onClose={handleCancelTestModal}
        size="lg"
        title={testData.test_title || "Test"}
      >
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Total Cost
            </p>
            <p
              className={`text-2xl font-bold ${
                testData.status == "Awaiting Payment" ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {formatCurrency(testData.total_cost)}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${
              STATUS_BADGE[testData.status] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {testData.status}
          </span>
        </div>

        <div className="flex rounded-lg border border-slate-200 p-1 mb-5">
          <button
            type="button"
            onClick={() => setCurrentTab(0)}
            className={`flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-colors ${
              currentTab == 0 ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <i className="fas fa-money-bill-wave"></i>
            Payment
            {testData.status !== "Awaiting Payment" && (
              <i
                className={`fas fa-check-circle ${
                  currentTab == 0 ? "text-white" : "text-emerald-500"
                }`}
              ></i>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab(1)}
            className={`flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-colors ${
              currentTab == 1 ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <i className="fas fa-vials"></i>
            Test Result
            {testData.status === "Test Completed" && (
              <i
                className={`fas fa-check-circle ${
                  currentTab == 1 ? "text-white" : "text-emerald-500"
                }`}
              ></i>
            )}
          </button>
        </div>

        <div className="text-sm text-slate-600">
          {currentTab == 0 && testData.status === "Awaiting Payment" && (
            <form className="flex flex-col my-2 items-start space-y-4 w-full">
              <div className="w-full">
                <label className={LABEL_CLASS}>Payment method</label>
                <div className="flex rounded-lg border border-slate-200 p-1">
                  <button
                    type="button"
                    onClick={() => setPaymentOption("cash")}
                    className={`flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-colors ${
                      paymentOption === "cash"
                        ? "bg-brand-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <i className="fas fa-money-bill-wave"></i>
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption("card")}
                    className={`flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-colors ${
                      paymentOption === "card"
                        ? "bg-brand-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <i className="fas fa-credit-card"></i>
                    Card
                  </button>
                </div>
              </div>
              {paymentOption == "cash" && (
                <>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div>
                      <label className={LABEL_CLASS} htmlFor="invoice">
                        Invoice No.
                      </label>
                      <input
                        id="invoice"
                        ref={invoiceRef}
                        type="text"
                        className={MODAL_INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS} htmlFor="amountPaid">
                        Amount Paid
                      </label>
                      <input
                        id="amountPaid"
                        ref={amountPaidRef}
                        type="text"
                        className={MODAL_INPUT_CLASS}
                      />
                    </div>
                  </div>
                  <button
                    disabled={loading}
                    type="button"
                    onClick={handleSavePayment}
                    className={MODAL_PRIMARY_BUTTON + " w-full"}
                  >
                    {loading && <Spinner />}
                    <i className="fas fa-hand-holding-usd mr-2"></i>
                    Save Payment
                  </button>
                </>
              )}
              {paymentOption == "card" && (
                <button
                  type="button"
                  onClick={() =>
                    toast.error("Card payments aren't available yet - please select cash for now")
                  }
                  className={MODAL_PRIMARY_BUTTON + " w-full"}
                >
                  Paystack Option
                </button>
              )}
            </form>
          )}
          {currentTab == 0 && testData.status !== "Awaiting Payment" && (
            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
              <div className="flex items-center gap-3 px-4 py-3">
                <i className="fas fa-receipt text-slate-400 w-4"></i>
                <span className="text-slate-500 flex-grow">Invoice Number</span>
                <span className="font-semibold text-slate-800">
                  {testData?.payment?.invoice}
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <i className="fas fa-hand-holding-usd text-slate-400 w-4"></i>
                <span className="text-slate-500 flex-grow">Amount Paid</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(testData?.payment?.amount_paid)}
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <i className="fas fa-calendar text-slate-400 w-4"></i>
                <span className="text-slate-500 flex-grow">Date Paid</span>
                <span className="font-semibold text-slate-800">
                  {testData?.payment?.createdAt
                    ? moment(testData.payment.createdAt).format("Do MMM YYYY, h:mm a")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <i className="fas fa-user-nurse text-slate-400 w-4"></i>
                <span className="text-slate-500 flex-grow">Received by</span>
                <span className="font-semibold text-slate-800">
                  {testData?.payment?.user?.firstname} {testData?.payment?.user?.lastname}
                </span>
              </div>
            </div>
          )}

          {currentTab == 1 && testData.status === "Awaiting Result" && (
            <form
              ref={test_result_form}
              onSubmit={handleTestDataForm}
              className="w-full py-2 space-y-3"
            >
              {testData?.test_data?.map((test: any, i: number) => {
                let { parameter = {} } = test;
                if (parameter.resultType === "text") {
                  return (
                    <div key={i} className="rounded-lg border border-slate-200 p-4">
                      <label className={LABEL_CLASS} htmlFor={parameter.id}>
                        {parameter.name}{" "}
                        <span className="text-slate-400 font-normal normal-case">
                          (analysis/findings)
                        </span>
                      </label>
                      <textarea
                        id={parameter.id}
                        required
                        name={parameter.id}
                        value={resultForm[parameter.name] || ""}
                        onChange={handleResultFormChange}
                        className={MODAL_INPUT_CLASS + " h-28"}
                      />
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-200 p-4 grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className={LABEL_CLASS} htmlFor={parameter.id}>
                        {parameter.name}
                      </label>
                      <input
                        id={parameter.id}
                        type="number"
                        required
                        name={parameter.id}
                        value={resultForm[parameter.name] || ""}
                        onChange={handleResultFormChange}
                        className={MODAL_INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Unit</label>
                      <select name={`select${parameter.id}`} className={MODAL_INPUT_CLASS}>
                        {parameter.unit?.length > 0 ? (
                          parameter.unit.map((val: any, index: number) => (
                            <option key={index}>{val}</option>
                          ))
                        ) : (
                          <option value="">No unit configured</option>
                        )}
                      </select>
                      {parameter.range && (
                        <p className="text-xs text-slate-500 mt-1">
                          Reference range: {parameter.range}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <button
                disabled={loading}
                type="submit"
                name="submitbutton"
                className={MODAL_PRIMARY_BUTTON + " w-full"}
              >
                {loading && <Spinner />}
                Save Test Value/Result
              </button>
            </form>
          )}

          {currentTab == 1 &&
            testData.status === "Test Completed" &&
            displayTestResult(testData, patientData)}
        </div>

        <div className="flex items-center pt-4 mt-2 border-t border-slate-100">
          <button onClick={handleCancelTestModal} className={MODAL_SECONDARY_BUTTON}>
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
