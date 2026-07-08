// app/layout.js
import { dbConnect } from "@/services/mongo";
import { Bebas_Neue, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";
import SideNavbar from "./SideNavBarComponent/SideNavbar";
import { ThemeProvider } from "./providers/ThemeProvider";
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "HKD Outdoor Innovations Limited",
  description:
    "A comprehensive contact management system for HKD Outdoor Innovations Limited",
  verification: {
    google: "AN7z4L9HiQdrX-lFrsDr2gAP7uEcLfQfzgwO_r2_-jI",
  },
};

// ✅ WebSite Schema — Google এটা দেখে সাইটের নাম ঠিক করে
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HKD Outdoor Innovations Limited",
  url: "https://hkdoutdoorinnovationsltd.vercel.app",
};

export default async function RootLayout({ children }) {
  await dbConnect();

  return (
    <html lang="en" style={{ "--sidebar-w": "56px" }}>
      <head>
        {/* ✅ এই script টা যোগ করুন */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`
          ${poppins.variable}
          ${roboto.variable}
          ${bebasNeue.variable}
          antialiased
        `}
      >
        <ThemeProvider>
        <AuthProvider>
          <SideNavbar />
          <div
            style={{
              paddingLeft: "var(--sidebar-w)",
              transition: "padding-left 280ms cubic-bezier(0.4,0,0.2,1)",
              minHeight: "100vh",
            }}
          >
            {children}
          </div>
        </AuthProvider>
     </ThemeProvider>
      </body>
    </html>
  );
}
