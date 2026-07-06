import { notFound } from "next/navigation";
import IrregularVerbsGallery from "@/components/irregular-verbs/IrregularVerbsGallery";

const SUPPORTED_LANGS = ["en", "de", "nl"];

export const metadata = {
  title: "Germanic Irregular Verbs | Language Playground",
  description: "See, hear, and train English, German and Dutch irregular verbs.",
};

export default async function IrregularVerbsPage({ params }) {
  const { lang } = await params;

  if (!SUPPORTED_LANGS.includes(lang)) {
    notFound();
  }

  return <IrregularVerbsGallery targetLang={lang} />;
}