import "./globals.css";

export const metadata = {
  title: "Polyglot Vocabulary Islands",
  description: "Learn vocabulary with interactive language islands.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Polyglot Islands",
    statusBarStyle: "default"
  }
};

export const viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sky-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}