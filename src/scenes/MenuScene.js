import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create animated ocean background
        this.createBackground();

        // Create animated title
        this.createTitle(centerX);

        // Create main fish mascot
        this.createMascot(centerX, 280);

        // Create play button
        this.createPlayButton(centerX, 400);

        // Create instructions panel
        this.createInstructions(centerX, 520);

        // Create decorative fish swimming around
        this.createSwimmingFish();

        // Create DNA helix decoration
        this.createDNAHelix(70, 300);
        this.createDNAHelix(730, 300);
    }

    createBackground() {
        const bg = this.add.graphics();

        // Ocean gradient
        for (let y = 0; y < 600; y += 5) {
            const ratio = y / 600;
            const r = Math.floor(15 + (1 - ratio) * 25);
            const g = Math.floor(40 + (1 - ratio) * 60);
            const b = Math.floor(70 + (1 - ratio) * 50);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, 800, 5);
        }

        // Light rays from top
        for (let i = 0; i < 5; i++) {
            const x = 100 + i * 150;
            bg.fillStyle(0xffffff, 0.03);
            for (let y = 0; y < 400; y += 15) {
                const spread = y * 0.2;
                bg.fillTriangle(x, y, x - 20 - spread, y + 15, x + 20 + spread, y + 15);
            }
        }

        // Animated bubbles
        this.bubbles = [];
        for (let i = 0; i < 30; i++) {
            const bubble = this.add.graphics();
            const size = 2 + Math.random() * 6;
            bubble.fillStyle(0xffffff, 0.2 + Math.random() * 0.2);
            bubble.fillCircle(0, 0, size);
            bubble.fillStyle(0xffffff, 0.5);
            bubble.fillCircle(-size * 0.3, -size * 0.3, size * 0.3);

            bubble.x = Math.random() * 800;
            bubble.y = 650 + Math.random() * 200;
            bubble.speed = 30 + Math.random() * 50;
            bubble.wobbleSpeed = 2 + Math.random() * 3;
            bubble.wobblePhase = Math.random() * Math.PI * 2;

            this.bubbles.push(bubble);
        }

        // Seaweed at bottom
        for (let i = 0; i < 15; i++) {
            const x = 50 + i * 50 + Math.random() * 30;
            const seaweed = this.add.graphics();
            seaweed.fillStyle(0x1a5a3a, 0.7);

            for (let j = 0; j < 4; j++) {
                seaweed.fillEllipse(0, -j * 20, 6, 22);
            }
            seaweed.x = x;
            seaweed.y = 600;

            // Animate seaweed
            this.tweens.add({
                targets: seaweed,
                rotation: 0.15,
                duration: 1500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createTitle(centerX) {
        // Glow behind title
        const titleGlow = this.add.graphics();
        titleGlow.fillStyle(0x00ffff, 0.15);
        titleGlow.fillEllipse(centerX, 100, 400, 80);

        // Main title with shadow
        this.add.text(centerX + 3, 73, 'FISH HUNTER', {
            fontFamily: 'Arial Black',
            fontSize: '52px',
            fill: '#003366'
        }).setOrigin(0.5);

        const title = this.add.text(centerX, 70, 'FISH HUNTER', {
            fontFamily: 'Arial Black',
            fontSize: '52px',
            fill: '#00ffff',
            stroke: '#004466',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Animate title
        this.tweens.add({
            targets: title,
            y: 75,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle
        this.add.text(centerX, 130, 'Caza • Sobrevive • Evoluciona', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#88ddff',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Decorative fish icons
        this.add.text(centerX - 180, 70, '🐟', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(centerX + 180, 70, '🐟', { fontSize: '32px' }).setOrigin(0.5);
    }

    createMascot(centerX, y) {
        // Create main fish mascot
        const mascot = this.add.container(centerX, y);

        // Glow
        const glow = this.add.graphics();
        glow.fillStyle(0x00ff88, 0.2);
        glow.fillCircle(0, 0, 60);
        mascot.add(glow);

        // Shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.3);
        shadow.fillEllipse(5, 50, 70, 20);
        mascot.add(shadow);

        // Tail
        const tail = this.add.graphics();
        tail.fillStyle(0x00cc66, 1);
        tail.fillTriangle(-35, 0, -60, -20, -60, 20);
        tail.fillTriangle(-35, 0, -55, -15, -55, 15);
        mascot.add(tail);

        // Body
        const body = this.add.graphics();
        body.fillStyle(0x00ff88, 1);
        body.fillEllipse(0, 0, 70, 45);
        body.fillTriangle(30, 0, 40, -8, 40, 8);
        mascot.add(body);

        // Dorsal fin
        const dorsal = this.add.graphics();
        dorsal.fillStyle(0x00cc66, 1);
        dorsal.fillTriangle(-10, -22, 15, -22, 5, -40);
        mascot.add(dorsal);

        // Side fin
        const sideFin = this.add.graphics();
        sideFin.fillStyle(0x00cc66, 0.9);
        sideFin.fillTriangle(0, 15, -15, 30, 10, 20);
        mascot.add(sideFin);

        // Belly
        const belly = this.add.graphics();
        belly.fillStyle(0x66ffaa, 0.7);
        belly.fillEllipse(0, 8, 45, 18);
        mascot.add(belly);

        // Eye
        const eye = this.add.graphics();
        eye.fillStyle(0xffffff, 1);
        eye.fillEllipse(15, -8, 18, 14);
        eye.fillStyle(0x2255aa, 1);
        eye.fillCircle(18, -8, 6);
        eye.fillStyle(0x000000, 1);
        eye.fillCircle(20, -8, 3);
        eye.fillStyle(0xffffff, 0.9);
        eye.fillCircle(16, -10, 2);
        mascot.add(eye);

        // Mouth (smile)
        const mouth = this.add.graphics();
        mouth.lineStyle(2, 0x00aa55, 1);
        mouth.beginPath();
        mouth.arc(32, 5, 6, 0.3, 1.2);
        mouth.stroke();
        mascot.add(mouth);

        // Animate mascot
        this.tweens.add({
            targets: mascot,
            y: y - 10,
            duration: 1500,
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

        this.tweens.add({
            targets: sideFin,
            rotation: 0.3,
            duration: 400,
            yoyo: true,
            repeat: -1
        });
    }

    createPlayButton(centerX, y) {
        const button = this.add.container(centerX, y);

        // Button glow
        const buttonGlow = this.add.graphics();
        buttonGlow.fillStyle(0x00ff44, 0.3);
        buttonGlow.fillRoundedRect(-130, -40, 260, 80, 20);
        button.add(buttonGlow);

        // Button shadow
        const buttonShadow = this.add.graphics();
        buttonShadow.fillStyle(0x005522, 1);
        buttonShadow.fillRoundedRect(-118, -25, 236, 56, 15);
        button.add(buttonShadow);

        // Button background
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x00cc44, 1);
        buttonBg.fillRoundedRect(-120, -28, 240, 56, 15);
        buttonBg.lineStyle(3, 0x00ff66, 1);
        buttonBg.strokeRoundedRect(-120, -28, 240, 56, 15);
        button.add(buttonBg);

        // Button highlight
        const highlight = this.add.graphics();
        highlight.fillStyle(0x44ff88, 0.4);
        highlight.fillRoundedRect(-110, -24, 220, 20, 10);
        button.add(highlight);

        // Button text
        const text = this.add.text(0, 0, '▶  JUGAR', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            fill: '#ffffff',
            stroke: '#006622',
            strokeThickness: 2
        }).setOrigin(0.5);
        button.add(text);

        // Make interactive
        button.setInteractive(new Phaser.Geom.Rectangle(-120, -28, 240, 56), Phaser.Geom.Rectangle.Contains);

        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 1.08,
                duration: 150,
                ease: 'Back.out'
            });
            buttonBg.clear();
            buttonBg.fillStyle(0x00ee55, 1);
            buttonBg.fillRoundedRect(-120, -28, 240, 56, 15);
            buttonBg.lineStyle(3, 0x66ff88, 1);
            buttonBg.strokeRoundedRect(-120, -28, 240, 56, 15);
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 150
            });
            buttonBg.clear();
            buttonBg.fillStyle(0x00cc44, 1);
            buttonBg.fillRoundedRect(-120, -28, 240, 56, 15);
            buttonBg.lineStyle(3, 0x00ff66, 1);
            buttonBg.strokeRoundedRect(-120, -28, 240, 56, 15);
        });

        button.on('pointerdown', () => {
            this.tweens.add({
                targets: button,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    this.cameras.main.fade(500, 0, 0, 0);
                    this.time.delayedCall(500, () => {
                        this.scene.start('GameScene');
                    });
                }
            });
        });

        // Pulse animation
        this.tweens.add({
            targets: buttonGlow,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    createInstructions(centerX, y) {
        // Instructions panel background
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.4);
        panel.fillRoundedRect(centerX - 200, y - 45, 400, 90, 10);
        panel.lineStyle(1, 0x4488aa, 0.5);
        panel.strokeRoundedRect(centerX - 200, y - 45, 400, 90, 10);

        // Instructions
        const instructions = [
            { icon: '🖱️', text: 'Mouse para nadar' },
            { icon: '🖱️', text: 'Click para atacar' },
            { icon: '⌨️', text: 'E para evolucionar' }
        ];

        instructions.forEach((item, i) => {
            const xPos = centerX - 130 + i * 130;
            this.add.text(xPos, y - 15, item.icon, { fontSize: '24px' }).setOrigin(0.5);
            this.add.text(xPos, y + 15, item.text, {
                fontSize: '11px',
                fill: '#aaddff'
            }).setOrigin(0.5);
        });
    }

    createSwimmingFish() {
        // Small fish swimming in background
        const fishColors = [0x4a9fff, 0xff8c00, 0xff3333, 0xffff00];

        for (let i = 0; i < 6; i++) {
            const fish = this.add.graphics();
            const color = fishColors[Math.floor(Math.random() * fishColors.length)];
            const size = 8 + Math.random() * 6;
            const y = 150 + Math.random() * 300;
            const direction = Math.random() > 0.5 ? 1 : -1;

            fish.fillStyle(color, 0.6);
            fish.fillEllipse(0, 0, size * 2, size);
            fish.fillTriangle(-size, 0, -size * 1.5, -size * 0.5, -size * 1.5, size * 0.5);
            fish.fillStyle(0xffffff, 0.8);
            fish.fillCircle(size * 0.4, -size * 0.2, size * 0.25);

            fish.x = direction > 0 ? -50 : 850;
            fish.y = y;
            fish.scaleX = direction;

            // Animate fish swimming across
            this.tweens.add({
                targets: fish,
                x: direction > 0 ? 850 : -50,
                duration: 8000 + Math.random() * 6000,
                repeat: -1,
                delay: Math.random() * 5000
            });

            this.tweens.add({
                targets: fish,
                y: y + (Math.random() - 0.5) * 40,
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createDNAHelix(x, y) {
        // Decorative DNA helix
        const helix = this.add.container(x, y);

        for (let i = 0; i < 8; i++) {
            const yOffset = i * 30 - 100;
            const phase = i * 0.8;

            // Left strand
            const left = this.add.graphics();
            left.fillStyle(0x00ffff, 0.6);
            left.fillCircle(0, 0, 4);
            left.x = Math.sin(phase) * 15;
            left.y = yOffset;

            // Right strand
            const right = this.add.graphics();
            right.fillStyle(0xff00ff, 0.6);
            right.fillCircle(0, 0, 4);
            right.x = Math.sin(phase + Math.PI) * 15;
            right.y = yOffset;

            // Connection
            const conn = this.add.graphics();
            conn.lineStyle(2, 0xffffff, 0.3);
            conn.lineBetween(left.x, left.y, right.x, right.y);

            helix.add([conn, left, right]);
        }

        // Animate rotation
        this.tweens.add({
            targets: helix,
            angle: 360,
            duration: 8000,
            repeat: -1
        });

        helix.alpha = 0.5;
    }

    update(time, delta) {
        // Animate bubbles
        this.bubbles.forEach(bubble => {
            bubble.y -= bubble.speed * delta * 0.001;
            bubble.x += Math.sin(time * 0.001 * bubble.wobbleSpeed + bubble.wobblePhase) * 0.5;

            if (bubble.y < -20) {
                bubble.y = 620;
                bubble.x = Math.random() * 800;
            }
        });
    }
}
