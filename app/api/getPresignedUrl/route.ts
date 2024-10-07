// app/api/getPresignedUrl/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const body = await request.json()
  const { fileName, fileType } = body

  if (!fileName || !fileType) {
    return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 })
  }

  const key = `uploads/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  })

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
      signableHeaders: new Set(["content-type"]),
    })
    
    return NextResponse.json({ 
      uploadUrl: signedUrl,
      key: key
    })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json({ error: 'Error generating upload URL' }, { status: 500 })
  }
}