import moment from "moment";
import Link from "next/link";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (amount: any): string => {
  const value = Number(amount);
  return `NGN ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
};

export const getAge = (date?: string | Date) => {
  if (date) {
    return moment(Date.now()).diff(moment(date), "years") + " years";
  } else
    return (
      <div className="shadow animate-pulse h-2 bg-gray-300 rounded-full dark:bg-gray-700 w-6"></div>
    );
};

export const printAge = (date: string | Date) => {
  return moment(Date.now()).diff(moment(date), "years") + " years";
};

export const filterRegisteredTestOnly = (arg: any[] = []) => {
  let filtered: any[] = [];
  arg.forEach((item) => {
    if (item.nest == 2) {
      item.type.map((typ: any) => {
        typ.parameters.map((parameter: any) => {
          if (parameter.checked) {
            filtered.push({
              name: item.name,
              discrete: item.discrete,
              nest: 2,
              type: typ.name,
              parameter: {
                ...parameter,
              },
            });
          }
        });
      });
    } else if (item.nest == 1) {
    } else if (item.nest == 0) {
    }
  });
  // return arg;
  return filtered;
};

export const assignValuesToTest = (arg: any[] = [], formData: Record<string, any> = {}) => {
  let filtered: any[] = [];
  arg.forEach((item) => {
    let { parameter } = item;
    if (parameter.checked) {
      const unit = "select" + parameter.id;
      filtered.push({
        ...item,
        parameter: {
          ...parameter,
          selectedunit: formData[unit],
          value: formData[parameter.id],
        },
      });
    }
  });
  return filtered;
};

export const displayTestResult = (testData: any = {}, patientData: any) => {
  const patientId = patientData.data._id;
  return (
    <div className="py-2">
      <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {testData.test_data.map((item: any, index: number) => {
          if (item.parameter.resultType === "text") {
            return (
              <div key={index} className="px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                  {item.parameter.name}
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {item.parameter.value}
                </p>
              </div>
            );
          }
          return (
            <div
              key={index}
              className="px-4 py-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {item.parameter.name}
                </p>
                {item.parameter.range && (
                  <p className="text-xs text-slate-400">
                    Reference range: {item.parameter.range}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-base font-bold text-slate-800">
                  {item.parameter.value}
                </span>{" "}
                <span className="text-sm text-slate-500">
                  {item.parameter.selectedunit || item.parameter.unit?.[0] || ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center w-full pt-5">
        <Link
          target="_blank"
          href={`/print/${patientId}/${testData._id}`}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-sm px-5 py-2.5 transition-colors"
        >
          <i className="fas fa-print"></i>
          Launch Print View
        </Link>
      </div>
    </div>
  );
};
