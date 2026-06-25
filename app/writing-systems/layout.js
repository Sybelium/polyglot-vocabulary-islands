export const metadata = {
  title: "Polyglot Writing Systems",
  description: "Explore alphabets, scripts and letter sounds around the world.",
  manifest: "/manifests/writing-systems.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Writing Systems",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#7c3aed",
};

export default function WritingSystemsLayout({ children }) {
  return <>{children}</>;
}