import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { Book } from "@/app/models";

export type ResponseData = {
    kind: "Success";
    book: Book;
} | {
    kind: "Error";
    message: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const { bookId } = req.query;

    if (typeof bookId !== "string") {
        res.status(400).json({ kind: "Error", message: "Error: Invalid URL format." });
        return;
    }

    const bookIdNum = Number(bookId);

    if (Number.isNaN(bookIdNum)) {
        res.status(400).json({ kind: "Error", message: "Error: URL query is not a number." });
        return;
    }

    fetchBook(bookIdNum).then((book) => {
        res.status(200).json({ kind: "Success", book });
    }).catch((reason) => {
        res.status(500).json({ kind: "Error", message: JSON.stringify(reason) });
    });
}

async function fetchBook(bookId: number): Promise<Book> {
    const url = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
    const response = await axios.get<string>(url);

    return {
        content: response.data.substring(0, 200)
    };
}