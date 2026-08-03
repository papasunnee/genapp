"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "@/components/ui/Toast";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import moment from "moment";

const INPUT_CLASS =
  "bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

const SingleTest = ({ id }: { id?: string }) => {
  const [testData, setTestData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState("cash");

  const amountPaidRef = useRef<HTMLInputElement>(null);
  const { data, mutate: mutateTest }: any = useSWR(
    `/api/diagnosis/test?id=${id}`,
    fetcher
  );
  const { mutate: mutateDiagnosis } = useSWR("/api/diagnosis", fetcher);

  useEffect(() => {
    setTestData(data?.data);
  }, [data]);

  const handlePaymentOption = (e: any) => {
    const { value } = e.target;
    setPaymentOption(value);
  };

  const handleSavePayment = async () => {
    setLoading(true);
    const amountPaid = amountPaidRef.current?.value;
    if (amountPaid == testData.total_cost) {
      try {
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount_paid: amountPaid,
            test: testData._id,
            payment_option: paymentOption,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Payment successfully recorded");
          mutateTest();
          mutateDiagnosis();
          const itemCopy = {
            ...data.data,
            test_data: JSON.parse(data.data.test_data),
          };
          setTestData(itemCopy);
        } else {
          toast.error(data.error || "Failed to record payment");
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    } else {
      toast.error("Wrong amount entered");
    }
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="px-6 py-5 border-b border-slate-100">
        <h6 className="text-slate-800 text-md md:text-lg font-semibold mb-4">
          Payment Information
        </h6>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <p className="font-medium text-slate-500">Patient Name</p>
          <p className="font-semibold text-slate-800">
            {testData?.patient?.firstname} {testData?.patient?.lastname}
          </p>
          <p className="font-medium text-slate-500">Test Title</p>
          <p className="font-semibold text-slate-800">{testData?.test_title}</p>
          <p className="font-medium text-slate-500">Invoice Number</p>
          <p className="font-semibold text-slate-800">{testData?.invoice?.invoiceNumber}</p>
          <p className="font-medium text-slate-500">Total Cost</p>
          <p
            className={`font-semibold ${
              testData?.status == "Awaiting Payment"
                ? "text-red-600"
                : testData?.status == "Cancelled"
                ? "text-slate-500"
                : "text-emerald-600"
            }`}
          >
            {formatCurrency(testData?.total_cost)}
          </p>
          <p className="font-medium text-slate-500">Status</p>
          <p className="font-semibold text-slate-800">{testData?.status}</p>
        </div>
        {testData?.invoice?._id && (
          <Link
            href={`/print/invoice/${testData.invoice._id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 mt-4 text-sm text-brand-600 hover:underline font-semibold"
          >
            <i className="fas fa-print"></i>
            Print Invoice
          </Link>
        )}
      </div>

      <div className="px-6 py-5">
        {testData?.status === "Cancelled" ? (
          <p className="text-sm text-slate-500">
            <i className="fas fa-ban mr-1.5 text-slate-400"></i>
            This test was cancelled - its invoice was voided before payment was recorded.
          </p>
        ) : testData?.status === "Awaiting Payment" ? (
          <form className="flex flex-col items-start space-y-4 max-w-sm">
            <div className="w-full">
              <label className={LABEL_CLASS} htmlFor="paymentOption">
                Select payment option
              </label>
              <select
                onChange={handlePaymentOption}
                id="paymentOption"
                className={INPUT_CLASS}
              >
                <option value="cash">Cash</option>
                <option value="card">Card Payment</option>
              </select>
            </div>
            {paymentOption == "cash" && (
              <>
                <div className="w-full">
                  <label className={LABEL_CLASS} htmlFor="amountPaid">
                    Amount Paid
                  </label>
                  <input
                    id="amountPaid"
                    ref={amountPaidRef}
                    type="text"
                    placeholder={formatCurrency(testData?.total_cost)}
                    className={INPUT_CLASS}
                  />
                </div>
                <button
                  disabled={loading}
                  type="button"
                  onClick={handleSavePayment}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 transition-colors"
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
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
              >
                Paystack Option
              </button>
            )}
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm max-w-sm">
            <span className="font-medium text-slate-500">Invoice Number</span>
            <span className="text-slate-800">{testData?.invoice?.invoiceNumber}</span>
            <span className="font-medium text-slate-500">Amount Paid</span>
            <span className="text-slate-800">
              {formatCurrency(testData?.payment?.amount_paid)}
            </span>
            <span className="font-medium text-slate-500">Date Paid</span>
            <span className="text-slate-800">
              {moment(testData?.payment?.createdAt).format("Do MMMM, YYYY | h:mm:ss a")}
            </span>
            <span className="font-medium text-slate-500">Received by</span>
            <span className="text-slate-800">
              {testData?.payment?.user?.firstname} {testData?.payment?.user?.lastname}
              <span className="block text-xs text-slate-400">
                {testData?.payment?.user?.role?.name}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleTest;
