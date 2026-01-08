export const BIOMES = {
    SURFACE: {
        id: 'surface',
        name: 'Superficie',
        yStart: 0,
        yEnd: 450,
        colors: {
            top: 0x4a9fff,
            bottom: 0x2a7fff
        },
        brightness: 1.0,
        spawnMultiplier: 1.2,
        decorations: ['sunrays', 'bubbles', 'waves'],
        ambientParticles: 'bubbles',
        description: 'Aguas cálidas y luminosas cerca de la superficie'
    },
    REEF: {
        id: 'reef',
        name: 'Arrecife de Coral',
        yStart: 450,
        yEnd: 950,
        colors: {
            top: 0x20b2aa,
            bottom: 0x1a8a7a
        },
        brightness: 0.9,
        spawnMultiplier: 1.0,
        decorations: ['coral', 'anemone', 'schoolFish'],
        ambientParticles: 'plankton',
        description: 'Arrecifes coloridos llenos de vida'
    },
    THERMOCLINE: {
        id: 'thermocline',
        name: 'Termoclina',
        yStart: 950,
        yEnd: 1550,
        colors: {
            top: 0x1a6b8a,
            bottom: 0x0d4f6b
        },
        brightness: 0.7,
        spawnMultiplier: 0.9,
        decorations: ['kelp', 'currents'],
        ambientParticles: 'plankton',
        description: 'Zona de transición con aguas más frías'
    },
    BATHYAL: {
        id: 'bathyal',
        name: 'Zona Batial',
        yStart: 1550,
        yEnd: 2200,
        colors: {
            top: 0x1a2a4a,
            bottom: 0x0d1a2a
        },
        brightness: 0.4,
        spawnMultiplier: 0.7,
        decorations: ['sponges', 'ghostJelly', 'glowingEyes'],
        ambientParticles: 'marineSnow',
        description: 'Profundidades oscuras con criaturas extrañas'
    },
    ABYSS: {
        id: 'abyss',
        name: 'Abismo',
        yStart: 2200,
        yEnd: 2800,
        colors: {
            top: 0x0a0a15,
            bottom: 0x050508
        },
        brightness: 0.2,
        spawnMultiplier: 0.5,
        decorations: ['vents', 'bioluminescence', 'marineSnow'],
        ambientParticles: 'marineSnow',
        description: 'El abismo más profundo, solo los más fuertes sobreviven'
    }
};

// Ordered array for iteration
export const BIOME_ORDER = ['SURFACE', 'REEF', 'THERMOCLINE', 'BATHYAL', 'ABYSS'];

// Get biome at a specific Y coordinate
export function getBiomeAtY(y) {
    for (const key of BIOME_ORDER) {
        const biome = BIOMES[key];
        if (y >= biome.yStart && y < biome.yEnd) {
            return biome;
        }
    }
    // Default to abyss if beyond bounds
    return BIOMES.ABYSS;
}

// Get spawn Y range for a specific biome
export function getSpawnRangeForBiome(biomeId) {
    const biome = Object.values(BIOMES).find(b => b.id === biomeId);
    if (biome) {
        return { min: biome.yStart + 30, max: biome.yEnd - 30 };
    }
    return { min: 0, max: 1500 };
}

// Transition zone size between biomes
export const BIOME_TRANSITION_SIZE = 50;
