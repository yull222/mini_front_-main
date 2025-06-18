import { useEffect, useState } from "react";
import NewsCard from "../newsfetchingcomponents/NewsCard";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { useNavigate } from "react-router-dom";

interface HistoryItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface Props {
  currentQuery: string;
}

const handleDragStart = (e: Event) => e.preventDefault();

export default function SearchHistoryFetcher({ currentQuery }: Props) {
  const [history, setHistory] = useState<HistoryItem[] | []>();
  const [pages, setPages] = useState<number>(0);
  const [now, setNow] = useState<number>(1);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const Gallery = () => <AliceCarousel mouseTracking items={cards} />;

  useEffect(() => {
    if (!userId || !currentQuery) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `http://10.125.121.190:8080/api/history?username=${userId}&query=${currentQuery}&idx=${now}`
        );
        const data: { pages: number; results: HistoryItem[] } =
          await res.json();
        setHistory(data.results);
        setPages(data.pages);
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
  const cards = history?.map((item) => (
    <NewsCard data={item} key={item.link} />
  ));
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 gap-4">
        {!history ? <div> 검색 기록이 없습니다 </div> : Gallery()}
      </div>
    </div>
  );
}
