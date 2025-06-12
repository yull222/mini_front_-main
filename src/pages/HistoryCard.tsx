// src/historycomponents/HistoryCard.tsx
interface HistoryItem {
  query: string;
  searchedAt: string;
}

export default function HistoryCard({ data }: { data: HistoryItem }) {
  return (
    <div className="border m-2 p-2 text-sm bg-white shadow rounded">
      <p className="font-semibold text-gray-800">검색어: {data.query}</p>
      <p className="text-gray-500 text-xs">시각: {new Date(data.searchedAt).toLocaleString()}</p>
    </div>
  );
}
