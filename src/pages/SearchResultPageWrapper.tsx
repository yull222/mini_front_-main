// src/pages/SearchResultPageWrapper.tsx
import { useLocation } from "react-router-dom";
import SearchResultPage from "./SearchResultPage";

export default function SearchResultPageWrapper() {
  const searchParams = new URLSearchParams(useLocation().search);
  const query = searchParams.get("query") || "";
  return <SearchResultPage uriEncodedString={encodeURI(query)} />;
}
