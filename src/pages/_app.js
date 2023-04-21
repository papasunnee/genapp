import React from "react";
import Head from "next/head";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { Roboto } from "next/font/google";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/styles/globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "900"],
});

export default function App({ Component, pageProps }) {
  const Layout = Component.layout || (({ children }) => <>{children}</>);
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>Genesis Diagnostics Laboratory</title>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.5/flowbite.min.css"
          rel="stylesheet"
        />
        {/* <Script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE"></Script> */}
      </Head>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.5/flowbite.min.js"></Script>
      <SessionProvider session={pageProps.session}>
        <main className={roboto.className}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </main>
      </SessionProvider>
    </>
  );
}
