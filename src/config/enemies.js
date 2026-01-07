export const ENEMY_TYPES = {
    COMMON: {
        name: 'Pez Común',
        color: 0x4a9fff,
        size: 15,
        speed: 80,
        health: 1,
        damage: 0,
        dnaType: 'speed',
        dnaAmount: 5,
        behavior: 'flee',
        hungerRestore: 15,
        spawnWeight: 40
    },
    PUFFER: {
        name: 'Pez Globo',
        color: 0xff8c00,
        size: 25,
        speed: 40,
        health: 3,
        damage: 0,
        dnaType: 'defense',
        dnaAmount: 8,
        behavior: 'wander',
        hungerRestore: 25,
        spawnWeight: 25
    },
    HUNTER: {
        name: 'Pez Cazador',
        color: 0xff3333,
        size: 20,
        speed: 70,
        health: 2,
        damage: 10,
        dnaType: 'attack',
        dnaAmount: 10,
        behavior: 'chase',
        hungerRestore: 20,
        spawnWeight: 20
    },
    LUMINOUS: {
        name: 'Pez Luminoso',
        color: 0xffff00,
        size: 12,
        speed: 120,
        health: 1,
        damage: 0,
        dnaType: 'energy',
        dnaAmount: 15,
        behavior: 'flee',
        hungerRestore: 10,
        spawnWeight: 10
    },
    MUTANT: {
        name: 'Pez Mutante',
        color: 0x9932cc,
        size: 30,
        speed: 60,
        health: 5,
        damage: 15,
        dnaType: 'random',
        dnaAmount: 20,
        behavior: 'chase',
        hungerRestore: 35,
        spawnWeight: 5
    }
};

export const DNA_TYPES = ['speed', 'defense', 'attack', 'energy'];
