'use client';

import { Book } from "./models";
import { useState } from "react";
import axios from "axios";
import { ResponseData } from "@/pages/api/fetchbook/[bookId]";

type SelectedBookState = |
{
  kind: "NoneSelected";
} |
{
  kind: "Loading";
} |
{
  kind: "SelectedBookLoaded",
  book: Book,
} |
{
  kind: "Error",
  message: string,
};

export default function Home() {
  const [selectedBookState, setSelectedBookState] = useState<SelectedBookState>({ kind: "NoneSelected" });
  const [inputState, setInputState] = useState<string>("");

  return (
    <div className="w-[500px] mx-auto mt-[250px]">
      <h1 className="text-4xl mb-4">Project Gutenberg Browser</h1>
      <SearchBar inputState={inputState} setInputState={setInputState} onClick={() => handleClickSearch(inputState, setSelectedBookState)} />
      <RenderBook selectedBookState={selectedBookState} />
    </div>
  );
}

function SearchBar({ inputState, setInputState, onClick }: { inputState: string, setInputState: SetState<string>, onClick: () => void; }) {
  return (
    <div className="mb-4">
      <label>
        Book ID:
      </label>
      <input className="bg-gray-800" value={inputState} onChange={(e) => setInputState(e.target.value)} />
      <button className="ml-2 pl-1.5 pr-1.5 bg-gray-600" onClick={onClick}>Search</button>
    </div>
  );
}

function RenderBook({ selectedBookState }: { selectedBookState: SelectedBookState; }) {
  if (selectedBookState.kind === "SelectedBookLoaded") {
    const book = selectedBookState.book;
    return (
      <div>
        <div className="text-3xl">{book.metadata.title}</div>
        <div className="text-2xl">{book.metadata.author}</div>
        <div className="whitespace-pre-wrap">{selectedBookState.book.content}</div>
      </div>
    );
  }

  return <div>{JSON.stringify(selectedBookState)}</div>;
}

type SetState<S> = (state: S) => void;

function handleClickSearch(inputState: string, setSelectedBookState: SetState<SelectedBookState>) {
  setSelectedBookState({ kind: "Loading" });

  const url = `/api/fetchbook/${inputState}`;

  axios.get<ResponseData>(url).then((response) => {
    if (response.data.kind === "Success") {
      setSelectedBookState({ kind: "SelectedBookLoaded", book: response.data.book });
    } else {
      setSelectedBookState({ kind: "Error", message: response.data.message });
    }
  }).catch((reason) => {
    setSelectedBookState({ kind: "Error", message: JSON.stringify(reason) });
  });
} 