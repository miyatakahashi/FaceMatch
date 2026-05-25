class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        const colors = ['blue', 'green', 'pink', 'purple', 'red', 'yellow'];
        colors.forEach(c => {
            this.load.image(c + '_body', 'assets/' + c + '_body_circle.png');
        });
        this.load.image('face_frown', 'assets/face_frown_open_eye.png');
        this.load.image('face_smile', 'assets/face_smile_open_eye.png');
    }

    create() {
        this.matchedCount = 0;
        this.totalPairs = 5;
        this.selected = null;
        this.canClick = true;
        this.faces = [];

        this.createHeader();
        this.spawnFaces();

        this.input.on('pointerdown', (pointer) => {
            if (!this.canClick) return;
            const clicked = this.faces.find(f =>
                f.body.getBounds().contains(pointer.x, pointer.y) ||
                f.face.getBounds().contains(pointer.x, pointer.y)
            );
            if (clicked && !clicked.happy) {
                this.handleFaceClick(clicked);
            }
        });
    }

    createHeader() {
        this.headerBg = this.add.rectangle(400, 30, 800, 60, 0x2c3e50);
        this.titleText = this.add.text(400, 22, 'FaceClicker', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ecf0f1',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scoreText = this.add.text(400, 48, 'Matched: 0 / 5', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#bdc3c7'
        }).setOrigin(0.5);

        this.instructionText = this.add.text(400, 80, 'Click two faces of the same color to make them happy!', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#7f8c8d'
        }).setOrigin(0.5);
    }

    spawnFaces() {
        const colors = ['blue', 'green', 'pink', 'purple', 'red', 'yellow'];
        const shuffled = Phaser.Utils.Array.Shuffle(colors);
        const chosen = shuffled.slice(0, this.totalPairs);

        const pairs = [];
        chosen.forEach(color => {
            pairs.push(color);
            pairs.push(color);
        });

        const shuffledPairs = Phaser.Utils.Array.Shuffle(pairs);

        const cols = 5;
        const rows = 2;
        const startX = 130;
        const startY = 180;
        const spacingX = 140;
        const spacingY = 200;

        shuffledPairs.forEach((color, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const body = this.add.image(x, y, color + '_body');
            const face = this.add.image(x, y, 'face_frown');

            body.setScale(0.5);
            face.setScale(0.5);

            const faceObj = { body, face, color, happy: false, selected: false };
            this.faces.push(faceObj);

            body.setInteractive();
            face.setInteractive();

            this.tweens.add({
                targets: [body, face],
                scaleX: 0.52,
                scaleY: 0.52,
                duration: 1500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: i * 100
            });
        });
    }

    handleFaceClick(clicked) {
        if (this.selected === clicked) {
            this.deselectFace(clicked);
            this.selected = null;
            return;
        }

        if (!this.selected) {
            this.selectFace(clicked);
            this.selected = clicked;
            return;
        }

        if (this.selected.color === clicked.color) {
            this.canClick = false;
            this.matchFaces(this.selected, clicked);
        } else {
            this.canClick = false;
            this.mismatchFaces(this.selected, clicked);
        }
    }

    selectFace(faceObj) {
        faceObj.selected = true;
        this.tweens.add({
            targets: [faceObj.body, faceObj.face],
            scaleX: 0.6,
            scaleY: 0.6,
            duration: 200,
            ease: 'Back.easeOut'
        });

        const ring = this.add.circle(
            faceObj.body.x, faceObj.body.y,
            40, 0xffffff, 0.4
        );
        ring.setStrokeStyle(3, 0xffffff, 1);
        this.tweens.add({
            targets: ring,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
    }

    deselectFace(faceObj) {
        faceObj.selected = false;
        this.tweens.add({
            targets: [faceObj.body, faceObj.face],
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 200,
            ease: 'Back.easeIn'
        });
    }

    matchFaces(a, b) {
        this.tweens.killTweensOf([a.body, a.face]);
        this.tweens.killTweensOf([b.body, b.face]);

        this.tweens.add({
            targets: [a.body, a.face],
            scaleX: 0.65,
            scaleY: 0.65,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                a.face.setTexture('face_smile');
                a.happy = true;
                b.face.setTexture('face_smile');
                b.happy = true;

                this.matchedCount++;
                this.scoreText.setText('Matched: ' + this.matchedCount + ' / ' + this.totalPairs);

                this.celebrateFace(a);
                this.celebrateFace(b);

                this.tweens.add({
                    targets: [a.body, a.face],
                    scaleX: 0.5,
                    scaleY: 0.5,
                    duration: 500,
                    ease: 'Elastic.easeOut',
                    delay: 300
                });
                this.tweens.add({
                    targets: [b.body, b.face],
                    scaleX: 0.5,
                    scaleY: 0.5,
                    duration: 500,
                    ease: 'Elastic.easeOut',
                    delay: 300,
                    onComplete: () => {
                        this.selected = null;
                        this.canClick = true;
                        if (this.matchedCount >= this.totalPairs) {
                            this.gameWin();
                        }
                    }
                });
            }
        });
    }

    celebrateFace(faceObj) {
        const colorMap = {
            blue: 0x3498db, green: 0x2ecc71, pink: 0xe91e63,
            purple: 0x9b59b6, red: 0xe74c3c, yellow: 0xf1c40f
        };
        const tint = colorMap[faceObj.color] || 0xffffff;

        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const particle = this.add.circle(
                faceObj.body.x,
                faceObj.body.y,
                5,
                tint
            );

            this.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * 70,
                y: particle.y + Math.sin(angle) * 70,
                alpha: 0,
                scale: 0,
                duration: 600,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    mismatchFaces(a, b) {
        const shake = (faceObj) => {
            const origX = faceObj.body.x;
            this.tweens.add({
                targets: [faceObj.body, faceObj.face],
                x: origX - 10,
                duration: 50,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    faceObj.body.x = origX;
                    faceObj.face.x = origX;
                }
            });
        };

        shake(a);
        shake(b);

        this.tweens.add({
            targets: [a.body, a.face],
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 200,
            delay: 350,
            ease: 'Back.easeIn'
        });
        this.tweens.add({
            targets: [b.body, b.face],
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 200,
            delay: 350,
            ease: 'Back.easeIn',
            onComplete: () => {
                a.selected = false;
                b.selected = false;
                this.selected = null;
                this.canClick = true;
            }
        });
    }

    gameWin() {
        this.canClick = false;
        this.instructionText.destroy();

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5);

        const winPanel = this.add.rectangle(400, 300, 500, 200, 0x2c3e50, 0.95);
        winPanel.setStrokeStyle(4, 0xecf0f1);

        this.add.text(400, 260, 'All Faces Are Happy!', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 310, 'You made everyone smile!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        const restartBtn = this.add.text(400, 360, 'Play Again', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            fontStyle: 'bold',
            backgroundColor: '#27ae60',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartBtn.on('pointerover', () => restartBtn.setStyle({ color: '#ffffff' }));
        restartBtn.on('pointerout', () => restartBtn.setStyle({ color: '#2ecc71' }));
        restartBtn.on('pointerdown', () => this.scene.restart());

        this.confetti();
    }

    confetti() {
        const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6, 0xe91e63];
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(-100, -20);
            const size = Phaser.Math.Between(3, 8);
            const color = Phaser.Utils.Array.GetRandom(colors);
            const piece = this.add.rectangle(x, y, size, size * 2, color);

            this.tweens.add({
                targets: piece,
                y: 650,
                x: x + Phaser.Math.Between(-100, 100),
                angle: Phaser.Math.Between(0, 720),
                duration: Phaser.Math.Between(1500, 3000),
                delay: i * 50,
                ease: 'Cubic.easeIn',
                onComplete: () => piece.destroy()
            });
        }
    }
}
