import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "../styles/globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "900"],
});

const rootDomain = process.env.ROOT_DOMAIN || "thelabsuite.com";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${rootDomain}`),
  title: {
    default: "LabSuite - Run Your Diagnostic Lab From One Place",
    template: "%s | LabSuite",
  },
  description:
    "Patient records, test orders, results, payments, and branded reports - LabSuite gives every diagnostic lab its own private, isolated workspace to run day-to-day operations without spreadsheets.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    siteName: "LabSuite",
    title: "LabSuite - Run Your Diagnostic Lab From One Place",
    description:
      "Patient records, test orders, results, payments, and branded reports - all in one private workspace per lab.",
  },
  twitter: {
    card: "summary",
    title: "LabSuite - Run Your Diagnostic Lab From One Place",
    description:
      "Patient records, test orders, results, payments, and branded reports - all in one private workspace per lab.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className={roboto.className}>{children}</main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
