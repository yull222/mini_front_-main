import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function MainPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query) {
      navigate(`/news?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4">
      {/* 소개 섹션 */}
      <section className="py-16 bg-gray-50 w-full">
        <h2 className="text-4xl font-bold text-center mb-14 text-gray-800">
          📰 News Pocket의 주요 기능
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
          {/* 카드 1 */}
          <div className="bg-blue-100 p-6 rounded-2xl shadow-md flex flex-col justify-between h-64">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-blue-900">🔍 뉴스 검색</h3>
              <p className="text-gray-700 text-sm">
                실시간으로 뉴스를 검색하고, 관련 기사를 빠르게 모아볼 수 있어요.
              </p>
            </div>
            <p className="text-blue-900 text-xs mt-4 font-medium">
              키워드 입력하면 관련 최신 뉴스가 한눈에!
            </p>
          </div>

          {/* 카드 2 */}
          <div className="bg-green-100 p-6 rounded-2xl shadow-md flex flex-col justify-between h-64">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-green-900">🧠 AI 요약</h3>
              <p className="text-gray-700 text-sm">
                긴 뉴스 기사도 AI가 핵심 내용을 요약해줘요. 시간절약을 도와드려요!
              </p>
            </div>
            <p className="text-green-900 text-xs mt-4 font-medium">
              클릭 한 번으로 요약된 핵심 뉴스 확인 가능
            </p>
          </div>

          {/* 카드 3 */}
          <div className="bg-yellow-100 p-6 rounded-2xl shadow-md flex flex-col justify-between h-64">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-yellow-900">📜 검색 히스토리</h3>
              <p className="text-gray-700 text-sm">
                로그인한 사용자라면 언제든지 이전 검색 기록을 다시 확인할 수 있어요.
              </p>
            </div>
            <p className="text-yellow-900 text-xs mt-4 font-medium">
              과거 검색어와 뉴스 결과를 한눈에 확인
            </p>
          </div>

          {/* 카드 4 */}
          <div className="bg-purple-100 p-6 rounded-2xl shadow-md flex flex-col justify-between h-64">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-purple-900">📌 뉴스 스크랩</h3>
              <p className="text-gray-700 text-sm">
                중요한 뉴스는 따로 저장해두고, 나중에 쉽게 다시 읽을 수 있어요.
              </p>
            </div>
            <p className="text-purple-900 text-xs mt-4 font-medium">
              관심 있는 뉴스만 따로 모아보세요!
            </p>
          </div>
        </div>
      </section>

      {/* 검색창 섹션 */}
      <section className="w-full max-w-xl mb-20 text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">🔎 뉴스 검색어를 입력하세요</h3>
        <form onSubmit={handleSearch} className="flex gap-3 justify-center">
          <input
            type="text"
            ref={inputRef}
            className="flex-grow border border-gray-300 px-4 py-2 rounded shadow w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="예: 테슬라, 코스피, 환율..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition font-semibold shadow"
          >
            검색
          </button>
        </form>
      </section>
    </div>
  );
}
