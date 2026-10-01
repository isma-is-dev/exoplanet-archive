import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ExoplanetService } from './exoplanet.service';
import { ExoplanetQueryDto } from './dto/exoplanet-query.dto';
import {
  DiscoveryMethod,
  ExoplanetFilters,
  HabitabilityClass,
  PlanetType,
  SortDirection,
  SortField,
  StellarClass,
} from '@exodex/shared-types';

@Controller('api/exoplanets')
export class ExoplanetController {
  constructor(private readonly exoplanetService: ExoplanetService) {}

  @Get()
  getAll(@Query() query: ExoplanetQueryDto) {
    this.assertDatasetAvailable();
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(96, Math.max(1, query.pageSize ?? 48));

    // Construir filtros
    const filters: ExoplanetFilters = {
      planetTypes: this.parseArray<PlanetType>(query.types),
      discoveryMethods: this.parseArray<DiscoveryMethod>(query.methods),
      habitabilityClasses: this.parseArray<HabitabilityClass>(query.habitability),
      discoveryYearRange:
        query.minYear !== undefined && query.maxYear !== undefined
          ? [query.minYear, query.maxYear]
          : null,
      radiusEarthRange:
        query.minRadius !== undefined && query.maxRadius !== undefined
          ? [query.minRadius, query.maxRadius]
          : null,
      stellarClasses: this.parseArray<StellarClass>(query.stellarClasses),
      massEarthRange: null,
      equilibriumTempKRange: null,
      searchQuery: query.q ?? '',
    };

    // Construir ordenamiento
    const sort = {
      field: (query.sort as SortField) ?? 'index',
      direction: (query.order as SortDirection) ?? 'asc',
    };

    const { data, total } = this.exoplanetService.getAll(
      filters,
      sort,
      page,
      pageSize
    );

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  @Get('meta/stats')
  getStats() {
    this.assertDatasetAvailable();
    return this.exoplanetService.getStats();
  }

  @Get('meta/status')
  getStatus() {
    // Diagnostics stay reachable even when the dataset is down — that is how a
    // client tells "no data yet / upstream broken" apart from "no exoplanets".
    return this.exoplanetService.getCacheStatus();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    this.assertDatasetAvailable();
    const planet = this.exoplanetService.getById(id);
    if (!planet) {
      throw new NotFoundException(`Exoplanet with id '${id}' not found`);
    }
    return planet;
  }

  /**
   * A dead upstream must not look like a working API with zero results, so the
   * endpoints answer 503 with an explicit reason instead.
   */
  private assertDatasetAvailable(): void {
    if (this.exoplanetService.isDatasetAvailable()) return;

    const state = this.exoplanetService.getDatasetState();
    const reason =
      state === 'loading'
        ? 'the NASA Exoplanet Archive dataset is still loading'
        : `the NASA Exoplanet Archive dataset could not be loaded: ${this.exoplanetService.getDatasetError() ?? 'unknown error'}`;

    throw new ServiceUnavailableException({
      statusCode: 503,
      error: 'Service Unavailable',
      message: `Exodex cannot serve exoplanet data because ${reason}. No data is returned in this state.`,
      datasetState: state,
    });
  }

  private parseArray<T>(value: string | undefined): T[] {
    if (!value) return [];
    return value.split(',') as T[];
  }
}
