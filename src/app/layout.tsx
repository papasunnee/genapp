import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import Providers from "./providers";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "../styles/globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "900"],
});

export const metadata: Metadata = {
  title: "LabFlow",
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
      </body>
    </html>
  );
}
