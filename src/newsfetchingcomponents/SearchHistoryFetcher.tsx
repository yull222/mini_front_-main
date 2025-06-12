import { useEffect, useState } from "react";
import NewsCard from "../newsfetchingcomponents/NewsCard";
import type { newsInfo } from "../newsfetchingcomponents/NewsFetcher"; 

import { useNavigate } from "react-router-dom";

interface HistoryItem {
  id: string;
  query: string;
  resultJson: string;
  searchedAt: string;
}

interface Props {
  currentQuery: string;
}

export default function SearchHistoryFetcher({ currentQuery }: Props) {
  const [filteredNews, setFilteredNews] = useState<newsInfo[][]>([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId || !currentQuery) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/history?userId=${userId}`);
        const data: HistoryItem[] = await res.json();

        // 1️⃣ 현재 검색어와 같은 query만 필터링
        const matched = data
          .filter((item) => item.query === decodeURI(currentQuery))
          .map((item) => JSON.parse(item.resultJson) as newsInfo[]);

        setFilteredNews(matched);
      } catch (err) {
        console.error("히스토리 불러오기 실패:", err);
      }
    };

    fetchHistory();
  }, [userId, currentQuery]);

  if (!userId) {
    return (
      <div className="p-4 bg-yellow-50 border rounded shadow text-center">
        <p className="text-gray-800 font-semibold mb-3">
          로그인하시면 이전 검색 기록을 확인하실 수 있습니다.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          로그인 하러가기
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {filteredNews.length > 0 ? (
        filteredNews.map((newsList, idx) => (
          <div key={idx}>
            {newsList.map((item) => (
              <NewsCard key={item.id} data={item} />
            ))}
          </div>
        ))
      ) : (
        <div className="text-gray-500">이전 검색 기록이 없습니다.</div>
      )}
    </div>
  );
}
