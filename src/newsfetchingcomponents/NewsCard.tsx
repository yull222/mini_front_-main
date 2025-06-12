import { useState } from "react";
import { type newsInfo } from "./NewsFetcher";

interface dataProps {
  data: newsInfo;
}

export default function NewsCard({ data }: dataProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarizeHandler = async () => {
  if (!data?.link) {
    setError("기사 링크가 없습니다.");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const res = await fetch("http://localhost:5000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: data.link,        // ✨ 여기 핵심: 실제 기사 링크
        length: "medium",      // 선택사항
        style: "neutral",      // 선택사항
        use_ai: true           // .env에 키가 있으니 Gemini 사용됨
      })
    });

    if (!res.ok) throw new Error("요약 요청 실패");

    const result = await res.json();
    setSummary(result.summary);
  } catch (err) {
    console.error("요약 에러:", err);
    setError("요약 중 문제가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2 hover:scale-105 transition-transform duration-200">
      <a
        href={data.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 mb-2">
          {data.title
            .replace(/<b>/g, "")
            .replace(/<\/b>/g, "")
            .replace(/&quot;/g, '"')}
        </h2>
        <p className="text-sm text-gray-500">{data.pubDate}</p>
      </a>

      <button
        onClick={summarizeHandler}
        className="mt-3 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
      >
        요약 보기
      </button>

      {loading && <p className="text-sm text-gray-500">요약 중...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {summary && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-800">
          <strong>요약:</strong> {summary}
        </div>
      )}
    </div>
  );
}
