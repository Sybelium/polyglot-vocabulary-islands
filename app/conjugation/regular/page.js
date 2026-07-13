import ConjugationTrainer from "@/components/conjugation/ConjugationTrainer";

export const metadata = {
  title: "Latin Languages Regular Conjugation | Language Playground",
  description: "Practice regular conjugation patterns in French, Spanish, Italian and Portuguese.",
};

const SUPPORTED_CONJUGATION_LANGUAGES = new Set(["fr", "es", "it", "pt"]);

function getTargetLangFromSearchParams(searchParams = {}) {
  const rawLang = Array.isArray(searchParams?.lang)
    ? searchParams.lang[0]
    : searchParams?.lang;

  return SUPPORTED_CONJUGATION_LANGUAGES.has(rawLang) ? rawLang : "";
}

export default async function RegularConjugationPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const targetLang = getTargetLangFromSearchParams(resolvedSearchParams);

  return (
    <ConjugationTrainer
      targetLang={targetLang || "fr"}
      preferStoredLang={!targetLang}
    />
  );
}