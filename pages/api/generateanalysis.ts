import type { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const SOURCE_TEXT_SIZE_LIMIT_CHARS = 5000;

export type AnalysisResponseData = {
    analysis: string;
};

/** 
 * Backend API endpoint to generate a plot summary via Groq and return it. 
 * 
 * Route: /api/generateanalysis
 * 
 * Requries: request body contains a "text" field with the desired text to summarize. 
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<AnalysisResponseData>) {
    const { text } = req.body;

    if (typeof text !== "string") {
        res.status(200).json({ analysis: "Error. " });
        return;
    }

    const prompt = "Please summarize the the following text: \n\n" + text.substring(0, SOURCE_TEXT_SIZE_LIMIT_CHARS);

    const chatCompletion = await groq.chat.completions.create({
        messages: [{
            role: "user",
            content: prompt,
        }],
        model: "llama3-8b-8192"
    });

    const analysis = chatCompletion.choices[0].message.content || "(No analysis.)";

    res.status(200).json({ analysis });
}

