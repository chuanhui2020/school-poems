import type { RelationshipType } from './poem';

export interface FilterState {
  selectedDynasties: string[];
  selectedThemes: string[];
  selectedRelationshipTypes: RelationshipType[];
  searchQuery: string;
  curriculumLevel: 'all' | 'middle_school' | 'high_school';
}

export const defaultFilterState: FilterState = {
  selectedDynasties: [],
  selectedThemes: [],
  selectedRelationshipTypes: [],
  searchQuery: '',
  curriculumLevel: 'all',
};
