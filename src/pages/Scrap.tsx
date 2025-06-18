import { useEffect, useState } from "react";

type newsHistory = {
  id: number;
  title: string;
  originallink: string;
  link: string;
  summary: string;
  pubDate: string;
};

export default function Scrap() {
  const [news, setNews] = useState<newsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");

  const fetchScrapHistory = async () => {
    if (!userId) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch(`http://10.125.121.190:8080/api/liked?username=${userId}`);
      if (!resp.ok) throw new Error("불러오기 실패");
      const jsn = await resp.json();
      setNews(jsn);
    } catch (err) {
      console.error(err);
      setError("스크랩 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, link:string) => {
  try {
    const res = await fetch(
        `http://10.125.121.190:8080/api/liked?username=${userId}&link=${encodeURIComponent(link)}`,
        { method: "DELETE" }
      );
    if (res.ok) {
      setNews(prev => prev.filter(item => item.id !== id));
    } else {
      alert("스크랩 해제 실패");
    }
  } catch (err) {
    console.error("스크랩 해제 오류:", err);
    alert("오류 발생");
  }
};


  useEffect(() => {
    fetchScrapHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">❤️ 내가 스크랩한 뉴스</h2>

      {loading && <p className="text-gray-500">불러오는 중...</p>}
      {error && (
        <div className="bg-white border border-red-200 rounded-lg p-4 shadow text-red-500">
          {error}
        </div>
      )}
      {!loading && !error && news.length === 0 && (
        <p className="text-gray-400">스크랩한 뉴스가 없습니다.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {news.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-lg p-4 shadow hover:shadow-md transition relative"
          >
            <a
              href={item.originallink || item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-base font-semibold text-blue-700 hover:underline mb-2"
            >
              {item.title?.replace(/<b>/g, "").replace(/<\/b>/g, "")}
            </a>
            <p className="text-sm text-gray-600 mb-2">{item.pubDate}</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {item.summary || "요약 정보가 없습니다."}
            </p>

            {/* 스크랩 해제 버튼 */}
            <button onClick={() => handleDelete(item.id, item.link)}>❌</button>
          </div>
        ))}
      </div>
    </div>
  );
}


/*

useEffect(() => {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  fetch(`http://localhost:8081/api/like?userId=${userId}`)
    .then(res => res.json())
    .then(setNews)
    .catch(err => {
      console.error("불러오기 실패", err);
      setError("불러오기 실패");
    })
    .finally(() => setLoading(false));
}, []);
*/