import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Queue } from 'bullmq';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { getSessionUser } from '@/lib/auth/auth';

const queue = new Queue('document-processing', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const userId = session?.id;
    const companyId = session?.companyId;
    if (!userId || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string;

    if (!file || !fileType) {
      return NextResponse.json(
        { error: 'File and type are required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Create document and processing job
    const document = await prisma.document.create({
      data: {
        name: file.name,
        fileUrl: filePath,
        fileType,
        status: 'uploaded',
        companyId,
      },
    });

    const job = await prisma.documentProcessingJob.create({
      data: {
        filePath,
        fileName: file.name,
        fileType,
        status: 'queued',
        companyId,
        userId,
      },
    });

    // Add to processing queue
    await queue.add('process-document', {
      documentId: document.id,
      filePath,
      fileType,
      companyId,
      userId,
      jobId: job.id,
    });

    return NextResponse.json({
      documentId: document.id,
      jobId: job.id,
      status: 'queued',
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    const session = await getSessionUser();
    const userId = session?.companyId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        companyId: userId,
      },
      include: {
        chunks: true,
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
} 