import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { PatientAuthProvider } from "@/lib/patientAuth";
import AuthModal from "@/components/AuthModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "India Care Consultancy - Premium Healthcare Guidance & Doctor Recommendation",
  description: "Find the right doctors, clinics, and partner hospitals. Get personalized healthcare advice, doctor recommendations, and appointment coordination across India.",
  keywords: "healthcare consultancy, find doctor, hospital recommendation, India care, medical guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <PatientAuthProvider>
          <ToastProvider>
            {children}
            {/* Global patient auth modal — available on every page */}
            <AuthModal />
          </ToastProvider>
        </PatientAuthProvider>
      </body>
    </html>
  );
}
