"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// libs/planet-renderer/src/index.ts
var src_exports = {};
__export(src_exports, {
  darkenHex: () => darkenHex,
  getPlanetColors: () => getPlanetColors,
  getPlanetVisualRadius: () => getPlanetVisualRadius,
  getViewBoxSize: () => getViewBoxSize,
  lightenHex: () => lightenHex,
  renderPlanet: () => renderPlanet
});
module.exports = __toCommonJS(src_exports);

// libs/planet-renderer/src/lib/algorithms/color.algorithm.ts
function getPlanetColors(planetType, equilibriumTempK) {
  if (planetType === "hot-jupiter" || equilibriumTempK !== null && equilibriumTempK > 1200) {
    return { primary: "#E8593C", secondary: "#F2A623" };
  }
  if (planetType === "jovian") {
    return { primary: "#E8A96A", secondary: "#C87D3E" };
  }
  if (planetType === "cold-giant") {
    return { primary: "#8BA4C7", secondary: "#5A7A9A" };
  }
  if (planetType === "neptunian") {
    if (equilibriumTempK !== null && equilibriumTempK < 300) {
      return { primary: "#4A90D9", secondary: "#6DB8E8" };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 300 && equilibriumTempK <= 700) {
      return { primary: "#7B68C8", secondary: "#A492E0" };
    }
    return { primary: "#4A90D9", secondary: "#6DB8E8" };
  }
  if (planetType === "mini-neptune") {
    if (equilibriumTempK !== null && equilibriumTempK < 300) {
      return { primary: "#4A90D9", secondary: "#6DB8E8" };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 300 && equilibriumTempK <= 700) {
      return { primary: "#7B68C8", secondary: "#A492E0" };
    }
    return { primary: "#7B68C8", secondary: "#A492E0" };
  }
  if (planetType === "super-earth") {
    if (equilibriumTempK !== null && equilibriumTempK < 260) {
      return { primary: "#5BB4A0", secondary: "#3D8C7A" };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 260 && equilibriumTempK <= 320) {
      return { primary: "#6BB86E", secondary: "#4A9A4E" };
    }
    return { primary: "#D4835A", secondary: "#B5603C" };
  }
  if (planetType === "rocky-terrestrial") {
    if (equilibriumTempK !== null && equilibriumTempK < 200) {
      return { primary: "#A8C4D4", secondary: "#7A9DB0" };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 200 && equilibriumTempK <= 320) {
      return { primary: "#8B9E6A", secondary: "#6A7D50" };
    }
    return { primary: "#C4885A", secondary: "#A06440" };
  }
  return { primary: "#7A7A7A", secondary: "#5A5A5A" };
}
function lightenHex(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const newR = Math.min(255, Math.round(r + (255 - r) * factor));
  const newG = Math.min(255, Math.round(g + (255 - g) * factor));
  const newB = Math.min(255, Math.round(b + (255 - b) * factor));
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}
function darkenHex(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const newR = Math.round(r * (1 - factor));
  const newG = Math.round(g * (1 - factor));
  const newB = Math.round(b * (1 - factor));
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}
function desaturateHex(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const newR = Math.round(r + (gray - r) * factor);
  const newG = Math.round(g + (gray - g) * factor);
  const newB = Math.round(b + (gray - b) * factor);
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

// libs/planet-renderer/src/lib/algorithms/size.algorithm.ts
function getPlanetVisualRadius(radiusEarth, size) {
  const baseRadius = { micro: 12, card: 48, detail: 128 }[size];
  if (radiusEarth === null)
    return baseRadius * 0.7;
  const scale = Math.min(Math.max(Math.log10(radiusEarth + 1) / Math.log10(12), 0.25), 1.8);
  return baseRadius * scale;
}
function getViewBoxSize(size) {
  return { micro: 32, card: 160, detail: 320 }[size];
}

// libs/planet-renderer/src/lib/algorithms/atmosphere.algorithm.ts
function buildAtmosphereGlow(radius, center, color, equilibriumTempK, insolationFlux) {
  if (insolationFlux === null && equilibriumTempK === null) {
    return "";
  }
  const glowRadius = radius * 1.15;
  let glowColor = color;
  let glowOpacity = 0.12;
  if (equilibriumTempK !== null && equilibriumTempK > 700) {
    glowColor = "#FF6A28";
    glowOpacity = 0.2;
  }
  if (equilibriumTempK !== null && equilibriumTempK < 200) {
    glowColor = "#A8D4F0";
    glowOpacity = 0.15;
  }
  const gradientId = `atm-${Math.random().toString(36).substr(2, 9)}`;
  return `
    <defs>
      <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${glowColor}" stop-opacity="0"/>
        <stop offset="70%" stop-color="${glowColor}" stop-opacity="${glowOpacity * 0.5}"/>
        <stop offset="100%" stop-color="${glowColor}" stop-opacity="${glowOpacity}"/>
      </radialGradient>
    </defs>
    <circle cx="${center}" cy="${center}" r="${glowRadius}" fill="url(#${gradientId})"/>
  `;
}

// libs/planet-renderer/src/lib/algorithms/rings.algorithm.ts
function shouldShowRings(planetType, radiusEarth) {
  return (planetType === "jovian" || planetType === "cold-giant" || planetType === "neptunian") && radiusEarth !== null && radiusEarth > 7;
}
function buildRings(radius, center, secondaryColor) {
  const ringColor1 = desaturateHex(secondaryColor, 0.3);
  const ringColor2 = desaturateHex(secondaryColor, 0.5);
  const majorAxis1 = radius * 2.2;
  const minorAxis1 = radius * 0.35;
  const majorAxis2 = radius * 2.8;
  const minorAxis2 = radius * 0.35;
  const rotation = -15;
  const clipId = `ring-clip-${Math.random().toString(36).substr(2, 9)}`;
  return `
    <defs>
      <clipPath id="${clipId}">
        <rect x="0" y="${center}" width="${center * 2}" height="${center}" />
      </clipPath>
    </defs>
    <!-- Anillos traseros -->
    <ellipse
      cx="${center}"
      cy="${center}"
      rx="${majorAxis1 / 2}"
      ry="${minorAxis1 / 2}"
      fill="none"
      stroke="${ringColor1}"
      stroke-width="${radius * 0.08}"
      opacity="0.45"
      transform="rotate(${rotation} ${center} ${center})"
    />
    <ellipse
      cx="${center}"
      cy="${center}"
      rx="${majorAxis2 / 2}"
      ry="${minorAxis2 / 2}"
      fill="none"
      stroke="${ringColor2}"
      stroke-width="${radius * 0.06}"
      opacity="0.30"
      transform="rotate(${rotation} ${center} ${center})"
    />
    <!-- Anillos delanteros (solo parte inferior, clippeada) -->
    <g clip-path="url(#${clipId})">
      <ellipse
        cx="${center}"
        cy="${center}"
        rx="${majorAxis1 / 2}"
        ry="${minorAxis1 / 2}"
        fill="none"
        stroke="${ringColor1}"
        stroke-width="${radius * 0.08}"
        opacity="0.45"
        transform="rotate(${rotation} ${center} ${center})"
      />
      <ellipse
        cx="${center}"
        cy="${center}"
        rx="${majorAxis2 / 2}"
        ry="${minorAxis2 / 2}"
        fill="none"
        stroke="${ringColor2}"
        stroke-width="${radius * 0.06}"
        opacity="0.30"
        transform="rotate(${rotation} ${center} ${center})"
      />
    </g>
  `;
}

// libs/planet-renderer/src/lib/algorithms/surface.algorithm.ts
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return function() {
    hash = hash * 1664525 + 1013904223 & 4294967295;
    return (hash >>> 0) / 4294967295;
  };
}
function buildSurfaceDetails(planetType, radius, center, primaryColor, secondaryColor, equilibriumTempK, planetName) {
  const rand = seededRandom(planetName || "unknown");
  let details = "";
  if (planetType === "rocky-terrestrial" || planetType === "super-earth") {
    details += buildRockySurface(radius, center, primaryColor, rand);
    if (equilibriumTempK !== null && equilibriumTempK < 250) {
      details += buildPolarCap(radius, center);
    }
  } else if (planetType === "mini-neptune" || planetType === "neptunian") {
    details += buildBandedSurface(radius, center, primaryColor, secondaryColor, rand, false);
  } else if (planetType === "jovian" || planetType === "hot-jupiter") {
    details += buildBandedSurface(radius, center, primaryColor, secondaryColor, rand, true);
  } else if (planetType === "cold-giant") {
    details += buildBandedSurface(radius, center, primaryColor, secondaryColor, rand, false);
  }
  return details;
}
function buildRockySurface(radius, center, color, rand) {
  const numSpots = 3 + Math.floor(rand() * 4);
  let spots = "";
  for (let i = 0; i < numSpots; i++) {
    const angle = rand() * Math.PI * 2;
    const distance = rand() * radius * 0.7;
    const cx = center + Math.cos(angle) * distance;
    const cy = center + Math.sin(angle) * distance;
    const rx = radius * (0.15 + rand() * 0.25);
    const ry = radius * (0.1 + rand() * 0.2);
    const rotation = rand() * 360;
    const opacity = 0.08 + rand() * 0.1;
    spots += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000000" opacity="${opacity}" transform="rotate(${rotation} ${cx} ${cy})"/>`;
  }
  return spots;
}
function buildPolarCap(radius, center) {
  const capRadius = radius * 0.4;
  const cy = center - radius * 0.5;
  return `<ellipse cx="${center}" cy="${cy}" rx="${capRadius}" ry="${capRadius * 0.5}" fill="#FFFFFF" opacity="0.25"/>`;
}
function buildBandedSurface(radius, center, primaryColor, secondaryColor, rand, isJovian) {
  const numBands = 4 + Math.floor(rand() * 4);
  const clipId = `band-clip-${Math.random().toString(36).substr(2, 9)}`;
  let bands = `
    <defs>
      <clipPath id="${clipId}">
        <circle cx="${center}" cy="${center}" r="${radius}"/>
      </clipPath>
    </defs>
    <g clip-path="url(#${clipId})">
  `;
  const bandHeight = radius * 2 / numBands;
  for (let i = 0; i < numBands; i++) {
    const isProminent = isJovian && i === Math.floor(numBands / 2);
    const color = i % 2 === 0 ? secondaryColor : "#000000";
    const opacity = isProminent ? 0.3 : 0.12 + rand() * 0.08;
    const y = center - radius + i * bandHeight;
    bands += `<rect x="${center - radius}" y="${y}" width="${radius * 2}" height="${bandHeight}" fill="${color}" opacity="${opacity}"/>`;
  }
  if (isJovian && rand() > 0.5) {
    const spotX = center + radius * 0.3;
    const spotY = center + radius * 0.1;
    const spotRx = radius * 0.25;
    const spotRy = radius * 0.18;
    const spotColor = getComplementaryHex(primaryColor);
    bands += `<ellipse cx="${spotX}" cy="${spotY}" rx="${spotRx}" ry="${spotRy}" fill="${spotColor}" opacity="0.35"/>`;
  }
  bands += "</g>";
  return bands;
}
function getComplementaryHex(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const newR = (r + 128) % 256;
  const newG = (g + 64) % 256;
  const newB = (b + 192) % 256;
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

// libs/planet-renderer/src/lib/planet-renderer.ts
function renderPlanet(params, planetName = "unknown") {
  const {
    radiusEarth,
    massEarth,
    equilibriumTempK,
    planetType,
    densityGCC,
    eccentricity,
    insolationFlux,
    discoveryYear,
    size,
    animationsEnabled
  } = params;
  const viewBoxSize = getViewBoxSize(size);
  const visualRadius = getPlanetVisualRadius(radiusEarth, size);
  const center = viewBoxSize / 2;
  const colors = getPlanetColors(planetType, equilibriumTempK);
  const { primary: primaryColor, secondary: secondaryColor } = colors;
  const highlightColor = lightenHex(secondaryColor, 0.35);
  const shadowColor = darkenHex(primaryColor, 0.4);
  const gradientId = `body-${Math.random().toString(36).substr(2, 9)}`;
  const showRings = shouldShowRings(planetType, radiusEarth);
  let svgParts = [];
  if (showRings) {
    svgParts.push(buildRings(visualRadius, center, secondaryColor));
  }
  const atmosphereSvg = buildAtmosphereGlow(
    visualRadius,
    center,
    primaryColor,
    equilibriumTempK,
    insolationFlux
  );
  if (atmosphereSvg) {
    svgParts.push(atmosphereSvg);
  }
  const bodySvg = `
    <defs>
      <radialGradient id="${gradientId}" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="${highlightColor}"/>
        <stop offset="45%" stop-color="${primaryColor}"/>
        <stop offset="100%" stop-color="${shadowColor}"/>
      </radialGradient>
    </defs>
    <circle cx="${center}" cy="${center}" r="${visualRadius}" fill="url(#${gradientId})"/>
  `;
  svgParts.push(bodySvg);
  const surfaceSvg = buildSurfaceDetails(
    planetType,
    visualRadius,
    center,
    primaryColor,
    secondaryColor,
    equilibriumTempK,
    planetName
  );
  svgParts.push(surfaceSvg);
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">${svgParts.join("")}</svg>`;
  const description = generateDescription(planetType, radiusEarth, equilibriumTempK);
  return {
    svgString,
    primaryColor,
    secondaryColor,
    description
  };
}
function generateDescription(planetType, radiusEarth, equilibriumTempK) {
  const size = radiusEarth !== null ? radiusEarth < 1.5 ? "peque\xF1o" : radiusEarth < 4 ? "mediano" : "grande" : "de tama\xF1o desconocido";
  const temp = equilibriumTempK !== null ? equilibriumTempK < 200 ? "muy fr\xEDo" : equilibriumTempK < 300 ? "fr\xEDo" : equilibriumTempK < 400 ? "templado" : equilibriumTempK < 600 ? "c\xE1lido" : "muy caliente" : "de temperatura desconocida";
  const typeNames = {
    "rocky-terrestrial": "planeta rocoso terrestre",
    "super-earth": "super-Tierra",
    "mini-neptune": "mini-Neptuno",
    "neptunian": "planeta tipo Neptuno",
    "jovian": "gigante gaseoso joviano",
    "hot-jupiter": "J\xFApiter caliente",
    "cold-giant": "gigante fr\xEDo",
    "unknown": "planeta de tipo desconocido"
  };
  return `${typeNames[planetType] || "planeta"} ${size}, ${temp}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  darkenHex,
  getPlanetColors,
  getPlanetVisualRadius,
  getViewBoxSize,
  lightenHex,
  renderPlanet
});
