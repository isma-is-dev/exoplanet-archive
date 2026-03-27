import { Exoplanet } from '@exodex/shared-types';

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ExoplanetResponseDto = Exoplanet;

export type ExoplanetListResponseDto = {
  exoplanets: ExoplanetResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
