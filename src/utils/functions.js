import moment from "moment";
import Link from "next/link";

export const getAge = (date) => {
  if (date) {
    return moment(Date.now()).diff(moment(date), "years") + " years";
  } else
    return (
      <div className="shadow animate-pulse h-2 bg-gray-300 rounded-full dark:bg-gray-700 w-6"></div>
    );
};

export const printAge = (date) => {
  return moment(Date.now()).diff(moment(date), "years") + " years";
};

export const filterRegisteredTestOnly = (arg = []) => {
  let filtered = [];
  arg.forEach((item) => {
    if (item.nest == 2) {
      item.type.map((typ) => {
        typ.parameters.map((parameter) => {
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

export const assignValuesToTest = (arg = [], formData = {}) => {
  let filtered = [];
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

export const displayTestResult = (testData = [], patientData) => {
  const patientId = patientData.data._id;
  return (
    <>
      <div className="flex flex-col items-start my-4 space-y-2 border py-4">
        <h1 className="text-center w-full underline text-xl font-bold">
          {testData.test_title}
        </h1>
        <div className="w-full">
          {testData.test_data.map((item) => {
            return (
              <div className="w-full flex space-y-0 mt-0">
                <div className="text-left flex-grow w-1/2 border px-2">
                  {item.parameter.name}
                </div>
                <div className="flex-grow w-1/2 border">
                  {item.parameter.value}
                </div>
                <div className="flex-grow w-1/2 border">mg/dl</div>
                <div className="flex-grow w-1/2 border">0.1 - 1.0</div>
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
