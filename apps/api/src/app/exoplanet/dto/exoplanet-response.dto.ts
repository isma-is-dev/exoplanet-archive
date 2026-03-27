import { Exoplanet } from '@exodex/shared-types';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExoplanetResponseDto extends Exoplanet {}

export interface ExoplanetListResponseDto {
  exoplanets: ExoplanetResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
