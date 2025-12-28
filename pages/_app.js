// pages/_app.js
import Script from "next/script";
import Layout from "@/components/common/Layout";
import LanguageSelector from "@/components/LanguageSelector";

import "@/styles/main.scss";
import "../pages/admin/Table.css";
import "../pages/admin/cards.css";
import "../pages/admin/users.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Hidden Google Translate container (required) */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Custom Language Selector */}


      <Layout>
        <Component {...pageProps} />
      </Layout>

      {/* Google Translate init */}
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement(
                {
                  pageLanguage: 'en',
                  includedLanguages: 'en,sv,es,fr,de,it,pt,ja,ko,zh-CN,ar,hi,si',
                  autoDisplay: false
                },
                'google_translate_element'
              );
            }
          `,
        }}
      />

      {/* Google Translate script */}
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      {/* Remove Google Translate UI completely */}
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate,
        iframe.goog-te-banner-frame {
          display: none !important;
        }

        html,
        body {
          top: 0 !important;
          margin-top: 0 !important;
        }

        .goog-te-gadget,
        .goog-te-gadget-simple,
        .goog-tooltip,
        .goog-tooltip:hover,
        .skiptranslate {
          display: none !important;
        }
      `}</style>
    </>
  );
}
