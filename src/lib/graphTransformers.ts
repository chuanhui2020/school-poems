import type { Poem, Author, AuthorRelationship } from '../types'
import type { SimNode, SimLink } from '../components/visualizations/shared/useSimulation'

export function buildAuthorGraph(
  authors: Author[],
  poems: Poem[],
  relationships: AuthorRelationship[],
  filters: {
    dynastyIds?: string[]
    relationshipTypes?: string[]
    curriculumLevel?: 'all' | 'middle_school' | 'high_school'
  } = {}
): { nodes: SimNode[]; links: SimLink[] } {
  const poemCountByAuthor = new Map<string, number>()
  for (const poem of poems) {
    if (filters.curriculumLevel && filters.curriculumLevel !== 'all' && poem.curriculum_level !== filters.curriculumLevel) continue
    poemCountByAuthor.set(poem.authorId, (poemCountByAuthor.get(poem.authorId) ?? 0) + 1)
  }

  let filteredAuthors = authors.filter((a) => poemCountByAuthor.has(a.id))
  if (filters.dynastyIds && filters.dynastyIds.length > 0) {
    filteredAuthors = filteredAuthors.filter((a) => filters.dynastyIds!.includes(a.dynastyId))
  }

  const authorIdSet = new Set(filteredAuthors.map((a) => a.id))

  const nodes: SimNode[] = filteredAuthors.map((a) => ({
    id: a.id,
    label: a.name,
    dynastyId: a.dynastyId,
    poemCount: poemCountByAuthor.get(a.id) ?? 0,
    bio: a.brief_bio,
    styleLabels: a.style_labels,
  }))

  let filteredRels = relationships.filter(
    (r) => authorIdSet.has(r.source) && authorIdSet.has(r.target)
  )
  if (filters.relationshipTypes && filters.relationshipTypes.length > 0) {
    filteredRels = filteredRels.filter((r) => filters.relationshipTypes!.includes(r.type))
  }

  const links: SimLink[] = filteredRels.map((r) => ({
    source: r.source,
    target: r.target,
    type: r.type,
    label: r.label,
    description: r.description,
    strength: r.strength,
  }))

  return { nodes, links }
}

export function buildContentGraph(
  poems: Poem[],
  filters: {
    dynastyIds?: string[]
    themeIds?: string[]
    curriculumLevel?: 'all' | 'middle_school' | 'high_school'
  } = {},
  minSharedTags = 1
): { nodes: SimNode[]; links: SimLink[] } {
  let filteredPoems = [...poems]
  if (filters.curriculumLevel && filters.curriculumLevel !== 'all') {
    filteredPoems = filteredPoems.filter((p) => p.curriculum_level === filters.curriculumLevel)
  }
  if (filters.dynastyIds && filters.dynastyIds.length > 0) {
    filteredPoems = filteredPoems.filter((p) => filters.dynastyIds!.includes(p.dynastyId))
  }
  if (filters.themeIds && filters.themeIds.length > 0) {
    filteredPoems = filteredPoems.filter((p) =>
      p.themes.some((t) => filters.themeIds!.includes(t))
    )
  }

  const nodes: SimNode[] = filteredPoems.map((p) => ({
    id: p.id,
    label: p.title,
    dynastyId: p.dynastyId,
    authorId: p.authorId,
    themes: p.themes,
    imagery: p.imagery,
    poemCount: 1,
  }))

  const links: SimLink[] = []
  for (let i = 0; i < filteredPoems.length; i++) {
    for (let j = i + 1; j < filteredPoems.length; j++) {
      const a = filteredPoems[i]
      const b = filteredPoems[j]
      const sharedThemes = a.themes.filter((t) => b.themes.includes(t))
      const sharedImagery = a.imagery.filter((img) => b.imagery.includes(img))
      const weight = sharedThemes.length + sharedImagery.length * 0.5
      if (weight >= minSharedTags) {
        links.push({
          source: a.id,
          target: b.id,
          type: 'theme',
          weight,
          sharedThemes,
          sharedImagery,
        })
      }
    }
  }

  return { nodes, links }
}
