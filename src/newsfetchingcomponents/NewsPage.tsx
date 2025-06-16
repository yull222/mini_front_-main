//뉴스 검색 결과, 히스토리 보여주는 페이지
//  과거 히스토리도 조회 하게 만들었음

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import NewsFetcher from "./NewsFetcher"; //뉴스 api호출 컴포넌트
import SearchHistoryFetcher from "./SearchHistoryFetcher"; //히스토리 api호출 컴포넌트

export default function NewsPage() {
  const [params] = useSearchParams(); // useSearchParams로 URL의 쿼리 파라미터navigate("/news?query=검색어") 읽음
  const queryFromURL = params.get("query") || ""; // 쿼리 파라미터에서 'query' 값을 가져옴, 없으면 빈 문자열 언디파인되는거 방지하려고씀
  const [inputValue, setInputValue] = useState(queryFromURL); //검색입력한값 텍스트 저장하는 상태
  const [showHistory, setShowHistory] = useState(false); //히스토리 보기 버튼 눌렀는지 저장하는거 만들기 
  const userId = localStorage.getItem("userId"); //로그인됐는지보려고
  const navigate = useNavigate(); //검색누르면 다시 호출하게 만들어야 

 //검색어 창에 값 바꿔주게 만들어야 함 
 //검색어 창에 값이 들어가는게 좋을거같음
  useEffect(() => {
    setInputValue(queryFromURL);
  }, [queryFromURL]);

  const onSubmitHandle = (e: React.FormEvent) => {
    e.preventDefault(); // 폼제출하고 페이지 새로고침 방지
    //공백제거해주는거
    
    const trimmed = inputValue.trim(); 
    if (trimmed) {
      navigate(`/news?query=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-50 p-4">
      {/* 검색 폼 
      검색 폼을 제출하면 동작하게  */}
      <form onSubmit={onSubmitHandle} className="mb-6 flex gap-2 w-full max-w-xl">
        <input
          type="text"
          value={inputValue}  //입력창의 값은 inputValue 로 관리
          onChange={(e) => setInputValue(e.target.value)} //입력창을 수정하면 setInputValue()
          className="flex-grow border px-3 py-2 rounded"
          placeholder="검색 입력..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          검색
        </button>
      </form>

      {/* 히스토리 보기 버튼 
      show history 숨긴 상태로 먼저  
      로그인할 때 localStorage에 저장된 사용자 ID
      queryFromURL 현재 브라우저 주소창의 URL 쿼리 파라미터   navigate("/news?query=...")로 이동했을 때 
      \*/}
      {userId && queryFromURL && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="mb-4 text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {showHistory ? "히스토리 숨기기" : "히스토리 보기"}
        </button>
      )}

      {/* 검색 결과랑  히스토리 렌더링 
      navigate("/news?query=...")로 이동하고  
      queryFromURL가 존재하면 뉴스 검색 결과와 히스토리 보여주기
      showHistory가 true이고 userId가 존재하면 현재 검색 결과와 과거 검색 기록을 보여주는게 안됨 ㅇㅇㅇㅇㅇㅇ됨
      */}
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
            <NewsFetcher uriEncodedString={encodeURIComponent(queryFromURL)} /> {/* 뉴스 호출해서 뉴스 카드 리스트를 보여주는거 props로전달uriEncodedString*/}
          </div>
        )
      )}
    </div>
  );
}
