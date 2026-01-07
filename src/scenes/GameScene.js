import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { ENEMY_TYPES } from '../config/enemies.js';
import { getAvailableEvolutions } from '../config/evolutions.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // World size
        this.worldWidth = 2000;
        this.worldHeight = 1500;

        // Create ocean background
        this.createBackground();

        // Create player
        this.player = new Player(this, this.worldWidth / 2, this.worldHeight / 2);

        // Enemies group
        this.enemies = [];

        // Set world bounds
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.player.body.setCollideWorldBounds(true);

        // Camera follows player
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Create HUD
        this.createHUD();
        this.hudDirty = true;

        // Hunger timer
        this.hungerTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateHunger,
            callbackScope: this,
            loop: true
        });

        // Spawn timer
        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Initial enemies
        for (let i = 0; i < 10; i++) {
            this.spawnEnemy();
        }

        // Input - click to attack
        this.input.on('pointerdown', () => {
            this.handleAttack();
        });

        // Evolution key
        this.evolutionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Can evolve flag
        this.canEvolve = false;
    }

    createBackground() {
        // Ocean gradient background with smoother transition
        const bg = this.add.graphics();

        // Create smoother layered blue gradient (surface to deep)
        for (let y = 0; y < this.worldHeight; y += 8) {
            const ratio = y / this.worldHeight;
            // Surface: lighter cyan-blue, Deep: darker blue-green
            const r = Math.floor(15 + (1 - ratio) * 45);
            const g = Math.floor(50 + (1 - ratio) * 110);
            const b = Math.floor(90 + (1 - ratio) * 90);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, this.worldWidth, 8);
        }

        // Add light rays from surface
        this.createLightRays(bg);

        // Add caustic light effects (animated)
        this.caustics = [];
        this.createCaustics();

        // Add sandy bottom
        this.createSandyBottom(bg);

        // Add rocks
        this.createRocks(bg);

        // Add corals
        this.createCorals();

        // Add jellyfish in background
        this.jellyfish = [];
        this.createJellyfish();

        // Add floating particles (plankton)
        this.createFloatingParticles(bg);

        // Add animated seaweed (stored for animation)
        this.seaweeds = [];
        this.createAnimatedSeaweed();

        // Add animated bubbles (particle emitter)
        this.createBubbles();

        // Add school of tiny fish in background
        this.schoolFish = [];
        this.createSchoolFish();
    }

    createLightRays(bg) {
        // Light rays from surface (god rays effect)
        for (let i = 0; i < 8; i++) {
            const x = 150 + Math.random() * (this.worldWidth - 300);
            const width = 30 + Math.random() * 60;
            const alpha = 0.03 + Math.random() * 0.04;

            // Create gradient ray that fades as it goes deeper
            for (let y = 0; y < this.worldHeight * 0.7; y += 20) {
                const fadeRatio = 1 - (y / (this.worldHeight * 0.7));
                const rayAlpha = alpha * fadeRatio;
                const spread = y * 0.15; // Rays spread as they go down

                bg.fillStyle(0xffffcc, rayAlpha);
                bg.fillTriangle(
                    x - width / 2 - spread, y + 20,
                    x + width / 2 + spread, y + 20,
                    x, y
                );
            }
        }
    }

    createSandyBottom(bg) {
        // Sandy ocean floor
        const sandHeight = 80;
        const sandY = this.worldHeight - sandHeight;

        // Sand gradient
        for (let y = sandY; y < this.worldHeight; y += 5) {
            const ratio = (y - sandY) / sandHeight;
            const r = Math.floor(194 - ratio * 30);
            const g = Math.floor(178 - ratio * 40);
            const b = Math.floor(128 - ratio * 30);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, this.worldWidth, 5);
        }

        // Add sand texture (small dots)
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.worldWidth;
            const y = sandY + 10 + Math.random() * (sandHeight - 20);
            const size = 1 + Math.random() * 2;
            const shade = Math.random() > 0.5 ? 0xc4b896 : 0xa89870;
            bg.fillStyle(shade, 0.5);
            bg.fillCircle(x, y, size);
        }
    }

    createRocks(bg) {
        // Add decorative rocks on the bottom
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.worldWidth;
            const y = this.worldHeight - 40 - Math.random() * 30;
            const width = 40 + Math.random() * 80;
            const height = 25 + Math.random() * 40;

            // Rock shadow
            bg.fillStyle(0x2a2a2a, 0.3);
            bg.fillEllipse(x + 5, y + 5, width, height * 0.6);

            // Main rock body
            const rockColor = Math.random() > 0.5 ? 0x5a5a5a : 0x6a6a6a;
            bg.fillStyle(rockColor, 1);
            bg.fillEllipse(x, y, width, height);

            // Rock highlight
            bg.fillStyle(0x8a8a8a, 0.4);
            bg.fillEllipse(x - width * 0.2, y - height * 0.2, width * 0.4, height * 0.3);
        }
    }

    createCorals() {
        // Colorful coral formations with more variety
        const coralColors = [
            { main: 0xff6b6b, light: 0xff9999, dark: 0xcc4444 },
            { main: 0xff8e53, light: 0xffb088, dark: 0xcc6633 },
            { main: 0xfeca57, light: 0xffdd88, dark: 0xcc9922 },
            { main: 0xff9ff3, light: 0xffccff, dark: 0xcc66cc },
            { main: 0x54a0ff, light: 0x88ccff, dark: 0x3377cc },
            { main: 0x5f27cd, light: 0x8855ee, dark: 0x441199 },
            { main: 0x00d2d3, light: 0x66ffff, dark: 0x009999 }
        ];

        for (let i = 0; i < 18; i++) {
            const x = 80 + Math.random() * (this.worldWidth - 160);
            const baseY = this.worldHeight - 55;
            const colorScheme = coralColors[Math.floor(Math.random() * coralColors.length)];
            const coralType = Math.floor(Math.random() * 5);

            const coral = this.add.graphics();

            switch (coralType) {
                case 0: // Branching coral (tree-like)
                    this.drawBranchingCoral(coral, x, baseY, colorScheme);
                    break;
                case 1: // Brain coral
                    this.drawBrainCoral(coral, x, baseY, colorScheme);
                    break;
                case 2: // Fan coral
                    this.drawFanCoral(coral, x, baseY, colorScheme);
                    break;
                case 3: // Tube coral
                    this.drawTubeCoral(coral, x, baseY, colorScheme);
                    break;
                case 4: // Mushroom coral
                    this.drawMushroomCoral(coral, x, baseY, colorScheme);
                    break;
            }
        }

        // Add sea anemones
        this.anemones = [];
        this.createSeaAnemones();
    }

    drawBranchingCoral(coral, x, baseY, colors) {
        const branches = 4 + Math.floor(Math.random() * 4);

        // Base/trunk
        coral.fillStyle(colors.dark, 1);
        coral.fillRoundedRect(x - 8, baseY - 20, 16, 25, 5);

        for (let b = 0; b < branches; b++) {
            const branchX = x + (b - branches / 2) * 12;
            const branchHeight = 35 + Math.random() * 55;
            const branchWidth = 5 + Math.random() * 3;

            // Main branch with gradient effect
            coral.fillStyle(colors.dark, 1);
            coral.fillRoundedRect(branchX - branchWidth / 2 - 1, baseY - branchHeight, branchWidth + 2, branchHeight, 3);
            coral.fillStyle(colors.main, 1);
            coral.fillRoundedRect(branchX - branchWidth / 2, baseY - branchHeight, branchWidth, branchHeight - 5, 3);

            // Branch tip with polyps
            coral.fillStyle(colors.light, 1);
            coral.fillCircle(branchX, baseY - branchHeight, 7);
            coral.fillStyle(colors.main, 0.8);
            coral.fillCircle(branchX, baseY - branchHeight, 5);

            // Small polyp dots on tip
            coral.fillStyle(0xffffff, 0.7);
            for (let p = 0; p < 5; p++) {
                const angle = (p / 5) * Math.PI * 2;
                coral.fillCircle(
                    branchX + Math.cos(angle) * 4,
                    baseY - branchHeight + Math.sin(angle) * 4,
                    1.5
                );
            }

            // Sub-branches
            if (Math.random() > 0.4) {
                const subHeight = branchHeight * 0.4;
                const subX = branchX + (Math.random() > 0.5 ? 1 : -1) * 8;
                coral.fillStyle(colors.main, 0.9);
                coral.fillRoundedRect(subX - 2, baseY - branchHeight * 0.7, 4, subHeight, 2);
                coral.fillStyle(colors.light, 1);
                coral.fillCircle(subX, baseY - branchHeight * 0.7 - subHeight + 10, 5);
            }
        }
    }

    drawBrainCoral(coral, x, baseY, colors) {
        const size = 30 + Math.random() * 35;

        // Shadow
        coral.fillStyle(0x000000, 0.2);
        coral.fillEllipse(x + 5, baseY - 5, size * 1.1, size * 0.4);

        // Main body
        coral.fillStyle(colors.main, 1);
        coral.fillCircle(x, baseY - size / 2, size);

        // Highlight
        coral.fillStyle(colors.light, 0.4);
        coral.fillEllipse(x - size * 0.3, baseY - size * 0.7, size * 0.5, size * 0.3);

        // Brain-like grooves
        coral.lineStyle(2, colors.dark, 0.7);
        for (let l = 0; l < 6; l++) {
            const startAngle = (l / 6) * Math.PI * 2;
            const curveSize = size * (0.4 + Math.random() * 0.4);
            coral.beginPath();
            coral.arc(x, baseY - size / 2, curveSize, startAngle, startAngle + 0.8);
            coral.stroke();
        }

        // Texture dots
        coral.fillStyle(colors.dark, 0.3);
        for (let d = 0; d < 8; d++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * size * 0.7;
            coral.fillCircle(
                x + Math.cos(angle) * dist,
                baseY - size / 2 + Math.sin(angle) * dist,
                2
            );
        }
    }

    drawFanCoral(coral, x, baseY, colors) {
        const width = 50 + Math.random() * 40;
        const height = 60 + Math.random() * 50;

        // Stem
        coral.fillStyle(colors.dark, 1);
        coral.fillRoundedRect(x - 4, baseY - 25, 8, 30, 3);

        // Fan shape (semi-circle with texture)
        coral.fillStyle(colors.main, 0.85);
        coral.beginPath();
        coral.arc(x, baseY - 25, width / 2, Math.PI, 0);
        coral.lineTo(x + 5, baseY - 25);
        coral.lineTo(x - 5, baseY - 25);
        coral.fill();

        // Fan ribs
        coral.lineStyle(1.5, colors.dark, 0.5);
        for (let r = 0; r < 9; r++) {
            const angle = Math.PI + (r / 8) * Math.PI;
            coral.lineBetween(
                x, baseY - 25,
                x + Math.cos(angle) * (width / 2 - 5),
                baseY - 25 + Math.sin(angle) * (width / 2 - 5)
            );
        }

        // Edge highlight
        coral.lineStyle(2, colors.light, 0.6);
        coral.beginPath();
        coral.arc(x, baseY - 25, width / 2 - 3, Math.PI, 0);
        coral.stroke();

        // Polyp dots along edge
        coral.fillStyle(colors.light, 0.8);
        for (let p = 0; p < 12; p++) {
            const angle = Math.PI + (p / 11) * Math.PI;
            coral.fillCircle(
                x + Math.cos(angle) * (width / 2 - 2),
                baseY - 25 + Math.sin(angle) * (width / 2 - 2),
                2
            );
        }
    }

    drawTubeCoral(coral, x, baseY, colors) {
        const tubes = 5 + Math.floor(Math.random() * 5);

        for (let t = 0; t < tubes; t++) {
            const tubeX = x + (t - tubes / 2) * 10 + Math.random() * 5;
            const tubeHeight = 25 + Math.random() * 40;
            const tubeWidth = 6 + Math.random() * 4;

            // Tube body
            coral.fillStyle(colors.dark, 1);
            coral.fillRoundedRect(tubeX - tubeWidth / 2 - 1, baseY - tubeHeight, tubeWidth + 2, tubeHeight, 3);
            coral.fillStyle(colors.main, 1);
            coral.fillRoundedRect(tubeX - tubeWidth / 2, baseY - tubeHeight + 2, tubeWidth, tubeHeight - 2, 3);

            // Tube opening (top)
            coral.fillStyle(colors.dark, 0.8);
            coral.fillCircle(tubeX, baseY - tubeHeight, tubeWidth / 2 + 2);
            coral.fillStyle(0x331111, 0.6);
            coral.fillCircle(tubeX, baseY - tubeHeight, tubeWidth / 2 - 1);

            // Rim highlight
            coral.fillStyle(colors.light, 0.7);
            coral.beginPath();
            coral.arc(tubeX, baseY - tubeHeight, tubeWidth / 2, Math.PI, 0);
            coral.fill();
        }
    }

    drawMushroomCoral(coral, x, baseY, colors) {
        const capWidth = 35 + Math.random() * 30;
        const capHeight = 15 + Math.random() * 10;
        const stemHeight = 20 + Math.random() * 15;

        // Stem
        coral.fillStyle(colors.dark, 1);
        coral.fillRoundedRect(x - 6, baseY - stemHeight - capHeight / 2, 12, stemHeight + 5, 4);
        coral.fillStyle(colors.main, 0.9);
        coral.fillRoundedRect(x - 5, baseY - stemHeight - capHeight / 2, 10, stemHeight + 3, 4);

        // Cap shadow
        coral.fillStyle(0x000000, 0.15);
        coral.fillEllipse(x + 3, baseY - stemHeight - capHeight / 2 + 5, capWidth + 5, capHeight);

        // Cap
        coral.fillStyle(colors.main, 1);
        coral.fillEllipse(x, baseY - stemHeight - capHeight / 2, capWidth, capHeight);

        // Cap highlight
        coral.fillStyle(colors.light, 0.5);
        coral.fillEllipse(x - capWidth * 0.2, baseY - stemHeight - capHeight * 0.7, capWidth * 0.4, capHeight * 0.4);

        // Underside gills
        coral.lineStyle(1, colors.dark, 0.4);
        for (let g = 0; g < 8; g++) {
            const gx = x - capWidth / 2 + 8 + g * (capWidth - 16) / 7;
            coral.lineBetween(gx, baseY - stemHeight - capHeight / 2, gx, baseY - stemHeight - capHeight / 2 + capHeight * 0.4);
        }

        // Spots on cap
        coral.fillStyle(colors.light, 0.6);
        for (let s = 0; s < 4; s++) {
            const sx = x + (Math.random() - 0.5) * capWidth * 0.6;
            const sy = baseY - stemHeight - capHeight / 2 - capHeight * 0.2 + Math.random() * capHeight * 0.3;
            coral.fillCircle(sx, sy, 2 + Math.random() * 3);
        }
    }

    createSeaAnemones() {
        const anemoneColors = [
            { base: 0xff6699, tips: 0xffaacc },
            { base: 0x66ffcc, tips: 0xaaffee },
            { base: 0xffaa44, tips: 0xffcc88 },
            { base: 0xaa66ff, tips: 0xcc99ff }
        ];

        for (let i = 0; i < 8; i++) {
            const x = 100 + Math.random() * (this.worldWidth - 200);
            const baseY = this.worldHeight - 50;
            const colors = anemoneColors[Math.floor(Math.random() * anemoneColors.length)];
            const tentacles = 12 + Math.floor(Math.random() * 8);
            const size = 20 + Math.random() * 15;

            const anemone = {
                x: x,
                y: baseY,
                colors: colors,
                tentacles: tentacles,
                size: size,
                graphics: this.add.graphics(),
                phase: Math.random() * Math.PI * 2
            };
            this.anemones.push(anemone);
        }
    }

    createFloatingParticles(bg) {
        // Small floating particles (plankton/marine snow)
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            const size = 1 + Math.random() * 2;
            const alpha = 0.1 + Math.random() * 0.2;

            bg.fillStyle(0xffffff, alpha);
            bg.fillCircle(x, y, size);
        }
    }

    createAnimatedSeaweed() {
        // Variety of seaweed types
        const seaweedTypes = [
            { // Kelp - tall and wavy
                color: 0x2d6b4e, lightColor: 0x3d9b6e, segments: 8, width: 12, segmentHeight: 28, type: 'kelp'
            },
            { // Grass - short and thin
                color: 0x1e8a3a, lightColor: 0x2eb84a, segments: 4, width: 4, segmentHeight: 18, type: 'grass'
            },
            { // Broad leaf
                color: 0x2a7a5e, lightColor: 0x3aaa7e, segments: 5, width: 18, segmentHeight: 22, type: 'broad'
            },
            { // Feathery
                color: 0x3d8b5e, lightColor: 0x5dbb7e, segments: 6, width: 8, segmentHeight: 20, type: 'feather'
            }
        ];

        // Create seaweed clusters
        for (let i = 0; i < 35; i++) {
            const x = Math.random() * this.worldWidth;
            const typeConfig = seaweedTypes[Math.floor(Math.random() * seaweedTypes.length)];
            const segments = typeConfig.segments + Math.floor(Math.random() * 3) - 1;

            const seaweed = {
                x: x,
                segments: segments,
                graphics: this.add.graphics(),
                phase: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 0.4,
                color: typeConfig.color,
                lightColor: typeConfig.lightColor,
                width: typeConfig.width + Math.random() * 4 - 2,
                segmentHeight: typeConfig.segmentHeight + Math.random() * 6 - 3,
                type: typeConfig.type
            };
            this.seaweeds.push(seaweed);
        }

        // Add some kelp forests (clusters of tall kelp)
        for (let forest = 0; forest < 4; forest++) {
            const forestX = 200 + Math.random() * (this.worldWidth - 400);
            for (let k = 0; k < 5; k++) {
                const seaweed = {
                    x: forestX + (k - 2) * 25 + Math.random() * 10,
                    segments: 10 + Math.floor(Math.random() * 4),
                    graphics: this.add.graphics(),
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.3 + Math.random() * 0.2,
                    color: 0x2d5a3e,
                    lightColor: 0x3d7a5e,
                    width: 14 + Math.random() * 4,
                    segmentHeight: 32 + Math.random() * 8,
                    type: 'kelp'
                };
                this.seaweeds.push(seaweed);
            }
        }
    }

    createBubbles() {
        // Create bubble texture once
        const bubbleGfx = this.make.graphics({ x: 0, y: 0, add: false });
        bubbleGfx.fillStyle(0xffffff, 0.3);
        bubbleGfx.fillCircle(8, 8, 8);
        bubbleGfx.fillStyle(0xffffff, 0.6);
        bubbleGfx.fillCircle(5, 5, 3);
        bubbleGfx.generateTexture('bubble', 16, 16);
        bubbleGfx.destroy();

        // Create particle emitter for bubbles
        this.bubbleEmitter = this.add.particles(0, this.worldHeight, 'bubble', {
            x: { min: 0, max: this.worldWidth },
            speedY: { min: -50, max: -20 },
            speedX: { min: -5, max: 5 },
            scale: { start: 0.3, end: 0.8 },
            alpha: { start: 0.4, end: 0 },
            lifespan: { min: 6000, max: 12000 },
            frequency: 300,
            quantity: 1
        });
        this.bubbleEmitter.setDepth(5);
    }

    createCaustics() {
        // Animated caustic light patterns on the ocean floor
        for (let i = 0; i < 15; i++) {
            const caustic = {
                x: Math.random() * this.worldWidth,
                y: this.worldHeight - 200 + Math.random() * 150,
                size: 40 + Math.random() * 80,
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.4,
                graphics: this.add.graphics()
            };
            this.caustics.push(caustic);
        }
    }

    createJellyfish() {
        // Background jellyfish floating around
        for (let i = 0; i < 6; i++) {
            const jelly = {
                x: Math.random() * this.worldWidth,
                y: 200 + Math.random() * (this.worldHeight - 500),
                size: 15 + Math.random() * 25,
                phase: Math.random() * Math.PI * 2,
                driftSpeed: 0.2 + Math.random() * 0.3,
                pulseSpeed: 1 + Math.random() * 0.5,
                color: [0xff88cc, 0x88ccff, 0xcc88ff, 0x88ffcc][Math.floor(Math.random() * 4)],
                graphics: this.add.graphics(),
                tentacles: 4 + Math.floor(Math.random() * 4)
            };
            this.jellyfish.push(jelly);
        }
    }

    createSchoolFish() {
        // Create a school of tiny background fish using sprites
        const schoolCenterX = Math.random() * this.worldWidth;
        const schoolCenterY = 300 + Math.random() * (this.worldHeight - 600);
        const schoolColors = [0x6699ff, 0x99ffcc, 0xffcc66];
        const schoolColor = schoolColors[Math.floor(Math.random() * 3)];

        // Generate fish texture once
        const fishGfx = this.make.graphics({ x: 0, y: 0, add: false });
        fishGfx.fillStyle(schoolColor, 0.6);
        fishGfx.fillEllipse(12, 8, 18, 12); // Body
        fishGfx.fillTriangle(3, 8, -6, 2, -6, 14); // Tail
        fishGfx.fillStyle(0xffffff, 0.7);
        fishGfx.fillCircle(17, 6, 2); // Eye
        fishGfx.generateTexture('schoolFish', 24, 16);
        fishGfx.destroy();

        for (let i = 0; i < 25; i++) {
            const size = 4 + Math.random() * 4;
            const sprite = this.add.sprite(
                schoolCenterX + (Math.random() - 0.5) * 200,
                schoolCenterY + (Math.random() - 0.5) * 150,
                'schoolFish'
            );
            sprite.setScale(size / 8); // Base size is 8
            sprite.setAlpha(0.5);
            sprite.setDepth(2);

            const fish = {
                sprite: sprite,
                size: size,
                phase: Math.random() * Math.PI * 2,
                speed: 30 + Math.random() * 20
            };
            this.schoolFish.push(fish);
        }

        // Store school center for movement
        this.schoolCenter = { x: schoolCenterX, y: schoolCenterY, targetX: schoolCenterX, targetY: schoolCenterY };
    }

    isInCameraView(x, y, margin = 100) {
        const cam = this.cameras.main;
        return x > cam.scrollX - margin &&
               x < cam.scrollX + cam.width + margin &&
               y > cam.scrollY - margin &&
               y < cam.scrollY + cam.height + margin;
    }

    updateBackgroundAnimations(time, delta) {
        // Animate seaweed with different styles based on type
        this.seaweeds.forEach(seaweed => {
            // Frustum culling - skip if not in view
            if (!this.isInCameraView(seaweed.x, this.worldHeight - 100, 150)) {
                seaweed.graphics.setVisible(false);
                return;
            }
            seaweed.graphics.setVisible(true);
            seaweed.graphics.clear();

            const baseY = this.worldHeight - 15;
            const width = seaweed.width || 8;
            const segHeight = seaweed.segmentHeight || 22;

            for (let j = 0; j < seaweed.segments; j++) {
                const segmentRatio = j / seaweed.segments;
                const waveIntensity = 8 + segmentRatio * 18;
                const waveOffset = Math.sin(time * 0.001 * seaweed.speed + seaweed.phase + j * 0.4) * waveIntensity;

                const segY = baseY - j * segHeight;
                const segX = seaweed.x + waveOffset;

                // Draw based on type
                if (seaweed.type === 'kelp') {
                    // Kelp - wide leaf segments with central vein
                    const leafWidth = width * (1 - segmentRatio * 0.3);
                    seaweed.graphics.fillStyle(seaweed.color, 0.85);
                    seaweed.graphics.fillEllipse(segX, segY, leafWidth, segHeight * 0.9);

                    // Central vein
                    seaweed.graphics.lineStyle(2, seaweed.lightColor, 0.5);
                    seaweed.graphics.lineBetween(segX, segY - segHeight * 0.4, segX, segY + segHeight * 0.4);

                    // Leaf edge highlight
                    if (j > 0) {
                        seaweed.graphics.fillStyle(seaweed.lightColor, 0.3);
                        seaweed.graphics.fillEllipse(segX - leafWidth * 0.3, segY - segHeight * 0.2, leafWidth * 0.3, segHeight * 0.4);
                    }
                } else if (seaweed.type === 'grass') {
                    // Sea grass - thin blades
                    seaweed.graphics.fillStyle(seaweed.color, 0.9);
                    seaweed.graphics.fillRoundedRect(segX - width / 2, segY - segHeight / 2, width, segHeight, 2);

                    // Highlight
                    seaweed.graphics.fillStyle(seaweed.lightColor, 0.4);
                    seaweed.graphics.fillRoundedRect(segX - width / 4, segY - segHeight / 2, width / 3, segHeight, 1);
                } else if (seaweed.type === 'broad') {
                    // Broad leaf seaweed
                    const leafWidth = width * (0.6 + Math.sin(j * 0.8) * 0.4);
                    seaweed.graphics.fillStyle(seaweed.color, 0.8);
                    seaweed.graphics.fillEllipse(segX, segY, leafWidth, segHeight);

                    // Wavy edge effect
                    seaweed.graphics.lineStyle(1.5, seaweed.lightColor, 0.4);
                    seaweed.graphics.beginPath();
                    seaweed.graphics.arc(segX, segY, leafWidth * 0.8, 0, Math.PI);
                    seaweed.graphics.stroke();
                } else if (seaweed.type === 'feather') {
                    // Feathery seaweed with side fronds
                    seaweed.graphics.fillStyle(seaweed.color, 0.85);
                    seaweed.graphics.fillRoundedRect(segX - 2, segY - segHeight / 2, 4, segHeight, 2);

                    // Side fronds
                    const frondWave = Math.sin(time * 0.002 + j * 0.3) * 0.3;
                    for (let f = 0; f < 3; f++) {
                        const fy = segY - segHeight * 0.3 + f * segHeight * 0.25;
                        const frondLen = width * 0.8;

                        seaweed.graphics.fillStyle(seaweed.lightColor, 0.7);
                        // Left frond
                        seaweed.graphics.beginPath();
                        seaweed.graphics.moveTo(segX - 2, fy);
                        seaweed.graphics.lineTo(segX - frondLen - frondWave * 5, fy - 3);
                        seaweed.graphics.lineTo(segX - frondLen - frondWave * 5, fy + 3);
                        seaweed.graphics.fill();
                        // Right frond
                        seaweed.graphics.beginPath();
                        seaweed.graphics.moveTo(segX + 2, fy);
                        seaweed.graphics.lineTo(segX + frondLen + frondWave * 5, fy - 3);
                        seaweed.graphics.lineTo(segX + frondLen + frondWave * 5, fy + 3);
                        seaweed.graphics.fill();
                    }
                } else {
                    // Default style
                    seaweed.graphics.fillStyle(seaweed.color, 0.8);
                    seaweed.graphics.fillEllipse(segX, segY, width * (1 - segmentRatio * 0.4), segHeight);
                }
            }

            // Add bubbles from tall seaweed occasionally
            if (seaweed.type === 'kelp' && seaweed.segments > 8 && Math.random() < 0.001) {
                const bubbleX = seaweed.x + (Math.random() - 0.5) * 20;
                const bubbleY = baseY - seaweed.segments * segHeight * 0.7;
                this.createSeaweedBubble(bubbleX, bubbleY);
            }
        });

        // Animate sea anemones
        if (this.anemones) {
            this.anemones.forEach(anemone => {
                // Frustum culling
                if (!this.isInCameraView(anemone.x, anemone.y, 80)) {
                    anemone.graphics.setVisible(false);
                    return;
                }
                anemone.graphics.setVisible(true);
                anemone.graphics.clear();
                anemone.phase += 0.02;

                // Base/body
                anemone.graphics.fillStyle(anemone.colors.base, 0.9);
                anemone.graphics.fillEllipse(anemone.x, anemone.y, anemone.size * 1.2, anemone.size * 0.5);

                // Tentacles
                for (let t = 0; t < anemone.tentacles; t++) {
                    const angle = (t / anemone.tentacles) * Math.PI - Math.PI / 2;
                    const wave = Math.sin(anemone.phase + t * 0.4) * 8;
                    const tentacleLen = anemone.size * 1.5 + Math.sin(anemone.phase * 0.5 + t) * 5;

                    const baseX = anemone.x + Math.cos(angle) * anemone.size * 0.8;
                    const baseYPos = anemone.y - anemone.size * 0.2;
                    const tipX = baseX + wave;
                    const tipY = baseYPos - tentacleLen;

                    // Tentacle gradient
                    anemone.graphics.lineStyle(3, anemone.colors.base, 0.8);
                    anemone.graphics.lineBetween(baseX, baseYPos, (baseX + tipX) / 2, (baseYPos + tipY) / 2);
                    anemone.graphics.lineStyle(2, anemone.colors.tips, 0.9);
                    anemone.graphics.lineBetween((baseX + tipX) / 2, (baseYPos + tipY) / 2, tipX, tipY);

                    // Tentacle tip
                    anemone.graphics.fillStyle(anemone.colors.tips, 1);
                    anemone.graphics.fillCircle(tipX, tipY, 2.5);
                }

                // Center mouth
                anemone.graphics.fillStyle(0x442244, 0.6);
                anemone.graphics.fillCircle(anemone.x, anemone.y - anemone.size * 0.1, anemone.size * 0.3);
            });
        }

        // Bubbles are now handled by particle emitter (this.bubbleEmitter)

        // Animate caustic lights
        this.caustics.forEach(caustic => {
            // Frustum culling
            if (!this.isInCameraView(caustic.x, caustic.y, 100)) {
                caustic.graphics.setVisible(false);
                return;
            }
            caustic.graphics.setVisible(true);
            caustic.graphics.clear();
            const pulse = Math.sin(time * 0.001 * caustic.speed + caustic.phase);
            const alpha = 0.03 + pulse * 0.02;
            const size = caustic.size + pulse * 10;

            // Draw caustic pattern (overlapping circles)
            caustic.graphics.fillStyle(0xaaffff, alpha);
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 + time * 0.0003;
                const offsetX = Math.cos(angle) * size * 0.3;
                const offsetY = Math.sin(angle) * size * 0.2;
                caustic.graphics.fillEllipse(caustic.x + offsetX, caustic.y + offsetY, size * 0.6, size * 0.4);
            }
            caustic.graphics.fillStyle(0xffffff, alpha * 0.5);
            caustic.graphics.fillEllipse(caustic.x, caustic.y, size * 0.4, size * 0.3);
        });

        // Animate jellyfish
        this.jellyfish.forEach(jelly => {
            jelly.phase += delta * 0.001 * jelly.pulseSpeed;

            // Slow drift movement
            jelly.y -= jelly.driftSpeed * delta * 0.05;
            jelly.x += Math.sin(time * 0.0005 + jelly.phase) * 0.3;

            // Reset if goes off screen
            if (jelly.y < -50) {
                jelly.y = this.worldHeight + 50;
                jelly.x = Math.random() * this.worldWidth;
            }

            // Frustum culling
            if (!this.isInCameraView(jelly.x, jelly.y, 80)) {
                jelly.graphics.setVisible(false);
                return;
            }
            jelly.graphics.setVisible(true);
            jelly.graphics.clear();

            const pulse = Math.sin(jelly.phase) * 0.2;
            const bodyWidth = jelly.size * (1 + pulse * 0.3);
            const bodyHeight = jelly.size * 0.7 * (1 - pulse * 0.2);

            // Glow
            jelly.graphics.fillStyle(jelly.color, 0.15);
            jelly.graphics.fillEllipse(jelly.x, jelly.y, bodyWidth * 1.5, bodyHeight * 1.5);

            // Body (bell)
            jelly.graphics.fillStyle(jelly.color, 0.4);
            jelly.graphics.fillEllipse(jelly.x, jelly.y, bodyWidth, bodyHeight);

            // Inner body highlight
            jelly.graphics.fillStyle(0xffffff, 0.2);
            jelly.graphics.fillEllipse(jelly.x, jelly.y - bodyHeight * 0.2, bodyWidth * 0.6, bodyHeight * 0.4);

            // Tentacles
            jelly.graphics.lineStyle(1, jelly.color, 0.5);
            for (let t = 0; t < jelly.tentacles; t++) {
                const tentacleX = jelly.x + (t - (jelly.tentacles - 1) / 2) * (bodyWidth / jelly.tentacles);
                const wave1 = Math.sin(jelly.phase + t * 0.5) * 5;
                const wave2 = Math.sin(jelly.phase * 1.5 + t * 0.3) * 3;

                jelly.graphics.beginPath();
                jelly.graphics.moveTo(tentacleX, jelly.y + bodyHeight * 0.3);
                jelly.graphics.lineTo(tentacleX + wave1, jelly.y + bodyHeight * 0.3 + jelly.size * 0.5);
                jelly.graphics.lineTo(tentacleX + wave2, jelly.y + bodyHeight * 0.3 + jelly.size);
                jelly.graphics.stroke();
            }
        });

        // Animate school of fish
        if (this.schoolCenter) {
            // Move school center slowly
            if (Math.random() < 0.005) {
                this.schoolCenter.targetX = 200 + Math.random() * (this.worldWidth - 400);
                this.schoolCenter.targetY = 200 + Math.random() * (this.worldHeight - 400);
            }

            this.schoolCenter.x += (this.schoolCenter.targetX - this.schoolCenter.x) * 0.001 * delta;
            this.schoolCenter.y += (this.schoolCenter.targetY - this.schoolCenter.y) * 0.001 * delta;

            this.schoolFish.forEach(fish => {
                // Move towards school center with some randomness
                const dx = this.schoolCenter.x + (Math.random() - 0.5) * 100 - fish.sprite.x;
                const dy = this.schoolCenter.y + (Math.random() - 0.5) * 80 - fish.sprite.y;
                fish.sprite.x += dx * 0.002 * delta;
                fish.sprite.y += dy * 0.002 * delta;
                fish.phase += delta * 0.003;

                // Frustum culling
                if (!this.isInCameraView(fish.sprite.x, fish.sprite.y, 20)) {
                    fish.sprite.setVisible(false);
                    return;
                }
                fish.sprite.setVisible(true);

                // Add wave motion offset
                const waveY = Math.sin(fish.phase) * 2;
                fish.sprite.y += waveY * 0.1; // Subtle wave effect
            });
        }
    }

    createHUD() {
        // Fixed HUD container
        this.hudContainer = this.add.container(0, 0);
        this.hudContainer.setScrollFactor(0);
        this.hudContainer.setDepth(100);

        // Create status bars panel (top-left)
        this.createStatusBarsPanel();

        // Create DNA panel (bottom)
        this.createDNAPanel();

        // Create evolution button
        this.createEvolutionButton();

        this.updateHUD();
    }

    createStatusBarsPanel() {
        // Panel background with glass effect
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x000000, 0.6);
        panelBg.fillRoundedRect(10, 10, 220, 85, 12);
        panelBg.lineStyle(2, 0x4488aa, 0.4);
        panelBg.strokeRoundedRect(10, 10, 220, 85, 12);
        panelBg.setScrollFactor(0).setDepth(100);

        // Panel highlight
        const panelHighlight = this.add.graphics();
        panelHighlight.fillStyle(0xffffff, 0.05);
        panelHighlight.fillRoundedRect(12, 12, 216, 25, { tl: 10, tr: 10, bl: 0, br: 0 });
        panelHighlight.setScrollFactor(0).setDepth(100);

        // === HEALTH BAR ===
        // Heart icon with glow
        const heartGlow = this.add.graphics();
        heartGlow.fillStyle(0xff0000, 0.3);
        heartGlow.fillCircle(30, 35, 14);
        heartGlow.setScrollFactor(0).setDepth(100);
        this.heartGlow = heartGlow;

        this.add.text(30, 35, '❤️', { fontSize: '18px' }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // Health bar background
        this.healthBarBg = this.add.graphics();
        this.healthBarBg.fillStyle(0x1a1a2a, 1);
        this.healthBarBg.fillRoundedRect(50, 25, 165, 20, 6);
        this.healthBarBg.lineStyle(1, 0x333344, 1);
        this.healthBarBg.strokeRoundedRect(50, 25, 165, 20, 6);
        this.healthBarBg.setScrollFactor(0).setDepth(100);

        // Health bar fill
        this.healthBar = this.add.graphics();
        this.healthBar.setScrollFactor(0).setDepth(100);

        // Health bar shine
        this.healthBarShine = this.add.graphics();
        this.healthBarShine.setScrollFactor(0).setDepth(100);

        // Health text
        this.healthText = this.add.text(132, 35, '', {
            fontFamily: 'Arial',
            fontSize: '11px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // === HUNGER BAR ===
        // Meat icon with glow
        const hungerGlow = this.add.graphics();
        hungerGlow.fillStyle(0xff8800, 0.3);
        hungerGlow.fillCircle(30, 65, 14);
        hungerGlow.setScrollFactor(0).setDepth(100);
        this.hungerGlow = hungerGlow;

        this.add.text(30, 65, '🍖', { fontSize: '18px' }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // Hunger bar background
        this.hungerBarBg = this.add.graphics();
        this.hungerBarBg.fillStyle(0x1a1a2a, 1);
        this.hungerBarBg.fillRoundedRect(50, 55, 165, 20, 6);
        this.hungerBarBg.lineStyle(1, 0x333344, 1);
        this.hungerBarBg.strokeRoundedRect(50, 55, 165, 20, 6);
        this.hungerBarBg.setScrollFactor(0).setDepth(100);

        // Hunger bar fill
        this.hungerBar = this.add.graphics();
        this.hungerBar.setScrollFactor(0).setDepth(100);

        // Hunger bar shine
        this.hungerBarShine = this.add.graphics();
        this.hungerBarShine.setScrollFactor(0).setDepth(100);

        // Hunger text
        this.hungerText = this.add.text(132, 65, '', {
            fontFamily: 'Arial',
            fontSize: '11px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    }

    createDNAPanel() {
        // DNA panel background (bottom center)
        const dnaPanelBg = this.add.graphics();
        dnaPanelBg.fillStyle(0x000000, 0.6);
        dnaPanelBg.fillRoundedRect(200, 545, 400, 50, 12);
        dnaPanelBg.lineStyle(2, 0x6644aa, 0.4);
        dnaPanelBg.strokeRoundedRect(200, 545, 400, 50, 12);
        dnaPanelBg.setScrollFactor(0).setDepth(100);

        // DNA icon
        this.add.text(220, 570, '🧬', { fontSize: '20px' }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // DNA label
        this.add.text(250, 558, 'ADN', {
            fontFamily: 'Arial Black',
            fontSize: '10px',
            fill: '#8866cc'
        }).setScrollFactor(0).setDepth(100);

        // Individual DNA counters with styled boxes
        this.dnaCounters = {};
        const dnaTypes = [
            { key: 'speed', icon: '⚡', color: 0x00ff88, label: 'VEL' },
            { key: 'defense', icon: '🛡️', color: 0x4488ff, label: 'DEF' },
            { key: 'attack', icon: '🔥', color: 0xff4444, label: 'ATQ' },
            { key: 'energy', icon: '💙', color: 0xffaa00, label: 'ENE' }
        ];

        dnaTypes.forEach((dna, i) => {
            const xPos = 280 + i * 78;

            // Box background
            const box = this.add.graphics();
            box.fillStyle(0x1a1a2a, 0.9);
            box.fillRoundedRect(xPos - 30, 553, 70, 38, 8);
            box.lineStyle(1, dna.color, 0.5);
            box.strokeRoundedRect(xPos - 30, 553, 70, 38, 8);
            box.setScrollFactor(0).setDepth(100);

            // Glow effect
            const glow = this.add.graphics();
            glow.fillStyle(dna.color, 0.1);
            glow.fillRoundedRect(xPos - 28, 555, 66, 34, 6);
            glow.setScrollFactor(0).setDepth(100);

            // Icon
            this.add.text(xPos - 18, 565, dna.icon, { fontSize: '14px' }).setScrollFactor(0).setDepth(100);

            // Value
            const valueText = this.add.text(xPos + 18, 572, '0', {
                fontFamily: 'Arial Black',
                fontSize: '16px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

            this.dnaCounters[dna.key] = {
                text: valueText,
                glow: glow,
                color: dna.color
            };
        });
    }

    createEvolutionButton() {
        // Evolution button container
        this.evolveButton = this.add.container(700, 570);
        this.evolveButton.setScrollFactor(0).setDepth(100);
        this.evolveButton.setVisible(false);

        // Button glow
        const evoGlow = this.add.graphics();
        evoGlow.fillStyle(0x00ff88, 0.3);
        evoGlow.fillRoundedRect(-55, -22, 110, 44, 10);
        this.evolveButton.add(evoGlow);
        this.evoGlow = evoGlow;

        // Button background
        const evoBg = this.add.graphics();
        evoBg.fillStyle(0x005522, 1);
        evoBg.fillRoundedRect(-50, -18, 100, 36, 8);
        evoBg.lineStyle(2, 0x00ff66, 0.8);
        evoBg.strokeRoundedRect(-50, -18, 100, 36, 8);
        this.evolveButton.add(evoBg);

        // Button highlight
        const evoHighlight = this.add.graphics();
        evoHighlight.fillStyle(0x00ff88, 0.2);
        evoHighlight.fillRoundedRect(-46, -15, 92, 14, 5);
        this.evolveButton.add(evoHighlight);

        // Button text
        const evoText = this.add.text(0, 0, '[E] EVOLUCIONAR', {
            fontFamily: 'Arial',
            fontSize: '11px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.evolveButton.add(evoText);

        // DNA icon on button
        this.add.text(-42, 0, '🧬', { fontSize: '12px' }).setOrigin(0.5);

        // Pulse animation for glow
        this.tweens.add({
            targets: evoGlow,
            alpha: 0.6,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        // Remove old evolve text
        this.evolveText = { setText: () => {} }; // Dummy to avoid errors
    }

    updateHUD() {
        const stats = this.player.stats;
        const dna = this.player.dna;
        const healthPercent = stats.health / stats.maxHealth;
        const hungerPercent = stats.hunger / stats.maxHunger;

        // Glow pulsing always runs (cheap operations)
        if (healthPercent <= 0.25) {
            this.heartGlow.setAlpha(0.5 + Math.sin(Date.now() * 0.01) * 0.3);
        } else {
            this.heartGlow.setAlpha(0.3);
        }
        if (hungerPercent <= 0.3) {
            this.hungerGlow.setAlpha(0.5 + Math.sin(Date.now() * 0.008) * 0.3);
        } else {
            this.hungerGlow.setAlpha(0.3);
        }

        // Skip expensive redraws if not dirty
        if (!this.hudDirty) return;
        this.hudDirty = false;

        // === HEALTH BAR ===
        this.healthBar.clear();
        this.healthBarShine.clear();
        const healthWidth = 161 * healthPercent;

        // Health bar gradient colors based on percentage
        let healthColor1, healthColor2;
        if (healthPercent > 0.5) {
            healthColor1 = 0x00ff44;
            healthColor2 = 0x00aa22;
        } else if (healthPercent > 0.25) {
            healthColor1 = 0xffcc00;
            healthColor2 = 0xcc8800;
        } else {
            healthColor1 = 0xff4444;
            healthColor2 = 0xaa0000;
        }

        // Draw health bar with gradient effect
        if (healthWidth > 4) {
            this.healthBar.fillStyle(healthColor2, 1);
            this.healthBar.fillRoundedRect(52, 27, healthWidth, 16, 4);
            this.healthBar.fillStyle(healthColor1, 1);
            this.healthBar.fillRoundedRect(52, 27, healthWidth, 10, { tl: 4, tr: 4, bl: 0, br: 0 });

            // Shine effect
            this.healthBarShine.fillStyle(0xffffff, 0.3);
            this.healthBarShine.fillRoundedRect(54, 28, Math.max(0, healthWidth - 8), 4, 2);
        }

        // Health text with current/max
        this.healthText.setText(`${Math.floor(stats.health)}/${stats.maxHealth}`);

        // === HUNGER BAR ===
        this.hungerBar.clear();
        this.hungerBarShine.clear();
        const hungerWidth = 161 * hungerPercent;

        // Hunger bar colors
        let hungerColor1, hungerColor2;
        if (hungerPercent > 0.3) {
            hungerColor1 = 0xffaa00;
            hungerColor2 = 0xcc7700;
        } else {
            hungerColor1 = 0xff5544;
            hungerColor2 = 0xaa2211;
        }

        // Draw hunger bar with gradient effect
        if (hungerWidth > 4) {
            this.hungerBar.fillStyle(hungerColor2, 1);
            this.hungerBar.fillRoundedRect(52, 57, hungerWidth, 16, 4);
            this.hungerBar.fillStyle(hungerColor1, 1);
            this.hungerBar.fillRoundedRect(52, 57, hungerWidth, 10, { tl: 4, tr: 4, bl: 0, br: 0 });

            // Shine effect
            this.hungerBarShine.fillStyle(0xffffff, 0.3);
            this.hungerBarShine.fillRoundedRect(54, 58, Math.max(0, hungerWidth - 8), 4, 2);
        }

        // Hunger text
        this.hungerText.setText(`${Math.floor(stats.hunger)}/${stats.maxHunger}`);

        // === DNA COUNTERS ===
        const dnaKeys = ['speed', 'defense', 'attack', 'energy'];
        dnaKeys.forEach(key => {
            const counter = this.dnaCounters[key];
            const value = dna[key];
            const oldValue = parseInt(counter.text.text) || 0;

            counter.text.setText(value.toString());

            // Pulse glow when value increases
            if (value > oldValue && this.scene.isActive()) {
                counter.glow.setAlpha(0.5);
                this.tweens.add({
                    targets: counter.glow,
                    alpha: 0.1,
                    duration: 500
                });

                // Scale pop effect on text
                counter.text.setScale(1.3);
                this.tweens.add({
                    targets: counter.text,
                    scale: 1,
                    duration: 200,
                    ease: 'Back.out'
                });
            }
        });

        // === EVOLUTION BUTTON ===
        const available = getAvailableEvolutions(dna, this.player.evolutions);
        if (available.length > 0) {
            this.canEvolve = true;
            this.evolveButton.setVisible(true);
        } else {
            this.canEvolve = false;
            this.evolveButton.setVisible(false);
        }
    }

    updateHunger() {
        const stats = this.player.stats;
        stats.hunger -= 2;

        if (stats.hunger < 0) stats.hunger = 0;
        this.hudDirty = true;

        // Damage from starvation
        if (stats.hunger === 0) {
            this.player.takeDamage(5);
        }

        // Check for death
        if (this.player.isDead()) {
            this.gameOver();
        }
    }

    spawnEnemy() {
        // Limit max enemies
        if (this.enemies.length >= 30) return;

        // Choose random type based on weights
        const totalWeight = Object.values(ENEMY_TYPES).reduce((sum, t) => sum + t.spawnWeight, 0);
        let random = Math.random() * totalWeight;
        let selectedType = 'COMMON';

        for (const [type, config] of Object.entries(ENEMY_TYPES)) {
            random -= config.spawnWeight;
            if (random <= 0) {
                selectedType = type;
                break;
            }
        }

        // Spawn at edge of world
        let x, y;
        const side = Math.floor(Math.random() * 4);

        switch (side) {
            case 0: // Top
                x = Math.random() * this.worldWidth;
                y = 50;
                break;
            case 1: // Right
                x = this.worldWidth - 50;
                y = Math.random() * this.worldHeight;
                break;
            case 2: // Bottom
                x = Math.random() * this.worldWidth;
                y = this.worldHeight - 50;
                break;
            case 3: // Left
                x = 50;
                y = Math.random() * this.worldHeight;
                break;
        }

        const enemy = new Enemy(this, x, y, selectedType);
        enemy.body.setCollideWorldBounds(true);
        this.enemies.push(enemy);
    }

    createSeaweedBubble(x, y) {
        // Small decorative bubble from seaweed
        const bubble = this.add.graphics();
        const size = 2 + Math.random() * 3;

        bubble.fillStyle(0xffffff, 0.4);
        bubble.fillCircle(0, 0, size);
        bubble.fillStyle(0xffffff, 0.6);
        bubble.fillCircle(-size * 0.3, -size * 0.3, size * 0.3);
        bubble.x = x;
        bubble.y = y;

        // Animate bubble rising
        this.tweens.add({
            targets: bubble,
            y: y - 100 - Math.random() * 50,
            x: x + (Math.random() - 0.5) * 30,
            alpha: 0,
            duration: 2000 + Math.random() * 1000,
            ease: 'Sine.out',
            onComplete: () => bubble.destroy()
        });
    }

    handleAttack() {
        const killed = this.player.attack(this.enemies);

        // Attack wave effect
        if (killed.length > 0 || this.player.stats.areaDamage) {
            this.createAttackWave(this.player.x, this.player.y, this.player.stats.attackRange);
        }

        killed.forEach(enemy => {
            const reward = enemy.getReward();

            // Create eat particles
            this.createEatParticles(enemy.x, enemy.y, reward.dnaType);

            // Collect DNA
            this.player.collectDNA(reward.dnaType, reward.dnaAmount);

            // Restore hunger
            this.player.feed(reward.hungerRestore);

            // Show floating text
            this.showFloatingText(enemy.x, enemy.y - 20, `+${reward.dnaAmount} ADN`, '#00ff00');

            // Remove enemy
            const index = this.enemies.indexOf(enemy);
            if (index > -1) {
                this.enemies.splice(index, 1);
            }
            enemy.destroy();
        });

        this.updateHUD();
    }

    showFloatingText(x, y, text, color) {
        const floatText = this.add.text(x, y, text, {
            fontSize: '14px',
            fill: color,
            stroke: '#000000',
            strokeThickness: 2
        });

        this.tweens.add({
            targets: floatText,
            y: y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => floatText.destroy()
        });
    }

    createEatParticles(x, y, dnaType) {
        // DNA type colors with secondary colors
        const colorSchemes = {
            speed: { primary: 0x00ffff, secondary: 0x00ff88, glow: 0x88ffff },
            defense: { primary: 0x4488ff, secondary: 0x6699ff, glow: 0xaaccff },
            attack: { primary: 0xff4444, secondary: 0xff8844, glow: 0xffaaaa },
            energy: { primary: 0xffff00, secondary: 0xffaa00, glow: 0xffffaa },
            random: { primary: 0xff00ff, secondary: 0xaa00ff, glow: 0xffaaff }
        };
        const scheme = colorSchemes[dnaType] || colorSchemes.speed;

        // Outer glow ring
        const glowRing = this.add.graphics();
        glowRing.fillStyle(scheme.glow, 0.3);
        glowRing.fillCircle(0, 0, 30);
        glowRing.x = x;
        glowRing.y = y;

        this.tweens.add({
            targets: glowRing,
            scale: 3,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => glowRing.destroy()
        });

        // DNA helix particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = this.add.graphics();

            // Helix-like shape
            particle.fillStyle(scheme.primary, 1);
            particle.fillCircle(0, 0, 4);
            particle.fillStyle(scheme.secondary, 1);
            particle.fillCircle(3, 0, 3);
            particle.x = x;
            particle.y = y;

            const dist = 60 + Math.random() * 40;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                rotation: Math.PI * 2,
                alpha: 0,
                scale: 0.2,
                duration: 500 + Math.random() * 200,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Sparkle burst
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 70;
            const size = 1 + Math.random() * 3;

            const sparkle = this.add.graphics();
            sparkle.fillStyle(0xffffff, 0.9);
            sparkle.fillCircle(0, 0, size);
            sparkle.x = x;
            sparkle.y = y;

            this.tweens.add({
                targets: sparkle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 300 + Math.random() * 300,
                onComplete: () => sparkle.destroy()
            });
        }

        // Central flash with multiple layers
        const flash = this.add.graphics();
        flash.fillStyle(0xffffff, 1);
        flash.fillCircle(0, 0, 8);
        flash.fillStyle(scheme.primary, 0.8);
        flash.fillCircle(0, 0, 15);
        flash.x = x;
        flash.y = y;

        this.tweens.add({
            targets: flash,
            scale: 2.5,
            alpha: 0,
            duration: 250,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });

        // Screen shake for feedback
        this.cameras.main.shake(100, 0.003);
    }

    createDamageParticles(x, y) {
        // Blood/damage splash
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 60;
            const size = 2 + Math.random() * 4;

            const particle = this.add.graphics();
            // Gradient from red to dark red
            const shade = Math.random() > 0.5 ? 0xff0000 : 0xcc0000;
            particle.fillStyle(shade, 1);
            particle.fillCircle(0, 0, size);
            particle.x = x;
            particle.y = y;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed + 30, // Gravity-like drift
                alpha: 0,
                scale: 0.5,
                duration: 400 + Math.random() * 300,
                ease: 'Power1',
                onComplete: () => particle.destroy()
            });
        }

        // Impact flash
        const impact = this.add.graphics();
        impact.fillStyle(0xff0000, 0.4);
        impact.fillCircle(0, 0, 20);
        impact.fillStyle(0xffffff, 0.6);
        impact.fillCircle(0, 0, 8);
        impact.x = x;
        impact.y = y;

        this.tweens.add({
            targets: impact,
            scale: 1.5,
            alpha: 0,
            duration: 150,
            onComplete: () => impact.destroy()
        });

        // Screen shake for damage feedback
        this.cameras.main.shake(150, 0.008);

        // Red flash overlay (brief)
        const redFlash = this.add.graphics();
        redFlash.fillStyle(0xff0000, 0.15);
        redFlash.fillRect(0, 0, 800, 600);
        redFlash.setScrollFactor(0);
        redFlash.setDepth(99);

        this.tweens.add({
            targets: redFlash,
            alpha: 0,
            duration: 200,
            onComplete: () => redFlash.destroy()
        });
    }

    createAttackWave(x, y, radius) {
        // Multiple expanding rings
        for (let i = 0; i < 3; i++) {
            const wave = this.add.graphics();
            wave.lineStyle(4 - i, 0xffffff, 0.7 - i * 0.2);
            wave.strokeCircle(0, 0, 10);
            wave.x = x;
            wave.y = y;

            this.tweens.add({
                targets: wave,
                scale: radius / 10,
                alpha: 0,
                duration: 300 + i * 50,
                delay: i * 30,
                ease: 'Power2',
                onComplete: () => wave.destroy()
            });
        }

        // Inner energy burst
        const burst = this.add.graphics();
        burst.fillStyle(0xffffff, 0.4);
        burst.fillCircle(0, 0, 15);
        burst.x = x;
        burst.y = y;

        this.tweens.add({
            targets: burst,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => burst.destroy()
        });

        // Radial lines effect
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const line = this.add.graphics();
            line.lineStyle(2, 0xffffff, 0.6);
            line.lineBetween(0, 0, Math.cos(angle) * 30, Math.sin(angle) * 30);
            line.x = x;
            line.y = y;

            this.tweens.add({
                targets: line,
                scale: radius / 30,
                alpha: 0,
                duration: 250,
                onComplete: () => line.destroy()
            });
        }
    }

    update(time, delta) {
        // Update background animations
        this.updateBackgroundAnimations(time, delta);

        // Update player
        this.player.update(time, delta);

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(time, delta, this.player);
        });

        // Update HUD
        this.updateHUD();

        // Check for death
        if (this.player.isDead()) {
            this.gameOver();
        }

        // Evolution menu
        if (this.canEvolve && Phaser.Input.Keyboard.JustDown(this.evolutionKey)) {
            this.openEvolutionMenu();
        }
    }

    openEvolutionMenu() {
        this.scene.pause();
        this.scene.launch('EvolutionScene', {
            player: this.player,
            gameScene: this
        });
    }

    gameOver() {
        this.hungerTimer.remove();
        this.spawnTimer.remove();
        this.scene.start('GameOverScene', {
            dna: { ...this.player.dna },
            evolutions: [...this.player.evolutions]
        });
    }
}
