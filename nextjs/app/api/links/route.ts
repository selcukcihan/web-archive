import { NextResponse } from 'next/server'
import { getLinks } from '../../../lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag')

  if (tag) {
    const links = await getLinks(tag);
    return NextResponse.json(links);
  } else {
    const links = await getLinks();
    return NextResponse.json(links);
  }
}
