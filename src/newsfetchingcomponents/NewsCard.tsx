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
          url: data.link,
          length: "short",
          style: "neutral",
          use_ai: true
        })
      });

      console.log("요약 요청 보낼 링크:", data.link);

      if (!res.ok) throw new Error("요약 요청 실패");

      const result = await res.json();
      setSummary(result.summary);
    } catch (err) {
      console.error("요약 에러:", err);
      setError("요약이 불가한 기사입니다. 원문으로 확인하실 수 있습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2 hover:scale-105 transition-transform duration-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {data.title.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/&quot;/g, '"')}
      </h2>
      <p className="text-sm text-gray-500">{data.pubDate}</p>

      <button
        onClick={summarizeHandler}
        className="mt-3 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
      >
        요약 보기
      </button>

      {loading && <p className="text-sm text-gray-500 mt-2">요약 중...</p>}

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
          <div className="mt-1">
            <a
              href={data.originallink || data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-blue-600 underline hover:text-blue-800"
            >
              원문 보기
            </a>
          </div>
        </div>
      )}

      {summary && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-800">
          <strong>요약:</strong> {summary}
        </div>
      )}
    </div>
  );
}
