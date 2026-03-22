export interface Dynasty {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  color: string;
}

export interface Author {
  id: string;
  name: string;
  courtesy_name: string;
  dynastyId: string;
  birth_year: number | null;
  death_year: number | null;
  literary_schools: string[];
  style_labels: string[];
  brief_bio: string;
}

export interface Poem {
  id: string;
  title: string;
  authorId: string;
  dynastyId: string;
  form: string;
  approximate_year: number | null;
  curriculum_level: 'middle_school' | 'high_school';
  grade: string;
  full_text: string;
  themes: string[];
  imagery: string[];
  mood: string;
  annotation: string;
  translation: string;
}

export interface AuthorRelationship {
  source: string;
  target: string;
  type: RelationshipType;
  label: string;
  description: string;
  strength: number;
}

export type RelationshipType =
  | 'friendship'
  | 'teacher_student'
  | 'literary_school'
  | 'influence'
  | 'same_dynasty';

export interface RelationshipTypeConfig {
  label: string;
  color: string;
  dashArray: string;
}

export interface RelationshipsData {
  author_relationships: AuthorRelationship[];
  relationship_types: Record<RelationshipType, RelationshipTypeConfig>;
}

export interface ThemeCategory {
  id: string;
  name: string;
  category: string;
  keywords: string[];
}

export interface ImageryItem {
  id: string;
  name: string;
}

export interface ThemesData {
  theme_taxonomy: ThemeCategory[];
  imagery_taxonomy: ImageryItem[];
}
