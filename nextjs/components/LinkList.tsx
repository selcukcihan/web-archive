import { getLinks } from '@/lib/api'
import LinkCard from './LinkCard'
import Pagination from './Pagination'

export default async function LinkList({ tag, page }: { tag?: string | null, page: number }) {
  const { links, totalPages } = await getLinks(tag, page)

  return (
    <div>
      <div className="grid gap-4 mb-4">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
