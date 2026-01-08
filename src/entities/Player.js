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
            damage: 2,
            attackRange: 50,
            dodgeChance: 0,
            speedMultiplier: 1,
            damageMultiplier: 1,
            areaDamage: false,
            areaRadius: 0,
            dashDamage: false,
            dashDamageMultiplier: 0
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

        // Dash ability
        this.dashSpeed = 600;           // Speed during dash
        this.dashDuration = 150;        // Duration of dash in ms
        this.dashCooldown = 5000;       // Cooldown in ms (5 seconds)
        this.dashCooldownRemaining = 0; // Current cooldown remaining
        this.isDashing = false;         // Is currently dashing
        this.canDash = true;            // Can dash (not on cooldown)
        this.dashDirection = { x: 0, y: 0 }; // Dash direction
        this.dashHitEnemies = new Set(); // Enemies hit during current dash
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
        // Multi-layered ambient glow
        this.glowGraphics.fillStyle(this.baseColor, 0.05);
        this.glowGraphics.fillEllipse(0, 0, 100, 70);
        this.glowGraphics.fillStyle(this.baseColor, 0.1);
        this.glowGraphics.fillEllipse(0, 0, 70, 50);
        this.glowGraphics.fillStyle(this.baseColor, 0.15);
        this.glowGraphics.fillEllipse(0, 0, 50, 35);
    }

    drawBody() {
        this.bodyGraphics.clear();

        // Shadow underneath
        this.bodyGraphics.fillStyle(0x000000, 0.2);
        this.bodyGraphics.fillEllipse(2, 4, 46, 24);

        // Main body gradient effect (darker edges)
        this.bodyGraphics.fillStyle(this.darkColor, 1);
        this.bodyGraphics.fillEllipse(0, 0, 48, 28);

        // Body main color
        this.bodyGraphics.fillStyle(this.baseColor, 1);
        this.bodyGraphics.fillEllipse(0, -1, 44, 24);

        // Body highlight (top)
        this.bodyGraphics.fillStyle(this.lightColor, 0.4);
        this.bodyGraphics.fillEllipse(0, -6, 35, 12);

        // Pointed snout
        this.bodyGraphics.fillStyle(this.baseColor, 1);
        this.bodyGraphics.beginPath();
        this.bodyGraphics.moveTo(20, 0);
        this.bodyGraphics.lineTo(28, -4);
        this.bodyGraphics.lineTo(30, 0);
        this.bodyGraphics.lineTo(28, 4);
        this.bodyGraphics.closePath();
        this.bodyGraphics.fill();

        // Gill marks
        this.bodyGraphics.lineStyle(2, this.darkColor, 0.5);
        this.bodyGraphics.beginPath();
        this.bodyGraphics.arc(12, 0, 8, -0.6, 0.6);
        this.bodyGraphics.stroke();
        this.bodyGraphics.beginPath();
        this.bodyGraphics.arc(14, 0, 6, -0.5, 0.5);
        this.bodyGraphics.stroke();

        // Lateral line
        this.bodyGraphics.lineStyle(1, this.darkColor, 0.3);
        this.bodyGraphics.lineBetween(-15, 0, 20, -2);
    }

    drawTail() {
        this.tailGraphics.clear();

        // Tail shadow
        this.tailGraphics.fillStyle(0x000000, 0.15);
        this.tailGraphics.fillTriangle(-20, 2, -42, -14, -32, 2);
        this.tailGraphics.fillTriangle(-20, 2, -42, 18, -32, 2);

        // Upper tail lobe
        this.tailGraphics.fillStyle(this.darkColor, 1);
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-20, 0);
        this.tailGraphics.lineTo(-28, -6);
        this.tailGraphics.lineTo(-40, -18);
        this.tailGraphics.lineTo(-35, -8);
        this.tailGraphics.lineTo(-30, 0);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Lower tail lobe
        this.tailGraphics.beginPath();
        this.tailGraphics.moveTo(-20, 0);
        this.tailGraphics.lineTo(-28, 6);
        this.tailGraphics.lineTo(-40, 18);
        this.tailGraphics.lineTo(-35, 8);
        this.tailGraphics.lineTo(-30, 0);
        this.tailGraphics.closePath();
        this.tailGraphics.fill();

        // Tail fin rays
        this.tailGraphics.lineStyle(1, this.baseColor, 0.4);
        for (let i = 0; i < 5; i++) {
            const angle = -0.8 + i * 0.4;
            this.tailGraphics.lineBetween(-25, 0, -35 + Math.cos(angle) * 8, Math.sin(angle) * 15);
        }

        // Tail connection
        this.tailGraphics.fillStyle(this.baseColor, 1);
        this.tailGraphics.fillEllipse(-18, 0, 12, 10);
    }

    drawDorsalFin() {
        this.dorsalFin.clear();

        // Fin membrane
        this.dorsalFin.fillStyle(this.darkColor, 0.9);
        this.dorsalFin.beginPath();
        this.dorsalFin.moveTo(-10, -12);
        this.dorsalFin.lineTo(-5, -28);
        this.dorsalFin.lineTo(5, -30);
        this.dorsalFin.lineTo(12, -12);
        this.dorsalFin.closePath();
        this.dorsalFin.fill();

        // Fin highlight
        this.dorsalFin.fillStyle(this.baseColor, 0.3);
        this.dorsalFin.beginPath();
        this.dorsalFin.moveTo(-8, -13);
        this.dorsalFin.lineTo(-3, -25);
        this.dorsalFin.lineTo(3, -26);
        this.dorsalFin.lineTo(6, -13);
        this.dorsalFin.closePath();
        this.dorsalFin.fill();

        // Fin spines
        this.dorsalFin.lineStyle(1.5, this.lightColor, 0.6);
        this.dorsalFin.lineBetween(-6, -13, -4, -26);
        this.dorsalFin.lineBetween(0, -13, 1, -28);
        this.dorsalFin.lineBetween(6, -13, 4, -25);
        this.dorsalFin.lineBetween(10, -13, 7, -20);
    }

    drawBelly() {
        this.bellyGraphics.clear();

        // Lighter belly gradient
        this.bellyGraphics.fillStyle(0xffffff, 0.3);
        this.bellyGraphics.fillEllipse(0, 8, 32, 10);
        this.bellyGraphics.fillStyle(this.lightColor, 0.5);
        this.bellyGraphics.fillEllipse(0, 6, 28, 8);

        // Ventral fin (small bottom fin)
        this.bellyGraphics.fillStyle(this.darkColor, 0.8);
        this.bellyGraphics.fillTriangle(-5, 10, -8, 18, 2, 12);
    }

    drawScales() {
        this.scalesGraphics.clear();

        // Scale pattern with overlapping effect
        this.scalesGraphics.lineStyle(1, this.darkColor, 0.25);
        for (let row = -1; row <= 1; row++) {
            for (let col = -3; col < 3; col++) {
                const x = col * 7 + (row % 2) * 3.5;
                const y = row * 6;
                this.scalesGraphics.beginPath();
                this.scalesGraphics.arc(x, y, 5, -0.9, 0.9);
                this.scalesGraphics.stroke();
            }
        }

        // Shimmering highlights on some scales
        this.scalesGraphics.fillStyle(0xffffff, 0.15);
        this.scalesGraphics.fillCircle(-7, -3, 2);
        this.scalesGraphics.fillCircle(3, 0, 2);
        this.scalesGraphics.fillCircle(-3, 4, 1.5);
    }

    drawSideFins() {
        this.sideFins.clear();

        // Pectoral fin shadow
        this.sideFins.fillStyle(0x000000, 0.15);
        this.sideFins.beginPath();
        this.sideFins.moveTo(0, 12);
        this.sideFins.lineTo(-14, 26);
        this.sideFins.lineTo(-6, 28);
        this.sideFins.lineTo(8, 16);
        this.sideFins.closePath();
        this.sideFins.fill();

        // Main pectoral fin
        this.sideFins.fillStyle(this.darkColor, 0.9);
        this.sideFins.beginPath();
        this.sideFins.moveTo(-2, 10);
        this.sideFins.lineTo(-15, 24);
        this.sideFins.lineTo(-8, 26);
        this.sideFins.lineTo(8, 14);
        this.sideFins.closePath();
        this.sideFins.fill();

        // Fin rays
        this.sideFins.lineStyle(1, this.lightColor, 0.5);
        this.sideFins.lineBetween(0, 11, -10, 22);
        this.sideFins.lineBetween(2, 12, -5, 24);
        this.sideFins.lineBetween(4, 13, 0, 22);

        // Fin membrane highlight
        this.sideFins.fillStyle(this.baseColor, 0.3);
        this.sideFins.fillTriangle(-2, 12, -8, 20, 2, 14);
    }

    drawEye() {
        this.eyeGraphics.clear();

        // Eye socket shadow
        this.eyeGraphics.fillStyle(0x000000, 0.2);
        this.eyeGraphics.fillEllipse(10, -3, 12, 10);

        // Eye white (sclera)
        this.eyeGraphics.fillStyle(0xffffff, 1);
        this.eyeGraphics.fillEllipse(10, -4, 11, 9);

        // Iris gradient
        this.eyeGraphics.fillStyle(0x1144aa, 1);
        this.eyeGraphics.fillCircle(12, -4, 5);
        this.eyeGraphics.fillStyle(0x2266cc, 1);
        this.eyeGraphics.fillCircle(12, -4, 4);
        this.eyeGraphics.fillStyle(0x3388ee, 1);
        this.eyeGraphics.fillCircle(12, -3, 2.5);

        // Pupil
        this.eyeGraphics.fillStyle(0x000000, 1);
        this.eyeGraphics.fillEllipse(13, -4, 3, 4);

        // Eye shine (multiple highlights)
        this.eyeGraphics.fillStyle(0xffffff, 1);
        this.eyeGraphics.fillCircle(10, -6, 2);
        this.eyeGraphics.fillStyle(0xffffff, 0.6);
        this.eyeGraphics.fillCircle(14, -2, 1);

        // Eye ring
        this.eyeGraphics.lineStyle(1, 0x001133, 0.3);
        this.eyeGraphics.strokeEllipse(10, -4, 11, 9);
    }

    drawMouth() {
        this.mouthGraphics.clear();

        // Mouth line
        this.mouthGraphics.lineStyle(2, this.darkColor, 0.7);
        this.mouthGraphics.beginPath();
        this.mouthGraphics.moveTo(26, 0);
        this.mouthGraphics.lineTo(28, 2);
        this.mouthGraphics.lineTo(26, 4);
        this.mouthGraphics.stroke();

        // Lip highlight
        this.mouthGraphics.lineStyle(1, this.lightColor, 0.3);
        this.mouthGraphics.lineBetween(26, -1, 28, 1);
    }

    drawMouthOpen() {
        this.mouthGraphics.clear();

        // Open mouth interior
        this.mouthGraphics.fillStyle(0x660033, 1);
        this.mouthGraphics.fillEllipse(26, 2, 8, 7);
        this.mouthGraphics.fillStyle(0x440022, 1);
        this.mouthGraphics.fillEllipse(27, 2, 5, 5);

        // Teeth row top
        this.mouthGraphics.fillStyle(0xffffff, 0.9);
        for (let i = 0; i < 3; i++) {
            this.mouthGraphics.fillTriangle(23 + i * 3, -1, 24 + i * 3, -4, 25 + i * 3, -1);
        }
        // Teeth row bottom
        for (let i = 0; i < 3; i++) {
            this.mouthGraphics.fillTriangle(23 + i * 3, 5, 24 + i * 3, 8, 25 + i * 3, 5);
        }

        // Tongue hint
        this.mouthGraphics.fillStyle(0xff6688, 0.7);
        this.mouthGraphics.fillEllipse(25, 3, 4, 2);
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
        // Update dash cooldown
        if (this.dashCooldownRemaining > 0) {
            this.dashCooldownRemaining -= delta;
            if (this.dashCooldownRemaining <= 0) {
                this.dashCooldownRemaining = 0;
                this.canDash = true;
            }
        }

        // Move towards mouse
        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

        const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
        const distance = Phaser.Math.Distance.Between(this.x, this.y, worldPoint.x, worldPoint.y);

        // Rotate to face direction
        this.rotation = angle;

        // If dashing, use dash velocity
        if (this.isDashing) {
            this.body.velocity.x = this.dashDirection.x * this.dashSpeed;
            this.body.velocity.y = this.dashDirection.y * this.dashSpeed;
        } else {
            // Normal movement - move if not too close to cursor
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

    dash() {
        if (!this.canDash || this.isDashing) return false;

        // Get dash direction (current facing direction)
        this.dashDirection.x = Math.cos(this.rotation);
        this.dashDirection.y = Math.sin(this.rotation);

        // Start dash
        this.isDashing = true;
        this.canDash = false;
        this.dashHitEnemies.clear(); // Reset hit enemies for new dash

        // Create dash visual effect
        this.createDashEffect();

        // End dash after duration
        this.scene.time.delayedCall(this.dashDuration, () => {
            this.isDashing = false;
            this.dashCooldownRemaining = this.dashCooldown;
        });

        return true;
    }

    createDashEffect() {
        const startX = this.x;
        const startY = this.y;

        // === INITIAL BURST ===
        // Energy ring at start position
        const burstRing = this.scene.add.graphics();
        burstRing.lineStyle(4, 0x00ffff, 1);
        burstRing.strokeCircle(0, 0, 15);
        burstRing.x = startX;
        burstRing.y = startY;

        this.scene.tweens.add({
            targets: burstRing,
            scale: 4,
            alpha: 0,
            duration: 300,
            ease: 'Quad.out',
            onComplete: () => burstRing.destroy()
        });

        // Inner glow burst
        const innerGlow = this.scene.add.graphics();
        innerGlow.fillStyle(0x00ffff, 0.6);
        innerGlow.fillCircle(0, 0, 25);
        innerGlow.x = startX;
        innerGlow.y = startY;

        this.scene.tweens.add({
            targets: innerGlow,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => innerGlow.destroy()
        });

        // === SPEED LINES ===
        for (let i = 0; i < 8; i++) {
            const line = this.scene.add.graphics();
            const offsetAngle = this.rotation + (Math.random() - 0.5) * 0.5;
            const offsetDist = 10 + Math.random() * 15;
            const perpX = Math.cos(this.rotation + Math.PI/2) * (Math.random() - 0.5) * 30;
            const perpY = Math.sin(this.rotation + Math.PI/2) * (Math.random() - 0.5) * 30;

            line.lineStyle(2 + Math.random() * 2, 0x00ffff, 0.8);
            line.lineBetween(0, 0, -40 - Math.random() * 30, 0);
            line.x = startX + perpX;
            line.y = startY + perpY;
            line.rotation = this.rotation;

            this.scene.tweens.add({
                targets: line,
                alpha: 0,
                x: line.x - this.dashDirection.x * 50,
                y: line.y - this.dashDirection.y * 50,
                duration: 250,
                delay: i * 20,
                onComplete: () => line.destroy()
            });
        }

        // === AFTERIMAGES WITH GLOW ===
        for (let i = 0; i < 5; i++) {
            // Glow behind afterimage
            const glow = this.scene.add.graphics();
            glow.fillStyle(0x00ffff, 0.3 - i * 0.05);
            glow.fillCircle(0, 0, 30 - i * 3);
            glow.x = startX - this.dashDirection.x * (i + 1) * 15;
            glow.y = startY - this.dashDirection.y * (i + 1) * 15;

            this.scene.tweens.add({
                targets: glow,
                alpha: 0,
                scale: 1.5,
                duration: 300,
                delay: i * 25,
                onComplete: () => glow.destroy()
            });

            // Fish silhouette
            const afterimage = this.scene.add.graphics();
            afterimage.fillStyle(this.baseColor, 0.5 - i * 0.08);
            afterimage.fillEllipse(0, 0, 35, 22);
            // Tail
            afterimage.fillTriangle(-20, 0, -35, -10, -35, 10);
            afterimage.x = startX - this.dashDirection.x * (i + 1) * 15;
            afterimage.y = startY - this.dashDirection.y * (i + 1) * 15;
            afterimage.rotation = this.rotation;

            this.scene.tweens.add({
                targets: afterimage,
                alpha: 0,
                scale: 0.6,
                duration: 300,
                delay: i * 25,
                onComplete: () => afterimage.destroy()
            });
        }

        // === PARTICLE TRAIL ===
        for (let i = 0; i < 12; i++) {
            const particle = this.scene.add.graphics();
            const size = 2 + Math.random() * 4;
            particle.fillStyle(0x00ffff, 0.8);
            particle.fillCircle(0, 0, size);

            const spread = (Math.random() - 0.5) * 40;
            particle.x = startX + Math.cos(this.rotation + Math.PI/2) * spread;
            particle.y = startY + Math.sin(this.rotation + Math.PI/2) * spread;

            this.scene.tweens.add({
                targets: particle,
                x: particle.x - this.dashDirection.x * (30 + Math.random() * 40),
                y: particle.y - this.dashDirection.y * (30 + Math.random() * 40),
                alpha: 0,
                scale: 0,
                duration: 300 + Math.random() * 200,
                delay: Math.random() * 50,
                onComplete: () => particle.destroy()
            });
        }

        // === FLASH EFFECT ON FISH ===
        // White flash
        this.scene.tweens.add({
            targets: [this.bodyGraphics, this.tailGraphics, this.dorsalFinGraphics],
            alpha: 0.3,
            duration: 40,
            yoyo: true,
            repeat: 2
        });

        // Temporary cyan tint overlay
        const flashOverlay = this.scene.add.graphics();
        flashOverlay.fillStyle(0x00ffff, 0.5);
        flashOverlay.fillEllipse(0, 0, 40, 25);
        this.add(flashOverlay);

        this.scene.tweens.add({
            targets: flashOverlay,
            alpha: 0,
            duration: 150,
            onComplete: () => flashOverlay.destroy()
        });

        // === SCREEN EFFECTS ===
        this.scene.cameras.main.shake(100, 0.004);

        // Brief zoom effect
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: 1.02,
            duration: 50,
            yoyo: true,
            ease: 'Quad.out'
        });
    }

    getDashCooldownPercent() {
        if (this.canDash) return 1;
        return 1 - (this.dashCooldownRemaining / this.dashCooldown);
    }

    getDashDamage() {
        if (!this.stats.dashDamage) return 0;
        return this.getDamage() * this.stats.dashDamageMultiplier;
    }

    canDashDamage() {
        return this.isDashing && this.stats.dashDamage;
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
        if (effects.dashDamage) {
            this.stats.dashDamage = true;
            this.stats.dashDamageMultiplier = effects.dashDamageMultiplier || 0.8;
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

        // Apply scale with smooth animation
        this.scene.tweens.add({
            targets: this,
            scaleX: visual.scaleX,
            scaleY: visual.scaleY,
            duration: 500,
            ease: 'Back.out'
        });

        // Evolution flash effect
        this.createEvolutionFlash(visual.color);

        // Add shell for armored form
        if (visual.hasShell) {
            this.createArmorEffect();
        }

        // Add glow for electric/luminescent form
        if (visual.glowing) {
            this.createGlowEffect(visual.color);
        }

        // Add transparency for phantom form
        if (visual.transparent) {
            this.createPhantomEffect();
        }

        // Add sparks for storm form
        if (visual.sparks) {
            this.createStormEffect();
        }
    }

    createEvolutionFlash(color) {
        // Bright flash when evolving
        const flash = this.scene.add.graphics();
        flash.fillStyle(color, 0.8);
        flash.fillCircle(this.x, this.y, 10);

        this.scene.tweens.add({
            targets: flash,
            scaleX: 8,
            scaleY: 8,
            alpha: 0,
            duration: 600,
            ease: 'Expo.out',
            onComplete: () => flash.destroy()
        });

        // Particle burst
        for (let i = 0; i < 12; i++) {
            const particle = this.scene.add.graphics();
            const angle = (i / 12) * Math.PI * 2;
            particle.fillStyle(color, 1);
            particle.fillCircle(0, 0, 4);
            particle.x = this.x;
            particle.y = this.y;

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * 80,
                y: this.y + Math.sin(angle) * 80,
                alpha: 0,
                scale: 0.2,
                duration: 500,
                ease: 'Expo.out',
                onComplete: () => particle.destroy()
            });
        }
    }

    createArmorEffect() {
        if (!this.shellGraphics) {
            this.shellGraphics = this.scene.add.graphics();
            this.add(this.shellGraphics);
        }
        this.shellGraphics.clear();

        // Metallic shell with gradient effect
        // Outer shell
        this.shellGraphics.lineStyle(4, 0xaaaaaa, 1);
        this.shellGraphics.strokeEllipse(0, 0, 55, 35);

        // Inner highlight
        this.shellGraphics.lineStyle(2, 0xdddddd, 0.8);
        this.shellGraphics.strokeEllipse(0, -3, 48, 28);

        // Armor plate segments
        this.shellGraphics.lineStyle(2, 0x666666, 0.7);
        for (let i = 0; i < 5; i++) {
            const x = -20 + i * 10;
            // Hexagonal plates
            this.shellGraphics.beginPath();
            for (let j = 0; j < 6; j++) {
                const angle = (j / 6) * Math.PI * 2;
                const px = x + Math.cos(angle) * 6;
                const py = Math.sin(angle) * 6;
                if (j === 0) this.shellGraphics.moveTo(px, py);
                else this.shellGraphics.lineTo(px, py);
            }
            this.shellGraphics.closePath();
            this.shellGraphics.stroke();
        }

        // Shine effect
        this.shellGraphics.fillStyle(0xffffff, 0.3);
        this.shellGraphics.fillEllipse(-10, -8, 15, 6);
    }

    createGlowEffect(color) {
        if (!this.electricGlow) {
            this.electricGlow = this.scene.add.graphics();
            this.addAt(this.electricGlow, 0);
        }

        // Animated glow aura
        const drawGlow = () => {
            if (!this.electricGlow || !this.scene) return;
            this.electricGlow.clear();

            // Outer glow
            this.electricGlow.fillStyle(color, 0.15);
            this.electricGlow.fillCircle(0, 0, 50);

            // Inner glow
            this.electricGlow.fillStyle(color, 0.25);
            this.electricGlow.fillCircle(0, 0, 35);

            // Core glow
            this.electricGlow.fillStyle(0xffffff, 0.2);
            this.electricGlow.fillCircle(0, 0, 20);

            // Lightning bolts
            this.electricGlow.lineStyle(2, color, 0.9);
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
                const startR = 25;
                const endR = 40 + Math.random() * 15;

                // Jagged lightning
                let px = Math.cos(angle) * startR;
                let py = Math.sin(angle) * startR;
                this.electricGlow.beginPath();
                this.electricGlow.moveTo(px, py);

                for (let j = 0; j < 3; j++) {
                    const progress = (j + 1) / 3;
                    const jitter = (Math.random() - 0.5) * 15;
                    px = Math.cos(angle + jitter * 0.05) * (startR + (endR - startR) * progress);
                    py = Math.sin(angle + jitter * 0.05) * (startR + (endR - startR) * progress) + jitter;
                    this.electricGlow.lineTo(px, py);
                }
                this.electricGlow.stroke();
            }
        };

        // Initial draw
        drawGlow();

        // Animate glow
        if (!this.glowTimer) {
            this.glowTimer = this.scene.time.addEvent({
                delay: 100,
                callback: drawGlow,
                loop: true
            });
        }
    }

    createPhantomEffect() {
        // Make player semi-transparent
        this.setAlpha(0.6);

        // Ghost trail effect
        if (!this.ghostTrail) {
            this.ghostTrail = [];
        }

        // Add afterimage effect in update
        this.isPhantom = true;
    }

    createStormEffect() {
        if (!this.stormGraphics) {
            this.stormGraphics = this.scene.add.graphics();
            this.addAt(this.stormGraphics, 0);
        }

        const drawStorm = () => {
            if (!this.stormGraphics || !this.scene) return;
            this.stormGraphics.clear();

            // Swirling storm aura
            this.stormGraphics.lineStyle(2, 0x4488ff, 0.5);
            for (let i = 0; i < 3; i++) {
                const time = this.scene.time.now * 0.003 + i * 2;
                const radius = 35 + i * 8;

                this.stormGraphics.beginPath();
                for (let j = 0; j <= 20; j++) {
                    const angle = (j / 20) * Math.PI * 2 + time;
                    const r = radius + Math.sin(angle * 3 + time) * 5;
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r * 0.6;
                    if (j === 0) this.stormGraphics.moveTo(x, y);
                    else this.stormGraphics.lineTo(x, y);
                }
                this.stormGraphics.stroke();
            }

            // Electric sparks
            this.stormGraphics.fillStyle(0xffff00, 0.9);
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 30 + Math.random() * 25;
                this.stormGraphics.fillCircle(
                    Math.cos(angle) * dist,
                    Math.sin(angle) * dist,
                    2 + Math.random() * 2
                );
            }
        };

        drawStorm();

        if (!this.stormTimer) {
            this.stormTimer = this.scene.time.addEvent({
                delay: 50,
                callback: drawStorm,
                loop: true
            });
        }
    }

    isDead() {
        return this.stats.health <= 0;
    }
}
