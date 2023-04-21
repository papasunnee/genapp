import moment from "moment";

export const getAge = (date) => {
  if (date) {
    return moment(Date.now()).diff(moment(date), "years") + " years";
  } else
    return (
      <div className="shadow animate-pulse h-2 bg-gray-300 rounded-full dark:bg-gray-700 w-6"></div>
    );
};
