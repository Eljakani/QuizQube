import { auth } from "@/auth"
import { NextResponse } from "next/server"
import normalizeText from '../../lib/normalizeText'
import pdfParse from 'pdf-parse'
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { Readable } from 'stream'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });
    }

    // Parse the S3 URL to get bucket and key
    const url = new URL(fileUrl);
    const bucket = url.hostname.split('.')[0];
    // decodeURIComponent to handle special characters in the key
    const key = url.pathname.slice(1).split('/').map(decodeURIComponent).join('/');

    // Fetch the file from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const { Body } = await s3Client.send(command);

    if (!Body) {
      throw new Error('Failed to fetch file from S3');
    }

    // Convert the readable stream to a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of Body as Readable) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Parse the PDF
    const pdfData = await pdfParse(buffer);
    const normalizedText = normalizeText(pdfData.text);

    return NextResponse.json({ content: normalizedText }, { status: 200 });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ 
      error: `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
})