import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowBoard",
  description: "A beautiful project management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
