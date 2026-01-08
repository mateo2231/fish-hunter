import Phaser from 'phaser';
import { getAvailableEvolutions } from '../config/evolutions.js';

export class EvolutionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EvolutionScene' });
    }

    init(data) {
        this.player = data.player;
        this.gameScene = data.gameScene;
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Animated background
        this.createBackground();

        // Floating DNA particles
        this.createDNAParticles();

        // Title with glow
        this.createTitle(centerX);

        // DNA status bar
        this.createDNABar(centerX);

        // Get available evolutions
        const available = getAvailableEvolutions(this.player.dna, this.player.evolutions);

        if (available.length === 0) {
            this.createNoEvolutionsMessage(centerX, centerY);
        } else {
            // Create evolution cards with staggered animation
            const cardWidth = 185;
            const startX = centerX - ((available.length - 1) * cardWidth) / 2;

            available.forEach((evolution, index) => {
                this.time.delayedCall(index * 100, () => {
                    this.createEvolutionCard(startX + index * cardWidth, centerY + 20, evolution, index);
                });
            });
        }

        // Close button
        this.createCloseButton(centerX);

        // ESC to close
        this.input.keyboard.on('keydown-ESC', () => {
            this.closeMenu();
        });
    }

    createBackground() {
        // Dark overlay with gradient
        const bg = this.add.graphics();

        for (let y = 0; y < 600; y += 10) {
            const alpha = 0.85 + (y / 600) * 0.1;
            bg.fillStyle(0x0a1525, alpha);
            bg.fillRect(0, y, 800, 10);
        }

        // Animated glow circles in background
        for (let i = 0; i < 5; i++) {
            const glow = this.add.graphics();
            const x = 100 + Math.random() * 600;
            const y = 100 + Math.random() * 400;
            glow.fillStyle(0x00ffff, 0.05);
            glow.fillCircle(x, y, 80 + Math.random() * 60);

            this.tweens.add({
                targets: glow,
                alpha: 0.15,
                scale: 1.2,
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createDNAParticles() {
        // Floating DNA helix particles
        this.dnaParticles = [];

        for (let i = 0; i < 20; i++) {
            const particle = this.add.graphics();
            const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00];
            const color = colors[Math.floor(Math.random() * colors.length)];

            particle.fillStyle(color, 0.4);
            particle.fillCircle(0, 0, 3 + Math.random() * 3);

            particle.x = Math.random() * 800;
            particle.y = Math.random() * 600;
            particle.speedX = (Math.random() - 0.5) * 30;
            particle.speedY = -20 - Math.random() * 30;

            this.dnaParticles.push(particle);
        }
    }

    createTitle(centerX) {
        // Glow effect
        const titleGlow = this.add.graphics();
        titleGlow.fillStyle(0x00ffff, 0.2);
        titleGlow.fillEllipse(centerX, 50, 350, 60);

        // DNA icon animation
        const dnaLeft = this.add.text(centerX - 150, 50, '🧬', { fontSize: '36px' }).setOrigin(0.5);
        const dnaRight = this.add.text(centerX + 150, 50, '🧬', { fontSize: '36px' }).setOrigin(0.5);

        this.tweens.add({
            targets: [dnaLeft, dnaRight],
            rotation: Math.PI * 2,
            duration: 4000,
            repeat: -1
        });

        // Main title
        this.add.text(centerX + 2, 52, 'EVOLUCIÓN', {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            fill: '#004466'
        }).setOrigin(0.5);

        const title = this.add.text(centerX, 50, 'EVOLUCIÓN', {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            fill: '#00ffff',
            stroke: '#003355',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(centerX, 85, 'Elige tu siguiente forma', {
            fontSize: '14px',
            fill: '#88ccff',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }

    createDNABar(centerX) {
        const dna = this.player.dna;
        const y = 115;

        // Background bar
        const barBg = this.add.graphics();
        barBg.fillStyle(0x000000, 0.5);
        barBg.fillRoundedRect(centerX - 200, y - 15, 400, 30, 8);
        barBg.lineStyle(1, 0x4488aa, 0.5);
        barBg.strokeRoundedRect(centerX - 200, y - 15, 400, 30, 8);

        // DNA counters with icons
        const dnaTypes = [
            { type: 'speed', icon: '⚡', color: '#00ffff', label: 'Velocidad' },
            { type: 'defense', icon: '🛡️', color: '#888888', label: 'Defensa' },
            { type: 'attack', icon: '🔥', color: '#ff4444', label: 'Ataque' },
            { type: 'energy', icon: '💙', color: '#ffff00', label: 'Energía' }
        ];

        dnaTypes.forEach((item, i) => {
            const x = centerX - 150 + i * 100;

            // Icon
            this.add.text(x - 15, y, item.icon, { fontSize: '16px' }).setOrigin(0.5);

            // Value
            this.add.text(x + 15, y, `${dna[item.type]}`, {
                fontSize: '16px',
                fill: item.color,
                fontFamily: 'Arial Black'
            }).setOrigin(0.5);
        });
    }

    createNoEvolutionsMessage(centerX, centerY) {
        // No evolutions available panel
        const panel = this.add.graphics();
        panel.fillStyle(0x331111, 0.8);
        panel.fillRoundedRect(centerX - 150, centerY - 50, 300, 100, 15);
        panel.lineStyle(2, 0xff4444, 0.5);
        panel.strokeRoundedRect(centerX - 150, centerY - 50, 300, 100, 15);

        this.add.text(centerX, centerY - 15, '❌', { fontSize: '32px' }).setOrigin(0.5);

        this.add.text(centerX, centerY + 20, 'No hay evoluciones disponibles', {
            fontSize: '16px',
            fill: '#ff8888'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 40, 'Recolecta más ADN', {
            fontSize: '12px',
            fill: '#aa6666'
        }).setOrigin(0.5);
    }

    createEvolutionCard(x, y, evolution, index) {
        const card = this.add.container(x, y);
        card.alpha = 0;
        card.y = y + 50;

        // Card glow
        const cardGlow = this.add.graphics();
        cardGlow.fillStyle(evolution.visual.color, 0.15);
        cardGlow.fillRoundedRect(-85, -135, 170, 270, 15);
        card.add(cardGlow);

        // Card shadow
        const cardShadow = this.add.graphics();
        cardShadow.fillStyle(0x000000, 0.4);
        cardShadow.fillRoundedRect(-77, -122, 160, 255, 12);
        card.add(cardShadow);

        // Card background
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x1a2a40, 1);
        cardBg.fillRoundedRect(-80, -125, 160, 250, 12);
        cardBg.lineStyle(2, evolution.visual.color, 0.8);
        cardBg.strokeRoundedRect(-80, -125, 160, 250, 12);
        card.add(cardBg);

        // Top accent
        const accent = this.add.graphics();
        accent.fillStyle(evolution.visual.color, 0.3);
        accent.fillRoundedRect(-80, -125, 160, 8, { tl: 12, tr: 12, bl: 0, br: 0 });
        card.add(accent);

        // Evolution name
        const nameText = this.add.text(0, -100, evolution.name, {
            fontFamily: 'Arial Black',
            fontSize: '15px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        card.add(nameText);

        // Fish preview with animation
        const preview = this.createFishPreview(evolution);
        preview.y = -30;
        card.add(preview);

        // Description panel
        const descBg = this.add.graphics();
        descBg.fillStyle(0x000000, 0.3);
        descBg.fillRoundedRect(-70, 35, 140, 40, 6);
        card.add(descBg);

        const descText = this.add.text(0, 55, evolution.description, {
            fontSize: '11px',
            fill: '#aaddff',
            align: 'center',
            wordWrap: { width: 130 }
        }).setOrigin(0.5);
        card.add(descText);

        // Requirements
        let reqText = 'Requiere: ';
        const icons = { speed: '⚡', defense: '🛡️', attack: '🔥', energy: '💙' };
        for (const [type, amount] of Object.entries(evolution.requirements)) {
            reqText += `${icons[type]}${amount} `;
        }

        const requirementsText = this.add.text(0, 85, reqText, {
            fontSize: '11px',
            fill: '#ffcc00'
        }).setOrigin(0.5);
        card.add(requirementsText);

        // Select button
        const selectButton = this.createSelectButton(evolution);
        selectButton.y = 110;
        card.add(selectButton);

        // Entrance animation
        this.tweens.add({
            targets: card,
            alpha: 1,
            y: y,
            duration: 400,
            ease: 'Back.out'
        });

        // Hover animation
        card.setInteractive(new Phaser.Geom.Rectangle(-80, -125, 160, 250), Phaser.Geom.Rectangle.Contains);

        card.on('pointerover', () => {
            this.tweens.add({
                targets: card,
                scale: 1.05,
                y: y - 10,
                duration: 150,
                ease: 'Back.out'
            });
            cardGlow.alpha = 1.5;
            cardBg.clear();
            cardBg.fillStyle(0x253550, 1);
            cardBg.fillRoundedRect(-80, -125, 160, 250, 12);
            cardBg.lineStyle(3, evolution.visual.color, 1);
            cardBg.strokeRoundedRect(-80, -125, 160, 250, 12);
        });

        card.on('pointerout', () => {
            this.tweens.add({
                targets: card,
                scale: 1,
                y: y,
                duration: 150
            });
            cardGlow.alpha = 1;
            cardBg.clear();
            cardBg.fillStyle(0x1a2a40, 1);
            cardBg.fillRoundedRect(-80, -125, 160, 250, 12);
            cardBg.lineStyle(2, evolution.visual.color, 0.8);
            cardBg.strokeRoundedRect(-80, -125, 160, 250, 12);
        });

        card.on('pointerdown', () => {
            this.selectEvolution(evolution, card);
        });
    }

    createFishPreview(evolution) {
        const preview = this.add.container(0, 0);

        // Glow behind fish
        const glow = this.add.graphics();
        glow.fillStyle(evolution.visual.color, 0.3);
        glow.fillCircle(0, 0, 40);
        preview.add(glow);

        // Fish body
        const body = this.add.graphics();
        body.fillStyle(evolution.visual.color, 1);
        body.fillEllipse(0, 0, 50, 30);
        body.fillTriangle(22, 0, 30, -7, 30, 7);
        preview.add(body);

        // Tail
        const tail = this.add.graphics();
        const darkColor = Phaser.Display.Color.ValueToColor(evolution.visual.color).darken(30).color;
        tail.fillStyle(darkColor, 1);
        tail.fillTriangle(-25, 0, -40, -12, -40, 12);
        preview.add(tail);

        // Dorsal fin
        const dorsal = this.add.graphics();
        dorsal.fillStyle(darkColor, 1);
        dorsal.fillTriangle(-5, -15, 10, -15, 2, -28);
        preview.add(dorsal);

        // Eye
        const eye = this.add.graphics();
        eye.fillStyle(0xffffff, 1);
        eye.fillCircle(12, -5, 6);
        eye.fillStyle(0x000000, 1);
        eye.fillCircle(14, -5, 3);
        preview.add(eye);

        // Special effects based on evolution
        if (evolution.visual.glowing) {
            const electricEffect = this.add.graphics();
            electricEffect.lineStyle(2, 0xffff00, 0.8);
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                electricEffect.lineBetween(
                    Math.cos(angle) * 25,
                    Math.sin(angle) * 15,
                    Math.cos(angle) * 35,
                    Math.sin(angle) * 22
                );
            }
            preview.add(electricEffect);

            this.tweens.add({
                targets: electricEffect,
                alpha: 0.3,
                duration: 200,
                yoyo: true,
                repeat: -1
            });
        }

        if (evolution.visual.hasShell) {
            const shell = this.add.graphics();
            shell.lineStyle(4, 0x888888, 1);
            shell.strokeEllipse(0, 0, 55, 35);
            preview.add(shell);
        }

        // Animate preview
        this.tweens.add({
            targets: preview,
            rotation: 0.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: tail,
            rotation: 0.2,
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        return preview;
    }

    createSelectButton(evolution) {
        const button = this.add.container(0, 0);

        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x00aa44, 1);
        btnBg.fillRoundedRect(-55, -15, 110, 30, 8);
        btnBg.lineStyle(2, 0x00ff66, 0.8);
        btnBg.strokeRoundedRect(-55, -15, 110, 30, 8);
        button.add(btnBg);

        const btnText = this.add.text(0, 0, '✓ Elegir', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        button.add(btnText);

        return button;
    }

    createCloseButton(centerX) {
        const button = this.add.container(centerX, 540);

        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x444455, 1);
        btnBg.fillRoundedRect(-80, -20, 160, 40, 10);
        btnBg.lineStyle(1, 0x666677, 1);
        btnBg.strokeRoundedRect(-80, -20, 160, 40, 10);
        button.add(btnBg);

        const btnText = this.add.text(0, 0, '✕ Cerrar (ESC)', {
            fontSize: '14px',
            fill: '#aaaacc'
        }).setOrigin(0.5);
        button.add(btnText);

        button.setInteractive(new Phaser.Geom.Rectangle(-80, -20, 160, 40), Phaser.Geom.Rectangle.Contains);

        button.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(0x555566, 1);
            btnBg.fillRoundedRect(-80, -20, 160, 40, 10);
            btnBg.lineStyle(1, 0x888899, 1);
            btnBg.strokeRoundedRect(-80, -20, 160, 40, 10);
            this.tweens.add({ targets: button, scale: 1.05, duration: 100 });
        });

        button.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0x444455, 1);
            btnBg.fillRoundedRect(-80, -20, 160, 40, 10);
            btnBg.lineStyle(1, 0x666677, 1);
            btnBg.strokeRoundedRect(-80, -20, 160, 40, 10);
            this.tweens.add({ targets: button, scale: 1, duration: 100 });
        });

        button.on('pointerdown', () => {
            this.closeMenu();
        });
    }

    selectEvolution(evolution, card) {
        // Disable all input
        this.input.enabled = false;

        // Evolution selection animation
        this.tweens.add({
            targets: card,
            scale: 1.3,
            alpha: 0,
            duration: 500,
            ease: 'Power2'
        });

        // Flash effect
        this.cameras.main.flash(600, 255, 255, 255);

        // Create evolution particles
        for (let i = 0; i < 30; i++) {
            const particle = this.add.graphics();
            particle.fillStyle(evolution.visual.color, 1);
            particle.fillCircle(0, 0, 4 + Math.random() * 4);
            particle.x = card.x;
            particle.y = card.y;

            const angle = (i / 30) * Math.PI * 2;
            const speed = 100 + Math.random() * 100;

            this.tweens.add({
                targets: particle,
                x: card.x + Math.cos(angle) * speed,
                y: card.y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }

        // Apply evolution
        this.player.applyEvolution(evolution);

        // Add evolution bonus score
        this.gameScene.addEvolutionBonus();

        // Close after animation
        this.time.delayedCall(600, () => {
            this.closeMenu();
        });
    }

    closeMenu() {
        this.cameras.main.fade(200, 0, 0, 0);
        this.time.delayedCall(200, () => {
            this.scene.stop();
            this.scene.resume('GameScene');
        });
    }

    update(time, delta) {
        // Animate DNA particles
        this.dnaParticles.forEach(particle => {
            particle.y += particle.speedY * delta * 0.001;
            particle.x += particle.speedX * delta * 0.001;

            if (particle.y < -20) {
                particle.y = 620;
                particle.x = Math.random() * 800;
            }
        });
    }
}
