import Phaser from 'phaser';
import { EVOLUTIONS } from '../config/evolutions.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalDNA = data.dna || { speed: 0, defense: 0, attack: 0, energy: 0 };
        this.finalEvolutions = data.evolutions || [];
        this.finalScore = data.score || { total: 0, enemies: 0, dna: 0, evolutions: 0, biomes: 0, survival: 0 };
        this.survivalTime = data.survivalTime || 0;
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Create animated dark background
        this.createBackground();

        // Create falling particles (debris/bubbles)
        this.createFallingParticles();

        // Create dramatic game over title with animation
        this.createGameOverTitle(centerX);

        // Create animated dead fish
        this.createDeadFish(centerX, 170);

        // Create stats panel with animations (score breakdown)
        this.createStatsPanel(centerX, 330);

        // Create evolution achievements
        this.createEvolutionAchievements(centerX, 460);

        // Create animated buttons
        this.createButtons(centerX);

        // Play dramatic entrance animations
        this.playEntranceAnimations();
    }

    createBackground() {
        const bg = this.add.graphics();

        // Dark gradient with red tint
        for (let y = 0; y < 600; y += 4) {
            const ratio = y / 600;
            const r = Math.floor(20 + ratio * 15);
            const g = Math.floor(10 + ratio * 10);
            const b = Math.floor(25 + ratio * 20);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, 800, 4);
        }

        // Vignette effect
        const vignette = this.add.graphics();
        for (let i = 0; i < 10; i++) {
            const alpha = 0.08 * (10 - i) / 10;
            vignette.fillStyle(0x000000, alpha);
            vignette.fillRect(0, 0, 800, 50 - i * 5);
            vignette.fillRect(0, 550 + i * 5, 800, 50 - i * 5);
            vignette.fillRect(0, 0, 50 - i * 5, 600);
            vignette.fillRect(750 + i * 5, 0, 50 - i * 5, 600);
        }

        // Red glow at top (danger zone)
        const dangerGlow = this.add.graphics();
        dangerGlow.fillStyle(0xff0000, 0.08);
        dangerGlow.fillEllipse(400, -50, 900, 300);

        // Animate danger glow
        this.tweens.add({
            targets: dangerGlow,
            alpha: 0.3,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Dark seaweed silhouettes at bottom
        for (let i = 0; i < 12; i++) {
            const seaweed = this.add.graphics();
            seaweed.fillStyle(0x0a0a15, 0.8);

            const x = 30 + i * 65 + Math.random() * 20;
            const height = 60 + Math.random() * 40;

            for (let j = 0; j < 5; j++) {
                seaweed.fillEllipse(0, -j * 18, 8, 24);
            }

            seaweed.x = x;
            seaweed.y = 600;

            // Slow sad sway
            this.tweens.add({
                targets: seaweed,
                rotation: 0.1,
                duration: 2500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createFallingParticles() {
        this.particles = [];

        // Create falling debris/bubbles
        for (let i = 0; i < 25; i++) {
            const particle = this.add.graphics();
            const size = 1 + Math.random() * 3;
            const isRed = Math.random() > 0.7;

            particle.fillStyle(isRed ? 0xff4444 : 0x445566, 0.3 + Math.random() * 0.3);
            particle.fillCircle(0, 0, size);

            if (!isRed) {
                particle.fillStyle(0xffffff, 0.4);
                particle.fillCircle(-size * 0.3, -size * 0.3, size * 0.3);
            }

            particle.x = Math.random() * 800;
            particle.y = -20 - Math.random() * 200;
            particle.fallSpeed = 20 + Math.random() * 40;
            particle.wobbleSpeed = 1 + Math.random() * 2;
            particle.wobblePhase = Math.random() * Math.PI * 2;

            this.particles.push(particle);
        }
    }

    createGameOverTitle(centerX) {
        // Glowing background for title
        this.titleGlow = this.add.graphics();
        this.titleGlow.fillStyle(0xff0000, 0.15);
        this.titleGlow.fillEllipse(centerX, 80, 450, 100);
        this.titleGlow.alpha = 0;

        // Shadow text
        this.add.text(centerX + 4, 84, 'GAME OVER', {
            fontFamily: 'Arial Black',
            fontSize: '60px',
            fill: '#000000'
        }).setOrigin(0.5).setAlpha(0.5);

        // Main title
        this.titleText = this.add.text(centerX, 80, 'GAME OVER', {
            fontFamily: 'Arial Black',
            fontSize: '60px',
            fill: '#ff3333',
            stroke: '#880000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.titleText.alpha = 0;
        this.titleText.y = 40;

        // Skull icons
        this.leftSkull = this.add.text(centerX - 200, 80, '💀', { fontSize: '36px' }).setOrigin(0.5);
        this.rightSkull = this.add.text(centerX + 200, 80, '💀', { fontSize: '36px' }).setOrigin(0.5);
        this.leftSkull.alpha = 0;
        this.rightSkull.alpha = 0;
    }

    createDeadFish(centerX, y) {
        this.deadFishContainer = this.add.container(centerX, y);
        this.deadFishContainer.alpha = 0;

        // Shadow below fish
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.3);
        shadow.fillEllipse(5, 35, 60, 15);
        this.deadFishContainer.add(shadow);

        // Fish body (grey, desaturated)
        const body = this.add.graphics();
        body.fillStyle(0x556666, 1);
        body.fillEllipse(0, 0, 55, 35);

        // Tail
        body.fillStyle(0x445555, 1);
        body.fillTriangle(-28, 0, -48, -18, -48, 18);

        // Dorsal fin (droopy)
        body.fillStyle(0x445555, 1);
        body.fillTriangle(-5, -18, 10, -18, 5, -30);

        // Belly
        body.fillStyle(0x667777, 0.7);
        body.fillEllipse(0, 8, 35, 14);

        this.deadFishContainer.add(body);

        // X eyes
        const eyeWhite = this.add.graphics();
        eyeWhite.fillStyle(0xcccccc, 1);
        eyeWhite.fillEllipse(12, -5, 16, 12);
        this.deadFishContainer.add(eyeWhite);

        const xEye = this.add.text(12, -5, '✕', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            fill: '#333333'
        }).setOrigin(0.5);
        this.deadFishContainer.add(xEye);

        // Sad mouth
        const mouth = this.add.graphics();
        mouth.lineStyle(2, 0x334444, 1);
        mouth.beginPath();
        mouth.arc(22, 10, 6, 3.5, 5.9);
        mouth.stroke();
        this.deadFishContainer.add(mouth);

        // Bubbles coming out (last breath)
        for (let i = 0; i < 3; i++) {
            const bubble = this.add.graphics();
            bubble.fillStyle(0xaaddff, 0.4);
            const size = 3 + i * 2;
            bubble.fillCircle(0, 0, size);
            bubble.fillStyle(0xffffff, 0.5);
            bubble.fillCircle(-size * 0.3, -size * 0.3, size * 0.3);
            bubble.x = 30 + i * 5;
            bubble.y = 5 - i * 15;
            this.deadFishContainer.add(bubble);

            // Animate bubbles rising
            this.tweens.add({
                targets: bubble,
                y: bubble.y - 50,
                alpha: 0,
                duration: 2000 + i * 500,
                delay: i * 300,
                repeat: -1,
                onRepeat: () => {
                    bubble.y = 5 - i * 15;
                    bubble.alpha = 0.4;
                }
            });
        }

        // Fish is upside down and tilted
        this.deadFishContainer.rotation = Math.PI + 0.2;
    }

    createStatsPanel(centerX, y) {
        this.statsPanel = this.add.container(centerX, y);
        this.statsPanel.alpha = 0;

        // Panel background - larger for score breakdown
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x000000, 0.6);
        panelBg.fillRoundedRect(-220, -80, 440, 180, 15);
        panelBg.lineStyle(2, 0xffd700, 0.5);
        panelBg.strokeRoundedRect(-220, -80, 440, 180, 15);
        this.statsPanel.add(panelBg);

        // Main score title with trophy
        const scoreTitle = this.add.text(0, -60, '🏆 PUNTAJE FINAL', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            fill: '#ffd700'
        }).setOrigin(0.5);
        this.statsPanel.add(scoreTitle);

        // Big score number
        const scoreValue = this.add.text(0, -25, this.finalScore.total.toLocaleString(), {
            fontFamily: 'Arial Black',
            fontSize: '36px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.statsPanel.add(scoreValue);

        // Score breakdown
        const breakdown = [
            { label: 'Enemigos', value: this.finalScore.enemies, icon: '🐟' },
            { label: 'ADN', value: this.finalScore.dna, icon: '🧬' },
            { label: 'Evoluciones', value: this.finalScore.evolutions, icon: '⬆️' },
            { label: 'Biomas', value: this.finalScore.biomes, icon: '🌊' },
            { label: 'Tiempo', value: this.finalScore.survival, icon: '⏱️' }
        ];

        breakdown.forEach((stat, i) => {
            const xPos = -170 + i * 85;

            // Background box
            const box = this.add.graphics();
            box.fillStyle(0x1a1a2a, 0.9);
            box.fillRoundedRect(xPos - 35, 15, 70, 55, 8);
            box.lineStyle(1, 0x3a3a4a, 0.5);
            box.strokeRoundedRect(xPos - 35, 15, 70, 55, 8);
            this.statsPanel.add(box);

            // Icon
            const icon = this.add.text(xPos, 28, stat.icon, { fontSize: '14px' }).setOrigin(0.5);
            this.statsPanel.add(icon);

            // Value
            const value = this.add.text(xPos, 45, stat.value.toLocaleString(), {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff'
            }).setOrigin(0.5);
            this.statsPanel.add(value);

            // Label
            const label = this.add.text(xPos, 62, stat.label, {
                fontSize: '9px',
                fill: '#888899'
            }).setOrigin(0.5);
            this.statsPanel.add(label);
        });

        // Survival time display
        const minutes = Math.floor(this.survivalTime / 60);
        const seconds = this.survivalTime % 60;
        const timeStr = `Tiempo: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        const timeText = this.add.text(0, 85, timeStr, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#88aacc'
        }).setOrigin(0.5);
        this.statsPanel.add(timeText);
    }

    createEvolutionAchievements(centerX, y) {
        this.evolutionPanel = this.add.container(centerX, y);
        this.evolutionPanel.alpha = 0;

        if (this.finalEvolutions.length > 0) {
            // Title
            const title = this.add.text(0, -25, `🧬 Evoluciones Logradas: ${this.finalEvolutions.length}`, {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#00ff88'
            }).setOrigin(0.5);
            this.evolutionPanel.add(title);

            // Evolution badges
            const startX = -(this.finalEvolutions.length - 1) * 50;
            this.finalEvolutions.forEach((evoId, i) => {
                const evo = Object.values(EVOLUTIONS).find(e => e.id === evoId);
                if (evo) {
                    const badge = this.add.container(startX + i * 100, 15);

                    // Badge background with glow
                    const glow = this.add.graphics();
                    glow.fillStyle(evo.color || 0x00ff88, 0.2);
                    glow.fillCircle(0, 0, 35);
                    badge.add(glow);

                    const bg = this.add.graphics();
                    bg.fillStyle(0x223322, 0.9);
                    bg.fillCircle(0, 0, 28);
                    bg.lineStyle(2, evo.color || 0x00ff88, 0.8);
                    bg.strokeCircle(0, 0, 28);
                    badge.add(bg);

                    // Evolution icon (fish shape with evolution color)
                    const fishIcon = this.add.graphics();
                    fishIcon.fillStyle(evo.color || 0x00ff88, 1);
                    fishIcon.fillEllipse(0, 0, 20, 12);
                    fishIcon.fillTriangle(-10, 0, -18, -6, -18, 6);
                    badge.add(fishIcon);

                    // Name below
                    const name = this.add.text(0, 40, evo.name, {
                        fontSize: '11px',
                        fill: '#88ffaa'
                    }).setOrigin(0.5);
                    badge.add(name);

                    // Pulse animation
                    this.tweens.add({
                        targets: glow,
                        alpha: 0.5,
                        duration: 1000 + i * 200,
                        yoyo: true,
                        repeat: -1
                    });

                    this.evolutionPanel.add(badge);
                }
            });
        } else {
            // No evolutions message
            const noEvo = this.add.text(0, 0, '🧬 Sin evoluciones esta partida', {
                fontFamily: 'Arial',
                fontSize: '16px',
                fill: '#666666'
            }).setOrigin(0.5);
            this.evolutionPanel.add(noEvo);

            // Encouragement
            const tip = this.add.text(0, 25, '¡Recolecta más ADN para evolucionar!', {
                fontSize: '12px',
                fill: '#555555',
                fontStyle: 'italic'
            }).setOrigin(0.5);
            this.evolutionPanel.add(tip);
        }
    }

    createButtons(centerX) {
        // Play Again button
        this.playButton = this.add.container(centerX, 510);
        this.playButton.alpha = 0;

        // Button glow
        const playGlow = this.add.graphics();
        playGlow.fillStyle(0x00ff44, 0.25);
        playGlow.fillRoundedRect(-135, -38, 270, 76, 20);
        this.playButton.add(playGlow);

        // Button shadow
        const playShadow = this.add.graphics();
        playShadow.fillStyle(0x005522, 1);
        playShadow.fillRoundedRect(-118, -23, 236, 52, 14);
        this.playButton.add(playShadow);

        // Button background
        const playBg = this.add.graphics();
        playBg.fillStyle(0x00aa44, 1);
        playBg.fillRoundedRect(-120, -26, 240, 52, 14);
        playBg.lineStyle(2, 0x00ff66, 0.8);
        playBg.strokeRoundedRect(-120, -26, 240, 52, 14);
        this.playButton.add(playBg);

        // Highlight
        const playHighlight = this.add.graphics();
        playHighlight.fillStyle(0x44ff88, 0.35);
        playHighlight.fillRoundedRect(-110, -22, 220, 18, 9);
        this.playButton.add(playHighlight);

        // Button text
        const playText = this.add.text(0, 0, '🔄 JUGAR DE NUEVO', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            fill: '#ffffff',
            stroke: '#006622',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.playButton.add(playText);

        // Make interactive
        this.playButton.setInteractive(new Phaser.Geom.Rectangle(-120, -26, 240, 52), Phaser.Geom.Rectangle.Contains);

        this.playButton.on('pointerover', () => {
            this.tweens.add({
                targets: this.playButton,
                scale: 1.08,
                duration: 150,
                ease: 'Back.out'
            });
            playBg.clear();
            playBg.fillStyle(0x00cc55, 1);
            playBg.fillRoundedRect(-120, -26, 240, 52, 14);
            playBg.lineStyle(2, 0x66ff88, 1);
            playBg.strokeRoundedRect(-120, -26, 240, 52, 14);
        });

        this.playButton.on('pointerout', () => {
            this.tweens.add({
                targets: this.playButton,
                scale: 1,
                duration: 150
            });
            playBg.clear();
            playBg.fillStyle(0x00aa44, 1);
            playBg.fillRoundedRect(-120, -26, 240, 52, 14);
            playBg.lineStyle(2, 0x00ff66, 0.8);
            playBg.strokeRoundedRect(-120, -26, 240, 52, 14);
        });

        this.playButton.on('pointerdown', () => {
            this.tweens.add({
                targets: this.playButton,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    this.cameras.main.fade(400, 0, 0, 0);
                    this.time.delayedCall(400, () => {
                        this.scene.start('GameScene');
                    });
                }
            });
        });

        // Pulse glow animation
        this.tweens.add({
            targets: playGlow,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Menu button
        this.menuButton = this.add.container(centerX, 565);
        this.menuButton.alpha = 0;

        const menuBg = this.add.graphics();
        menuBg.fillStyle(0x333355, 0.9);
        menuBg.fillRoundedRect(-85, -18, 170, 36, 8);
        menuBg.lineStyle(1, 0x5555aa, 0.5);
        menuBg.strokeRoundedRect(-85, -18, 170, 36, 8);
        this.menuButton.add(menuBg);

        const menuText = this.add.text(0, 0, '🏠 Menú Principal', {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#aaaacc'
        }).setOrigin(0.5);
        this.menuButton.add(menuText);

        this.menuButton.setInteractive(new Phaser.Geom.Rectangle(-85, -18, 170, 36), Phaser.Geom.Rectangle.Contains);

        this.menuButton.on('pointerover', () => {
            this.tweens.add({
                targets: this.menuButton,
                scale: 1.05,
                duration: 100
            });
            menuBg.clear();
            menuBg.fillStyle(0x444477, 0.9);
            menuBg.fillRoundedRect(-85, -18, 170, 36, 8);
            menuBg.lineStyle(1, 0x7777cc, 0.7);
            menuBg.strokeRoundedRect(-85, -18, 170, 36, 8);
        });

        this.menuButton.on('pointerout', () => {
            this.tweens.add({
                targets: this.menuButton,
                scale: 1,
                duration: 100
            });
            menuBg.clear();
            menuBg.fillStyle(0x333355, 0.9);
            menuBg.fillRoundedRect(-85, -18, 170, 36, 8);
            menuBg.lineStyle(1, 0x5555aa, 0.5);
            menuBg.strokeRoundedRect(-85, -18, 170, 36, 8);
        });

        this.menuButton.on('pointerdown', () => {
            this.cameras.main.fade(400, 0, 0, 0);
            this.time.delayedCall(400, () => {
                this.scene.start('MenuScene');
            });
        });
    }

    playEntranceAnimations() {
        // Title drops down
        this.tweens.add({
            targets: this.titleText,
            y: 80,
            alpha: 1,
            duration: 600,
            ease: 'Bounce.out'
        });

        this.tweens.add({
            targets: this.titleGlow,
            alpha: 1,
            duration: 800
        });

        // Skulls fade in from sides
        this.tweens.add({
            targets: this.leftSkull,
            alpha: 1,
            x: this.leftSkull.x + 20,
            duration: 500,
            delay: 300
        });

        this.tweens.add({
            targets: this.rightSkull,
            alpha: 1,
            x: this.rightSkull.x - 20,
            duration: 500,
            delay: 300
        });

        // Dead fish falls and settles
        this.deadFishContainer.y = -50;
        this.tweens.add({
            targets: this.deadFishContainer,
            y: 170,
            alpha: 1,
            duration: 800,
            delay: 400,
            ease: 'Bounce.out'
        });

        // Gentle floating after settling
        this.time.delayedCall(1200, () => {
            this.tweens.add({
                targets: this.deadFishContainer,
                y: 165,
                rotation: Math.PI + 0.15,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Stats panel slides in
        this.statsPanel.y = 390;
        this.tweens.add({
            targets: this.statsPanel,
            y: 330,
            alpha: 1,
            duration: 500,
            delay: 800,
            ease: 'Back.out'
        });

        // Evolution panel fades in
        this.tweens.add({
            targets: this.evolutionPanel,
            alpha: 1,
            duration: 500,
            delay: 1000
        });

        // Buttons slide up
        this.playButton.y = 560;
        this.tweens.add({
            targets: this.playButton,
            y: 510,
            alpha: 1,
            duration: 400,
            delay: 1200,
            ease: 'Back.out'
        });

        this.menuButton.y = 610;
        this.tweens.add({
            targets: this.menuButton,
            y: 565,
            alpha: 1,
            duration: 400,
            delay: 1350,
            ease: 'Back.out'
        });
    }

    update(time, delta) {
        // Animate falling particles
        if (this.particles) {
            this.particles.forEach(particle => {
                particle.y += particle.fallSpeed * delta * 0.001;
                particle.x += Math.sin(time * 0.001 * particle.wobbleSpeed + particle.wobblePhase) * 0.3;

                if (particle.y > 620) {
                    particle.y = -20;
                    particle.x = Math.random() * 800;
                }
            });
        }
    }
}
