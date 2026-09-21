import { readFile, stat } from "fs/promises";
import * as mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import WordExtractor = require("word-extractor");

export type TextExtractionStatus = "success" | "no_text_found" | "failed";

export interface TextExtractionResult {
  status: TextExtractionStatus;
  text: string | null;
  error: string | null;
}

const PDF_MIME_TYPE = "application/pdf";
const DOC_MIME_TYPE = "application/msword";
const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function extractResumeText(
  filePath: string,
  mimeType: string,
): Promise<TextExtractionResult> {
  try {
    const fileStats = await stat(filePath);

    if (fileStats.size === 0) {
      return {
        status: "failed",
        text: null,
        error: "Uploaded resume file is empty.",
      };
    }

    const fileBuffer = await readFile(filePath);

    if (!matchesExpectedFormat(fileBuffer, mimeType)) {
      return {
        status: "failed",
        text: null,
        error: "Uploaded file contents do not match its declared format.",
      };
    }

    let extractedText: string;

    switch (mimeType) {
      case PDF_MIME_TYPE:
        extractedText = await extractPdfText(fileBuffer);
        break;

      case DOC_MIME_TYPE:
        extractedText = await extractDocText(filePath);
        break;

      case DOCX_MIME_TYPE:
        extractedText = await extractDocxText(filePath);
        break;

      default:
        return {
          status: "failed",
          text: null,
          error: "Unsupported resume file format.",
        };
    }

    const text = extractedText.trim();
const meaningfulText = stripPdfPageMarkers(text).trim();

if (!meaningfulText) {
  return {
    status: "no_text_found",
    text: null,
    error: "No selectable text found. OCR is not currently supported.",
  };
}

return {
  status: "success",
  text,
  error: null,
};

    
  } catch (error: unknown) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error);

    if (/password|encrypted|encryption|protected/i.test(message)) {
      return {
        status: "failed",
        text: null,
        error: "Password-protected resumes are not supported.",
      };
    }

    return {
      status: "failed",
      text: null,
      error: "Unable to extract text from the uploaded resume file.",
    };
  }
}

async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocText(filePath: string): Promise<string> {
  const extractor = new WordExtractor();
  const document = await extractor.extract(filePath);

  return document.getBody();
}

async function extractDocxText(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });

  return result.value;
}

function matchesExpectedFormat(fileBuffer: Buffer, mimeType: string): boolean {
  if (mimeType === PDF_MIME_TYPE) {
    return fileBuffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  if (mimeType === DOC_MIME_TYPE) {
    const docSignature = Buffer.from([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
    ]);

    return fileBuffer.subarray(0, 8).equals(docSignature);
  }

  if (mimeType === DOCX_MIME_TYPE) {
    return fileBuffer.subarray(0, 4).toString("hex") === "504b0304";
  }

  return false;
}

function stripPdfPageMarkers(text: string): string {
  return text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "");
}