import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import NewsFetcher from "./NewsFetcher";
import SearchHistoryFetcher from "./SearchHistoryFetcher";

export default function NewsPage() {
  const [params] = useSearchParams();
  const queryFromURL = params.get("query") || "";
  const [inputValue, setInputValue] = useState(queryFromURL); // 
  const [showHistory, setShowHistory] = useState(false);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

 
  useEffect(() => {
    setInputValue(queryFromURL);
  }, [queryFromURL]);

  const onSubmitHandle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      navigate(`/news?query=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-50 p-4">
      {/* 검색 폼 */}
      <form onSubmit={onSubmitHandle} className="mb-6 flex gap-2 w-full max-w-xl">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow border px-3 py-2 rounded"
          placeholder="검색 입력..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          검색
        </button>
      </form>

      {/* 히스토리 보기 버튼 */}
      {userId && queryFromURL && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="mb-4 text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {showHistory ? "히스토리 숨기기" : "히스토리 보기"}
        </button>
      )}

      {/* 검색 결과 & 히스토리 렌더링 */}
      {queryFromURL && (
        showHistory && userId ? (
          <div className="w-full flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-bold mb-2">현재 검색 결과</h2>
              <NewsFetcher uriEncodedString={encodeURIComponent(queryFromURL)} />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-bold mb-2">과거 검색 기록</h2>
              <SearchHistoryFetcher currentQuery={queryFromURL} />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <NewsFetcher uriEncodedString={encodeURIComponent(queryFromURL)} />
          </div>
        )
      )}
    </div>
  );
}
