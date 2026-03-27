/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
const exoplanet_module_1 = __webpack_require__(6);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: '.env',
                isGlobal: true,
            }),
            exoplanet_module_1.ExoplanetModule,
        ],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExoplanetModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const exoplanet_controller_1 = __webpack_require__(7);
const exoplanet_service_1 = __webpack_require__(8);
let ExoplanetModule = class ExoplanetModule {
};
exports.ExoplanetModule = ExoplanetModule;
exports.ExoplanetModule = ExoplanetModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [exoplanet_controller_1.ExoplanetController],
        providers: [exoplanet_service_1.ExoplanetService],
        exports: [exoplanet_service_1.ExoplanetService],
    })
], ExoplanetModule);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExoplanetController = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const exoplanet_service_1 = __webpack_require__(8);
const exoplanet_query_dto_1 = __webpack_require__(11);
let ExoplanetController = class ExoplanetController {
    constructor(exoplanetService) {
        this.exoplanetService = exoplanetService;
    }
    getAll(query) {
        const page = Math.max(1, query.page ?? 1);
        const pageSize = Math.min(96, Math.max(1, query.pageSize ?? 48));
        // Construir filtros
        const filters = {
            planetTypes: this.parseArray(query.types),
            discoveryMethods: this.parseArray(query.methods),
            habitabilityClasses: this.parseArray(query.habitability),
            discoveryYearRange: query.minYear !== undefined && query.maxYear !== undefined
                ? [query.minYear, query.maxYear]
                : null,
            radiusEarthRange: query.minRadius !== undefined && query.maxRadius !== undefined
                ? [query.minRadius, query.maxRadius]
                : null,
            massEarthRange: null,
            equilibriumTempKRange: null,
            searchQuery: query.q ?? '',
        };
        // Construir ordenamiento
        const sort = {
            field: query.sort ?? 'index',
            direction: query.order ?? 'asc',
        };
        const { data, total } = this.exoplanetService.getAll(filters, sort, page, pageSize);
        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    getStats() {
        return this.exoplanetService.getStats();
    }
    getStatus() {
        return this.exoplanetService.getCacheStatus();
    }
    getById(id) {
        const planet = this.exoplanetService.getById(id);
        if (!planet) {
            throw new common_1.NotFoundException(`Exoplanet with id '${id}' not found`);
        }
        return planet;
    }
    parseArray(value) {
        if (!value)
            return [];
        return value.split(',');
    }
};
exports.ExoplanetController = ExoplanetController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof exoplanet_query_dto_1.ExoplanetQueryDto !== "undefined" && exoplanet_query_dto_1.ExoplanetQueryDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], ExoplanetController.prototype, "getAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('meta/stats'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExoplanetController.prototype, "getStats", null);
tslib_1.__decorate([
    (0, common_1.Get)('meta/status'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ExoplanetController.prototype, "getStatus", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], ExoplanetController.prototype, "getById", null);
exports.ExoplanetController = ExoplanetController = tslib_1.__decorate([
    (0, common_1.Controller)('api/exoplanets'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof exoplanet_service_1.ExoplanetService !== "undefined" && exoplanet_service_1.ExoplanetService) === "function" ? _a : Object])
], ExoplanetController);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var ExoplanetService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExoplanetService = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
const axios_1 = tslib_1.__importDefault(__webpack_require__(9));
const exoplanet_transformer_1 = __webpack_require__(10);
let ExoplanetService = ExoplanetService_1 = class ExoplanetService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ExoplanetService_1.name);
        this.exoplanets = [];
        this.exoplanetMap = new Map();
        this.searchIndex = new Map();
        this.lastUpdated = null;
        this.refreshTimer = null;
    }
    async onModuleInit() {
        // Carga inicial en background sin bloquear
        this.loadData().catch((err) => {
            this.logger.error('Failed to load initial data', err);
        });
        // Configurar TTL de caché
        const ttlSeconds = this.configService.get('CACHE_TTL_SECONDS', 3600);
        this.refreshTimer = setInterval(() => {
            this.loadData().catch((err) => {
                this.logger.error('Failed to refresh data', err);
            });
        }, ttlSeconds * 1000);
    }
    async loadData() {
        this.logger.log('Loading exoplanet data from NASA TAP API...');
        const startTime = Date.now();
        const baseUrl = this.configService.get('NASA_TAP_BASE_URL', 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync');
        const query = `
      SELECT
        pl_name, hostname, pl_letter,
        pl_orbper, pl_orbsmax, pl_orbeccen, pl_orbincl,
        pl_rade, pl_radj, pl_bmasse, pl_bmassj, pl_dens, pl_g, pl_eqt, pl_insol,
        discoverymethod, disc_year, disc_facility, disc_telescope,
        st_teff, st_rad, st_mass, st_met, st_age,
        ra, dec, sy_dist, sy_pnum,
        pl_refname
      FROM ps
      WHERE default_flag = 1
      ORDER BY disc_year ASC, pl_name ASC
    `;
        try {
            const response = await axios_1.default.get(baseUrl, {
                params: {
                    LANG: 'ADQL',
                    FORMAT: 'json',
                    QUERY: query,
                },
                timeout: 60000,
            });
            const rawData = response.data;
            this.logger.log(`Loaded ${rawData.length} exoplanets from NASA`);
            // Transformar datos y asignar índices
            this.exoplanets = rawData.map((raw, idx) => (0, exoplanet_transformer_1.transformNasaData)(raw, idx + 1));
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
        }
        catch (error) {
            this.logger.error('Failed to fetch data from NASA API', error);
            throw error;
        }
    }
    buildSearchIndex() {
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
    addToIndex(word, planetId) {
        if (!this.searchIndex.has(word)) {
            this.searchIndex.set(word, new Set());
        }
        const ids = this.searchIndex.get(word);
        if (ids) {
            ids.add(planetId);
        }
    }
    getAll(filters, sort, page, pageSize) {
        // Aplicar filtros
        let filtered = this.exoplanets.filter((planet) => this.matchesFilters(planet, filters));
        // Aplicar ordenamiento
        filtered = this.applySort(filtered, sort);
        // Aplicar paginación
        const total = filtered.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginated = filtered.slice(start, end);
        return { data: paginated, total };
    }
    getById(id) {
        return this.exoplanetMap.get(id);
    }
    getStats() {
        const typeDistribution = {
            'rocky-terrestrial': 0,
            'super-earth': 0,
            'mini-neptune': 0,
            neptunian: 0,
            jovian: 0,
            'hot-jupiter': 0,
            'cold-giant': 0,
            unknown: 0,
        };
        const methodDistribution = {
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
    getCacheStatus() {
        const cacheAge = this.lastUpdated
            ? Date.now() - this.lastUpdated.getTime()
            : -1;
        return {
            lastUpdated: this.lastUpdated,
            totalPlanets: this.exoplanets.length,
            cacheAge,
        };
    }
    matchesFilters(planet, filters) {
        // Filtro por tipo de planeta
        if (filters.planetTypes.length > 0 &&
            !filters.planetTypes.includes(planet.planetType)) {
            return false;
        }
        // Filtro por método de descubrimiento
        if (filters.discoveryMethods.length > 0 &&
            !filters.discoveryMethods.includes(planet.discoveryMethod)) {
            return false;
        }
        // Filtro por habitabilidad
        if (filters.habitabilityClasses.length > 0 &&
            !filters.habitabilityClasses.includes(planet.habitabilityClass)) {
            return false;
        }
        // Filtro por rango de años
        if (filters.discoveryYearRange !== null) {
            const [min, max] = filters.discoveryYearRange;
            if (planet.discoveryYear !== null &&
                (planet.discoveryYear < min || planet.discoveryYear > max)) {
                return false;
            }
        }
        // Filtro por radio
        if (filters.radiusEarthRange !== null) {
            const [min, max] = filters.radiusEarthRange;
            if (planet.radiusEarth !== null &&
                (planet.radiusEarth < min || planet.radiusEarth > max)) {
                return false;
            }
        }
        // Filtro por masa
        if (filters.massEarthRange !== null) {
            const [min, max] = filters.massEarthRange;
            if (planet.massEarth !== null &&
                (planet.massEarth < min || planet.massEarth > max)) {
                return false;
            }
        }
        // Filtro por temperatura
        if (filters.equilibriumTempKRange !== null) {
            const [min, max] = filters.equilibriumTempKRange;
            if (planet.equilibriumTempK !== null &&
                (planet.equilibriumTempK < min || planet.equilibriumTempK > max)) {
                return false;
            }
        }
        // Búsqueda por texto
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase().trim();
            const words = query.split(/\s+/);
            // Buscar en índice
            let matchingIds = null;
            for (const word of words) {
                const idsForWord = this.searchIndex.get(word);
                if (!idsForWord) {
                    return false; // Palabra no encontrada en índice
                }
                if (matchingIds === null) {
                    matchingIds = new Set(idsForWord);
                }
                else {
                    // Intersección
                    matchingIds = new Set([...matchingIds].filter((id) => idsForWord.has(id)));
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
    applySort(planets, sort) {
        const { field, direction } = sort;
        const multiplier = direction === 'asc' ? 1 : -1;
        return [...planets].sort((a, b) => {
            let aVal;
            let bVal;
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
            if (aVal === null && bVal === null)
                return 0;
            if (aVal === null)
                return 1;
            if (bVal === null)
                return 1;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal) * multiplier;
            }
            return (aVal - bVal) * multiplier;
        });
    }
};
exports.ExoplanetService = ExoplanetService;
exports.ExoplanetService = ExoplanetService = ExoplanetService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], ExoplanetService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("axios");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.transformNasaData = transformNasaData;
function mapDiscoveryMethod(method) {
    const mapping = {
        Transit: 'Transit',
        'Radial Velocity': 'Radial Velocity',
        'Direct Imaging': 'Direct Imaging',
        Microlensing: 'Microlensing',
        Astrometry: 'Astrometry',
        'Transit Timing Variations': 'Transit Timing Variations',
    };
    return mapping[method] || 'Other';
}
function classifyPlanetType(radiusEarth, massEarth, equilibriumTempK, orbitalPeriodDays) {
    if (radiusEarth === null && massEarth === null)
        return 'unknown';
    const r = radiusEarth ?? (massEarth ? Math.pow(massEarth, 0.55) : null);
    if (r === null)
        return 'unknown';
    if (r < 1.2)
        return 'rocky-terrestrial';
    if (r < 1.75)
        return 'super-earth';
    if (r < 3.5)
        return 'mini-neptune';
    if (r < 6.0)
        return 'neptunian';
    // Gigantes: diferenciar hot-jupiter de cold-giant
    if (r >= 6.0) {
        if (orbitalPeriodDays !== null && orbitalPeriodDays < 10)
            return 'hot-jupiter';
        return equilibriumTempK !== null && equilibriumTempK > 1000 ? 'hot-jupiter' : 'jovian';
    }
    return 'unknown';
}
function calculateHabitabilityScore(planet) {
    let score = 0;
    let factors = 0;
    // Factor 1: Temperatura de equilibrio (peso: 40%)
    if (planet.equilibriumTempK !== null && planet.equilibriumTempK !== undefined) {
        const tempOptimal = 255;
        const tempMin = 180, tempMax = 340;
        if (planet.equilibriumTempK >= tempMin && planet.equilibriumTempK <= tempMax) {
            const deviation = Math.abs(planet.equilibriumTempK - tempOptimal) / (tempMax - tempMin);
            score += (1 - deviation) * 40;
        }
        factors += 40;
    }
    // Factor 2: Radio del planeta (peso: 25%)
    if (planet.radiusEarth !== null && planet.radiusEarth !== undefined) {
        if (planet.radiusEarth >= 0.5 && planet.radiusEarth <= 2.0) {
            const deviation = Math.abs(planet.radiusEarth - 1.0) / 1.5;
            score += (1 - deviation) * 25;
        }
        factors += 25;
    }
    // Factor 3: Masa del planeta (peso: 20%)
    if (planet.massEarth !== null && planet.massEarth !== undefined) {
        if (planet.massEarth >= 0.1 && planet.massEarth <= 5.0) {
            const deviation = Math.abs(planet.massEarth - 1.0) / 4.0;
            score += (1 - deviation) * 20;
        }
        factors += 20;
    }
    // Factor 4: Flujo de insolación (peso: 15%)
    if (planet.insolationFlux !== null && planet.insolationFlux !== undefined) {
        if (planet.insolationFlux >= 0.25 && planet.insolationFlux <= 1.8) {
            const deviation = Math.abs(planet.insolationFlux - 1.0) / 1.55;
            score += (1 - deviation) * 15;
        }
        factors += 15;
    }
    if (factors === 0)
        return 0;
    return Math.round((score / factors) * 100);
}
function classifyHabitability(score, type) {
    if (type === 'hot-jupiter' || type === 'jovian' || type === 'cold-giant')
        return 'uninhabitable';
    if (score === 0)
        return 'unknown';
    if (score >= 60)
        return 'potentially-habitable';
    if (score >= 30)
        return 'marginal';
    return 'uninhabitable';
}
function normalizeId(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
function transformNasaData(raw, index) {
    const planetType = classifyPlanetType(raw.pl_rade, raw.pl_bmasse, raw.pl_eqt, raw.pl_orbper);
    const basePlanet = {
        radiusEarth: raw.pl_rade,
        massEarth: raw.pl_bmasse,
        equilibriumTempK: raw.pl_eqt,
        insolationFlux: raw.pl_insol,
    };
    const habitabilityScore = calculateHabitabilityScore(basePlanet);
    const habitabilityClass = classifyHabitability(habitabilityScore, planetType);
    return {
        id: normalizeId(raw.pl_name),
        index,
        name: raw.pl_name,
        hostStar: raw.hostname,
        letter: raw.pl_letter,
        orbitalPeriodDays: raw.pl_orbper,
        semiMajorAxisAU: raw.pl_orbsmax,
        eccentricity: raw.pl_orbeccen,
        inclinationDeg: raw.pl_orbincl,
        radiusEarth: raw.pl_rade,
        radiusJupiter: raw.pl_radj,
        massEarth: raw.pl_bmasse,
        massJupiter: raw.pl_bmassj,
        densityGCC: raw.pl_dens,
        gravityMS2: raw.pl_g,
        equilibriumTempK: raw.pl_eqt,
        insolationFlux: raw.pl_insol,
        planetType,
        discoveryMethod: mapDiscoveryMethod(raw.discoverymethod),
        discoveryYear: raw.disc_year,
        discoveryFacility: raw.disc_facility,
        telescope: raw.disc_telescope,
        stellarTempK: raw.st_teff,
        stellarRadiusSun: raw.st_rad,
        stellarMassSun: raw.st_mass,
        stellarMetallicity: raw.st_met,
        stellarAge: raw.st_age,
        rightAscension: raw.ra,
        declination: raw.dec,
        distanceParsec: raw.sy_dist,
        habitabilityScore,
        habitabilityClass,
        referenceUrl: raw.pl_refname,
        hasAtmosphereData: false, // No hay datos de atmósfera en TAP actualmente
        numberOfKnownPlanetsInSystem: raw.sy_pnum,
    };
}


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("compression");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
const compression_1 = tslib_1.__importDefault(__webpack_require__(12));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Compresión gzip
    app.use((0, compression_1.default)());
    // CORS para el frontend Angular
    app.enableCors({
        origin: 'http://localhost:4200',
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map