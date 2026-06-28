import IrregularConjugationTrainer from "@/components/conjugation/irregular/IrregularConjugationTrainer";

export default async function IrregularConjugationPage({ params }) {
  const { lang } = await params;

  return <IrregularConjugationTrainer targetLang={lang} />;
}