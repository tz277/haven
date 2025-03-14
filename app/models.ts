/** 
 * Represents a book from Project Gutenberg. 
 */
export interface Book {
    /** The entire contents of the book, in string format. */
    content: string;

    /** Metadata on the book, as scraped from Project Gutenber's website. */
    metadata: {
        title: string,
        author: string,
    };
}