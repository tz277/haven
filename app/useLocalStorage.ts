'use client';

import { useCallback, useEffect, useState } from "react";
import { Book } from "./models";

export function useLocalStorage() {
    const [listSavedMetadata, setListSavedMetada] = useState<{ bookId: number, metadata: Book["metadata"]; }[]>([]);

    useEffect(() => {
        const savedBookIds = Object.keys(localStorage);

        const initialListSavedMetadata = savedBookIds.map((bookId) => {
            const savedBookRaw = localStorage.getItem(bookId);
            const savedBook: Book = savedBookRaw ? JSON.parse(savedBookRaw) : undefined; // undefined not possible
            return {
                bookId: Number(bookId),
                metadata: savedBook.metadata,
            };
        });

        setListSavedMetada(initialListSavedMetadata);
    }, []);

    const getSavedBook = useCallback((bookId: number): Book | undefined => {
        const savedBookRaw = localStorage.getItem(bookId.toString());
        return savedBookRaw ? JSON.parse(savedBookRaw) : undefined;
    }, []);

    const saveBook = useCallback((bookId: number, book: Book) => {
        const bookIdStr = bookId.toString();
        if (!Object.keys(localStorage).includes(bookIdStr)) {
            localStorage.setItem(bookIdStr, JSON.stringify(book));
            setListSavedMetada((prev) => [...prev, { bookId, metadata: book.metadata }]);
        }
    }, []);

    const clearAllBooks = useCallback(() => { localStorage.clear(), setListSavedMetada([]); }, []);

    return {
        listSavedMetadata,
        getSavedBook,
        saveBook,
        clearAllBooks,
    };
}