import { getTags } from '@/lib/api'
import TagFilter from './TagFilter'

export default async function TagFilterContainer() {
  const tags = await getTags()
  return <TagFilter tags={tags} />
}

