import ConjugationTrainer from "@/components/conjugation/ConjugationTrainer";

export const metadata = {
  title: "Regular Conjugation Trainer | Polyglot World",
  description: "Learn regular conjugation patterns with roots and endings.",
};

export default async function RegularConjugationPage({ params }) {
  const { lang } = await params;

  return <ConjugationTrainer targetLang={lang} />;
}