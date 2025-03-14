'use client';

import { Book } from "./models";
import { useCallback, useState } from "react";
import axios from "axios";
import { BookResponseData } from "@/pages/api/fetchbook/[bookId]";
import { AnalysisResponseData } from "@/pages/api/generateanalysis";
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
  llmAnalysis: string | undefined;
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
      setSelectedBookState({ kind: "SelectedBookLoaded", book: savedBook, llmAnalysis: undefined });
    } else {
      // Book has not been saved yet. 
      const url = `/api/fetchbook/${inputState}`;

      axios.get<BookResponseData>(url).then((response) => {
        if (response.data.kind === "Success") {
          setSelectedBookState({ kind: "SelectedBookLoaded", book: response.data.book, llmAnalysis: undefined });
          saveBook(Number(inputState), response.data.book);
        } else {
          setSelectedBookState({ kind: "Error", message: response.data.message });
        }
      }).catch((reason) => {
        setSelectedBookState({ kind: "Error", message: JSON.stringify(reason) });
      });
    }

  }, [inputState, getSavedBook, saveBook]);

  const handleGenerateLlmAnalysis = useCallback(() => {
    if (selectedBookState.kind === "SelectedBookLoaded" && !selectedBookState.llmAnalysis) {
      const url = '/api/generateanalysis';

      axios.post<AnalysisResponseData>(url, { text: selectedBookState.book.content }).then((response) => {
        setSelectedBookState((prev) => ({ ...prev, llmAnalysis: response.data.analysis }));
      }).catch((reason) => {
        setSelectedBookState({ kind: "Error", message: JSON.stringify(reason) });
      });
    }
  }, [selectedBookState]);

  const handleBackToContent = useCallback(() => {
    if (selectedBookState.kind === "SelectedBookLoaded" && selectedBookState.llmAnalysis) {
      setSelectedBookState((prev) => ({ ...prev, llmAnalysis: undefined }));
    }
  }, [selectedBookState]);

  const handleExitBook = useCallback(() => {
    if (selectedBookState.kind === "SelectedBookLoaded") {
      setSelectedBookState({ kind: "NoneSelected" });
      setInputState("");
    }
  }, [selectedBookState]);

  return (
    <div className="w-[500px] mx-auto mt-[250px]">
      <h1 className="text-6xl mb-4">Project Gutenberg Browser</h1>
      <SearchBar inputState={inputState} setInputState={setInputState} onClick={handleClickSearch} />
      <h2 className="text-3xl mb-4">Saved Books: </h2>
      {listSavedMetadata.length ? <RenderBookList listSavedMetadata={listSavedMetadata} onClearSavedBooks={clearAllBooks} /> : <div>No Saved Books yet!</div>}
      <RenderBook
        selectedBookState={selectedBookState}
        onGenerateAnalysis={handleGenerateLlmAnalysis}
        onBackToContent={handleBackToContent}
        onExitBook={handleExitBook}
      />
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

function RenderBook({
  selectedBookState,
  onGenerateAnalysis,
  onBackToContent,
  onExitBook
}: {
  selectedBookState: SelectedBookState;
  onGenerateAnalysis: () => void;
  onBackToContent: () => void;
  onExitBook: () => void;
}) {
  if (selectedBookState.kind === "SelectedBookLoaded") {
    const book = selectedBookState.book;
    return (
      <div>
        <div className="text-5xl">{book.metadata.title}</div>
        <div className="text-3xl mb-2">{book.metadata.author}</div>
        {selectedBookState.llmAnalysis
          ? <>
            <button
              className="mb-2 mr-2 pl-1.5 pr-1.5 bg-gray-600"
              onClick={onBackToContent}
            >
              Back to Book Content
            </button>
            <button
              className="mb-2 pl-1.5 pr-1.5 bg-gray-600"
              onClick={onExitBook}
            >
              Exit Book
            </button>
            <div className="text-2xl mb-2">LLM Analysis: </div>
            <div className="whitespace-pre-wrap">{selectedBookState.llmAnalysis}</div>
          </>
          : <>
            <button
              className="mb-2 mr-2 pl-1.5 pr-1.5 bg-gray-600"
              onClick={onGenerateAnalysis}
            >
              Generate LLM Analysis
            </button>
            <button
              className="mb-2 pl-1.5 pr-1.5 bg-gray-600"
              onClick={onExitBook}
            >
              Exit Book
            </button>
            <div className="whitespace-pre-wrap">{selectedBookState.book.content}</div>
          </>}

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
