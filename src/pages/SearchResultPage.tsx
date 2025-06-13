import { useState } from "react";
import NewsFetcher from "../newsfetchingcomponents/NewsFetcher";
import SearchHistoryFetcher from "../newsfetchingcomponents/SearchHistoryFetcher";

export default function SearchResultPage({ uriEncodedString }: { uriEncodedString: string }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">뉴스 검색 결과</h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          {showHistory ? "히스토리 숨기기" : "히스토리 보기"}
        </button>
      </div>

      {!showHistory ? (
        // 히스토리 안보일 때는 검색결과만
        <NewsFetcher uriEncodedString={uriEncodedString} />
      ) : (
        // 히스토리 보일 때는 2패널 구성
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <h2 className="text-lg font-semibold mb-2">과거 검색 기록</h2>
            <SearchHistoryFetcher currentQuery={uriEncodedString} />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-lg font-semibold mb-2">현재 검색 결과</h2>
            <NewsFetcher uriEncodedString={uriEncodedString} />
          </div>
        </div>
      )}
    </div>
  );
}
