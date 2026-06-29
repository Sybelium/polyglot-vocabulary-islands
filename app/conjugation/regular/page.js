import ConjugationTrainer from "@/components/conjugation/ConjugationTrainer";

export const metadata = {
  title: "Latin Languages Regular Conjugation | Language Playground",
  description: "Practice regular conjugation patterns in French, Spanish, Italian and Portuguese.",
};

export default function RegularConjugationPage() {
  return <ConjugationTrainer targetLang="fr" />;
}