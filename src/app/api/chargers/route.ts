import { NextResponse } from 'next/server';
import { fetchAllChargers, fetchChargersBySegment } from '@/lib/airtable/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment');

    let chargers;
    if (segment) {
      chargers = await fetchChargersBySegment(segment);
    } else {
      chargers = await fetchAllChargers();
    }

    return NextResponse.json({ chargers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching chargers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chargers' },
      { status: 500 }
    );
  }
}
