import { useEffect, useRef, useState } from "react";
import NewsCard from "./NewsCard";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { useNavigate } from "react-router-dom";
import type { searchHistory } from "./NewsFetcher";

interface HistoryItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface Props {
  pages: searchHistory[];
}

const LoadingPlaceholder = () => (
  <div className="flex justify-center items-center h-400px">
    <p className="text-gray-400 italic">Loading…</p>
  </div>
);

const NewsGrid = ({data}:{data:HistoryItem[]}) => (
  <div className="grid grid-cols-3 gap-4 p-2">
    {data.map((item) => <NewsCard data={item} key={item.link} />)}
  </div>
);

export default function SearchHistoryFetcherCopy({ pages }: Props) {
  console.log(pages);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [activeIndex, setActiveIndex] = useState(1);
  const carouselRef = useRef<AliceCarousel>(null);
  const [dataCache, setDataCache] = useState<{[pageId:string]:HistoryItem[]}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token || !pages || pages.length === 0) return;

    const pageToFetch = pages[activeIndex];
    if(!pageToFetch) return;

    if(dataCache[pageToFetch.id]) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const resp = await fetch(
          `http://10.125.121.190:8080/api/history?id=${pageToFetch.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        if (!resp.ok) throw new Error(`failed to fetch history: ${resp.status}`);
        const data:HistoryItem[] = await resp.json();
        setDataCache(prevCache => ({
          ...prevCache,
          [pageToFetch.id]:data
        }));
      } catch (err) {
        console.error("failed to pull data: ", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [activeIndex, pages, token, dataCache]);

  const onSlideChanged = (e: { item: number }) => {
    if (e.item !== activeIndex) {
      setActiveIndex(e.item);
    }
  };

  const slidePrev = () => {
      carouselRef.current?.slidePrev();
  };

  const slideNext = () => {
      carouselRef.current?.slideNext();
  };

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

  if (!pages || pages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">검색 기록이 없습니다.</div>
    );
  }

  const activePageData = dataCache[pages[activeIndex]?.id];

  let activePageContent;
  if (activePageData) activePageContent = <NewsGrid data={activePageData} />;
  else activePageContent = <LoadingPlaceholder />;

  const carouselItems = pages.map((page, index) => (
    <div key={page.id} className="w-full h-400px">
      {index === activeIndex
      ? activePageContent
      : null
    }
    </div>
  ));

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-center items-center my-4">
        <button
          onClick={slidePrev}
          className="bg-gray-200 mx-2 px-4 py-1 rounded disabled:opacity-50"
          disabled={activeIndex === 0}
        >
          이전
        </button>
        <span className="font-semibold text-gray-700">
          {pages[activeIndex]?.timestamp}
        </span>
        <button
          onClick={slideNext}
          className="bg-gray-200 mx-2 px-4 py-1 rounded disabled:opacity-50"
          disabled={activeIndex === pages.length - 1}
        >
          다음
        </button>
      </div>
      <AliceCarousel ref={carouselRef} items={carouselItems} activeIndex={activeIndex} onSlideChanged={onSlideChanged} mouseTracking disableDotsControls disableButtonsControls animationDuration={400} />
    </div>
  );
}
