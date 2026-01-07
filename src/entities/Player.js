import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Stats base
        this.stats = {
            maxHealth: 100,
            health: 100,
            maxHunger: 100,
            hunger: 100,
            speed: 150,
            damage: 10,
            attackRange: 50,
            dodgeChance: 0,
            speedMultiplier: 1,
            damageMultiplier: 1,
            areaDamage: false,
            areaRadius: 0
        };

        // DNA collected
        this.dna = {
            speed: 0,
            defense: 0,
            attack: 0,
            energy: 0
        };

        // Evolution state
        this.evolutions = [];

        // Create visual representation
        this.createVisuals();

        // Physics body
        this.body.setCircle(20);
        this.body.setOffset(-20, -20);

        // Attack cooldown
        this.canAttack = true;
        this.attackCooldown = 300;
    }

    createVisuals() {
        // Base colors
        this.baseColor = 0x00ff88;
        this.darkColor = 0x00cc66;
        this.lightColor = 0x66ffaa;

        // Tail (forked tail fin)
        this.tailGraphics = this.scene.add.graphics();
        this.drawTail();

        // Back fin (dorsal)
        this.dorsalFin = this.scene.add.graphics();
        this.drawDorsalFin();

        // Main body (teardrop/fish shape)
        this.bodyGraphics = this.scene.add.graphics();
        this.drawBody();

        // Scales pattern
        this.scalesGraphics = this.scene.add.graphics();
        this.drawScales();

        // Belly (lighter underside)
        this.bellyGraphics = this.scene.add.graphics();
        this.drawBelly();

        // Side fins (pectoral fins)
        this.sideFins = this.scene.add.graphics();
        this.drawSideFins();

        // Eye with more detail
        this.eyeGraphics = this.scene.add.graphics();
        this.drawEye();

        // Mouth
        this.mouthGraphics = this.scene.add.graphics();
        this.drawMouth();

        // Glow effect behind fish
        this.glowGraphics = this.scene.add.graphics();
        this.drawGlow();

        // Speed trail (initially invisible)
        this.speedTrail = this.scene.add.graphics();
        this.speedTrail.alpha = 0;

        // Swimming bubbles
        this.swimBubbles = [];
        for (let i = 0; i < 8; i++) {
            const bubble = this.scene.add.graphics();
            bubble.visible = false;
            this.swimBubbles.push({
                graphics: bubble,
                x: 0,
                y: 0,
                size: 0,
                life: 0,
                maxLife: 0
            });
        }

        this.add([
            this.glowGraphics,
            this.speedTrail,
            ...this.swimBubbles.map(b => b.graphics),
            this.tailGraphics,
            this.dorsalFin,
            this.bodyGraphics,
            this.scalesGraphics,
            this.bellyGraphics,
            this.sideFins,
            this.eyeGraphics,
            this.mouthGraphics
        ]);

        // Animation state
        this.finAngle = 0;
        this.mouthOpen = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.bubbleTimer = 0;
        this.glowPulse = 0;
    }

    drawGlow() {
        this.glowGraphics.clear();
        // Subtle ambient glow
        this.glowGraphics.fillStyle(this.baseColor, 0.15);
        this.glowGraphics.fillEllipse(0, 0, 60, 40);
        this.glowGraphics.fillStyle(this.baseColor, 0.08);
        this.glowGraphics.fillEllipse(0, 0, 80, 55);
    }

    drawBody() {
        this.bodyGraphics.clear();
        this.bodyGraphics.fillStyle(this.baseColor, 1);

        // Teardrop fish shape using ellipse and curves
        this.bodyGraphics.fillEllipse(0, 0, 44, 26);

        // Add slight point at front
        this.bodyGraphics.fillTriangle(18, 0, 24, -6, 24, 6);
    }

    drawTail() {
        this.tailGraphics.clear();
        this.tailGraphics.fillStyle(this.darkColor, 1);

        // Forked tail fin
        this.tailGraphics.fillTriangle(-22, 0, -38, -16, -30, 0);
        this.tailGraphics.fillTriangle(-22, 0, -38, 16, -30, 0);

        // Tail connection
        this.tailGraphics.fillStyle(this.baseColor, 1);
        this.tailGraphics.fillEllipse(-20, 0, 10, 8);
    }

    drawDorsalFin() {
        this.dorsalFin.clear();
        this.dorsalFin.fillStyle(this.darkColor, 1);

        // Dorsal fin on top
        this.dorsalFin.beginPath();
        this.dorsalFin.moveTo(-8, -13);
        this.dorsalFin.lineTo(0, -26);
        this.dorsalFin.lineTo(10, -13);
        this.dorsalFin.closePath();
        this.dorsalFin.fill();

        // Fin details (rays)
        this.dorsalFin.lineStyle(1, this.baseColor, 0.5);
        this.dorsalFin.lineBetween(-4, -14, -2, -22);
        this.dorsalFin.lineBetween(2, -14, 2, -24);
        this.dorsalFin.lineBetween(6, -14, 6, -20);
    }

    drawBelly() {
        this.bellyGraphics.clear();
        this.bellyGraphics.fillStyle(this.lightColor, 0.6);

        // Lighter belly area
        this.bellyGraphics.fillEllipse(0, 6, 30, 10);
    }

    drawScales() {
        this.scalesGraphics.clear();
        this.scalesGraphics.lineStyle(1, this.darkColor, 0.3);

        // Scale pattern (curved lines)
        for (let i = -2; i < 3; i++) {
            const x = i * 8;
            this.scalesGraphics.beginPath();
            this.scalesGraphics.arc(x, 0, 6, -0.8, 0.8);
            this.scalesGraphics.stroke();
        }
    }

    drawSideFins() {
        this.sideFins.clear();
        this.sideFins.fillStyle(this.darkColor, 0.9);

        // Pectoral fin (side fin)
        this.sideFins.beginPath();
        this.sideFins.moveTo(-2, 10);
        this.sideFins.lineTo(-12, 22);
        this.sideFins.lineTo(6, 14);
        this.sideFins.closePath();
        this.sideFins.fill();

        // Fin detail
        this.sideFins.lineStyle(1, this.lightColor, 0.4);
        this.sideFins.lineBetween(0, 11, -6, 18);
    }

    drawEye() {
        this.eyeGraphics.clear();

        // Eye white (sclera)
        this.eyeGraphics.fillStyle(0xffffff, 1);
        this.eyeGraphics.fillEllipse(10, -4, 10, 8);

        // Iris
        this.eyeGraphics.fillStyle(0x2255aa, 1);
        this.eyeGraphics.fillCircle(12, -4, 4);

        // Pupil
        this.eyeGraphics.fillStyle(0x000000, 1);
        this.eyeGraphics.fillCircle(13, -4, 2);

        // Eye shine
        this.eyeGraphics.fillStyle(0xffffff, 0.9);
        this.eyeGraphics.fillCircle(11, -6, 1.5);
    }

    drawMouth() {
        this.mouthGraphics.clear();
        this.mouthGraphics.lineStyle(2, this.darkColor, 0.8);

        // Simple curved mouth
        this.mouthGraphics.beginPath();
        this.mouthGraphics.arc(22, 2, 4, 0.3, 1.2);
        this.mouthGraphics.stroke();
    }

    drawMouthOpen() {
        this.mouthGraphics.clear();
        this.mouthGraphics.fillStyle(0x880044, 1);
        this.mouthGraphics.fillEllipse(23, 2, 6, 5);

        // Teeth hint
        this.mouthGraphics.fillStyle(0xffffff, 0.8);
        this.mouthGraphics.fillTriangle(20, 0, 22, -2, 22, 2);
        this.mouthGraphics.fillTriangle(20, 4, 22, 2, 22, 6);
    }

    animateFins(time) {
        // Oscillate side fins
        this.finAngle = Math.sin(time * 0.008) * 0.3;
        this.sideFins.rotation = this.finAngle;
        this.dorsalFin.rotation = this.finAngle * 0.3;
    }

    animateBlink(time) {
        this.blinkTimer += 16;

        // Random blink every few seconds
        if (!this.isBlinking && this.blinkTimer > 3000 + Math.random() * 2000) {
            this.isBlinking = true;
            this.blinkTimer = 0;
        }

        if (this.isBlinking) {
            // Draw closed eye
            this.eyeGraphics.clear();
            this.eyeGraphics.lineStyle(2, 0x000000, 1);
            this.eyeGraphics.lineBetween(6, -4, 16, -4);

            if (this.blinkTimer > 150) {
                this.isBlinking = false;
                this.drawEye();
            }
        }
    }

    updateSpeedTrail(speed, time) {
        const currentSpeed = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
        const maxSpeed = this.stats.speed * this.stats.speedMultiplier * 1.5;
        const speedRatio = currentSpeed / maxSpeed;

        if (currentSpeed > maxSpeed * 0.5) {
            this.speedTrail.clear();

            // Enhanced speed trail with wave effect
            for (let i = 1; i <= 5; i++) {
                const alpha = (0.2 - i * 0.035) * speedRatio;
                const waveOffset = Math.sin(time * 0.01 + i * 0.5) * 3;
                this.speedTrail.fillStyle(this.baseColor, alpha);
                this.speedTrail.fillEllipse(-18 - i * 10, waveOffset, 12 - i * 1.5, 8 - i);
            }

            // Add sparkle particles for high speed
            if (speedRatio > 0.8) {
                for (let i = 0; i < 3; i++) {
                    const sparkX = -30 - Math.random() * 30;
                    const sparkY = (Math.random() - 0.5) * 20;
                    this.speedTrail.fillStyle(0xffffff, 0.4 + Math.random() * 0.3);
                    this.speedTrail.fillCircle(sparkX, sparkY, 1 + Math.random() * 2);
                }
            }

            this.speedTrail.alpha = 1;
        } else {
            this.speedTrail.alpha *= 0.9;
        }
    }

    updateSwimBubbles(time, delta, currentSpeed) {
        const maxSpeed = this.stats.speed * this.stats.speedMultiplier;
        const speedRatio = currentSpeed / maxSpeed;

        // Spawn bubbles based on speed
        this.bubbleTimer += delta;
        const bubbleInterval = 200 - speedRatio * 150; // Faster = more bubbles

        if (this.bubbleTimer > bubbleInterval && speedRatio > 0.3) {
            this.bubbleTimer = 0;

            // Find inactive bubble
            const bubble = this.swimBubbles.find(b => b.life <= 0);
            if (bubble) {
                bubble.x = -25 + (Math.random() - 0.5) * 10;
                bubble.y = (Math.random() - 0.5) * 15;
                bubble.size = 2 + Math.random() * 3;
                bubble.life = 1;
                bubble.maxLife = 400 + Math.random() * 300;
                bubble.graphics.visible = true;
            }
        }

        // Update existing bubbles
        this.swimBubbles.forEach(bubble => {
            if (bubble.life > 0) {
                bubble.life -= delta / bubble.maxLife;
                bubble.x -= delta * 0.05; // Drift backward relative to fish
                bubble.y -= delta * 0.02; // Float up

                bubble.graphics.clear();
                const alpha = bubble.life * 0.5;
                bubble.graphics.fillStyle(0xaaddff, alpha);
                bubble.graphics.fillCircle(bubble.x, bubble.y, bubble.size * bubble.life);
                bubble.graphics.fillStyle(0xffffff, alpha * 0.8);
                bubble.graphics.fillCircle(
                    bubble.x - bubble.size * 0.3,
                    bubble.y - bubble.size * 0.3,
                    bubble.size * 0.3 * bubble.life
                );

                if (bubble.life <= 0) {
                    bubble.graphics.visible = false;
                }
            }
        });
    }

    updateGlow(time) {
        this.glowPulse += 0.05;
        const pulse = Math.sin(this.glowPulse) * 0.05;

        this.glowGraphics.clear();
        this.glowGraphics.fillStyle(this.baseColor, 0.12 + pulse);
        this.glowGraphics.fillEllipse(0, 0, 60, 40);
        this.glowGraphics.fillStyle(this.baseColor, 0.06 + pulse * 0.5);
        this.glowGraphics.fillEllipse(0, 0, 80, 55);
    }

    update(time, delta) {
        // Move towards mouse
        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

        const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
        const distance = Phaser.Math.Distance.Between(this.x, this.y, worldPoint.x, worldPoint.y);

        // Rotate to face direction
        this.rotation = angle;

        // Move if not too close to cursor
        if (distance > 10) {
            const speed = this.getSpeed();
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            // Smooth movement using lerp
            this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, velocityX, 0.1);
            this.body.velocity.y = Phaser.Math.Linear(this.body.velocity.y, velocityY, 0.1);
        } else {
            this.body.velocity.x = Phaser.Math.Linear(this.body.velocity.x, 0, 0.2);
            this.body.velocity.y = Phaser.Math.Linear(this.body.velocity.y, 0, 0.2);
        }

        // Animate tail with speed-based frequency
        const currentSpeed = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
        const tailSpeed = 0.01 + (currentSpeed / 200) * 0.02;
        const tailWag = Math.sin(time * tailSpeed) * (0.2 + currentSpeed / 500);
        this.tailGraphics.rotation = tailWag;

        // Animate fins
        this.animateFins(time);

        // Animate blinking
        this.animateBlink(time);

        // Update speed trail
        this.updateSpeedTrail(currentSpeed, time);

        // Update swimming bubbles
        this.updateSwimBubbles(time, delta, currentSpeed);

        // Update ambient glow
        this.updateGlow(time);
    }

    getSpeed() {
        let speed = this.stats.speed * this.stats.speedMultiplier;

        // Reduce speed if hungry
        if (this.stats.hunger < 30) {
            speed *= 0.6;
        }

        return speed;
    }

    getDamage() {
        return this.stats.damage * this.stats.damageMultiplier;
    }

    attack(enemies) {
        if (!this.canAttack) return [];

        const killed = [];
        const inRange = enemies.filter(enemy => {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            return dist < this.stats.attackRange + enemy.size;
        });

        if (inRange.length === 0) return [];

        // Attack cooldown
        this.canAttack = false;
        this.scene.time.delayedCall(this.attackCooldown, () => {
            this.canAttack = true;
        });

        // Open mouth animation
        this.drawMouthOpen();
        this.scene.time.delayedCall(200, () => {
            this.drawMouth();
        });

        // Visual feedback - lunge forward
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.15,
            scaleY: 0.92,
            duration: 80,
            yoyo: true,
            ease: 'Power2'
        });

        // Damage enemies
        const damage = this.getDamage();

        if (this.stats.areaDamage) {
            // Area damage - hit all in radius
            inRange.forEach(enemy => {
                enemy.takeDamage(damage);
                if (enemy.isDead()) {
                    killed.push(enemy);
                }
            });
        } else {
            // Single target - hit closest
            const closest = inRange.reduce((a, b) => {
                const distA = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y);
                const distB = Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y);
                return distA < distB ? a : b;
            });

            closest.takeDamage(damage);
            if (closest.isDead()) {
                killed.push(closest);
            }
        }

        return killed;
    }

    takeDamage(amount) {
        // Dodge chance
        if (Math.random() < this.stats.dodgeChance) {
            // Show dodge text
            this.scene.showFloatingText(this.x, this.y - 30, 'Esquivado!', '#00ffff');
            return;
        }

        this.stats.health -= amount;
        if (this.stats.health < 0) this.stats.health = 0;
        this.scene.hudDirty = true;

        // Damage particles
        if (this.scene.createDamageParticles) {
            this.scene.createDamageParticles(this.x, this.y);
        }

        // Show damage number
        this.scene.showFloatingText(this.x, this.y - 30, `-${amount}`, '#ff4444');

        // Visual feedback - flash red
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
    }

    feed(hungerAmount) {
        this.stats.hunger += hungerAmount;
        if (this.stats.hunger > this.stats.maxHunger) {
            this.stats.hunger = this.stats.maxHunger;
        }

        // Also restore some health
        this.stats.health += hungerAmount * 0.3;
        if (this.stats.health > this.stats.maxHealth) {
            this.stats.health = this.stats.maxHealth;
        }
        this.scene.hudDirty = true;
    }

    collectDNA(type, amount) {
        if (type === 'random') {
            const types = ['speed', 'defense', 'attack', 'energy'];
            type = types[Math.floor(Math.random() * types.length)];
        }
        this.dna[type] += amount;
        this.scene.hudDirty = true;
    }

    applyEvolution(evolution) {
        this.evolutions.push(evolution.id);

        // Apply effects
        const effects = evolution.effects;

        if (effects.speedMultiplier) {
            this.stats.speedMultiplier *= effects.speedMultiplier;
        }
        if (effects.damageMultiplier) {
            this.stats.damageMultiplier *= effects.damageMultiplier;
        }
        if (effects.maxHealthMultiplier) {
            this.stats.maxHealth *= effects.maxHealthMultiplier;
            this.stats.health = this.stats.maxHealth;
        }
        if (effects.dodgeChance) {
            this.stats.dodgeChance += effects.dodgeChance;
        }
        if (effects.areaDamage) {
            this.stats.areaDamage = true;
            this.stats.areaRadius = effects.areaRadius;
        }

        // Apply visual changes
        this.updateVisuals(evolution.visual);

        // Consume DNA
        for (const [type, amount] of Object.entries(evolution.requirements)) {
            this.dna[type] -= amount;
        }
    }

    updateVisuals(visual) {
        // Update colors based on evolution
        this.baseColor = visual.color;

        // Calculate darker and lighter versions
        const r = (visual.color >> 16) & 0xff;
        const g = (visual.color >> 8) & 0xff;
        const b = visual.color & 0xff;

        this.darkColor = Phaser.Display.Color.GetColor(
            Math.max(0, r - 40),
            Math.max(0, g - 40),
            Math.max(0, b - 40)
        );
        this.lightColor = Phaser.Display.Color.GetColor(
            Math.min(255, r + 60),
            Math.min(255, g + 60),
            Math.min(255, b + 60)
        );

        // Redraw all parts with new colors
        this.drawBody();
        this.drawTail();
        this.drawDorsalFin();
        this.drawBelly();
        this.drawScales();
        this.drawSideFins();
        this.drawEye();
        this.drawMouth();

        // Apply scale
        this.setScale(visual.scaleX, visual.scaleY);

        // Add shell for armored form
        if (visual.hasShell) {
            if (!this.shellGraphics) {
                this.shellGraphics = this.scene.add.graphics();
                this.add(this.shellGraphics);
            }
            this.shellGraphics.clear();

            // Hexagonal armor plates
            this.shellGraphics.lineStyle(3, 0x888888, 1);
            this.shellGraphics.strokeEllipse(0, 0, 50, 32);

            // Armor plate details
            this.shellGraphics.lineStyle(2, 0x666666, 0.6);
            for (let i = 0; i < 4; i++) {
                const x = -15 + i * 10;
                this.shellGraphics.strokeCircle(x, 0, 6);
            }
        }

        // Add glow for electric form
        if (visual.glowing) {
            if (!this.electricGlow) {
                this.electricGlow = this.scene.add.graphics();
                this.addAt(this.electricGlow, 0);
            }
            // Electric aura with animated sparks
            this.electricGlow.clear();
            this.electricGlow.fillStyle(0xffff00, 0.2);
            this.electricGlow.fillCircle(0, 0, 40);

            // Lightning bolts
            this.electricGlow.lineStyle(2, 0xffff00, 0.8);
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.5;
                const startR = 25;
                const endR = 35 + Math.random() * 10;
                const midR = (startR + endR) / 2;
                const midAngle = angle + (Math.random() - 0.5) * 0.5;

                this.electricGlow.lineBetween(
                    Math.cos(angle) * startR,
                    Math.sin(angle) * startR,
                    Math.cos(midAngle) * midR,
                    Math.sin(midAngle) * midR
                );
                this.electricGlow.lineBetween(
                    Math.cos(midAngle) * midR,
                    Math.sin(midAngle) * midR,
                    Math.cos(angle) * endR,
                    Math.sin(angle) * endR
                );
            }
        }
    }

    isDead() {
        return this.stats.health <= 0;
    }
}
