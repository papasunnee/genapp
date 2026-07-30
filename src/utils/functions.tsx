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
    <>
      <div className="flex flex-col items-start my-4 space-y-2 border py-4">
        <h1 className="text-center w-full underline text-xl font-bold">
          {testData.test_title}
        </h1>
        <div className="w-full">
          {testData.test_data.map((item: any, index: number) => {
            if (item.parameter.resultType === "text") {
              return (
                <div className="w-full flex flex-col mt-0 border" key={index}>
                  <div className="text-left px-2 font-semibold border-b bg-gray-50">
                    {item.parameter.name}
                  </div>
                  <div className="px-2 py-1 whitespace-pre-wrap">
                    {item.parameter.value}
                  </div>
                </div>
              );
            }
            return (
              <div className="w-full flex space-y-0 mt-0" key={index}>
                <div className="text-left flex-grow w-1/2 border px-2">
                  {item.parameter.name}
                </div>
                <div className="flex-grow w-1/2 border">
                  {item.parameter.value}
                </div>
                <div className="flex-grow w-1/2 border">
                  {item.parameter.selectedunit || item.parameter.unit?.[0] || "-"}
                </div>
                <div className="flex-grow w-1/2 border">
                  {item.parameter.range || "-"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center w-full py-5 block">
          <Link
            target="_blank"
            href={`/print/${patientId}/${testData._id}`}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 mr-2 mb-2 focus:outline-none"
          >
            Launch Print View
          </Link>
        </div>
      </div>
    </>
  );
};
