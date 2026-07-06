import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import SentencesAppShell from "@/components/sentences/SentencesAppShell";
import {
  SENTENCE_LANGUAGES,
  SENTENCE_STEPS,
} from "@/components/sentences/sentenceUtils";

export const metadata = {
  title: "Sentences | Language Playground",
  description:
    "Practice useful sentences with ordering, matching, blanks and polyglot comparison.",
};

async function readJson(relativePath) {
  const filePath = path.join(process.cwd(), "public", relativePath);
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
}

function isSafeId(value) {
  return /^[a-z0-9_-]+$/i.test(String(value || ""));
}

async function getSentenceIndex() {
  return readJson("data/sentences/index.json");
}

async function getSentenceTheme(subjectId) {
  if (!isSafeId(subjectId)) return null;

  try {
    return await readJson(`data/sentences/${subjectId}.json`);
  } catch {
    return null;
  }
}

export default async function SentencesStepPage({ params }) {
  const { lang, subjectId, step } = await params;

  const validLang = SENTENCE_LANGUAGES.some((language) => language.id === lang);
  const validStep = SENTENCE_STEPS.some((item) => item.id === step);

  if (!validLang || !validStep || !isSafeId(subjectId)) {
    notFound();
  }

  const index = await getSentenceIndex();
  const themes = Array.isArray(index?.themes) ? index.themes : [];
  const subject = themes.find((theme) => theme.id === subjectId);

  if (!subject) {
    notFound();
  }

  const themeData = await getSentenceTheme(subjectId);

  if (!themeData || !Array.isArray(themeData.sentences)) {
    notFound();
  }

  return (
    <SentencesAppShell
      lang={lang}
      subjectId={subjectId}
      step={step}
      themes={themes}
      subject={subject}
      themeData={themeData}
    />
  );
}