import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as cheerio from "cheerio";
import { Book } from "@/app/models";

export type BookResponseData = {
    kind: "Success";
    book: Book;
} | {
    kind: "Error";
    message: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<BookResponseData>) {
    const { bookId } = req.query;

    if (typeof bookId !== "string") {
        res.status(200).json({ kind: "Error", message: "Error: Invalid URL format." });
        return;
    }

    const bookIdNum = Number(bookId);

    if (Number.isNaN(bookIdNum)) {
        res.status(200).json({ kind: "Error", message: "Error: URL query is not a number." });
        return;
    }

    fetchBook(bookIdNum).then((book) => {
        res.status(200).json({ kind: "Success", book });
    }).catch((reason) => {
        res.status(200).json({ kind: "Error", message: JSON.stringify(reason) });
    });
}

async function fetchBook(bookId: number): Promise<Book> {
    const content_url = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
    const content_response = await axios.get<string>(content_url);
    const content = content_response.data;

    const metadata_url = `https://www.gutenberg.org/ebooks/${bookId}`;
    const metadata_response = await axios.get<string>(metadata_url);
    const metadata = parseMetadataResponse(metadata_response.data);

    return {
        content,
        metadata
    };
}

function parseMetadataResponse(metadataResponseHTML: string): Book["metadata"] {
    const $ = cheerio.load(metadataResponseHTML);

    const author = $('#bibrec th:contains("Author")').next('td').text().trim();
    const title = $('#bibrec th:contains("Title")').next('td').text().trim();

    console.log(title);
    console.log(author);

    return { title, author };
}