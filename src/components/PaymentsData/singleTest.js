import React, { useEffect, useRef, useState } from "react";
import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { useRouter } from "next/router";
import { displayTestResult } from "@/utils/functions";

const SingleTest = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [testData, setTestData] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState("cash");

  const invoiceRef = useRef();
  const amountPaidRef = useRef();
  const { data } = useSWR(`/api/diagnosis/test?id=${router.query.id}`, fetcher);

  useEffect(() => {
    setTestData(data?.data);
  }, [data]);

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
  return (
    <div className="bg-white">
      <div className="flex items-start justify-between p-4 border-b rounded-t">
        <div className="flex flex-grow flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex-grow">
            {testData?.test_title}
          </h3>
          <div className="text-2xl font-bold">
            Total Cost :{" "}
            <span
              className={
                testData?.status == "Awaiting Payment"
                  ? "text-red-700"
                  : "text-emerald-700"
              }
            >
              NGN {testData?.total_cost}.00
            </span>
          </div>
        </div>
      </div>
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200  px-8">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2 flex-grow">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab(0);
              }}
              className={currentTab == 0 ? "active_tab" : "non_active_tab"}
            >
              Payment Information
            </a>
          </li>
        </ul>
        {currentTab == 0 && testData?.status === "Awaiting Payment" && (
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
        {currentTab == 0 && testData?.status !== "Awaiting Payment" && (
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
                {testData?.payment?.user?.lastname} <br />
                <span className="text-xs italic">
                  {testData?.payment?.user?.role?.name}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleTest;
