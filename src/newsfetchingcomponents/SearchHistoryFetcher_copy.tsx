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

export default function SearchHistoryFetcherCopy({ pages }: Props) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [activeIndex, setActiveIndex] = useState(1);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<AliceCarousel>(null);

  useEffect(() => {
    if (!token || !pages || pages.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setHistoryData([]);
      try {
        const pageNow = pages[activeIndex].id;
        const resp = await fetch(
          `http://10.125.121.190:8080/api/history?id=${pageNow}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        if (!resp.ok) throw new Error(`failed to load history: ${resp.status}`);
        const data:HistoryItem[] = await resp.json();
        setHistoryData(data);
      } catch (err) {
        console.error("failed to pull data: ", err);
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [activeIndex, pages, token]); // pages, token??

  const onSlideChanged = (e: { item: number }) => {
    if (e.item !== activeIndex) {
      setActiveIndex(e.item);
    }
  };

  const slidePrev = () => {
    if (!isLoading) {
      carouselRef.current?.slidePrev();
    }
  };

  const slideNext = () => {
    if (!isLoading) {
      carouselRef.current?.slideNext();
    }
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

  const activePageContent = (
    <div className="grid grid-cols-3 gap-4 p-2">
      {isLoading ? (
        <p className="col-span-full text-center text-gray-400 italic p-8">
          Now Loading…
        </p>
      ) : (
        historyData.map((item) => <NewsCard data={item} key={item.link} />)
      )}
    </div>
  );

  const carouselItems = pages.map((page, index) => (
    <div key={page.id} className="w-full" data-value={index}>
      {index === activeIndex ? (
        activePageContent
      ) : (
        <div className="h-400px"/>
      )}
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
  // if (!token) return;
  // const Carousel = () => {
  //   const [history, setHistory] = useState<HistoryItem[] | []>();
  //   const [now, setNow] = useState<number>(1);
  //   const fetchHistory = async () => {
  //     try {
  //       const resp = await fetch(
  //         `http://10.125.121.190:8080/api/history?id=${pages[now].id}`,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: token,
  //           },
  //         }
  //       );
  //       const data: HistoryItem[] = await resp.json();
  //       console.log(data);
  //       setHistory(data);
  //     } catch (err) {
  //       console.error("히스토리 불러오기 실패:", err);
  //     }
  //   };
  //   useEffect(() => {
  //     fetchHistory();
  //   }, []);

  //   const slidePrev = () => {
  //     if (now <= 1) {
  //       console.log("bounded");
  //       return;
  //     }
  //     setNow(now - 1);
  //     fetchHistory();
  //   };
  //   const slideNext = () => {
  //     if (now >= pages.length) {
  //       console.log("bounded");
  //       return;
  //     }
  //     setNow(now + 1);
  //     fetchHistory();
  //   };
  //   console.log(pages[now].timestamp);
  //   const cards = history?.map((item) => (
  //     <NewsCard data={item} key={item.link} />
  //   ));
  //   const range = (pages: number) => [...Array(pages).keys()];
  //   const page = range(pages.length).map((i) => (
  //     <div className="grid grid-cols-3 gap-4" key={i}>
  //       {cards}
  //     </div>
  //   ));
  //   return (
  //     <>
  //       <div className="flex flex-row justify-self-end mr-3">
  //         <button onClick={() => slidePrev()} className="bg-gray-200 mx-1">
  //           Prev
  //         </button>
  //         <span>{pages[now].timestamp}</span>
  //         <button onClick={() => slideNext()} className="bg-gray-200 mx-1">
  //           Next
  //         </button>
  //       </div>
  //       <AliceCarousel
  //         items={page}
  //         disableButtonsControls
  //         disableDotsControls
  //         mouseTracking
  //       />
  //     </>
  //   );
  // };

  // const Gallery = () => (
  //   <AliceCarousel
  //     mouseTracking
  //     items={[]}
  //   />
  // );

  // useEffect(() => {
  //   if (!userId || !currentQuery) return;

  //   fetchHistory();
  // }, [userId, currentQuery]);
  // else
  return (
    <div className="flex flex-col">
      <div>Carousel()</div>
    </div>
  );
}
