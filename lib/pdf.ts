import PDFParser from "pdf2json";

/** Extract raw text from a PDF buffer using pdf2json. */
export function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (err: unknown) => {
        reject(err instanceof Error ? err : new Error(String(err)));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: PdfData) => {
        try {
          let text = "";
          for (const page of pdfData.Pages || []) {
            for (const item of page.Texts || []) {
              for (const run of item.R || []) {
                const value = run?.T || "";
                try {
                  text += decodeURIComponent(value) + " ";
                } catch {
                  text += value + " ";
                }
              }
            }
            text += "\n";
          }
          resolve(text.trim());
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });

      pdfParser.parseBuffer(buffer);
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

interface PdfData {
  Pages?: Array<{
    Texts?: Array<{
      R?: Array<{ T?: string }>;
    }>;
  }>;
}
