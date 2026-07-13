import IrregularConjugationTrainer from "@/components/conjugation/irregular/IrregularConjugationTrainer";

export const metadata = {
  title: "Latin Languages Irregular Conjugation | Language Playground",
  description: "Practice irregular conjugation forms in French, Spanish, Italian and Portuguese.",
};

const SUPPORTED_CONJUGATION_LANGUAGES = new Set(["fr", "es", "it", "pt"]);

function getTargetLangFromSearchParams(searchParams = {}) {
  const rawLang = Array.isArray(searchParams?.lang)
    ? searchParams.lang[0]
    : searchParams?.lang;

  return SUPPORTED_CONJUGATION_LANGUAGES.has(rawLang) ? rawLang : "";
}

export default async function IrregularConjugationPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const targetLang = getTargetLangFromSearchParams(resolvedSearchParams);

  return (
    <IrregularConjugationTrainer
      targetLang={targetLang || "fr"}
      preferStoredLang={!targetLang}
    />
  );
}