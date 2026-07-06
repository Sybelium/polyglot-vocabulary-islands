export default function VocabularyImage({
  word,
  fallback = "❔",
  className = "",
}) {
  if (word?.imageSrc) {
    return (
      <img
        src={word.imageSrc}
        alt=""
        draggable="false"
        className={className || "h-full w-full object-cover"}
      />
    );
  }

  return word?.image || fallback;
}