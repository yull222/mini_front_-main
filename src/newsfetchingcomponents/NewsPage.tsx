import { useState } from "react";
import NewsFetcher from "./NewsFetcher";
import SearchHistoryFetcher from "./SearchHistoryFetcher";

// 임시 로그인 상태 (실제론 Context 또는 전역 상태관리로 처리해야 함)
const isLoggedIn = true;

export default function NewsPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-50 p-4">
      {/* 검색 폼 */}
      <form
        className="mb-6 flex gap-2 w-full max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          const value = (e.currentTarget.querySelector("input") as HTMLInputElement).value;
          setQuery(encodeURI(value));
        }}
      >
        <input type="text" className="flex-grow border px-3 py-2 rounded" placeholder="검색어 입력..." />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">검색</button>
      </form>

      {/* 조건 분기 */}
      {isLoggedIn && query ? (
        <div className="w-full flex justify-center gap-8">
          <div className="w-1/2">
            <h2 className="text-xl font-bold mb-2">현재 검색 결과</h2>
            <NewsFetcher uriEncodedString={query} />
          </div>
          <div className="w-1/2">
            <h2 className="text-xl font-bold mb-2">이전 검색 기록</h2>
            <SearchHistoryFetcher currentQuery={query} />

          </div>
        </div>
      ) : (
        query && (
          <div className="w-4/5">
            <SearchHistoryFetcher currentQuery={decodeURI(query)} />

          </div>
        )
      )}
    </div>
  );
}
