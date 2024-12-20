import { NextResponse } from 'next/server'
import { links } from '@/lib/data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag')

  let filteredLinks = links;
  if (tag) {
    filteredLinks = links.filter(link => link.tags.includes(tag));
  }

  return NextResponse.json(filteredLinks)
}

