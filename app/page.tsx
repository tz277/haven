'use client';

import { Book } from "./models";
import { useCallback, useState } from "react";
import axios from "axios";
import { ResponseData } from "@/pages/api/fetchbook/[bookId]";
import { useLocalStorage } from "./useLocalStorage";

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
  const { listSavedMetadata, getSavedBook, saveBook, clearAllBooks } = useLocalStorage();

  const handleClickSearch = useCallback(() => {
    setSelectedBookState({ kind: "Loading" });

    const savedBook = getSavedBook(Number(inputState));

    if (savedBook) {
      setSelectedBookState({ kind: "SelectedBookLoaded", book: savedBook });
    } else {
      // Book has not been saved yet. 
      const url = `/api/fetchbook/${inputState}`;

      axios.get<ResponseData>(url).then((response) => {
        if (response.data.kind === "Success") {
          setSelectedBookState({ kind: "SelectedBookLoaded", book: response.data.book });
          saveBook(Number(inputState), response.data.book);
        } else {
          setSelectedBookState({ kind: "Error", message: response.data.message });
        }
      }).catch((reason) => {
        setSelectedBookState({ kind: "Error", message: JSON.stringify(reason) });
      });
    }

  }, [inputState, getSavedBook, saveBook]);

  return (
    <div className="w-[500px] mx-auto mt-[250px]">
      <h1 className="text-5xl mb-4">Project Gutenberg Browser</h1>
      <SearchBar inputState={inputState} setInputState={setInputState} onClick={handleClickSearch} />
      <h2 className="text-4xl mb-4">Saved Books: </h2>
      {listSavedMetadata.length ? <RenderBookList listSavedMetadata={listSavedMetadata} onClearSavedBooks={clearAllBooks} /> : <div>No Saved Books yet!</div>}
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
        <div className="text-4xl">{book.metadata.title}</div>
        <div className="text-3xl">{book.metadata.author}</div>
        <div className="whitespace-pre-wrap">{selectedBookState.book.content}</div>
      </div>
    );
  } else if (selectedBookState.kind === "Loading") {
    return <div>(LOADING BOOK ... )</div>;
  } else if (selectedBookState.kind === "Error") {
    return <div>ERROR: {selectedBookState.message}</div>;
  } else { // (selectedBookState.kind === "NoneSelected")
    return null;
  }
}

function RenderBookList({ listSavedMetadata, onClearSavedBooks }: { listSavedMetadata: { bookId: number, metadata: Book["metadata"]; }[]; onClearSavedBooks: () => void; }) {
  return (
    <div className="mb-4">
      <button
        className="mb-2 pl-1.5 pr-1.5 bg-gray-600"
        onClick={onClearSavedBooks}
      >
        Clear Saved Books
      </button>
      <table>
        <thead>
          <tr>
            <th>Book Id</th>
            <th>Title</th>
            <th>Author</th>
          </tr>
        </thead>
        <tbody>
          {listSavedMetadata.map(({ bookId, metadata }) =>
            <tr key={bookId}>
              <td>{bookId}</td>
              <td>{metadata.title}</td>
              <td>{metadata.author}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

type SetState<S> = (state: S) => void;
