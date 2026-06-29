import IrregularConjugationTrainer from "@/components/conjugation/irregular/IrregularConjugationTrainer";

export const metadata = {
  title: "Latin Languages Irregular Conjugation | Language Playground",
  description: "Practice irregular conjugation forms in French, Spanish, Italian and Portuguese.",
};

export default function IrregularConjugationPage() {
  return <IrregularConjugationTrainer targetLang="fr" />;
}