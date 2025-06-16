//히스트로 저장
//NewsPage에서 뉴스 결과를 보여줌 
//네이버 api 호출, 받은거로 뉴스카드 그리기 
import { useEffect, useState, type ReactNode } from "react";
import NewsCard from "./NewsCard"; 

//검색어 받을 거
export interface newsFetcherProps {
  uriEncodedString: string;
}

//뉴스 하나에 담을 객체 자료형 타입 정의하기
export type newsInfo = {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
  id: string; // 프론트 자체적으로 만든거
};

export default function NewsFetcher({ uriEncodedString }: newsFetcherProps) {
  const apikey: string = import.meta.env.VITE_APP_APIKEY; // 환경변수에서 API 키 가져오기

  // 네이버 뉴스 검색 API 호출을 위한 헤더 설정
  const myHeaders: Headers = new Headers();
  myHeaders.append("X-Naver-Client-Id", "qQ0rDJDLUQdGBC0U6Ndl");
  myHeaders.append("X-Naver-Client-Secret", apikey);

  //fetch 요청 옵션 설정 네이버 뉴스 검색 API는 GET 방식
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const [news, setNews] = useState<newsInfo[] | undefined>(); //뉴스 데이터들을 저장할 상태,  이 데이터를 업데이트할 함수

  const fetchHandler = async () => {
    try {
      // 네이버 뉴스 검색 API 호출
      const resp: Response = await fetch(`/v1/search/news.json?query=${uriEncodedString}&display=12`, requestOptions);
      const jsn = await resp.json(); //  여기서 API 응답 JSON 전체 받음

      // 프론트에서 쓸 id 추가해서 뉴스 배열 생성
      const itemsWithId: newsInfo[] = jsn.items.map((item: any, idx: number) => ({
        ...item,
        id: `${item.title}_${item.pubDate}_${idx}`,
      }));

      setNews(itemsWithId);
      await saveHistory(itemsWithId);
    } catch (e) {
      console.error("뉴스 가져오기 실패:", e);
    }
  };

  useEffect(() => {
    if (!uriEncodedString) return;
    fetchHandler();
  }, [uriEncodedString]);

  const tags: ReactNode = news
    ? news.map((item: newsInfo) => <NewsCard data={item} key={item.id} />)
    : <div></div>;

 const saveHistory = async (items: newsInfo[]) => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    console.warn("userId 또는 token 없음");
    return;
  }
  console.log("저장 보낼 데이터:", {
  userId,
  query: decodeURI(uriEncodedString),
  results: items.map(({ id, ...rest }) => rest),
});

  try {
    await fetch("http://10.125.121.190:8080/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
        //"Authorization": token,//"Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        query: decodeURI(uriEncodedString),
        results: items.map(({ id, ...rest }) => rest), // ← id 제외
      }),
    });
  } catch (err) {
    console.error("백엔드 저장 실패:", err);
  }
};

return (
  <div className="w-full flex justify-center mt-6">
    <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
      {tags}
    </div>
  </div>
);

}
