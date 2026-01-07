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
        this.health = this.config.health;
        this.size = this.config.size;
        this.speed = this.config.speed;
        this.damage = this.config.damage;
        this.behavior = this.config.behavior;

        // Create visual
        this.createVisuals();

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
            default:
                this.drawCommonFish();
        }

        this.add([this.ambientGlow, ...this.bubbles.map(b => b.graphics), this.tailGraphics, this.mainGraphics, this.detailGraphics]);

        // Animation state
        this.animTime = Math.random() * Math.PI * 2;
        this.bubbleTimer = Math.random() * 500;
        this.glowPulse = Math.random() * Math.PI * 2;
    }

    drawCommonFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x3080cc;

        // Forked tail
        this.tailGraphics.fillStyle(darkColor, 1);
        this.tailGraphics.fillTriangle(-s, 0, -s * 1.6, -s * 0.6, -s * 1.3, 0);
        this.tailGraphics.fillTriangle(-s, 0, -s * 1.6, s * 0.6, -s * 1.3, 0);

        // Oval body
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.fillEllipse(0, 0, s * 2.2, s * 1.4);

        // Stripes
        this.detailGraphics.lineStyle(2, 0x6ac0ff, 0.4);
        for (let i = -2; i <= 2; i++) {
            this.detailGraphics.lineBetween(i * s * 0.3, -s * 0.5, i * s * 0.3, s * 0.5);
        }

        // Dorsal fin
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.fillTriangle(-s * 0.3, -s * 0.7, s * 0.2, -s * 0.7, 0, -s * 1.1);

        // Big scared eyes
        this.detailGraphics.fillStyle(0xffffff, 1);
        this.detailGraphics.fillEllipse(s * 0.4, -s * 0.15, s * 0.5, s * 0.4);
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.5, -s * 0.1, s * 0.15);
        // Highlight
        this.detailGraphics.fillStyle(0xffffff, 0.8);
        this.detailGraphics.fillCircle(s * 0.4, -s * 0.2, s * 0.08);

        // Small mouth
        this.detailGraphics.lineStyle(1, darkColor, 0.6);
        this.detailGraphics.lineBetween(s * 0.9, 0, s * 1.0, s * 0.1);
    }

    drawPufferFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0xcc6600;

        // Small tail
        this.tailGraphics.fillStyle(darkColor, 0.9);
        this.tailGraphics.fillTriangle(-s * 0.8, 0, -s * 1.2, -s * 0.4, -s * 1.2, s * 0.4);

        // Round puffy body
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.fillCircle(0, 0, s);

        // Spots/patches
        this.detailGraphics.fillStyle(darkColor, 0.4);
        this.detailGraphics.fillCircle(-s * 0.3, -s * 0.3, s * 0.2);
        this.detailGraphics.fillCircle(s * 0.2, s * 0.3, s * 0.15);
        this.detailGraphics.fillCircle(-s * 0.4, s * 0.2, s * 0.15);

        // Small spikes around body
        this.detailGraphics.fillStyle(darkColor, 0.8);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sx = Math.cos(angle) * s;
            const sy = Math.sin(angle) * s;
            this.detailGraphics.fillTriangle(
                sx, sy,
                sx + Math.cos(angle) * s * 0.3, sy + Math.sin(angle) * s * 0.3,
                sx + Math.cos(angle + 0.3) * s * 0.15, sy + Math.sin(angle + 0.3) * s * 0.15
            );
        }

        // Small round fins
        this.mainGraphics.fillStyle(darkColor, 0.8);
        this.mainGraphics.fillEllipse(0, s * 0.8, s * 0.4, s * 0.2);

        // Cute round eyes
        this.detailGraphics.fillStyle(0xffffff, 1);
        this.detailGraphics.fillCircle(s * 0.4, -s * 0.3, s * 0.25);
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.45, -s * 0.25, s * 0.12);

        // Small mouth
        this.detailGraphics.lineStyle(2, darkColor, 0.7);
        this.detailGraphics.beginPath();
        this.detailGraphics.arc(s * 0.7, 0, s * 0.15, -0.5, 0.5);
        this.detailGraphics.stroke();
    }

    drawHunterFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0xaa0000;

        // Aggressive forked tail
        this.tailGraphics.fillStyle(darkColor, 1);
        this.tailGraphics.fillTriangle(-s, 0, -s * 1.5, -s * 0.7, -s * 1.1, 0);
        this.tailGraphics.fillTriangle(-s, 0, -s * 1.5, s * 0.7, -s * 1.1, 0);

        // Torpedo body
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 1.2, 0);
        this.mainGraphics.lineTo(s * 0.5, -s * 0.6);
        this.mainGraphics.lineTo(-s * 0.8, -s * 0.5);
        this.mainGraphics.lineTo(-s, 0);
        this.mainGraphics.lineTo(-s * 0.8, s * 0.5);
        this.mainGraphics.lineTo(s * 0.5, s * 0.6);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Pointed dorsal fin
        this.mainGraphics.fillStyle(darkColor, 1);
        this.mainGraphics.fillTriangle(-s * 0.2, -s * 0.5, s * 0.3, -s * 0.6, 0, -s * 1.1);

        // Scars/battle marks
        this.detailGraphics.lineStyle(2, 0x880000, 0.6);
        this.detailGraphics.lineBetween(-s * 0.3, -s * 0.2, s * 0.1, -s * 0.35);
        this.detailGraphics.lineBetween(-s * 0.5, s * 0.15, -s * 0.2, s * 0.3);

        // Angry eyes with red tint
        this.detailGraphics.fillStyle(0xffffcc, 1);
        this.detailGraphics.fillEllipse(s * 0.5, -s * 0.15, s * 0.35, s * 0.25);
        this.detailGraphics.fillStyle(0x880000, 1);
        this.detailGraphics.fillCircle(s * 0.6, -s * 0.12, s * 0.12);
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.63, -s * 0.12, s * 0.06);
        // Angry brow
        this.detailGraphics.lineStyle(2, darkColor, 1);
        this.detailGraphics.lineBetween(s * 0.3, -s * 0.35, s * 0.7, -s * 0.28);

        // Open mouth with teeth
        this.detailGraphics.fillStyle(0x440000, 1);
        this.detailGraphics.fillTriangle(s * 0.9, -s * 0.15, s * 1.2, 0, s * 0.9, s * 0.15);
        // Teeth
        this.detailGraphics.fillStyle(0xffffff, 1);
        this.detailGraphics.fillTriangle(s * 0.95, -s * 0.1, s * 1.05, 0, s * 0.95, s * 0.02);
        this.detailGraphics.fillTriangle(s * 0.92, s * 0.08, s * 1.02, 0, s * 0.92, -s * 0.02);
    }

    drawLuminousFish() {
        const s = this.size;
        const color = this.config.color;

        // Outer glow
        this.glowGraphics = this.scene.add.graphics();
        this.glowGraphics.fillStyle(color, 0.15);
        this.glowGraphics.fillCircle(0, 0, s * 2);
        this.glowGraphics.fillStyle(color, 0.25);
        this.glowGraphics.fillCircle(0, 0, s * 1.5);
        this.addAt(this.glowGraphics, 0);

        // Ethereal tail
        this.tailGraphics.fillStyle(color, 0.6);
        this.tailGraphics.fillTriangle(-s * 0.8, 0, -s * 1.4, -s * 0.5, -s * 1.4, s * 0.5);

        // Translucent body
        this.mainGraphics.fillStyle(color, 0.7);
        this.mainGraphics.fillEllipse(0, 0, s * 2, s * 1.2);

        // Inner glow/core
        this.mainGraphics.fillStyle(0xffffff, 0.5);
        this.mainGraphics.fillEllipse(0, 0, s * 1.2, s * 0.7);

        // Light particles around
        this.detailGraphics.fillStyle(0xffffff, 0.8);
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + Math.random();
            const dist = s * 1.3 + Math.random() * s * 0.5;
            this.detailGraphics.fillCircle(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist,
                2
            );
        }

        // Delicate fins
        this.mainGraphics.fillStyle(color, 0.5);
        this.mainGraphics.fillTriangle(0, -s * 0.6, s * 0.3, -s * 0.6, 0, -s * 1);

        // Big luminous eyes
        this.detailGraphics.fillStyle(0xffffff, 0.9);
        this.detailGraphics.fillCircle(s * 0.4, -s * 0.1, s * 0.25);
        this.detailGraphics.fillStyle(0xffff88, 1);
        this.detailGraphics.fillCircle(s * 0.45, -s * 0.08, s * 0.12);
        this.detailGraphics.fillStyle(0x000000, 1);
        this.detailGraphics.fillCircle(s * 0.48, -s * 0.08, s * 0.06);
    }

    drawMutantFish() {
        const s = this.size;
        const color = this.config.color;
        const darkColor = 0x6622aa;

        // Irregular tentacle-like tail
        this.tailGraphics.fillStyle(darkColor, 0.8);
        for (let i = 0; i < 3; i++) {
            const offsetY = (i - 1) * s * 0.4;
            const length = s * 0.8 + Math.random() * s * 0.4;
            this.tailGraphics.fillEllipse(-s - length / 2, offsetY, length, s * 0.15);
        }

        // Irregular/asymmetric body
        this.mainGraphics.fillStyle(color, 1);
        this.mainGraphics.beginPath();
        this.mainGraphics.moveTo(s * 0.8, -s * 0.2);
        this.mainGraphics.lineTo(s * 0.3, -s * 0.8);
        this.mainGraphics.lineTo(-s * 0.5, -s * 0.6);
        this.mainGraphics.lineTo(-s * 0.9, -s * 0.1);
        this.mainGraphics.lineTo(-s * 0.7, s * 0.5);
        this.mainGraphics.lineTo(s * 0.1, s * 0.7);
        this.mainGraphics.lineTo(s * 0.7, s * 0.3);
        this.mainGraphics.closePath();
        this.mainGraphics.fill();

        // Weird protrusions
        this.mainGraphics.fillStyle(darkColor, 0.9);
        this.mainGraphics.fillCircle(-s * 0.2, -s * 0.9, s * 0.25);
        this.mainGraphics.fillCircle(s * 0.5, s * 0.6, s * 0.2);

        // Multiple eyes (3 eyes)
        const eyePositions = [
            { x: s * 0.4, y: -s * 0.3, size: s * 0.22 },
            { x: s * 0.1, y: -s * 0.5, size: s * 0.18 },
            { x: s * 0.6, y: s * 0.1, size: s * 0.15 }
        ];

        eyePositions.forEach(eye => {
            this.detailGraphics.fillStyle(0xccffcc, 1);
            this.detailGraphics.fillCircle(eye.x, eye.y, eye.size);
            this.detailGraphics.fillStyle(0x440066, 1);
            this.detailGraphics.fillCircle(eye.x + eye.size * 0.2, eye.y, eye.size * 0.5);
            this.detailGraphics.fillStyle(0x000000, 1);
            this.detailGraphics.fillCircle(eye.x + eye.size * 0.25, eye.y, eye.size * 0.25);
        });

        // Glitch/distortion effect (spots)
        this.detailGraphics.fillStyle(0xff00ff, 0.3);
        this.detailGraphics.fillRect(-s * 0.4, -s * 0.2, s * 0.3, s * 0.1);
        this.detailGraphics.fillStyle(0x00ffff, 0.3);
        this.detailGraphics.fillRect(s * 0.1, s * 0.2, s * 0.25, s * 0.08);

        // Jagged mouth
        this.detailGraphics.fillStyle(0x220033, 1);
        this.detailGraphics.fillTriangle(s * 0.5, -s * 0.1, s * 0.9, 0, s * 0.5, s * 0.1);
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
            case 'wander':
            default:
                this.wander(time);
                break;
        }

        // Rotate to face movement direction
        if (Math.abs(this.body.velocity.x) > 1 || Math.abs(this.body.velocity.y) > 1) {
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
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
