import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  DiscoveryMethod,
  Exoplanet,
  ExoplanetFilters,
  PlanetType,
  SortState,
} from '@exodex/shared-types';
import { NasaExoplanetRaw, transformNasaData } from './exoplanet.transformer';

@Injectable()
export class ExoplanetService implements OnModuleInit {
  private readonly logger = new Logger(ExoplanetService.name);
  private exoplanets: Exoplanet[] = [];
  private exoplanetMap: Map<string, Exoplanet> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map();
  private lastUpdated: Date | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    // Carga inicial en background sin bloquear
    this.loadData().catch((err) => {
      this.logger.error('Failed to load initial data', err);
    });

    // Configurar TTL de caché
    const ttlSeconds = this.configService.get<number>('CACHE_TTL_SECONDS', 3600);
    this.refreshTimer = setInterval(() => {
      this.loadData().catch((err) => {
        this.logger.error('Failed to refresh data', err);
      });
    }, ttlSeconds * 1000);
  }

  private async loadData(): Promise<void> {
    this.logger.log('Loading exoplanet data from NASA TAP API...');
    const startTime = Date.now();

    const baseUrl = this.configService.get<string>(
      'NASA_TAP_BASE_URL',
      'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'
    );

    const query = `
      SELECT
        pl_name, hostname, pl_letter,
        pl_orbper, pl_orbpererr1, pl_orbpererr2,
        pl_orbsmax, pl_orbeccen,
        pl_rade, pl_radeerr1, pl_radeerr2,
        pl_radj,
        pl_bmasse, pl_bmasseerr1, pl_bmasseerr2,
        pl_bmassj,
        pl_eqt, pl_eqterr1, pl_eqterr2,
        pl_insol, pl_controv_flag,
        discoverymethod, disc_year, disc_facility,
        st_spectype, st_teff, st_rad, st_mass, st_met, st_logg,
        sy_vmag, sy_kmag, sy_gaiamag,
        ra, dec, sy_dist, sy_snum, sy_pnum,
        pl_refname, rowupdate, pl_pubdate
      FROM ps
      WHERE default_flag = 1
      ORDER BY disc_year ASC, pl_name ASC
    `;

    try {
      const response = await axios.get(baseUrl, {
        params: {
          LANG: 'ADQL',
          FORMAT: 'json',
          QUERY: query,
        },
        timeout: 60000,
      });

      const rawData: NasaExoplanetRaw[] = response.data;
      this.logger.log(`Loaded ${rawData.length} exoplanets from NASA`);

      // Transformar datos y asignar índices
      this.exoplanets = rawData.map((raw, idx) =>
        transformNasaData(raw, idx + 1)
      );

      // Crear mapa por ID
      this.exoplanetMap.clear();
      for (const planet of this.exoplanets) {
        this.exoplanetMap.set(planet.id, planet);
      }

      // Crear índice de búsqueda
      this.buildSearchIndex();

      this.lastUpdated = new Date();
      const duration = Date.now() - startTime;
      this.logger.log(`Data processed in ${duration}ms`);
    } catch (error) {
      this.logger.error('Failed to fetch data from NASA API', error);
      throw error;
    }
  }

  private buildSearchIndex(): void {
    this.searchIndex.clear();

    for (const planet of this.exoplanets) {
      // Indexar por nombre
      const nameWords = planet.name.toLowerCase().split(/[\s-_]+/);
      for (const word of nameWords) {
        if (word.length > 1) {
          this.addToIndex(word, planet.id);
        }
      }

      // Indexar por estrella huésped
      const starWords = planet.hostStar.toLowerCase().split(/[\s-_]+/);
      for (const word of starWords) {
        if (word.length > 1) {
          this.addToIndex(word, planet.id);
        }
      }
    }
  }

  private addToIndex(word: string, planetId: string): void {
    if (!this.searchIndex.has(word)) {
      this.searchIndex.set(word, new Set());
    }
    const ids = this.searchIndex.get(word);
    if (ids) {
      ids.add(planetId);
    }
  }

  getAll(
    filters: ExoplanetFilters,
    sort: SortState,
    page: number,
    pageSize: number
  ): { data: Exoplanet[]; total: number } {
    // Aplicar filtros
    let filtered = this.exoplanets.filter((planet) =>
      this.matchesFilters(planet, filters)
    );

    // Aplicar ordenamiento
    filtered = this.applySort(filtered, sort);

    // Aplicar paginación
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return { data: paginated, total };
  }

  getById(id: string): Exoplanet | undefined {
    return this.exoplanetMap.get(id);
  }

  getStats(): {
    totalCount: number;
    typeDistribution: Record<PlanetType, number>;
    methodDistribution: Record<DiscoveryMethod, number>;
    yearRange: [number, number];
    radiusRange: [number, number];
  } {
    const typeDistribution: Record<PlanetType, number> = {
      'rocky-terrestrial': 0,
      'super-earth': 0,
      'mini-neptune': 0,
      neptunian: 0,
      jovian: 0,
      'hot-jupiter': 0,
      'cold-giant': 0,
      unknown: 0,
    };

    const methodDistribution: Record<DiscoveryMethod, number> = {
      Transit: 0,
      'Radial Velocity': 0,
      'Direct Imaging': 0,
      Microlensing: 0,
      Astrometry: 0,
      'Transit Timing Variations': 0,
      Other: 0,
    };

    let minYear = Infinity;
    let maxYear = -Infinity;
    let minRadius = Infinity;
    let maxRadius = -Infinity;

    for (const planet of this.exoplanets) {
      typeDistribution[planet.planetType]++;
      methodDistribution[planet.discoveryMethod]++;

      if (planet.discoveryYear !== null) {
        minYear = Math.min(minYear, planet.discoveryYear);
        maxYear = Math.max(maxYear, planet.discoveryYear);
      }

      if (planet.radiusEarth !== null) {
        minRadius = Math.min(minRadius, planet.radiusEarth);
        maxRadius = Math.max(maxRadius, planet.radiusEarth);
      }
    }

    return {
      totalCount: this.exoplanets.length,
      typeDistribution,
      methodDistribution,
      yearRange: [minYear === Infinity ? 1992 : minYear, maxYear === -Infinity ? new Date().getFullYear() : maxYear],
      radiusRange: [minRadius === Infinity ? 0.3 : minRadius, maxRadius === -Infinity ? 25 : maxRadius],
    };
  }

  getCacheStatus(): {
    lastUpdated: Date | null;
    totalPlanets: number;
    cacheAge: number;
  } {
    const cacheAge = this.lastUpdated
      ? Date.now() - this.lastUpdated.getTime()
      : -1;
    return {
      lastUpdated: this.lastUpdated,
      totalPlanets: this.exoplanets.length,
      cacheAge,
    };
  }

  private getStellarClass(planet: Exoplanet): string {
    if (planet.spectralType) {
      const match = planet.spectralType.match(/^([OBAFGKM])/i);
      if (match) return match[1].toUpperCase();
    }
    const t = planet.stellarTempK ?? 5778;
    if (t < 3700) return 'M';
    if (t < 5200) return 'K';
    if (t < 6000) return 'G';
    if (t < 7500) return 'F';
    if (t < 10000) return 'A';
    if (t < 33000) return 'B';
    return 'O';
  }

  private matchesFilters(
    planet: Exoplanet,
    filters: ExoplanetFilters
  ): boolean {
    // Filtro por tipo de planeta
    if (
      filters.planetTypes.length > 0 &&
      !filters.planetTypes.includes(planet.planetType)
    ) {
      return false;
    }

    // Filtro por clase estelar
    if (filters.stellarClasses.length > 0) {
      const sc = this.getStellarClass(planet);
      if (!filters.stellarClasses.includes(sc as never)) {
        return false;
      }
    }

    // Filtro por método de descubrimiento
    if (
      filters.discoveryMethods.length > 0 &&
      !filters.discoveryMethods.includes(planet.discoveryMethod)
    ) {
      return false;
    }

    // Filtro por habitabilidad
    if (
      filters.habitabilityClasses.length > 0 &&
      !filters.habitabilityClasses.includes(planet.habitabilityClass)
    ) {
      return false;
    }

    // Filtro por rango de años
    if (filters.discoveryYearRange !== null) {
      const [min, max] = filters.discoveryYearRange;
      if (
        planet.discoveryYear !== null &&
        (planet.discoveryYear < min || planet.discoveryYear > max)
      ) {
        return false;
      }
    }

    // Filtro por radio
    if (filters.radiusEarthRange !== null) {
      const [min, max] = filters.radiusEarthRange;
      if (
        planet.radiusEarth !== null &&
        (planet.radiusEarth < min || planet.radiusEarth > max)
      ) {
        return false;
      }
    }

    // Filtro por masa
    if (filters.massEarthRange !== null) {
      const [min, max] = filters.massEarthRange;
      if (
        planet.massEarth !== null &&
        (planet.massEarth < min || planet.massEarth > max)
      ) {
        return false;
      }
    }

    // Filtro por temperatura
    if (filters.equilibriumTempKRange !== null) {
      const [min, max] = filters.equilibriumTempKRange;
      if (
        planet.equilibriumTempK !== null &&
        (planet.equilibriumTempK < min || planet.equilibriumTempK > max)
      ) {
        return false;
      }
    }

    // Búsqueda por texto
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      const words = query.split(/\s+/);

      // Buscar en índice
      let matchingIds: Set<string> | null = null;
      for (const word of words) {
        const idsForWord = this.searchIndex.get(word);
        if (!idsForWord) {
          return false; // Palabra no encontrada en índice
        }
        if (matchingIds === null) {
          matchingIds = new Set(idsForWord);
        } else {
          // Intersección
          matchingIds = new Set(
            [...matchingIds].filter((id) => idsForWord.has(id))
          );
        }
        if (matchingIds.size === 0) {
          return false;
        }
      }

      if (matchingIds === null || !matchingIds.has(planet.id)) {
        return false;
      }
    }

    return true;
  }

  private applySort(
    planets: Exoplanet[],
    sort: SortState
  ): Exoplanet[] {
    const { field, direction } = sort;
    const multiplier = direction === 'asc' ? 1 : -1;

    return [...planets].sort((a, b) => {
      let aVal: number | string | null;
      let bVal: number | string | null;

      switch (field) {
        case 'index':
          aVal = a.index;
          bVal = b.index;
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'discoveryYear':
          aVal = a.discoveryYear;
          bVal = b.discoveryYear;
          break;
        case 'radiusEarth':
          aVal = a.radiusEarth;
          bVal = b.radiusEarth;
          break;
        case 'massEarth':
          aVal = a.massEarth;
          bVal = b.massEarth;
          break;
        case 'equilibriumTempK':
          aVal = a.equilibriumTempK;
          bVal = b.equilibriumTempK;
          break;
        case 'habitabilityScore':
          aVal = a.habitabilityScore;
          bVal = b.habitabilityScore;
          break;
        case 'orbitalPeriodDays':
          aVal = a.orbitalPeriodDays;
          bVal = b.orbitalPeriodDays;
          break;
        case 'distanceParsec':
          aVal = a.distanceParsec;
          bVal = b.distanceParsec;
          break;
        default:
          aVal = a.index;
          bVal = b.index;
      }

      // Manejar nulls - nulls al final
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * multiplier;
      }

      return ((aVal as number) - (bVal as number)) * multiplier;
    });
  }
}
