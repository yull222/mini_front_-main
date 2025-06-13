import { useRef, useState, type FormEvent } from "react";
import NewsFetcher from "./NewsFetcher";

export default function News() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    console.log("submitHandler called");
    const value = inputRef.current?.value.trim();
    if (!value) return;
    const encoded = encodeURI(value);
    setQuery(encoded);
  };

  return (
    <div className="w-full flex flex-col items-center mt-10">
     
      <NewsFetcher uriEncodedString={query} />
    </div>
  );
}
