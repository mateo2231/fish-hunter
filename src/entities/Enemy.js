import Phaser from 'phaser';
import { ENEMY_TYPES } from '../config/enemies.js';

export class Enemy extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type) {
        super(scene, x, y);

        this.scene = scene;
        this.type = type;
        this.config = ENEMY_TYPES[type];

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Copy stats from config
        this.maxHealth = this.config.health;
        this.health = this.config.health;
        this.size = this.config.size;
        this.speed = this.config.speed;
        this.damage = this.config.damage;
        this.behavior = this.config.behavior;

        // Create visual
        this.createVisuals();

        // Create health bar
        this.createHealthBar();

        // Physics
        this.body.setCircle(this.size);
        this.body.setOffset(-this.size, -this.size);

        // Behavior state
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderTimer = 0;
        this.attackCooldown = 0;
    }

    createVisuals() {
        // Ambient glow for all fish
        this.ambientGlow = this.scene.add.graphics();
        this.ambientGlow.fillStyle(this.config.color, 0.12);
        this.ambientGlow.fillEllipse(0, 0, this.size * 3, this.size * 2);

        this.mainGraphics = this.scene.add.graphics();
        this.tailGraphics = this.scene.add.graphics();
        this.detailGraphics = this.scene.add.graphics();

        // Swimming bubbles
        this.bubbles = [];
        for (let i = 0; i < 3; i++) {
            const bubble = this.scene.add.graphics();
            bubble.visible = false;
            this.bubbles.push({
                graphics: bubble,
                x: 0, y: 0,
                life: 0
            });
        }

        // Draw based on enemy type
        switch (this.type) {
            case 'COMMON':
                this.drawCommonFish();
                break;
            case 'PUFFER':
                this.drawPufferFish();
                break;
            case 'HUNTER':
                this.drawHunterFish();
                break;
            case 'LUMINOUS':
                this.drawLuminousFish();
                break;
            case 'MUTANT':
                this.drawMutantFish();
                break;
            case 'TOXIC':
                this.drawToxicFish();
                break;
            case 'ANGLERFISH':
                this.drawAnglerfish();
                break;
            case 'JELLYFISH':
                this.drawJellyfish();
                break;
            case 'SHARK':
                this.drawShark();
                break;
            case 'ELECTRIC_EEL':
                this.drawElectricEel();
                break;
            case 'CAMOUFLAGE':
                this.drawCamouflageFish();
                break;
            default:
                this.drawCommonFish();
        }

        this.add([this.ambientGlow, ...this.bubbles.map(b => b.graphics), this.tailGraphics, this.mainGraphics, this.detailGraphics]);

        // Animation state
        this.animTime = Math.random() * Math.PI * 2;
        this.bubbleTimer = Math.random() * 500;
        this.glowPulse = Math.random() * Math.PI * 2;
    }

    createHealthBar() {
        // Health bar container (positioned above enemy)
        this.healthBarBg = this.scene.add.graphics();
        this.healthBarFill = this.scene.add.graphics();

        const barWidth = Math.max(30, this.size * 1.5);
        const barHeight = 4;
        const barY = -this.size - 12;

        // Background
        this.healthBarBg.fillStyle(0x000000, 0.6);
        this.healthBarBg.fillRoundedRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2, 2);

        // Fill (starts full)
        this.healthBarFill.fillStyle(0x00ff00, 1);
        this.healthBarFill.fillRoundedRect(-barWidth / 2, barY, barWidth, barHeight, 1);

        // Store dimensions for updates
        this.healthBarWidth = barWidth;
        this.healthBarHeight = barHeight;
        this.healthBarY = barY;

        // Add to container
        this.add([this.healthBarBg, this.healthBarFill]);

        // Initially hide if full health (show only when damaged)
        this.healthBarBg.setVisible(false);
        this.healthBarFill.setVisible(false);
    }

    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;

        // Show health bar only when damaged
        if (healthPercent < 1) {
            this.healthBarBg.setVisible(true);
            this.healthBarFill.setVisible(true);

            // Redraw fill bar
            this.healthBarFill.clear();

            // Color based on health percentage
            let color;
            if (healthPercent > 0.6) {
                color = 0x00ff00; // Green
            } else if (healthPercent > 0.3) {
                color = 0xffff00; // Yellow
            } else {
                color = 0xff0000; // Red
            }

            this.healthBarFill.fillStyle(color, 1);
            this.healthBarFill.fillRoundedRect(
                -this.healthBarWidth / 2,
                this.healthBarY,
                this.healthBarWidth * healthPercent,
                this.healthBarHeight,
                1
            );
        } else {
            this.healthBarBg.setVisible(false);
            this.healthBarFill.setVisible(false);
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        // Flash effect
        this.scene.tweens.add({
            targets: this.mainGraphics,
            alpha: 0.3,
            duration: 50,
            yoyo: true,
            repeat: 2
        });

        // Update health bar
        this.updateHealthBar();

        // Check if dead
        if (this.health <= 0) {
            this.health = 0;
            return true; // Enemy died
        }
        return false; // Still alive
    }

    isDead() {
        return this.health <= 0;
    }

    destroy() {
        // Clean up health bar
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBarFill) this.healthBarFill.destroy();

        // Clean up other graphics
        if (this.ambientGlow) this.ambientGlow.destroy();
        if (this.mainGraphics) this.mainGraphics.destroy();
        if (this.tailGraphics) this.tailGraphics.destroy();
        if (this.detailGraphics) this.detailGraphics.destroy();

        // Clean up bubbles
        this.bubbles.forEach(b => {
            if (b.graphics) b.graphics.destroy();
        });

        // Call parent destroy
        super.destroy();
    }

    drawCommonFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x2868aa;
        const lightColor = 0x7ad0ff;

        // Shadow
        this.mainGraphics.fillStyle(0x000000, 0.15);
        this.mainGraphics.fillEllipse(s * 0.1, s * 0.2, s * 2.2, s * 1.3);

        // Forked tail with detail
        this.tailGraphics.fillStyle(darkColor, 1);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.9, 0);
        this.tailGraphics.lineTo(-s * 1.5, -s * 0.7);
        this.tailGraphics.lineTo(-s * 1.2, 0);
        this.tailGraphics.lineTo(-s * 1.5, s * 0.7);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Tail rays
        this.tailGraphics.lineStyle(1, lightColor, 0.3);
        this.tailGraphics.lineBetween(-s, 0, -s * 1.4, -s * 0.5);
        this.tailGraphics.lineBetween(-s, 0, -s * 1.4, s * 0.5);
        this.tailGraphics.lineBetween(-s, 0, -s * 1.3, 0);

        // Body gradient
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.fillEllipse(0, 0, s * 2.3, s * 1.5);
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.fillEllipse(0, -s * 0.05, s * 2.1, s * 1.3);

        // Body highlight
        this.mainGraphics.fillStyle(lightColor, 0.4);
        this.mainGraphics.fillEllipse(0, -s * 0.3, s * 1.5, s * 0.6);

        // Belly
        this.mainGraphics.fillStyle(0xffffff, 0.3);
        this.mainGraphics.fillEllipse(0, s * 0.3, s * 1.4, s * 0.5);

        // Scales pattern
        this.detailGraphics.lineStyle(1, darkColor, 0.2);
        for (let row = -1; row <= 1; row++) {
            for (let col = -2; col <= 1; col++) {
                const x = col * s * 0.4 + (row % 2) * s * 0.2;
                const y = row * s * 0.3;
                this.detailGraphics.beginPath();
                this.detailGraphics.arc(x, y, s * 0.2, -0.8, 0.8);
                this.detailGraphics.stroke();
            }
        }

        // Dorsal fin
        this.mainGraphics.fillStyle(darkColor, 0.9);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(-s * 0.4, -s * 0.65);
        this.mainGraphics.lineTo(-s * 0.1, -s * 1.2);
        this.mainGraphics.lineTo(s * 0.3, -s * 0.65);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Fin rays
        this.detailGraphics.lineStyle(1, lightColor, 0.4);
        this.detailGraphics.lineBetween(-s * 0.2, -s * 0.7, -s * 0.05, -s * 1.1);
        this.detailGraphics.lineBetween(s * 0.1, -s * 0.7, 0.05 * s, -s * 1.0);

        // Side fin
        this.mainGraphics.fillStyle(darkColor, 0.8);
        this.mainGraphics.fillTriangle(0, s * 0.4, -s * 0.5, s * 0.9, s * 0.2, s * 0.5);

        // Gill
        this.detailGraphics.lineStyle(1.5, darkColor, 0.4);
        this.detailGraphics.beginPath();
        this.detailGraphics.arc(s * 0.5, 0, s * 0.35, -0.5, 0.5);
        this.detailGraphics.stroke();

        // Eye socket
        this.detailGraphics.fillStyle(0x000000, 0.15);
        this.detailGraphics.fillEllipse(s * 0.55, -s * 0.15, s * 0.5, s * 0.45);

        // Eye white
        this.detailGraphics.fillStyle(0xffffff, 1);
        this.detailGraphics.fillEllipse(s * 0.55, -s * 0.18, s * 0.45, s * 0.38);

        // Iris
        this.detailGraphics.fillStyle(0x224488, 1);
        this.detailGraphics.fillCircle(s * 0.6, -s * 0.15, s * 0.18);

        // Pupil
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.63, -s * 0.15, s * 0.1);

        // Eye shine
        this.detailGraphics.fillStyle(0xffffff, 0.9);
        this.detailGraphics.fillCircle(s * 0.52, -s * 0.25, s * 0.08);

        // Mouth
        this.detailGraphics.lineStyle(1.5, darkColor, 0.6);
        this.detailGraphics.beginPath();
        this.detailGraphics.arc(s * 1.0, s * 0.05, s * 0.15, 0.3, 1.2);
        this.detailGraphics.stroke();
    }

    drawPufferFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0xcc6600;
        const lightColor = 0xffaa44;

        // Shadow
        this.mainGraphics.fillStyle(0x000000, 0.15);
        this.mainGraphics.fillCircle(s * 0.1, s * 0.15, s * 1.05);

        // Small cute tail
        this.tailGraphics.fillStyle(darkColor, 0.9);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.75, 0);
        this.tailGraphics.lineTo(-s * 1.0, -s * 0.2);
        this.tailGraphics.lineTo(-s * 1.25, -s * 0.35);
        this.tailGraphics.lineTo(-s * 1.15, 0);
        this.tailGraphics.lineTo(-s * 1.25, s * 0.35);
        this.tailGraphics.lineTo(-s * 1.0, s * 0.2);
        this.tailGraphics.lineTo(-s * 0.75, 0);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Round puffy body gradient
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.fillCircle(0, 0, s * 1.05);
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.fillCircle(0, -s * 0.05, s);

        // Body highlight
        this.mainGraphics.fillStyle(lightColor, 0.5);
        this.mainGraphics.fillEllipse(-s * 0.2, -s * 0.4, s * 0.8, s * 0.5);

        // Belly
        this.mainGraphics.fillStyle(0xffffcc, 0.4);
        this.mainGraphics.fillEllipse(0, s * 0.3, s * 0.8, s * 0.5);

        // Spots pattern
        this.detailGraphics.fillStyle(darkColor, 0.35);
        const spotPositions = [
            {x: -s*0.35, y: -s*0.35, r: s*0.18},
            {x: s*0.25, y: -s*0.4, r: s*0.14},
            {x: -s*0.5, y: s*0.15, r: s*0.16},
            {x: s*0.15, y: s*0.45, r: s*0.12},
            {x: -s*0.15, y: s*0.1, r: s*0.1},
            {x: s*0.4, y: s*0.2, r: s*0.13}
        ];
        spotPositions.forEach(spot => {
            this.detailGraphics.fillCircle(spot.x, spot.y, spot.r);
        });

        // Spines all around
        this.detailGraphics.fillStyle(darkColor, 0.85);
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const sx = Math.cos(angle) * s * 0.95;
            const sy = Math.sin(angle) * s * 0.95;
            const spineLength = s * 0.2 + Math.sin(i * 2) * s * 0.1;
            this.detailGraphics.beginPath();
            this.detailGraphics.moveTo(sx, sy);
            this.detailGraphics.lineTo(
                sx + Math.cos(angle) * spineLength,
                sy + Math.sin(angle) * spineLength
            );
            this.detailGraphics.lineTo(
                sx + Math.cos(angle + 0.15) * s * 0.08,
                sy + Math.sin(angle + 0.15) * s * 0.08
            );
            this.detailGraphics.closePath();
            this.detailGraphics.fill();
        }

        // Side fins
        this.mainGraphics.fillStyle(darkColor, 0.7);
        this.mainGraphics.fillEllipse(-s * 0.1, s * 0.85, s * 0.35, s * 0.15);
        this.mainGraphics.fillEllipse(s * 0.6, s * 0.5, s * 0.25, s * 0.12);

        // Dorsal fin
        this.mainGraphics.fillStyle(darkColor, 0.8);
        this.mainGraphics.fillEllipse(0, -s * 0.9, s * 0.3, s * 0.15);

        // Eye socket
        this.detailGraphics.fillStyle(0x000000, 0.1);
        this.detailGraphics.fillCircle(s * 0.45, -s * 0.25, s * 0.3);

        // Big cute eyes
        this.detailGraphics.fillStyle(0xffffff, 1);
        this.detailGraphics.fillCircle(s * 0.45, -s * 0.28, s * 0.27);
        this.detailGraphics.fillStyle(0x442200, 1);
        this.detailGraphics.fillCircle(s * 0.5, -s * 0.25, s * 0.15);
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.52, -s * 0.25, s * 0.08);
        // Eye shine
        this.detailGraphics.fillStyle(0xffffff, 0.9);
        this.detailGraphics.fillCircle(s * 0.42, -s * 0.35, s * 0.07);
        this.detailGraphics.fillCircle(s * 0.55, -s * 0.2, s * 0.03);

        // Cute puckered mouth
        this.detailGraphics.fillStyle(0xcc8866, 1);
        this.detailGraphics.fillEllipse(s * 0.85, s * 0.05, s * 0.15, s * 0.12);
        this.detailGraphics.fillStyle(0x884422, 1);
        this.detailGraphics.fillEllipse(s * 0.88, s * 0.05, s * 0.08, s * 0.06);
    }

    drawHunterFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x990000;
        const lightColor = 0xff6655;

        // Shadow
        this.mainGraphics.fillStyle(0x000000, 0.2);
        this.mainGraphics.fillEllipse(s * 0.1, s * 0.15, s * 2.2, s * 1.1);

        // Aggressive crescent tail
        this.tailGraphics.fillStyle(darkColor, 1);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.85, 0);
        this.tailGraphics.lineTo(-s * 1.1, -s * 0.25);
        this.tailGraphics.lineTo(-s * 1.5, -s * 0.75);
        this.tailGraphics.lineTo(-s * 1.3, -s * 0.2);
        this.tailGraphics.lineTo(-s * 1.15, 0);
        this.tailGraphics.lineTo(-s * 1.3, s * 0.2);
        this.tailGraphics.lineTo(-s * 1.5, s * 0.75);
        this.tailGraphics.lineTo(-s * 1.1, s * 0.25);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Torpedo body - sleek predator
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 1.25, 0);
        this.mainGraphics.lineTo(s * 0.9, -s * 0.45);
        this.mainGraphics.lineTo(s * 0.4, -s * 0.6);
        this.mainGraphics.lineTo(-s * 0.7, -s * 0.5);
        this.mainGraphics.lineTo(-s * 0.9, 0);
        this.mainGraphics.lineTo(-s * 0.7, s * 0.5);
        this.mainGraphics.lineTo(s * 0.4, s * 0.6);
        this.mainGraphics.lineTo(s * 0.9, s * 0.45);
        this.mainGraphics.lineTo(s * 1.25, 0);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 1.2, 0);
        this.mainGraphics.lineTo(s * 0.85, -s * 0.4);
        this.mainGraphics.lineTo(s * 0.35, -s * 0.55);
        this.mainGraphics.lineTo(-s * 0.65, -s * 0.45);
        this.mainGraphics.lineTo(-s * 0.85, 0);
        this.mainGraphics.lineTo(-s * 0.65, s * 0.45);
        this.mainGraphics.lineTo(s * 0.35, s * 0.55);
        this.mainGraphics.lineTo(s * 0.85, s * 0.4);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Highlight stripe
        this.mainGraphics.fillStyle(lightColor, 0.5);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 1.0, -s * 0.1);
        this.mainGraphics.lineTo(s * 0.5, -s * 0.3);
        this.mainGraphics.lineTo(-s * 0.3, -s * 0.35);
        this.mainGraphics.lineTo(-s * 0.6, -s * 0.25);
        this.mainGraphics.lineTo(s * 0.3, -s * 0.15);
        this.mainGraphics.lineTo(s * 1.0, -s * 0.1);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Pointed dorsal fin
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(-s * 0.1, -s * 0.55);
        this.mainGraphics.lineTo(s * 0.1, -s * 1.15);
        this.mainGraphics.lineTo(s * 0.35, -s * 0.55);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Fin rays
        this.detailGraphics.lineStyle(1, lightColor, 0.4);
        this.detailGraphics.lineBetween(0, -s * 0.6, 0.1 * s, -s * 1.05);
        this.detailGraphics.lineBetween(s * 0.2, -s * 0.6, 0.15 * s, -s * 0.95);

        // Side fin
        this.mainGraphics.fillStyle(darkColor, 0.9);
        this.mainGraphics.fillTriangle(s * 0.2, s * 0.35, -s * 0.15, s * 0.8, s * 0.35, s * 0.45);

        // Scars/battle marks
        this.detailGraphics.lineStyle(2, 0x660000, 0.5);
        this.detailGraphics.lineBetween(-s * 0.35, -s * 0.25, s * 0.05, -s * 0.38);
        this.detailGraphics.lineBetween(-s * 0.55, s * 0.12, -s * 0.25, s * 0.28);
        this.detailGraphics.lineBetween(s * 0.3, s * 0.15, s * 0.55, s * 0.08);

        // Gill
        this.detailGraphics.lineStyle(2, darkColor, 0.5);
        this.detailGraphics.beginPath();
        this.detailGraphics.arc(s * 0.55, 0, s * 0.3, -0.5, 0.5);
        this.detailGraphics.stroke();

        // Angry eye socket
        this.detailGraphics.fillStyle(0x000000, 0.15);
        this.detailGraphics.fillEllipse(s * 0.6, -s * 0.15, s * 0.38, s * 0.28);

        // Angry eye
        this.detailGraphics.fillStyle(0xffffaa, 1);
        this.detailGraphics.fillEllipse(s * 0.6, -s * 0.17, s * 0.32, s * 0.24);
        this.detailGraphics.fillStyle(0xaa0000, 1);
        this.detailGraphics.fillCircle(s * 0.68, -s * 0.15, s * 0.13);
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.7, -s * 0.15, s * 0.07);

        // Angry brow
        this.detailGraphics.lineStyle(3, darkColor, 0.9);
        this.detailGraphics.lineBetween(s * 0.38, -s * 0.38, s * 0.75, -s * 0.3);

        // Eye shine
        this.detailGraphics.fillStyle(0xffffff, 0.7);
        this.detailGraphics.fillCircle(s * 0.55, -s * 0.25, s * 0.05);

        // Open mouth with teeth
        this.detailGraphics.fillStyle(0x330000, 1);
        this.detailGraphics.beginPath();
        this.detailGraphics.moveTo(s * 0.95, -s * 0.2);
        this.detailGraphics.lineTo(s * 1.25, 0);
        this.detailGraphics.lineTo(s * 0.95, s * 0.2);
        this.detailGraphics.closePath();
        this.detailGraphics.fill();

        // Sharp teeth
        this.detailGraphics.fillStyle(0xffffff, 1);
        for (let i = 0; i < 4; i++) {
            const ty = -s * 0.15 + i * s * 0.1;
            this.detailGraphics.fillTriangle(s * 0.98, ty, s * 1.12, ty + s * 0.05, s * 0.98, ty + s * 0.08);
        }
    }

    drawLuminousFish() {
        const s = this.size;
        const color = this.config.color;
        const coreColor = 0x88ffff;
        const innerColor = 0xaaffff;

        // Multi-layer outer glow for depth
        this.glowGraphics = this.scene.add.graphics();
        this.glowGraphics.fillStyle(color, 0.08);
        this.glowGraphics.fillCircle(0, 0, s * 2.5);
        this.glowGraphics.fillStyle(color, 0.15);
        this.glowGraphics.fillCircle(0, 0, s * 2);
        this.glowGraphics.fillStyle(coreColor, 0.2);
        this.glowGraphics.fillCircle(0, 0, s * 1.5);
        this.addAt(this.glowGraphics, 0);

        // Ethereal flowing tail with gradient
        this.tailGraphics.fillStyle(color, 0.3);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.7, 0);
        this.tailGraphics.lineTo(-s * 1.0, -s * 0.25);
        this.tailGraphics.lineTo(-s * 1.5, -s * 0.6);
        this.tailGraphics.lineTo(-s * 1.35, 0);
        this.tailGraphics.lineTo(-s * 1.5, s * 0.6);
        this.tailGraphics.lineTo(-s * 1.0, s * 0.25);
        this.tailGraphics.lineTo(-s * 0.7, 0);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Tail inner glow
        this.tailGraphics.fillStyle(coreColor, 0.4);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.75, 0);
        this.tailGraphics.lineTo(-s * 0.95, -s * 0.15);
        this.tailGraphics.lineTo(-s * 1.2, -s * 0.35);
        this.tailGraphics.lineTo(-s * 1.1, 0);
        this.tailGraphics.lineTo(-s * 1.2, s * 0.35);
        this.tailGraphics.lineTo(-s * 0.95, s * 0.15);
        this.tailGraphics.lineTo(-s * 0.75, 0);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Tail veins/rays
        this.tailGraphics.lineStyle(1, 0xffffff, 0.3);
        for (let i = -2; i <= 2; i++) {
            this.tailGraphics.lineBetween(-s * 0.75, i * s * 0.08, -s * 1.3, i * s * 0.25);
        }

        // Translucent body - outer layer
        this.mainGraphics.fillStyle(color, 0.5);
        this.mainGraphics.fillEllipse(0, 0, s * 2.1, s * 1.3);

        // Body middle layer
        this.mainGraphics.fillStyle(innerColor, 0.6);
        this.mainGraphics.fillEllipse(0, -s * 0.05, s * 1.8, s * 1.1);

        // Inner glow/core - pulsing center
        this.mainGraphics.fillStyle(coreColor, 0.7);
        this.mainGraphics.fillEllipse(0, 0, s * 1.3, s * 0.8);

        // Bright core
        this.mainGraphics.fillStyle(0xffffff, 0.6);
        this.mainGraphics.fillEllipse(0, 0, s * 0.8, s * 0.5);

        // Internal organs visible through translucent body
        this.detailGraphics.fillStyle(coreColor, 0.5);
        this.detailGraphics.fillEllipse(-s * 0.2, s * 0.1, s * 0.4, s * 0.25);

        // Spine/skeleton hint
        this.detailGraphics.lineStyle(1, 0xffffff, 0.25);
        this.detailGraphics.beginPath();
        this.detailGraphics.moveTo(s * 0.6, 0);
        this.detailGraphics.lineTo(-s * 0.6, 0);
        this.detailGraphics.stroke();
        for (let i = -3; i <= 2; i++) {
            const x = i * s * 0.2;
            this.detailGraphics.lineBetween(x, -s * 0.15, x, s * 0.15);
        }

        // Light particles orbiting
        this.detailGraphics.fillStyle(0xffffff, 0.9);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = s * 1.4;
            const particleSize = 1.5 + (i % 3) * 0.5;
            this.detailGraphics.fillCircle(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist,
                particleSize
            );
        }

        // Delicate dorsal fin
        this.mainGraphics.fillStyle(color, 0.4);
        this.mainGraphics.fillTriangle(-s * 0.2, -s * 0.6, 0, -s * 1.1, s * 0.2, -s * 0.6);

        // Fin glow
        this.mainGraphics.fillStyle(coreColor, 0.5);
        this.mainGraphics.fillTriangle(-s * 0.1, -s * 0.65, 0, -s * 0.95, s * 0.1, -s * 0.65);

        // Side fins
        this.mainGraphics.fillStyle(color, 0.35);
        this.mainGraphics.fillTriangle(s * 0.1, s * 0.45, -s * 0.3, s * 0.85, -s * 0.1, s * 0.5);

        // Big luminous eyes - ethereal look
        this.detailGraphics.fillStyle(0x000000, 0.1);
        this.detailGraphics.fillCircle(s * 0.4, -s * 0.12, s * 0.32);

        this.detailGraphics.fillStyle(0xffffff, 0.95);
        this.detailGraphics.fillCircle(s * 0.4, -s * 0.15, s * 0.28);

        // Iris with glow
        this.detailGraphics.fillStyle(coreColor, 1);
        this.detailGraphics.fillCircle(s * 0.45, -s * 0.12, s * 0.16);

        this.detailGraphics.fillStyle(0xffff88, 1);
        this.detailGraphics.fillCircle(s * 0.47, -s * 0.12, s * 0.1);

        // Pupil
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.48, -s * 0.12, s * 0.05);

        // Eye shine - multiple
        this.detailGraphics.fillStyle(0xffffff, 1);
        this.detailGraphics.fillCircle(s * 0.38, -s * 0.2, s * 0.06);
        this.detailGraphics.fillCircle(s * 0.52, -s * 0.08, s * 0.03);

        // Small mouth
        this.detailGraphics.lineStyle(1.5, coreColor, 0.5);
        this.detailGraphics.beginPath();
        this.detailGraphics.arc(s * 0.85, 0, s * 0.12, 0.4, 1.2);
        this.detailGraphics.stroke();
    }

    drawMutantFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x6622aa;
        const glowColor = 0xaa44ff;
        const fleshColor = 0x9944cc;

        // Shadow
        this.mainGraphics.fillStyle(0x000000, 0.2);
        this.mainGraphics.fillEllipse(s * 0.1, s * 0.15, s * 2, s * 1.2);

        // Multiple irregular tentacle-like tails using ellipses
        this.tailGraphics.fillStyle(darkColor, 0.9);
        this.tailGraphics.fillEllipse(-s * 1.1, -s * 0.15, s * 0.8, s * 0.18);
        this.tailGraphics.fillTriangle(-s * 0.7, 0, -s * 1.5, -s * 0.35, -s * 1.3, 0);

        // Second tentacle
        this.tailGraphics.fillStyle(fleshColor, 0.85);
        this.tailGraphics.fillEllipse(-s * 1.0, s * 0.25, s * 0.7, s * 0.15);
        this.tailGraphics.fillTriangle(-s * 0.65, s * 0.15, -s * 1.4, s * 0.5, -s * 1.2, s * 0.2);

        // Third smaller tentacle
        this.tailGraphics.fillStyle(darkColor, 0.8);
        this.tailGraphics.fillEllipse(-s * 0.95, -s * 0.35, s * 0.5, s * 0.12);
        this.tailGraphics.fillTriangle(-s * 0.6, -s * 0.2, -s * 1.2, -s * 0.6, -s * 1.0, -s * 0.3);

        // Suction cups on tentacles
        this.tailGraphics.fillStyle(glowColor, 0.5);
        for (let i = 0; i < 4; i++) {
            this.tailGraphics.fillCircle(-s * 0.85 - i * s * 0.15, -s * 0.15 - i * s * 0.05, s * 0.06);
            this.tailGraphics.fillCircle(-s * 0.8 - i * s * 0.15, s * 0.25 + i * s * 0.07, s * 0.05);
        }

        // Irregular/asymmetric body
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.85, -s * 0.15);
        this.mainGraphics.lineTo(s * 0.6, -s * 0.5);
        this.mainGraphics.lineTo(s * 0.2, -s * 0.7);
        this.mainGraphics.lineTo(-s * 0.2, -s * 0.75);
        this.mainGraphics.lineTo(-s * 0.55, -s * 0.55);
        this.mainGraphics.lineTo(-s * 0.75, -s * 0.2);
        this.mainGraphics.lineTo(-s * 0.7, s * 0.2);
        this.mainGraphics.lineTo(-s * 0.5, s * 0.55);
        this.mainGraphics.lineTo(-s * 0.15, s * 0.7);
        this.mainGraphics.lineTo(s * 0.3, s * 0.6);
        this.mainGraphics.lineTo(s * 0.6, s * 0.35);
        this.mainGraphics.lineTo(s * 0.8, s * 0.1);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Body inner layer
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.75, -s * 0.1);
        this.mainGraphics.lineTo(s * 0.5, -s * 0.4);
        this.mainGraphics.lineTo(s * 0.15, -s * 0.58);
        this.mainGraphics.lineTo(-s * 0.2, -s * 0.6);
        this.mainGraphics.lineTo(-s * 0.45, -s * 0.42);
        this.mainGraphics.lineTo(-s * 0.6, -s * 0.15);
        this.mainGraphics.lineTo(-s * 0.55, s * 0.2);
        this.mainGraphics.lineTo(-s * 0.35, s * 0.45);
        this.mainGraphics.lineTo(-s * 0.05, s * 0.55);
        this.mainGraphics.lineTo(s * 0.3, s * 0.45);
        this.mainGraphics.lineTo(s * 0.55, s * 0.25);
        this.mainGraphics.lineTo(s * 0.7, s * 0.05);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Weird protrusions/tumors
        this.mainGraphics.fillStyle(fleshColor, 0.9);
        this.mainGraphics.fillCircle(-s * 0.15, -s * 0.75, s * 0.22);
        this.mainGraphics.fillCircle(s * 0.45, s * 0.5, s * 0.18);
        this.mainGraphics.fillCircle(-s * 0.55, s * 0.3, s * 0.15);

        // Protrusion highlights
        this.mainGraphics.fillStyle(glowColor, 0.4);
        this.mainGraphics.fillCircle(-s * 0.2, -s * 0.8, s * 0.1);
        this.mainGraphics.fillCircle(s * 0.4, s * 0.45, s * 0.08);

        // Veins on body
        this.detailGraphics.lineStyle(1.5, darkColor, 0.5);
        this.detailGraphics.lineBetween(s * 0.5, -s * 0.2, -s * 0.3, -s * 0.15);
        this.detailGraphics.lineBetween(s * 0.3, s * 0.3, -s * 0.4, s * 0.2);

        // Multiple eyes (5 eyes - truly mutated)
        const eyePositions = [
            { x: s * 0.45, y: -s * 0.25, size: s * 0.22, iris: 0x440066 },
            { x: s * 0.15, y: -s * 0.5, size: s * 0.16, iris: 0x006644 },
            { x: s * 0.6, y: s * 0.15, size: s * 0.14, iris: 0x664400 },
            { x: -s * 0.1, y: -s * 0.32, size: s * 0.12, iris: 0x440066 },
            { x: s * 0.25, y: s * 0.32, size: s * 0.1, iris: 0x006644 }
        ];

        eyePositions.forEach(eye => {
            // Eye socket shadow
            this.detailGraphics.fillStyle(0x000000, 0.2);
            this.detailGraphics.fillCircle(eye.x + s * 0.02, eye.y + s * 0.02, eye.size * 1.1);

            // Eye white (sickly yellow-green)
            this.detailGraphics.fillStyle(0xccffcc, 1);
            this.detailGraphics.fillCircle(eye.x, eye.y, eye.size);

            // Bloodshot veins
            this.detailGraphics.lineStyle(0.5, 0xff4444, 0.4);
            for (let v = 0; v < 3; v++) {
                const angle = v * 2.1 + eye.x;
                this.detailGraphics.lineBetween(
                    eye.x, eye.y,
                    eye.x + Math.cos(angle) * eye.size * 0.9,
                    eye.y + Math.sin(angle) * eye.size * 0.9
                );
            }

            // Iris
            this.detailGraphics.fillStyle(eye.iris, 1);
            this.detailGraphics.fillCircle(eye.x + eye.size * 0.15, eye.y, eye.size * 0.55);

            // Pupil (slitted like a cat)
            this.detailGraphics.fillStyle(0x000000, 1);
            this.detailGraphics.fillEllipse(eye.x + eye.size * 0.2, eye.y, eye.size * 0.15, eye.size * 0.4);

            // Eye shine
            this.detailGraphics.fillStyle(0xffffff, 0.8);
            this.detailGraphics.fillCircle(eye.x - eye.size * 0.2, eye.y - eye.size * 0.3, eye.size * 0.15);
        });

        // Glitch/distortion effect (digital corruption)
        this.detailGraphics.fillStyle(0xff00ff, 0.35);
        this.detailGraphics.fillRect(-s * 0.45, -s * 0.15, s * 0.35, s * 0.08);
        this.detailGraphics.fillRect(s * 0.2, -s * 0.4, s * 0.2, s * 0.06);
        this.detailGraphics.fillStyle(0x00ffff, 0.35);
        this.detailGraphics.fillRect(s * 0.05, s * 0.15, s * 0.3, s * 0.07);
        this.detailGraphics.fillRect(-s * 0.35, s * 0.4, s * 0.25, s * 0.05);

        // Jagged mouth with teeth
        this.detailGraphics.fillStyle(0x220033, 1);
        this.detailGraphics.fillTriangle(s * 0.55, -s * 0.12, s * 0.95, 0, s * 0.55, s * 0.12);

        // Irregular teeth
        this.detailGraphics.fillStyle(0xffffcc, 1);
        this.detailGraphics.fillTriangle(s * 0.6, -s * 0.08, s * 0.75, -s * 0.02, s * 0.6, s * 0.02);
        this.detailGraphics.fillTriangle(s * 0.65, s * 0.05, s * 0.8, s * 0.02, s * 0.65, s * 0.1);
        this.detailGraphics.fillTriangle(s * 0.7, -s * 0.06, s * 0.85, -s * 0.03, s * 0.72, 0);

        // Drool/slime
        this.detailGraphics.fillStyle(glowColor, 0.4);
        this.detailGraphics.fillEllipse(s * 0.72, s * 0.2, s * 0.08, s * 0.15);
        this.detailGraphics.fillCircle(s * 0.7, s * 0.35, s * 0.05);
    }

    drawToxicFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x006600;
        const poisonColor = 0xaaff00;
        const warningColor = 0xffff00;

        // Shadow
        this.mainGraphics.fillStyle(0x000000, 0.15);
        this.mainGraphics.fillEllipse(s * 0.1, s * 0.15, s * 2.2, s * 1.5);

        // Spiky venomous tail
        this.tailGraphics.fillStyle(darkColor, 1);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.85, 0);
        this.tailGraphics.lineTo(-s * 1.1, -s * 0.15);
        this.tailGraphics.lineTo(-s * 1.5, -s * 0.55);
        this.tailGraphics.lineTo(-s * 1.3, -s * 0.2);
        this.tailGraphics.lineTo(-s * 1.55, -s * 0.3);
        this.tailGraphics.lineTo(-s * 1.35, -s * 0.05);
        this.tailGraphics.lineTo(-s * 1.2, 0);
        this.tailGraphics.lineTo(-s * 1.35, s * 0.05);
        this.tailGraphics.lineTo(-s * 1.55, s * 0.3);
        this.tailGraphics.lineTo(-s * 1.3, s * 0.2);
        this.tailGraphics.lineTo(-s * 1.5, s * 0.55);
        this.tailGraphics.lineTo(-s * 1.1, s * 0.15);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Tail inner color
        this.tailGraphics.fillStyle(color, 0.7);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.9, 0);
        this.tailGraphics.lineTo(-s * 1.25, -s * 0.35);
        this.tailGraphics.lineTo(-s * 1.1, 0);
        this.tailGraphics.lineTo(-s * 1.25, s * 0.35);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Poison drip from tail
        this.tailGraphics.fillStyle(poisonColor, 0.6);
        this.tailGraphics.fillCircle(-s * 1.45, -s * 0.5, s * 0.08);
        this.tailGraphics.fillCircle(-s * 1.5, s * 0.52, s * 0.06);

        // Body with bumpy texture - outer layer
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.95, 0);
        this.mainGraphics.lineTo(s * 0.7, -s * 0.5);
        this.mainGraphics.lineTo(s * 0.2, -s * 0.7);
        this.mainGraphics.lineTo(-s * 0.3, -s * 0.7);
        this.mainGraphics.lineTo(-s * 0.7, -s * 0.5);
        this.mainGraphics.lineTo(-s * 0.85, 0);
        this.mainGraphics.lineTo(-s * 0.7, s * 0.5);
        this.mainGraphics.lineTo(-s * 0.3, s * 0.7);
        this.mainGraphics.lineTo(s * 0.2, s * 0.7);
        this.mainGraphics.lineTo(s * 0.7, s * 0.5);
        this.mainGraphics.lineTo(s * 0.95, 0);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Body inner layer
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.85, 0);
        this.mainGraphics.lineTo(s * 0.6, -s * 0.42);
        this.mainGraphics.lineTo(s * 0.15, -s * 0.58);
        this.mainGraphics.lineTo(-s * 0.25, -s * 0.58);
        this.mainGraphics.lineTo(-s * 0.55, -s * 0.4);
        this.mainGraphics.lineTo(-s * 0.7, 0);
        this.mainGraphics.lineTo(-s * 0.55, s * 0.4);
        this.mainGraphics.lineTo(-s * 0.25, s * 0.58);
        this.mainGraphics.lineTo(s * 0.15, s * 0.58);
        this.mainGraphics.lineTo(s * 0.6, s * 0.42);
        this.mainGraphics.lineTo(s * 0.85, 0);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Warning pattern - diagonal stripes
        this.detailGraphics.fillStyle(warningColor, 0.7);
        for (let i = -3; i <= 2; i++) {
            this.detailGraphics.beginPath();
            const x = i * s * 0.3;
            this.detailGraphics.moveTo(x, -s * 0.5);
            this.detailGraphics.lineTo(x + s * 0.12, -s * 0.5);
            this.detailGraphics.lineTo(x + s * 0.12 + s * 0.15, s * 0.5);
            this.detailGraphics.lineTo(x + s * 0.15, s * 0.5);
            this.detailGraphics.closePath();
            this.detailGraphics.fill();
        }

        // Poison glands/bumps
        const bumpPositions = [
            { x: -s * 0.4, y: -s * 0.35, r: s * 0.18 },
            { x: s * 0.1, y: -s * 0.4, r: s * 0.15 },
            { x: -s * 0.55, y: s * 0.1, r: s * 0.14 },
            { x: s * 0.25, y: s * 0.38, r: s * 0.16 },
            { x: -s * 0.2, y: s * 0.35, r: s * 0.13 },
            { x: s * 0.5, y: -s * 0.2, r: s * 0.12 }
        ];

        bumpPositions.forEach(bump => {
            // Bump base
            this.detailGraphics.fillStyle(darkColor, 0.6);
            this.detailGraphics.fillCircle(bump.x, bump.y, bump.r);
            // Poison glow
            this.detailGraphics.fillStyle(poisonColor, 0.8);
            this.detailGraphics.fillCircle(bump.x, bump.y, bump.r * 0.7);
            // Shine
            this.detailGraphics.fillStyle(0xffffff, 0.4);
            this.detailGraphics.fillCircle(bump.x - bump.r * 0.25, bump.y - bump.r * 0.25, bump.r * 0.25);
        });

        // Venomous dorsal spines
        this.mainGraphics.fillStyle(darkColor, 1);
        for (let i = 0; i < 5; i++) {
            const x = -s * 0.4 + i * s * 0.2;
            const height = s * 0.35 + Math.sin(i * 0.8) * s * 0.1;
            this.mainGraphics.beginPath();
            this.mainGraphics.moveTo(x - s * 0.05, -s * 0.55);
            this.mainGraphics.lineTo(x, -s * 0.55 - height);
            this.mainGraphics.lineTo(x + s * 0.05, -s * 0.55);
            this.mainGraphics.closePath();
            this.mainGraphics.fill();
            // Spine tip - poison
            this.detailGraphics.fillStyle(poisonColor, 0.9);
            this.detailGraphics.fillCircle(x, -s * 0.55 - height, s * 0.04);
        }

        // Side fin with spines
        this.mainGraphics.fillStyle(darkColor, 0.9);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.15, s * 0.45);
        this.mainGraphics.lineTo(-s * 0.1, s * 0.85);
        this.mainGraphics.lineTo(-s * 0.05, s * 0.75);
        this.mainGraphics.lineTo(-s * 0.2, s * 0.9);
        this.mainGraphics.lineTo(-s * 0.15, s * 0.7);
        this.mainGraphics.lineTo(-s * 0.3, s * 0.8);
        this.mainGraphics.lineTo(-s * 0.2, s * 0.55);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Angry warning eye
        this.detailGraphics.fillStyle(0x000000, 0.2);
        this.detailGraphics.fillEllipse(s * 0.55, -s * 0.12, s * 0.32, s * 0.28);

        this.detailGraphics.fillStyle(warningColor, 1);
        this.detailGraphics.fillEllipse(s * 0.55, -s * 0.15, s * 0.28, s * 0.24);

        // Red angry iris
        this.detailGraphics.fillStyle(0xff3300, 1);
        this.detailGraphics.fillCircle(s * 0.6, -s * 0.13, s * 0.13);

        // Pupil - slitted
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillEllipse(s * 0.62, -s * 0.13, s * 0.05, s * 0.12);

        // Angry brow
        this.detailGraphics.lineStyle(2.5, darkColor, 0.9);
        this.detailGraphics.lineBetween(s * 0.38, -s * 0.32, s * 0.7, -s * 0.28);

        // Eye shine
        this.detailGraphics.fillStyle(0xffffff, 0.7);
        this.detailGraphics.fillCircle(s * 0.5, -s * 0.22, s * 0.05);

        // Mean mouth
        this.detailGraphics.lineStyle(2, darkColor, 0.8);
        this.detailGraphics.lineBetween(s * 0.7, s * 0.05, s * 0.85, s * 0.1);
        this.detailGraphics.lineBetween(s * 0.85, s * 0.1, s * 0.9, s * 0.05);

        // Poison dripping from mouth
        this.detailGraphics.fillStyle(poisonColor, 0.7);
        this.detailGraphics.fillEllipse(s * 0.82, s * 0.22, s * 0.06, s * 0.15);
        this.detailGraphics.fillCircle(s * 0.78, s * 0.38, s * 0.05);
    }

    drawAnglerfish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x1a0a2a;
        const fleshColor = 0x2a1a3a;
        const lureColor = 0x00ffff;

        // Shadow
        this.mainGraphics.fillStyle(0x000000, 0.2);
        this.mainGraphics.fillEllipse(s * 0.1, s * 0.15, s * 2.2, s * 2.2);

        // Thin ragged tail
        this.tailGraphics.fillStyle(darkColor, 0.9);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.7, 0);
        this.tailGraphics.lineTo(-s * 0.9, -s * 0.08);
        this.tailGraphics.lineTo(-s * 1.2, -s * 0.35);
        this.tailGraphics.lineTo(-s * 1.1, -s * 0.2);
        this.tailGraphics.lineTo(-s * 1.35, -s * 0.25);
        this.tailGraphics.lineTo(-s * 1.15, -s * 0.1);
        this.tailGraphics.lineTo(-s * 1.3, 0);
        this.tailGraphics.lineTo(-s * 1.15, s * 0.1);
        this.tailGraphics.lineTo(-s * 1.35, s * 0.25);
        this.tailGraphics.lineTo(-s * 1.1, s * 0.2);
        this.tailGraphics.lineTo(-s * 1.2, s * 0.35);
        this.tailGraphics.lineTo(-s * 0.9, s * 0.08);
        this.tailGraphics.lineTo(-s * 0.7, 0);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Small dorsal fin
        this.tailGraphics.fillStyle(darkColor, 0.8);
        this.tailGraphics.fillTriangle(-s * 0.5, -s * 0.7, -s * 0.3, -s * 0.95, -s * 0.15, -s * 0.75);

        // Large bulbous body
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.9, s * 0.1);
        this.mainGraphics.lineTo(s * 0.8, -s * 0.4);
        this.mainGraphics.lineTo(s * 0.3, -s * 0.85);
        this.mainGraphics.lineTo(-s * 0.3, -s * 0.9);
        this.mainGraphics.lineTo(-s * 0.7, -s * 0.65);
        this.mainGraphics.lineTo(-s * 0.9, -s * 0.2);
        this.mainGraphics.lineTo(-s * 0.85, s * 0.3);
        this.mainGraphics.lineTo(-s * 0.5, s * 0.8);
        this.mainGraphics.lineTo(s * 0.1, s * 0.9);
        this.mainGraphics.lineTo(s * 0.6, s * 0.65);
        this.mainGraphics.lineTo(s * 0.9, s * 0.35);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Body inner layer
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.8, s * 0.1);
        this.mainGraphics.lineTo(s * 0.7, -s * 0.35);
        this.mainGraphics.lineTo(s * 0.25, -s * 0.72);
        this.mainGraphics.lineTo(-s * 0.25, -s * 0.78);
        this.mainGraphics.lineTo(-s * 0.6, -s * 0.55);
        this.mainGraphics.lineTo(-s * 0.78, -s * 0.15);
        this.mainGraphics.lineTo(-s * 0.72, s * 0.28);
        this.mainGraphics.lineTo(-s * 0.4, s * 0.68);
        this.mainGraphics.lineTo(s * 0.08, s * 0.78);
        this.mainGraphics.lineTo(s * 0.5, s * 0.55);
        this.mainGraphics.lineTo(s * 0.8, s * 0.3);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Wrinkly texture
        this.detailGraphics.lineStyle(1, darkColor, 0.3);
        this.detailGraphics.beginPath();
        this.detailGraphics.arc(-s * 0.3, -s * 0.2, s * 0.5, -2.5, -1.5);
        this.detailGraphics.stroke();
        this.detailGraphics.beginPath();
        this.detailGraphics.arc(-s * 0.2, s * 0.3, s * 0.4, 1, 2);
        this.detailGraphics.stroke();

        // Bioluminescent lure - illicium (fishing rod)
        this.detailGraphics.lineStyle(3, darkColor, 1);
        this.detailGraphics.lineBetween(s * 0.15, -s * 0.75, s * 0.28, -s * 1.05);
        this.detailGraphics.lineBetween(s * 0.28, -s * 1.05, s * 0.25, -s * 1.35);

        // Lure glow layers
        this.detailGraphics.fillStyle(lureColor, 0.15);
        this.detailGraphics.fillCircle(s * 0.25, -s * 1.4, s * 0.35);
        this.detailGraphics.fillStyle(lureColor, 0.3);
        this.detailGraphics.fillCircle(s * 0.25, -s * 1.4, s * 0.25);
        this.detailGraphics.fillStyle(lureColor, 0.6);
        this.detailGraphics.fillCircle(s * 0.25, -s * 1.4, s * 0.15);
        this.detailGraphics.fillStyle(0xffffff, 0.9);
        this.detailGraphics.fillCircle(s * 0.25, -s * 1.4, s * 0.08);

        // Tendrils from lure
        this.detailGraphics.lineStyle(1, lureColor, 0.5);
        this.detailGraphics.lineBetween(s * 0.25, -s * 1.4, s * 0.1, -s * 1.55);
        this.detailGraphics.lineBetween(s * 0.25, -s * 1.4, s * 0.35, -s * 1.6);
        this.detailGraphics.lineBetween(s * 0.25, -s * 1.4, s * 0.25, -s * 1.6);

        // Big scary mouth - gaping maw
        this.mainGraphics.fillStyle(0x0a0008, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.3, -s * 0.45);
        this.mainGraphics.lineTo(s * 0.6, -s * 0.38);
        this.mainGraphics.lineTo(s * 0.85, -s * 0.15);
        this.mainGraphics.lineTo(s * 0.95, s * 0.1);
        this.mainGraphics.lineTo(s * 0.9, s * 0.35);
        this.mainGraphics.lineTo(s * 0.6, s * 0.55);
        this.mainGraphics.lineTo(s * 0.3, s * 0.6);
        this.mainGraphics.lineTo(s * 0.4, s * 0.3);
        this.mainGraphics.lineTo(s * 0.38, s * 0.1);
        this.mainGraphics.lineTo(s * 0.35, -s * 0.15);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Mouth inner color
        this.mainGraphics.fillStyle(0x1a0515, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.35, -s * 0.35);
        this.mainGraphics.lineTo(s * 0.55, -s * 0.28);
        this.mainGraphics.lineTo(s * 0.72, -s * 0.1);
        this.mainGraphics.lineTo(s * 0.8, s * 0.1);
        this.mainGraphics.lineTo(s * 0.75, s * 0.28);
        this.mainGraphics.lineTo(s * 0.55, s * 0.45);
        this.mainGraphics.lineTo(s * 0.35, s * 0.5);
        this.mainGraphics.lineTo(s * 0.42, s * 0.25);
        this.mainGraphics.lineTo(s * 0.4, s * 0.1);
        this.mainGraphics.lineTo(s * 0.38, -s * 0.1);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Sharp irregular teeth - top row
        this.detailGraphics.fillStyle(0xddddcc, 1);
        const topTeeth = [
            { x: s * 0.35, y: -s * 0.4, h: s * 0.25, w: s * 0.08 },
            { x: s * 0.5, y: -s * 0.35, h: s * 0.35, w: s * 0.1 },
            { x: s * 0.65, y: -s * 0.28, h: s * 0.28, w: s * 0.08 },
            { x: s * 0.78, y: -s * 0.18, h: s * 0.22, w: s * 0.07 },
            { x: s * 0.88, y: -s * 0.05, h: s * 0.18, w: s * 0.06 }
        ];
        topTeeth.forEach(tooth => {
            this.detailGraphics.beginPath();
            this.detailGraphics.moveTo(tooth.x - tooth.w / 2, tooth.y);
            this.detailGraphics.lineTo(tooth.x, tooth.y + tooth.h);
            this.detailGraphics.lineTo(tooth.x + tooth.w / 2, tooth.y);
            this.detailGraphics.closePath();
            this.detailGraphics.fill();
        });

        // Bottom teeth
        const bottomTeeth = [
            { x: s * 0.38, y: s * 0.52, h: -s * 0.22, w: s * 0.08 },
            { x: s * 0.52, y: s * 0.48, h: -s * 0.3, w: s * 0.09 },
            { x: s * 0.68, y: s * 0.42, h: -s * 0.25, w: s * 0.08 },
            { x: s * 0.82, y: s * 0.32, h: -s * 0.2, w: s * 0.07 }
        ];
        bottomTeeth.forEach(tooth => {
            this.detailGraphics.beginPath();
            this.detailGraphics.moveTo(tooth.x - tooth.w / 2, tooth.y);
            this.detailGraphics.lineTo(tooth.x, tooth.y + tooth.h);
            this.detailGraphics.lineTo(tooth.x + tooth.w / 2, tooth.y);
            this.detailGraphics.closePath();
            this.detailGraphics.fill();
        });

        // Side spines/barbels
        this.detailGraphics.lineStyle(2, darkColor, 0.8);
        this.detailGraphics.lineBetween(-s * 0.6, -s * 0.4, -s * 0.85, -s * 0.6);
        this.detailGraphics.lineBetween(-s * 0.7, s * 0.2, -s * 0.95, s * 0.35);

        // Small evil eye - deep set
        this.detailGraphics.fillStyle(0x000000, 0.3);
        this.detailGraphics.fillCircle(-s * 0.25, -s * 0.45, s * 0.18);

        this.detailGraphics.fillStyle(0x220000, 1);
        this.detailGraphics.fillCircle(-s * 0.25, -s * 0.48, s * 0.14);

        this.detailGraphics.fillStyle(0xff2200, 1);
        this.detailGraphics.fillCircle(-s * 0.23, -s * 0.48, s * 0.1);

        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(-s * 0.22, -s * 0.48, s * 0.05);

        // Evil eye glow
        this.detailGraphics.fillStyle(0xff0000, 0.3);
        this.detailGraphics.fillCircle(-s * 0.25, -s * 0.48, s * 0.2);

        // Eye shine
        this.detailGraphics.fillStyle(0xffffff, 0.5);
        this.detailGraphics.fillCircle(-s * 0.3, -s * 0.52, s * 0.03);

        // Pectoral fin
        this.mainGraphics.fillStyle(fleshColor, 0.8);
        this.mainGraphics.fillTriangle(
            -s * 0.4, s * 0.4,
            -s * 0.55, s * 0.85,
            -s * 0.35, s * 0.5
        );
    }

    drawJellyfish() {
        const s = this.size;
        const color = this.config.color;
        const innerColor = 0xffaaff;
        const glowColor = 0xff88ff;

        // No tail needed for jellyfish
        this.tailGraphics.clear();

        // Outer glow
        this.mainGraphics.fillStyle(color, 0.1);
        this.mainGraphics.fillEllipse(0, -s * 0.1, s * 2.2, s * 1.6);

        // Bell/dome - outer layer (use arc for dome shape)
        this.mainGraphics.fillStyle(color, 0.5);
        // Upper dome
        this.mainGraphics.slice(0, -s * 0.2, s * 0.95, Math.PI, 0, false);
        this.mainGraphics.fillPath();
        // Lower rim
        this.mainGraphics.fillRect(-s * 0.9, -s * 0.2, s * 1.8, s * 0.4);

        // Bell inner layer
        this.mainGraphics.fillStyle(innerColor, 0.4);
        this.mainGraphics.slice(0, -s * 0.15, s * 0.75, Math.PI, 0, false);
        this.mainGraphics.fillPath();
        this.mainGraphics.fillRect(-s * 0.7, -s * 0.15, s * 1.4, s * 0.3);

        // Glowing center/gonads
        this.mainGraphics.fillStyle(glowColor, 0.6);
        this.mainGraphics.fillEllipse(0, -s * 0.25, s * 0.7, s * 0.45);

        this.mainGraphics.fillStyle(0xffffff, 0.4);
        this.mainGraphics.fillEllipse(0, -s * 0.3, s * 0.4, s * 0.25);

        // Radial canals
        this.detailGraphics.lineStyle(1.5, glowColor, 0.4);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI - Math.PI / 2;
            const startX = Math.cos(angle) * s * 0.2;
            const startY = -s * 0.25 + Math.sin(angle) * s * 0.15;
            const endX = Math.cos(angle) * s * 0.75;
            const endY = Math.sin(angle) * s * 0.5;
            this.detailGraphics.beginPath();
            this.detailGraphics.moveTo(startX, startY);
            this.detailGraphics.lineTo(endX, endY);
            this.detailGraphics.stroke();
        }

        // Bell rim/margin
        this.mainGraphics.fillStyle(color, 0.7);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(-s * 0.9, s * 0.2);
        for (let i = 0; i <= 12; i++) {
            const angle = Math.PI + (i / 12) * Math.PI;
            const rx = Math.cos(angle) * s * 0.9;
            const ry = s * 0.2 + Math.sin(i * 0.8) * s * 0.08;
            if (i % 2 === 0) {
                this.mainGraphics.lineTo(rx, ry + s * 0.15);
            } else {
                this.mainGraphics.lineTo(rx, ry);
            }
        }
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Oral arms (thick central tentacles) - using overlapping ellipses
        this.detailGraphics.fillStyle(innerColor, 0.5);
        for (let i = 0; i < 4; i++) {
            const ox = (i - 1.5) * s * 0.35;
            // Arm segments using ellipses
            this.detailGraphics.fillEllipse(ox, s * 0.5, s * 0.1, s * 0.25);
            this.detailGraphics.fillEllipse(ox + s * 0.02, s * 0.85, s * 0.08, s * 0.25);
            this.detailGraphics.fillEllipse(ox - s * 0.02, s * 1.15, s * 0.06, s * 0.2);
        }

        // Thin stinging tentacles
        this.detailGraphics.lineStyle(1.5, color, 0.6);
        for (let i = 0; i < 12; i++) {
            const tx = (i - 5.5) * s * 0.15;
            const waveAmp = s * 0.15 + Math.sin(i * 0.7) * s * 0.08;
            const length = s * 1.2 + Math.sin(i * 1.3) * s * 0.4;

            this.detailGraphics.beginPath();
            this.detailGraphics.moveTo(tx, s * 0.35);

            // Wavy tentacle path
            let currentY = s * 0.35;
            let currentX = tx;
            const segments = 4;
            for (let j = 1; j <= segments; j++) {
                const segY = s * 0.35 + (length / segments) * j;
                const wave = Math.sin(j * 1.5 + i * 0.5) * waveAmp;
                this.detailGraphics.lineTo(currentX + wave, segY);
                currentX = currentX + wave * 0.3;
            }
            this.detailGraphics.stroke();

            // Nematocysts (stinging cells) - small dots
            if (i % 2 === 0) {
                this.detailGraphics.fillStyle(glowColor, 0.5);
                this.detailGraphics.fillCircle(tx, s * 0.6 + Math.sin(i) * s * 0.1, s * 0.03);
                this.detailGraphics.fillCircle(tx + waveAmp * 0.5, s * 1.0, s * 0.025);
            }
        }

        // Bell highlight/shine
        this.detailGraphics.fillStyle(0xffffff, 0.3);
        this.detailGraphics.fillEllipse(-s * 0.2, -s * 0.55, s * 0.5, s * 0.2);

        // Secondary shine
        this.detailGraphics.fillStyle(0xffffff, 0.2);
        this.detailGraphics.fillEllipse(s * 0.4, -s * 0.35, s * 0.2, s * 0.15);

        // Bioluminescent spots
        this.detailGraphics.fillStyle(0xffffff, 0.6);
        this.detailGraphics.fillCircle(-s * 0.3, -s * 0.15, s * 0.04);
        this.detailGraphics.fillCircle(s * 0.25, -s * 0.1, s * 0.035);
        this.detailGraphics.fillCircle(0, -s * 0.4, s * 0.03);
    }

    drawShark() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x3a3a55;
        const bellyColor = 0xcccccc;
        const lightColor = 0x777799;

        // Shadow
        this.mainGraphics.fillStyle(0x000000, 0.2);
        this.mainGraphics.fillEllipse(s * 0.1, s * 0.15, s * 1.8, s * 0.9);

        // Powerful crescent tail
        this.tailGraphics.fillStyle(darkColor, 1);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.5, 0);
        this.tailGraphics.lineTo(-s * 0.7, -s * 0.2);
        this.tailGraphics.lineTo(-s * 1.3, -s * 0.8);
        this.tailGraphics.lineTo(-s * 1.1, -s * 0.3);
        this.tailGraphics.lineTo(-s * 0.9, 0);
        this.tailGraphics.lineTo(-s * 1.0, s * 0.2);
        this.tailGraphics.lineTo(-s * 1.2, s * 0.6);
        this.tailGraphics.lineTo(-s * 0.7, s * 0.15);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Tail highlight
        this.tailGraphics.fillStyle(color, 0.6);
        this.tailGraphics.fillTriangle(-s * 0.6, 0, -s * 1.1, -s * 0.6, -s * 0.9, -s * 0.1);

        // Streamlined body - torpedo shape
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 1.1, 0);
        this.mainGraphics.lineTo(s * 0.95, -s * 0.3);
        this.mainGraphics.lineTo(s * 0.6, -s * 0.45);
        this.mainGraphics.lineTo(s * 0.2, -s * 0.5);
        this.mainGraphics.lineTo(-s * 0.5, -s * 0.4);
        this.mainGraphics.lineTo(-s * 0.5, s * 0.35);
        this.mainGraphics.lineTo(s * 0.2, s * 0.5);
        this.mainGraphics.lineTo(s * 0.6, s * 0.42);
        this.mainGraphics.lineTo(s * 0.95, s * 0.25);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Body top highlight
        this.mainGraphics.fillStyle(lightColor, 0.5);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.9, -s * 0.1);
        this.mainGraphics.lineTo(s * 0.55, -s * 0.32);
        this.mainGraphics.lineTo(0, -s * 0.38);
        this.mainGraphics.lineTo(-s * 0.4, -s * 0.3);
        this.mainGraphics.lineTo(-s * 0.3, -s * 0.15);
        this.mainGraphics.lineTo(s * 0.3, -s * 0.18);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // White belly with gradient
        this.mainGraphics.fillStyle(bellyColor, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.95, s * 0.05);
        this.mainGraphics.lineTo(s * 0.6, s * 0.3);
        this.mainGraphics.lineTo(s * 0.1, s * 0.4);
        this.mainGraphics.lineTo(-s * 0.45, s * 0.32);
        this.mainGraphics.lineTo(-s * 0.45, s * 0.1);
        this.mainGraphics.lineTo(s * 0.3, s * 0.12);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Iconic dorsal fin
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.1, -s * 0.5);
        this.mainGraphics.lineTo(-s * 0.05, -s * 1.1);
        this.mainGraphics.lineTo(-s * 0.35, -s * 0.5);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Dorsal fin highlight
        this.mainGraphics.fillStyle(color, 0.4);
        this.mainGraphics.fillTriangle(s * 0.05, -s * 0.55, -s * 0.02, -s * 0.95, -s * 0.15, -s * 0.55);

        // Second smaller dorsal
        this.mainGraphics.fillStyle(darkColor, 0.9);
        this.mainGraphics.fillTriangle(-s * 0.35, -s * 0.4, -s * 0.4, -s * 0.6, -s * 0.5, -s * 0.4);

        // Pectoral fins (side fins)
        this.mainGraphics.fillStyle(darkColor, 0.95);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.2, s * 0.25);
        this.mainGraphics.lineTo(-s * 0.1, s * 0.9);
        this.mainGraphics.lineTo(-s * 0.35, s * 0.8);
        this.mainGraphics.lineTo(-s * 0.15, s * 0.3);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Anal fin
        this.mainGraphics.fillStyle(darkColor, 0.9);
        this.mainGraphics.fillTriangle(-s * 0.3, s * 0.32, -s * 0.35, s * 0.5, -s * 0.45, s * 0.32);

        // Gill slits (5 slits like real shark)
        this.detailGraphics.lineStyle(2, darkColor, 0.7);
        for (let i = 0; i < 5; i++) {
            const gx = s * 0.45 - i * s * 0.12;
            const curve = Math.sin(i * 0.3) * s * 0.03;
            this.detailGraphics.beginPath();
            this.detailGraphics.moveTo(gx + curve, -s * 0.25);
            this.detailGraphics.lineTo(gx - curve, s * 0.2);
            this.detailGraphics.stroke();
        }

        // Lateral line
        this.detailGraphics.lineStyle(1, darkColor, 0.3);
        this.detailGraphics.lineBetween(s * 0.8, 0, s * 0.3, -s * 0.08);
        this.detailGraphics.lineBetween(s * 0.3, -s * 0.08, -s * 0.4, -s * 0.05);

        // Snout detail
        this.mainGraphics.fillStyle(darkColor, 0.3);
        this.mainGraphics.fillEllipse(s * 0.95, 0, s * 0.2, s * 0.15);

        // Nostril
        this.detailGraphics.fillStyle(0x222222, 0.6);
        this.detailGraphics.fillEllipse(s * 0.85, -s * 0.08, s * 0.08, s * 0.05);

        // Cold predator eye
        this.detailGraphics.fillStyle(0x000000, 0.3);
        this.detailGraphics.fillEllipse(s * 0.6, -s * 0.18, s * 0.18, s * 0.14);
        this.detailGraphics.fillStyle(0x111122, 1);
        this.detailGraphics.fillEllipse(s * 0.6, -s * 0.18, s * 0.14, s * 0.11);
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillEllipse(s * 0.62, -s * 0.18, s * 0.08, s * 0.09);

        // Subtle eye shine
        this.detailGraphics.fillStyle(0xffffff, 0.3);
        this.detailGraphics.fillCircle(s * 0.56, -s * 0.22, s * 0.03);

        // Teeth hint at mouth
        this.detailGraphics.lineStyle(1, 0x222222, 0.5);
        this.detailGraphics.beginPath();
        this.detailGraphics.arc(s * 0.95, s * 0.12, s * 0.12, 0.2, Math.PI - 0.2);
        this.detailGraphics.stroke();

        // Scarring/texture
        this.detailGraphics.lineStyle(1, darkColor, 0.15);
        this.detailGraphics.lineBetween(s * 0.2, -s * 0.3, s * 0.4, -s * 0.25);
        this.detailGraphics.lineBetween(-s * 0.1, -s * 0.35, s * 0.1, -s * 0.32);
    }

    drawElectricEel() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x004466;
        const electricColor = 0xffff44;
        const bellyColor = 0xffcc88;

        // Shadow
        this.mainGraphics.fillStyle(0x000000, 0.15);
        this.mainGraphics.fillEllipse(s * 0.05, s * 0.1, s * 2.8, s * 0.55);

        // Long serpentine tail - tapers
        this.tailGraphics.fillStyle(darkColor, 1);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.95, -s * 0.18);
        this.tailGraphics.lineTo(-s * 1.3, -s * 0.1);
        this.tailGraphics.lineTo(-s * 1.6, -s * 0.05);
        this.tailGraphics.lineTo(-s * 1.7, 0);
        this.tailGraphics.lineTo(-s * 1.6, s * 0.05);
        this.tailGraphics.lineTo(-s * 1.3, s * 0.1);
        this.tailGraphics.lineTo(-s * 0.95, s * 0.18);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Tail inner
        this.tailGraphics.fillStyle(color, 0.8);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 1.0, -s * 0.12);
        this.tailGraphics.lineTo(-s * 1.3, -s * 0.06);
        this.tailGraphics.lineTo(-s * 1.55, -s * 0.02);
        this.tailGraphics.lineTo(-s * 1.55, s * 0.02);
        this.tailGraphics.lineTo(-s * 1.3, s * 0.06);
        this.tailGraphics.lineTo(-s * 1.0, s * 0.12);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Tail fin (continuous dorsal/anal)
        this.tailGraphics.fillStyle(darkColor, 0.7);
        this.tailGraphics.fillTriangle(
            -s * 1.2, -s * 0.08,
            -s * 1.65, -s * 0.12,
            -s * 1.55, -s * 0.05
        );

        // Long eel body - outer layer
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 1.1, 0);
        this.mainGraphics.lineTo(s * 1.0, -s * 0.18);
        this.mainGraphics.lineTo(s * 0.5, -s * 0.28);
        this.mainGraphics.lineTo(-s * 0.5, -s * 0.25);
        this.mainGraphics.lineTo(-s * 1.0, -s * 0.2);
        this.mainGraphics.lineTo(-s * 1.0, s * 0.2);
        this.mainGraphics.lineTo(-s * 0.5, s * 0.25);
        this.mainGraphics.lineTo(s * 0.5, s * 0.28);
        this.mainGraphics.lineTo(s * 1.0, s * 0.18);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Body inner layer
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 1.0, 0);
        this.mainGraphics.lineTo(s * 0.9, -s * 0.15);
        this.mainGraphics.lineTo(s * 0.45, -s * 0.22);
        this.mainGraphics.lineTo(-s * 0.5, -s * 0.2);
        this.mainGraphics.lineTo(-s * 0.9, -s * 0.16);
        this.mainGraphics.lineTo(-s * 0.9, s * 0.16);
        this.mainGraphics.lineTo(-s * 0.5, s * 0.2);
        this.mainGraphics.lineTo(s * 0.45, s * 0.22);
        this.mainGraphics.lineTo(s * 0.9, s * 0.15);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Belly - lighter
        this.mainGraphics.fillStyle(bellyColor, 0.5);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.9, s * 0.08);
        this.mainGraphics.lineTo(s * 0.5, s * 0.15);
        this.mainGraphics.lineTo(0, s * 0.18);
        this.mainGraphics.lineTo(-s * 0.8, s * 0.14);
        this.mainGraphics.lineTo(-s * 0.8, s * 0.05);
        this.mainGraphics.lineTo(0, s * 0.08);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Electric organ sections (visible through skin)
        this.detailGraphics.fillStyle(electricColor, 0.25);
        for (let i = 0; i < 6; i++) {
            const x = -s * 0.6 + i * s * 0.3;
            this.detailGraphics.fillRect(x, -s * 0.12, s * 0.2, s * 0.24);
        }

        // Electric organ lines
        this.detailGraphics.lineStyle(1, darkColor, 0.3);
        for (let i = 0; i < 7; i++) {
            const x = -s * 0.75 + i * s * 0.3;
            this.detailGraphics.lineBetween(x, -s * 0.18, x, s * 0.18);
        }

        // Electric discharge pattern
        this.detailGraphics.lineStyle(2.5, electricColor, 0.9);
        this.detailGraphics.beginPath();
        this.detailGraphics.moveTo(-s * 0.7, 0);
        let lastX = -s * 0.7;
        let lastY = 0;
        for (let i = 1; i <= 8; i++) {
            const x = -s * 0.7 + i * s * 0.2;
            const y = (i % 2 === 0 ? -1 : 1) * s * 0.12;
            this.detailGraphics.lineTo(x, y);
            lastX = x;
            lastY = y;
        }
        this.detailGraphics.stroke();

        // Electric glow along pattern
        this.detailGraphics.lineStyle(5, electricColor, 0.2);
        this.detailGraphics.beginPath();
        this.detailGraphics.moveTo(-s * 0.7, 0);
        for (let i = 1; i <= 8; i++) {
            const x = -s * 0.7 + i * s * 0.2;
            const y = (i % 2 === 0 ? -1 : 1) * s * 0.12;
            this.detailGraphics.lineTo(x, y);
        }
        this.detailGraphics.stroke();

        // Electric nodes
        this.detailGraphics.fillStyle(electricColor, 0.8);
        for (let i = 0; i < 5; i++) {
            const x = -s * 0.5 + i * s * 0.35;
            this.detailGraphics.fillCircle(x, 0, s * 0.06);
            // Node glow
            this.detailGraphics.fillStyle(electricColor, 0.3);
            this.detailGraphics.fillCircle(x, 0, s * 0.12);
            this.detailGraphics.fillStyle(electricColor, 0.8);
        }

        // Lateral line
        this.detailGraphics.lineStyle(1, darkColor, 0.4);
        this.detailGraphics.lineBetween(s * 0.9, -s * 0.05, s * 0.3, -s * 0.07);
        this.detailGraphics.lineBetween(s * 0.3, -s * 0.07, -s * 0.8, -s * 0.06);

        // Continuous dorsal fin
        this.mainGraphics.fillStyle(darkColor, 0.7);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.5, -s * 0.22);
        for (let i = 0; i < 8; i++) {
            const x = s * 0.5 - i * s * 0.2;
            const h = s * 0.08 + Math.sin(i * 0.8) * s * 0.04;
            this.mainGraphics.lineTo(x - s * 0.05, -s * 0.22 - h);
            this.mainGraphics.lineTo(x - s * 0.1, -s * 0.22);
        }
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Head detail
        this.mainGraphics.fillStyle(darkColor, 0.5);
        this.mainGraphics.fillEllipse(s * 0.95, 0, s * 0.2, s * 0.15);

        // Gill opening
        this.detailGraphics.lineStyle(2, darkColor, 0.5);
        this.detailGraphics.beginPath();
        this.detailGraphics.arc(s * 0.7, 0, s * 0.12, -0.6, 0.6);
        this.detailGraphics.stroke();

        // Electric eye with glow
        this.detailGraphics.fillStyle(electricColor, 0.3);
        this.detailGraphics.fillCircle(s * 0.88, -s * 0.06, s * 0.15);

        this.detailGraphics.fillStyle(0x111111, 1);
        this.detailGraphics.fillCircle(s * 0.88, -s * 0.06, s * 0.1);

        this.detailGraphics.fillStyle(electricColor, 1);
        this.detailGraphics.fillCircle(s * 0.9, -s * 0.06, s * 0.07);

        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.91, -s * 0.06, s * 0.035);

        // Eye shine
        this.detailGraphics.fillStyle(0xffffff, 0.8);
        this.detailGraphics.fillCircle(s * 0.85, -s * 0.1, s * 0.025);

        // Mouth
        this.detailGraphics.lineStyle(1.5, darkColor, 0.7);
        this.detailGraphics.lineBetween(s * 0.95, s * 0.02, s * 1.02, s * 0.04);
        this.detailGraphics.lineBetween(s * 1.02, s * 0.04, s * 1.1, s * 0.02);

        // Nostril
        this.detailGraphics.fillStyle(0x002233, 1);
        this.detailGraphics.fillEllipse(s * 1.0, -s * 0.03, s * 0.04, s * 0.025);
    }

    drawCamouflageFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x4a3a2a;
        const lightColor = 0x8a7a6a;
        const mossColor = 0x4a5a3a;
        const sandColor = 0xaa9a7a;

        // Shadow - irregular
        this.mainGraphics.fillStyle(0x000000, 0.15);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.85, s * 0.15);
        this.mainGraphics.lineTo(s * 0.45, -s * 0.4);
        this.mainGraphics.lineTo(-s * 0.3, -s * 0.55);
        this.mainGraphics.lineTo(-s * 0.75, -s * 0.2);
        this.mainGraphics.lineTo(-s * 0.85, s * 0.35);
        this.mainGraphics.lineTo(-s * 0.35, s * 0.65);
        this.mainGraphics.lineTo(s * 0.4, s * 0.55);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Ragged, rock-like tail
        this.tailGraphics.fillStyle(darkColor, 0.85);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-s * 0.7, 0);
        this.tailGraphics.lineTo(-s * 0.9, -s * 0.15);
        this.tailGraphics.lineTo(-s * 1.2, -s * 0.35);
        this.tailGraphics.lineTo(-s * 1.05, -s * 0.2);
        this.tailGraphics.lineTo(-s * 1.35, -s * 0.25);
        this.tailGraphics.lineTo(-s * 1.15, -s * 0.08);
        this.tailGraphics.lineTo(-s * 1.4, 0);
        this.tailGraphics.lineTo(-s * 1.15, s * 0.08);
        this.tailGraphics.lineTo(-s * 1.35, s * 0.25);
        this.tailGraphics.lineTo(-s * 1.05, s * 0.2);
        this.tailGraphics.lineTo(-s * 1.2, s * 0.35);
        this.tailGraphics.lineTo(-s * 0.9, s * 0.15);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Tail texture
        this.tailGraphics.fillStyle(lightColor, 0.4);
        this.tailGraphics.fillCircle(-s * 1.1, -s * 0.1, s * 0.1);
        this.tailGraphics.fillCircle(-s * 1.0, s * 0.12, s * 0.08);

        // Irregular rocky body shape - outer layer
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.85, 0);
        this.mainGraphics.lineTo(s * 0.7, -s * 0.25);
        this.mainGraphics.lineTo(s * 0.45, -s * 0.5);
        this.mainGraphics.lineTo(s * 0.2, -s * 0.6);
        this.mainGraphics.lineTo(-s * 0.15, -s * 0.65);
        this.mainGraphics.lineTo(-s * 0.45, -s * 0.55);
        this.mainGraphics.lineTo(-s * 0.7, -s * 0.35);
        this.mainGraphics.lineTo(-s * 0.8, -s * 0.1);
        this.mainGraphics.lineTo(-s * 0.75, s * 0.2);
        this.mainGraphics.lineTo(-s * 0.55, s * 0.45);
        this.mainGraphics.lineTo(-s * 0.25, s * 0.55);
        this.mainGraphics.lineTo(s * 0.15, s * 0.5);
        this.mainGraphics.lineTo(s * 0.5, s * 0.35);
        this.mainGraphics.lineTo(s * 0.75, s * 0.15);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Body inner layer
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.75, 0);
        this.mainGraphics.lineTo(s * 0.6, -s * 0.2);
        this.mainGraphics.lineTo(s * 0.35, -s * 0.42);
        this.mainGraphics.lineTo(s * 0.1, -s * 0.5);
        this.mainGraphics.lineTo(-s * 0.2, -s * 0.52);
        this.mainGraphics.lineTo(-s * 0.45, -s * 0.42);
        this.mainGraphics.lineTo(-s * 0.62, -s * 0.25);
        this.mainGraphics.lineTo(-s * 0.68, 0);
        this.mainGraphics.lineTo(-s * 0.6, s * 0.25);
        this.mainGraphics.lineTo(-s * 0.4, s * 0.4);
        this.mainGraphics.lineTo(-s * 0.1, s * 0.45);
        this.mainGraphics.lineTo(s * 0.25, s * 0.38);
        this.mainGraphics.lineTo(s * 0.55, s * 0.22);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Rock-like bumps and protrusions
        const bumps = [
            { x: -s * 0.1, y: -s * 0.55, r: s * 0.15 },
            { x: -s * 0.5, y: -s * 0.35, r: s * 0.12 },
            { x: s * 0.35, y: -s * 0.35, r: s * 0.14 },
            { x: -s * 0.55, y: s * 0.2, r: s * 0.13 },
            { x: s * 0.1, y: s * 0.4, r: s * 0.11 }
        ];
        bumps.forEach(bump => {
            this.mainGraphics.fillStyle(darkColor, 0.8);
            this.mainGraphics.fillCircle(bump.x, bump.y, bump.r);
            this.mainGraphics.fillStyle(color, 0.6);
            this.mainGraphics.fillCircle(bump.x - bump.r * 0.2, bump.y - bump.r * 0.2, bump.r * 0.7);
        });

        // Moss/algae patches
        this.detailGraphics.fillStyle(mossColor, 0.5);
        this.detailGraphics.fillEllipse(-s * 0.2, -s * 0.47, s * 0.2, s * 0.1);

        this.detailGraphics.fillStyle(mossColor, 0.4);
        this.detailGraphics.fillEllipse(-s * 0.5, s * 0.1, s * 0.2, s * 0.15);
        this.detailGraphics.fillEllipse(s * 0.2, -s * 0.3, s * 0.15, s * 0.1);

        // Rock texture - cracks and lines
        this.detailGraphics.lineStyle(1, darkColor, 0.4);
        this.detailGraphics.lineBetween(-s * 0.3, -s * 0.3, -s * 0.1, -s * 0.1);
        this.detailGraphics.lineBetween(-s * 0.1, -s * 0.1, s * 0.1, -s * 0.15);
        this.detailGraphics.lineBetween(s * 0.2, s * 0.1, s * 0.4, s * 0.05);
        this.detailGraphics.lineBetween(-s * 0.4, s * 0.2, -s * 0.2, s * 0.3);

        // Sand/sediment spots
        this.detailGraphics.fillStyle(sandColor, 0.5);
        const sandSpots = [
            { x: -s * 0.25, y: -s * 0.15, r: s * 0.18 },
            { x: s * 0.3, y: s * 0.15, r: s * 0.2 },
            { x: s * 0.05, y: -s * 0.35, r: s * 0.12 },
            { x: -s * 0.45, y: s * 0.3, r: s * 0.14 }
        ];
        sandSpots.forEach(spot => {
            this.detailGraphics.fillCircle(spot.x, spot.y, spot.r);
        });

        // Darker patches for depth
        this.detailGraphics.fillStyle(darkColor, 0.4);
        this.detailGraphics.fillCircle(s * 0.15, s * 0.05, s * 0.22);
        this.detailGraphics.fillCircle(-s * 0.35, -s * 0.2, s * 0.16);

        // Pebble texture
        this.detailGraphics.fillStyle(lightColor, 0.35);
        for (let i = 0; i < 8; i++) {
            const px = -s * 0.5 + Math.sin(i * 1.7) * s * 0.6;
            const py = -s * 0.3 + Math.cos(i * 2.1) * s * 0.35;
            const pr = s * 0.05 + Math.sin(i * 0.8) * s * 0.03;
            this.detailGraphics.fillCircle(px, py, pr);
        }

        // Ragged dorsal fin (like coral/rock growth)
        this.mainGraphics.fillStyle(darkColor, 0.75);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.3, -s * 0.45);
        this.mainGraphics.lineTo(s * 0.2, -s * 0.7);
        this.mainGraphics.lineTo(s * 0.1, -s * 0.55);
        this.mainGraphics.lineTo(0, -s * 0.75);
        this.mainGraphics.lineTo(-s * 0.1, -s * 0.6);
        this.mainGraphics.lineTo(-s * 0.25, -s * 0.8);
        this.mainGraphics.lineTo(-s * 0.35, -s * 0.55);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Fin texture
        this.detailGraphics.fillStyle(mossColor, 0.3);
        this.detailGraphics.fillCircle(s * 0.1, -s * 0.6, s * 0.06);
        this.detailGraphics.fillCircle(-s * 0.15, -s * 0.65, s * 0.05);

        // Hidden pectoral fin
        this.mainGraphics.fillStyle(darkColor, 0.6);
        this.mainGraphics.fillTriangle(
            s * 0.35, s * 0.25,
            -s * 0.1, s * 0.55,
            s * 0.3, s * 0.3
        );

        // Camouflaged eye - very well hidden
        // Eye socket blends with rock
        this.detailGraphics.fillStyle(darkColor, 0.5);
        this.detailGraphics.fillCircle(s * 0.55, -s * 0.12, s * 0.18);

        // Eye itself - small and subtle
        this.detailGraphics.fillStyle(sandColor, 0.9);
        this.detailGraphics.fillCircle(s * 0.55, -s * 0.15, s * 0.12);

        // Iris matches rock
        this.detailGraphics.fillStyle(0x6a5a4a, 1);
        this.detailGraphics.fillCircle(s * 0.58, -s * 0.14, s * 0.08);

        // Pupil
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.59, -s * 0.14, s * 0.04);

        // Tiny eye shine
        this.detailGraphics.fillStyle(0xffffff, 0.5);
        this.detailGraphics.fillCircle(s * 0.53, -s * 0.18, s * 0.025);

        // Hidden mouth - downturned, grumpy
        this.detailGraphics.lineStyle(2, darkColor, 0.6);
        this.detailGraphics.lineBetween(s * 0.6, s * 0.05, s * 0.72, s * 0.08);
        this.detailGraphics.lineBetween(s * 0.72, s * 0.08, s * 0.8, s * 0.02);

        // Barnacle detail
        this.detailGraphics.fillStyle(lightColor, 0.6);
        this.detailGraphics.fillCircle(-s * 0.55, -s * 0.1, s * 0.08);
        this.detailGraphics.fillCircle(-s * 0.58, -s * 0.08, s * 0.04);
        this.detailGraphics.fillStyle(darkColor, 0.5);
        this.detailGraphics.fillCircle(-s * 0.55, -s * 0.1, s * 0.03);
    }

    animateFish(time, delta) {
        this.animTime += 0.016;
        this.glowPulse += 0.03;

        // Tail animation - speed based
        const speed = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
        const tailSpeed = 6 + (speed / this.speed) * 6;
        const tailWag = Math.sin(this.animTime * tailSpeed) * (0.1 + speed / this.speed * 0.15);
        this.tailGraphics.rotation = tailWag;

        // Ambient glow pulse
        const glowAlpha = 0.1 + Math.sin(this.glowPulse) * 0.05;
        this.ambientGlow.clear();
        this.ambientGlow.fillStyle(this.config.color, glowAlpha);
        this.ambientGlow.fillEllipse(0, 0, this.size * 3, this.size * 2);

        // Update bubbles
        this.bubbleTimer -= delta || 16;
        if (this.bubbleTimer <= 0 && speed > this.speed * 0.3) {
            this.bubbleTimer = 300 + Math.random() * 400;
            const bubble = this.bubbles.find(b => b.life <= 0);
            if (bubble) {
                bubble.x = -this.size;
                bubble.y = (Math.random() - 0.5) * this.size;
                bubble.life = 1;
                bubble.graphics.visible = true;
            }
        }

        this.bubbles.forEach(bubble => {
            if (bubble.life > 0) {
                bubble.life -= 0.02;
                bubble.x -= 0.5;
                bubble.y -= 0.3;

                bubble.graphics.clear();
                bubble.graphics.fillStyle(0xaaddff, bubble.life * 0.4);
                bubble.graphics.fillCircle(bubble.x, bubble.y, 2 + bubble.life * 2);
                bubble.graphics.fillStyle(0xffffff, bubble.life * 0.5);
                bubble.graphics.fillCircle(bubble.x - 1, bubble.y - 1, 1);

                if (bubble.life <= 0) {
                    bubble.graphics.visible = false;
                }
            }
        });

        // Special animations per type
        if (this.type === 'LUMINOUS' && this.glowGraphics) {
            // Pulsing glow
            const pulse = 0.8 + Math.sin(this.animTime * 3) * 0.2;
            this.glowGraphics.alpha = pulse;

            // Update light particles
            this.detailGraphics.clear();
            this.detailGraphics.fillStyle(0xffffff, 0.8);
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + this.animTime * 0.5;
                const dist = this.size * 1.3 + Math.sin(this.animTime * 2 + i) * this.size * 0.3;
                this.detailGraphics.fillCircle(
                    Math.cos(angle) * dist,
                    Math.sin(angle) * dist,
                    1.5 + Math.sin(this.animTime * 3 + i) * 0.5
                );
            }

            // Redraw eyes
            const s = this.size;
            this.detailGraphics.fillStyle(0xffffff, 0.9);
            this.detailGraphics.fillCircle(s * 0.4, -s * 0.1, s * 0.25);
            this.detailGraphics.fillStyle(0xffff88, 1);
            this.detailGraphics.fillCircle(s * 0.45, -s * 0.08, s * 0.12);
            this.detailGraphics.fillStyle(0x000000, 1);
            this.detailGraphics.fillCircle(s * 0.48, -s * 0.08, s * 0.06);
        }

        if (this.type === 'PUFFER') {
            // Smooth puffing animation
            const targetScale = this.isPuffed ? 1.3 : 1;
            const currentScale = this.scaleX;
            const newScale = currentScale + (targetScale - currentScale) * 0.1;
            this.setScale(newScale);
        }

        if (this.type === 'MUTANT') {
            // Glitch effect - random color shifts
            if (Math.random() < 0.02) {
                this.detailGraphics.fillStyle(Math.random() > 0.5 ? 0xff00ff : 0x00ffff, 0.4);
                this.detailGraphics.fillRect(
                    (Math.random() - 0.5) * this.size,
                    (Math.random() - 0.5) * this.size,
                    this.size * 0.3,
                    this.size * 0.1
                );
            }
        }

        if (this.type === 'HUNTER') {
            // Aggressive eye tracking - pupil follows player direction
            const s = this.size;
            // Slight scale breathing
            const breath = 1 + Math.sin(this.animTime * 2) * 0.02;
            this.mainGraphics.setScale(breath, 1 / breath);
        }
    }

    update(time, delta, player) {
        if (!player) return;

        const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Animate the fish
        this.animateFish(time, delta);

        // Puffer fish puffs up when player is near
        if (this.type === 'PUFFER') {
            this.isPuffed = distToPlayer < 150;
        }

        switch (this.behavior) {
            case 'flee':
                this.fleeFromPlayer(player, distToPlayer);
                break;
            case 'chase':
                this.chasePlayer(player, distToPlayer);
                break;
            case 'ambush':
                this.ambushBehavior(player, distToPlayer);
                break;
            case 'float':
                this.floatBehavior(time);
                break;
            case 'hunt':
                this.huntBehavior(player, distToPlayer);
                break;
            case 'patrol':
                this.patrolBehavior(time);
                break;
            case 'wander':
            default:
                this.wander(time);
                break;
        }

        // Rotate to face movement direction
        if (Math.abs(this.body.velocity.x) > 1 || Math.abs(this.body.velocity.y) > 1) {
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        }

        // Frenzy visual effect (for sharks)
        if (this.inFrenzy) {
            this.ambientGlow.clear();
            this.ambientGlow.fillStyle(0xff0000, 0.3 + Math.sin(time * 0.01) * 0.15);
            this.ambientGlow.fillCircle(0, 0, this.size * 1.8);
        } else if (this.type === 'SHARK' && this.ambientGlow) {
            // Reset to normal glow
            this.ambientGlow.clear();
            this.ambientGlow.fillStyle(this.config.color, 0.15);
            this.ambientGlow.fillCircle(0, 0, this.size * 1.5);
        }

        // Attack player if in range and aggressive
        if (this.damage > 0 && distToPlayer < this.size + 30) {
            this.attackPlayer(player, time);
        }
    }

    fleeFromPlayer(player, distance) {
        const fleeDistance = 200;

        if (distance < fleeDistance) {
            const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
            this.body.velocity.x = Math.cos(angle) * this.speed * 1.5;
            this.body.velocity.y = Math.sin(angle) * this.speed * 1.5;
        } else {
            // Slow wander when not fleeing
            this.body.velocity.x *= 0.98;
            this.body.velocity.y *= 0.98;
        }
    }

    chasePlayer(player, distance) {
        const chaseDistance = 300;
        const attackDistance = 40;

        if (distance < chaseDistance && distance > attackDistance) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.body.velocity.x = Math.cos(angle) * this.speed;
            this.body.velocity.y = Math.sin(angle) * this.speed;
        } else if (distance >= chaseDistance) {
            // Wander if player too far
            this.wander();
        }
    }

    wander(time) {
        this.wanderTimer -= 16;

        if (this.wanderTimer <= 0) {
            this.wanderAngle += (Math.random() - 0.5) * 1;
            this.wanderTimer = 500 + Math.random() * 1000;
        }

        this.body.velocity.x = Math.cos(this.wanderAngle) * this.speed * 0.5;
        this.body.velocity.y = Math.sin(this.wanderAngle) * this.speed * 0.5;
    }

    ambushBehavior(player, distance) {
        // Stay hidden and still until player is close, then attack
        const triggerDistance = 120;
        const chaseDistance = 250;

        if (!this.isAmbushing) {
            this.isAmbushing = true;
            this.ambushRevealed = false;
        }

        if (distance < triggerDistance && !this.ambushRevealed) {
            this.ambushRevealed = true;
            // Burst of speed when revealed
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.body.velocity.x = Math.cos(angle) * this.speed * 2;
            this.body.velocity.y = Math.sin(angle) * this.speed * 2;
        } else if (this.ambushRevealed && distance < chaseDistance) {
            // Chase after revealed
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.body.velocity.x = Math.cos(angle) * this.speed;
            this.body.velocity.y = Math.sin(angle) * this.speed;
        } else if (!this.ambushRevealed) {
            // Stay still while hiding
            this.body.velocity.x *= 0.9;
            this.body.velocity.y *= 0.9;
        } else {
            // Reset ambush if player gets far away
            if (distance > 400) {
                this.ambushRevealed = false;
            }
            this.wander();
        }
    }

    floatBehavior(time) {
        // Slow drifting up and down, very passive movement
        if (!this.floatPhase) this.floatPhase = Math.random() * Math.PI * 2;
        this.floatPhase += 0.01;

        const floatY = Math.sin(this.floatPhase) * 0.5;
        const driftX = Math.sin(this.floatPhase * 0.3) * 0.3;

        this.body.velocity.x = driftX * this.speed;
        this.body.velocity.y = floatY * this.speed;
    }

    huntBehavior(player, distance) {
        // Aggressive shark-like behavior - always chase, burst speed when close
        const burstDistance = 150;
        const maxChaseDistance = 500;

        if (distance < maxChaseDistance) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            let speedMult = 1;

            // Burst of speed when getting close
            if (distance < burstDistance) {
                speedMult = 1.5;
                // Frenzy visual effect - store flag for draw method
                this.inFrenzy = true;
            } else {
                this.inFrenzy = false;
            }

            this.body.velocity.x = Math.cos(angle) * this.speed * speedMult;
            this.body.velocity.y = Math.sin(angle) * this.speed * speedMult;
        } else {
            this.inFrenzy = false;
            // Patrol when player is far
            this.patrolBehavior();
        }
    }

    patrolBehavior(time) {
        // Move in a pattern, good for eels
        if (!this.patrolPhase) this.patrolPhase = Math.random() * Math.PI * 2;
        if (!this.patrolCenterX) {
            this.patrolCenterX = this.x;
            this.patrolCenterY = this.y;
        }

        this.patrolPhase += 0.02;
        const patrolRadius = 100;

        const targetX = this.patrolCenterX + Math.cos(this.patrolPhase) * patrolRadius;
        const targetY = this.patrolCenterY + Math.sin(this.patrolPhase * 0.5) * patrolRadius * 0.5;

        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        this.body.velocity.x = Math.cos(angle) * this.speed * 0.7;
        this.body.velocity.y = Math.sin(angle) * this.speed * 0.7;
    }

    attackPlayer(player, time) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= 16;
            return;
        }

        player.takeDamage(this.damage);
        this.attackCooldown = 1000; // 1 second cooldown

        // Visual feedback
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 0.8,
            duration: 100,
            yoyo: true
        });
    }

    takeDamage(amount) {
        this.health -= amount;

        // Flash white
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 50,
            yoyo: true
        });
    }

    isDead() {
        return this.health <= 0;
    }

    getReward() {
        return {
            dnaType: this.config.dnaType,
            dnaAmount: this.config.dnaAmount,
            hungerRestore: this.config.hungerRestore
        };
    }
}
