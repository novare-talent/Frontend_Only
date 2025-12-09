// app/api/onboarding/parse-jd/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PDFDocument } from "pdf-lib";
import axios from "axios";
import mammoth from "mammoth";

import PDFParser from "pdf2json";

type ParsedDetails = {
  job_title: string;
  job_summary: string;
  job_responsibilities: string[];
  job_skills: string[];
  duration: string;
  location: string;
  stipend: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { submissionId, bucketPath } = body;

    if (!submissionId || !bucketPath) {
      return NextResponse.json(
        { error: "Missing submissionId or bucketPath" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: fileData, error: downloadErr } = await supabase.storage
      .from("jds")
      .download(bucketPath);

    if (downloadErr) {
      throw new Error("Failed to download JD: " + downloadErr.message);
    }

    const buffer = await toBuffer(fileData);
    const lower = bucketPath.toLowerCase();

    let text = "";

    if (lower.endsWith(".pdf")) {
      text = await extractPdf(buffer);
    } else if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
      text = await extractDocx(buffer);
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const parsed = await parseJdWithGemini(text);

    const updateData = {
      job_title: parsed.job_title,
      job_summary: parsed.job_summary,
      job_responsibilities: JSON.stringify(parsed.job_responsibilities),
      job_skills: JSON.stringify(parsed.job_skills),
      duration: parsed.duration,
      location: parsed.location,
      stipend: parsed.stipend,
      status: "details_parsed",
    };

    const { data: updateResult, error: updateErr } = await supabase
      .from("client_submission")
      .update(updateData)
      .eq("id", submissionId)
      .select()
      .single();

    if (updateErr) {
      console.error("RLS prevented DB update:", updateErr);
      return NextResponse.json(
        {
          success: true,
          data: { id: submissionId, ...updateData },
          note: "Parsed but DB update failed",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, data: updateResult },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("parse-jd error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function toBuffer(data: any): Promise<Buffer> {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (typeof data.arrayBuffer === "function")
    return Buffer.from(await data.arrayBuffer());

  const chunks: Uint8Array[] = [];
  for await (const c of data as any) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks);
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

async function extractPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (err: any) => {
      console.error("pdf2json error:", err);
      reject("Failed to extract text from PDF");
    });

    parser.on("pdfParser_dataReady", (pdf: any) => {
      let text = "";

      pdf?.Pages?.forEach((page: any) => {
        page?.Texts?.forEach((t: any) => {
          t?.R?.forEach((r: any) => {
            text += decodeURIComponent(r.T) + " ";
          });
        });
        text += "\n";
      });

      resolve(text.trim());
    });

    parser.parseBuffer(buffer);
  });
}

async function parseJdWithGemini(text: string): Promise<ParsedDetails> {
  try {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) throw new Error("LLM_API_KEY missing");

    const prompt = `
Extract JSON with fields:
job_title, job_summary, job_responsibilities[], job_skills[], duration, location, stipend
From this job description:
${text}
Return JSON only.
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    let raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    raw = raw.replace(/```json|```/g, "").trim();

    return JSON.parse(raw);
  } catch (e) {
    console.warn("Gemini failed, using fallback");
    return {
      job_title: "Job Title",
      job_summary: "Content extracted - please review",
      job_responsibilities: ["Responsibility 1", "Responsibility 2"],
      job_skills: ["Skill 1", "Skill 2"],
      duration: "",
      location: "",
      stipend: "",
    };
  }
}
