export const EVOLUTIONS = {
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
