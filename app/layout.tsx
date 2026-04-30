import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Elevate Admin",
  description: "Elevate CRM Business Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
