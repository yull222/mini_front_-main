import { useState, useEffect } from "react";
import { type newsInfo } from "./NewsFetcher";

interface dataProps {
  data: newsInfo;
}

export default function NewsCard({ data }: dataProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scraped, setScraped] = useState(false);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.link,
          length: "short",
          style: "neutral",
          use_ai: true,
        }),
      });

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
  /*
  const scrapHandler = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    if (!scraped) {
      // 1. Gemini 요약 먼저 받아오기
      const summaryRes = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.link,
          length: "short",
          style: "neutral",
          use_ai: true,
        }),
      });

      if (!summaryRes.ok) throw new Error("요약 실패");
      const summaryData = await summaryRes.json();

      // 2. 받은 요약 포함해서 스크랩 저장
      const res = await fetch("http://localhost:8081/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: data.title,
          link: data.link,
          originallink: data.originallink,
          pubDate: data.pubDate,
          summary: summaryData.summary || "요약 없음",
        }),
      });

      if (res.ok) {
        setScraped(true);
      } else {
        alert("스크랩 실패");
      }
    } else {
      // 해제
      const res = await fetch(
        `http://localhost:8081/api/like?userId=${userId}&link=${encodeURIComponent(data.link)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setScraped(false);
      } else {
        alert("스크랩 해제 실패");
      }
    }
  } catch (err) {
    console.error("스크랩 토글 오류:", err);
    alert("오류 발생");
  }
};
*/

   const scrapHandler = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    if (!scraped) {
      // 1. Gemini 요약 먼저 받아오기
      const summaryRes = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.link,
          length: "short",
          style: "neutral",
          use_ai: true,
        }),
      });

      if (!summaryRes.ok) throw new Error("요약 실패");
      const summaryData = await summaryRes.json();

      // 2. 받은 요약 포함해서 스크랩 저장
      const res = await fetch("http://10.125.121.190:8080/api/liked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userId,
          title: data.title,
          link: data.link,
          originallink: data.originallink,
          pubDate: data.pubDate,
          summary: summaryData.summary || "요약 없음",
        }),
      });

      if (res.ok) {
        setScraped(true);
      } else {
        alert("스크랩 실패");
      }
    } else {
      // 해제
      const res = await fetch(
        `http://10.125.121.190:8080/api/liked?username=${userId}&link=${encodeURIComponent(data.link)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setScraped(false);
      } else {
        alert("스크랩 해제 실패");
      }
    }
  } catch (err) {
    console.error("스크랩 토글 오류:", err);
    alert("오류 발생");
  }
};


  // 처음 렌더링 시 스크랩 여부 확인
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const checkScrap = async () => {
      try {
        const res = await fetch(
          `http://10.125.121.190:8080/api/liked/check?username=${encodeURIComponent(
            userId
          )}&link=${encodeURIComponent(data.link)}`
        );
        if (!res.ok) throw new Error("스크랩 여부 확인 실패");

        const result = await res.json();
        setScraped(result.scraped); // { scraped: true/false }
      } catch (err) {
        console.error("스크랩 여부 확인 에러:", err);
      }
    };

    checkScrap();
  }, [data.link]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2 hover:scale-105 transition-transform duration-200 relative">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        <a
          href={data.originallink || data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 underline"
        >
          {data.title.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/&quot;/g, '"')}
        </a>
      </h2>
      <p className="text-sm text-gray-500">{data.pubDate}</p>

      <div className="flex gap-2 mt-3">
        <button
          onClick={summarizeHandler}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        >
          요약 보기
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500 mt-2">요약 중...</p>}
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
          <div className="mt-1">
            <a
              href={data.originallink || data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 underline hover:text-blue-800"
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

      {/* 하트 버튼: 오른쪽 하단 */}
      <button
        onClick={scrapHandler}
        className="text-2xl absolute bottom-2 right-2 hover:scale-110 transition"
        title={scraped ? "스크랩 해제" : "스크랩"}
      >
        {scraped ? "❤️" : "🤍"}
      </button>
    </div>
  );
}
