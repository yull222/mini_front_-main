import { useEffect, useState, type ReactNode } from "react";
import NewsCard from "./NewsCard";

export interface newsFetcherProps {
  uriEncodedString: string;
}

export type newsInfo = {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
  id: string; // 프론트 전용으로 생성
};

export default function NewsFetcher({ uriEncodedString }: newsFetcherProps) {
  const apikey: string = import.meta.env.VITE_APP_APIKEY;

  const myHeaders: Headers = new Headers();
  myHeaders.append("X-Naver-Client-Id", "qQ0rDJDLUQdGBC0U6Ndl");
  myHeaders.append("X-Naver-Client-Secret", apikey);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const [news, setNews] = useState<newsInfo[] | undefined>();

  const fetchHandler = async () => {
    try {
      const resp: Response = await fetch(`/v1/search/news.json?query=${uriEncodedString}&display=12`, requestOptions);
      const jsn = await resp.json();

      // id 추가해서 뉴스 배열 생성
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
    <div className="w-11/12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {tags}
    </div>
  );
}
