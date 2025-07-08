import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = await prisma.documentProcessingJob.findMany({
      where: {
        companyId: user.companyId,
        status: {
          in: ['queued', 'processing']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Limit to 5 most recent jobs
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching processing jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processing jobs' },
      { status: 500 }
    );
  }
} 