export const EVOLUTIONS = {
    // Tier 1 - Basic evolutions (single DNA requirement)
    AGILE: {
        id: 'agile',
        name: 'Forma Ágil',
        description: '+50% velocidad, +20% esquivar',
        requirements: { speed: 50 },
        effects: {
            speedMultiplier: 1.5,
            dodgeChance: 0.2
        },
        visual: {
            scaleX: 0.8,
            scaleY: 1.2,
            color: 0x00ffff
        }
    },
    BRUTAL: {
        id: 'brutal',
        name: 'Forma Brutal',
        description: '+40% daño, -20% velocidad',
        requirements: { attack: 50 },
        effects: {
            damageMultiplier: 1.4,
            speedMultiplier: 0.8
        },
        visual: {
            scaleX: 1.4,
            scaleY: 1.2,
            color: 0xff4444
        }
    },
    ARMORED: {
        id: 'armored',
        name: 'Forma Acorazada',
        description: '+50% vida máxima, -10% velocidad',
        requirements: { defense: 50 },
        effects: {
            maxHealthMultiplier: 1.5,
            speedMultiplier: 0.9
        },
        visual: {
            scaleX: 1.2,
            scaleY: 1.2,
            color: 0x888888,
            hasShell: true
        }
    },
    LUMINESCENT: {
        id: 'luminescent',
        name: 'Forma Luminiscente',
        description: '+30% energía, revela enemigos ocultos',
        requirements: { energy: 50 },
        effects: {
            energyMultiplier: 1.3,
            revealHidden: true
        },
        visual: {
            scaleX: 1.0,
            scaleY: 1.0,
            color: 0xffffaa,
            glowing: true
        }
    },

    // Tier 2 - Hybrid evolutions (dual DNA requirements)
    ELECTRIC: {
        id: 'electric',
        name: 'Forma Eléctrica',
        description: 'Daño en área al atacar',
        requirements: { attack: 30, energy: 30 },
        effects: {
            areaDamage: true,
            areaRadius: 60
        },
        visual: {
            scaleX: 1.0,
            scaleY: 1.0,
            color: 0xffff00,
            glowing: true
        }
    },
    VENOMOUS: {
        id: 'venomous',
        name: 'Forma Venenosa',
        description: 'Ataques envenenan (daño continuo)',
        requirements: { attack: 25, defense: 25 },
        effects: {
            poisonDamage: true,
            poisonDuration: 3000,
            poisonDPS: 5
        },
        visual: {
            scaleX: 1.1,
            scaleY: 1.0,
            color: 0x00ff44
        }
    },
    PREDATOR: {
        id: 'predator',
        name: 'Forma Depredadora',
        description: '+60% rango de ataque, +20% daño',
        requirements: { attack: 40, speed: 20 },
        effects: {
            attackRangeMultiplier: 1.6,
            damageMultiplier: 1.2
        },
        visual: {
            scaleX: 1.3,
            scaleY: 1.0,
            color: 0xcc3333
        }
    },
    REGENERATIVE: {
        id: 'regenerative',
        name: 'Forma Regenerativa',
        description: 'Regenera 2 vida/segundo',
        requirements: { defense: 30, energy: 20 },
        effects: {
            healthRegen: 2,
            regenInterval: 1000
        },
        visual: {
            scaleX: 1.1,
            scaleY: 1.1,
            color: 0x44ff88
        }
    },
    SWIFT_HUNTER: {
        id: 'swift_hunter',
        name: 'Cazador Veloz',
        description: '-40% cooldown de ataque',
        requirements: { speed: 30, attack: 20 },
        effects: {
            attackCooldownMultiplier: 0.6
        },
        visual: {
            scaleX: 0.9,
            scaleY: 1.1,
            color: 0xff6666
        }
    },
    DASH_STRIKER: {
        id: 'dash_striker',
        name: 'Embestida Letal',
        description: 'El dash hace daño a enemigos',
        requirements: { speed: 35, attack: 25 },
        effects: {
            dashDamage: true,
            dashDamageMultiplier: 0.8
        },
        visual: {
            scaleX: 1.0,
            scaleY: 0.9,
            color: 0x00ccff,
            trail: true
        }
    },

    // Tier 3 - Advanced evolutions (triple DNA or high requirements)
    VAMPIRE: {
        id: 'vampire',
        name: 'Forma Vampírica',
        description: 'Roba 30% del daño como vida',
        requirements: { attack: 40, defense: 20, energy: 20 },
        effects: {
            lifeSteal: 0.3
        },
        visual: {
            scaleX: 1.2,
            scaleY: 1.0,
            color: 0x880044
        }
    },
    BERSERKER: {
        id: 'berserker',
        name: 'Forma Berserker',
        description: '+100% daño cuando vida < 30%',
        requirements: { attack: 60, speed: 30 },
        effects: {
            berserkThreshold: 0.3,
            berserkDamageMultiplier: 2.0
        },
        visual: {
            scaleX: 1.3,
            scaleY: 1.2,
            color: 0xff0000
        }
    },
    PHANTOM: {
        id: 'phantom',
        name: 'Forma Fantasma',
        description: '+40% esquivar, atraviesa enemigos',
        requirements: { speed: 40, energy: 40 },
        effects: {
            dodgeChance: 0.4,
            phaseThrough: true
        },
        visual: {
            scaleX: 0.9,
            scaleY: 1.0,
            color: 0xaaccff,
            transparent: true
        }
    },
    TITAN: {
        id: 'titan',
        name: 'Forma Titán',
        description: '+100% vida, +50% tamaño, -30% velocidad',
        requirements: { defense: 70, attack: 30 },
        effects: {
            maxHealthMultiplier: 2.0,
            sizeMultiplier: 1.5,
            speedMultiplier: 0.7
        },
        visual: {
            scaleX: 1.5,
            scaleY: 1.5,
            color: 0x666699
        }
    },
    STORM: {
        id: 'storm',
        name: 'Forma Tormenta',
        description: 'Daño en área pasivo cada 2s',
        requirements: { energy: 60, attack: 30 },
        effects: {
            passiveAreaDamage: true,
            passiveAreaRadius: 80,
            passiveAreaDamage: 10,
            passiveAreaInterval: 2000
        },
        visual: {
            scaleX: 1.1,
            scaleY: 1.1,
            color: 0x4488ff,
            glowing: true,
            sparks: true
        }
    }
};

export function getAvailableEvolutions(dna, currentEvolutions = []) {
    const available = [];

    for (const [key, evolution] of Object.entries(EVOLUTIONS)) {
        if (currentEvolutions.includes(evolution.id)) continue;

        let meetsRequirements = true;
        for (const [type, amount] of Object.entries(evolution.requirements)) {
            if ((dna[type] || 0) < amount) {
                meetsRequirements = false;
                break;
            }
        }

        if (meetsRequirements) {
            available.push(evolution);
        }
    }

    return available;
}
