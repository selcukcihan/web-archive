import { getLinks } from '@/lib/data'
import LinkCard from './LinkCard'
import Pagination from './Pagination'

export default async function LinkList({ tag, page }: { tag?: string, page: number }) {
  const { links, totalPages, totalLinks } = await getLinks(tag, page)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm text-zinc-400">
          {tag ? (
            <span>
              Showing links tagged with <span className="text-zinc-300">#{tag}</span>
            </span>
          ) : (
            'All links'
          )}
        </h2>
        <span className="text-sm text-zinc-500">
          {totalLinks} {totalLinks === 1 ? 'link' : 'links'} found
        </span>
      </div>
      <div className="grid gap-4 mb-4">
        {links.map((link) => (
          <LinkCard key={link.link} link={link} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} totalLinks={totalLinks} />
    </div>
  )
}
