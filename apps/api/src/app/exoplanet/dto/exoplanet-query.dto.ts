export interface ExoplanetQueryDto {
  page?: number;
  pageSize?: number;
  types?: string;
  methods?: string;
  habitability?: string;
  minYear?: number;
  maxYear?: number;
  minRadius?: number;
  maxRadius?: number;
  stellarClasses?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  q?: string;
}
