import { useRef, useState, type FormEvent } from "react";
import NewsFetcher from "./NewsFetcher";

export default function News() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (!value) return;
    const encoded = encodeURI(value);
    setQuery(encoded);
  };

  return (
    <div className="w-full flex flex-col items-center mt-10">
      <form
        onSubmit={submitHandler}
        className="flex gap-2 items-center bg-white p-4 rounded shadow mb-6"
      >
        <input
          type="text"
          className="border px-3 py-2 rounded w-64"
          ref={inputRef}
          placeholder="검색어를 입력하세요"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          검색
        </button>
      </form>
      <NewsFetcher uriEncodedString={query} />
    </div>
  );
}
