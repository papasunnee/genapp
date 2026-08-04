import moment from "moment";
import Link from "next/link";

// The billing currency itself is fixed - a lab operating in Naira charges
// in Naira no matter who's looking at the screen, so this never converts
// to another currency based on where it's viewed. What *does* localize is
// the formatting convention (grouping separators, symbol placement,
// symbol vs. code) via Intl.NumberFormat's locale argument - en-NG reads
// "₦25,000.00", a locale with no NGN symbol mapping falls back to
// "NGN 25,000.00", and de-DE would group digits as "25.000,00 NGN".
const DEFAULT_LOCALE = "en-NG";
const CURRENCY = "NGN";

function detectLocale(): string {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return DEFAULT_LOCALE;
}

export const formatCurrency = (amount: any, locale?: string): string => {
  const value = Number(amount);
  const safeValue = Number.isFinite(value) ? value : 0;
  const resolvedLocale = locale || detectLocale();

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency: CURRENCY,
    }).format(safeValue);
  } catch {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: "currency",
      currency: CURRENCY,
    }).format(safeValue);
  }
};

export function resizeImageToDataUrl(file: File, maxSize = 160): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas is not supported in this browser"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a file (image or PDF) as a base64 data URI with no resizing or
 * re-encoding - unlike resizeImageToDataUrl, this must also work for PDFs,
 * which can't be drawn onto a canvas.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

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

      {testData.labRemark && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
            Clinical Remark
          </p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{testData.labRemark}</p>
        </div>
      )}

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
