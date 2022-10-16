import Phaser from "phaser";
import images from "./assets/*.png";

const gameOptions = {
    dudeGravity: 800,
    dudeSpeed: 300,
    weaponFireRate: 500,
    weaponNextFire: 0
}

const gameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
    },
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

const game = new Phaser.Game(gameConfig)

function preload() {
    this.load.image("sky", images.sky)
    this.load.image("cloud", images.cloud)
    this.load.image("ground", images.ground)
    this.load.image("spider", images.spider)
    this.load.image("star-yellow", images.staryellow)
    this.load.image("star-red", images.starred)
    this.load.image("bullet", images.bullet);
    this.load.spritesheet("dude", images.dude, {frameWidth: 32, frameHeight: 48});
}

function create() {
    this.add.image(400, 300, 'sky');
    this.score = 0;
    this.add.image(16, 16, "star-yellow");
    this.scoreText = this.add.text(32, 3, "0", {fontSize: "30px", fill: "#ffffff"})

    // Ground
    this.groundGroup = this.physics.add.group({
        immovable: true,
        allowGravity: false
    })
    this.groundGroup.create(400, 350, "ground");
    this.groundGroup.create(700, 400, "ground");
    this.groundGroup.setVelocityX(-gameOptions.dudeSpeed/4);

    // Dude
    this.dude = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, "dude");
    this.dude.body.gravity.y = gameOptions.dudeGravity;
    this.physics.add.collider(this.dude, this.groundGroup);

    // Bullets
    this.bulletsGroup = this.physics.add.group({});
    this.physics.add.collider(this.bulletsGroup, this.groundGroup, (bullet, ground) => {
        bullet.disableBody(true, true);
    });

    // Spiders
    this.spidersGroup = this.physics.add.group({});
    this.physics.add.collider(this.spidersGroup, this.groundGroup);
    this.physics.add.overlap(this.dude, this.spidersGroup, (dude, spider) => {
        this.scene.restart();
    }, null, this);
    this.physics.add.overlap(this.bulletsGroup, this.spidersGroup, (bullet, spider) => {
        spider.disableBody(true, true);
        bullet.disableBody(true, true);
    })

    // Yellow Stars
    this.starsYellowGroup = this.physics.add.group({});
    this.physics.add.collider(this.starsYellowGroup, this.groundGroup);
    this.physics.add.overlap(this.dude, this.starsYellowGroup, collectYellowStar, null, this);

    // Red Stars
    this.starsRedGroup = this.physics.add.group({});
    this.physics.add.collider(this.starsRedGroup, this.groundGroup);
    this.physics.add.overlap(this.dude, this.starsRedGroup, collectRedStar, null, this);

    // Input and Anims
    this.cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: "turn",
        frames: [{key: "dude", frame: 4}],
        frameRate: 10
    })

    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", {start: 5, end: 9}),
        frameRate: 10,
        repeate: -1
    })


    // Object generation
    this.triggerTime = this.time.addEvent({
        callback: addGround,
        callbackScope: this,
        delay: 3000,
        loop: true
    })

    this.triggerTime = this.time.addEvent({
        callback: addClouds,
        callbackScope: this,
        delay: 2800,
        loop: true
    })

    this.triggerTime = this.time.addEvent({
        callback: addSpiders,
        callbackScope: this,
        delay: 4000,
        loop: true
    })

    this.triggerTime = this.time.addEvent({
        callback: addYellowStars,
        callbackScope: this,
        delay: 1500,
        loop: true
    })

    this.triggerTime = this.time.addEvent({
        callback: addRedStars,
        callbackScope: this,
        delay: 5000,
        loop: true
    })
}

function addGround() {
    if (Phaser.Math.Between(0, 10) <= 7) {
        this.groundGroup.create(game.config.width+200, Phaser.Math.Between(game.config.height/2, game.config.height), "ground");
        this.groundGroup.setVelocityX(-gameOptions.dudeSpeed/4);
    } 
}

function addClouds() {
    if (Phaser.Math.Between(0, 10) <= 7) {
        this.groundGroup.create(game.config.width+200, Phaser.Math.Between(0, game.config.height/2), "cloud");
        this.groundGroup.setVelocityX(-gameOptions.dudeSpeed/4);
    }
}


function addSpiders() {
    if (Phaser.Math.Between(0, 1)) {
        this.spidersGroup.create(game.config.width, Phaser.Math.Between(0, game.config.height), "spider")
        this.spidersGroup.setVelocityX(-gameOptions.dudeSpeed/4);
        this.spidersGroup.setVelocityY(gameOptions.dudeSpeed/8);
    }
}


function addYellowStars() {
    if (Phaser.Math.Between(0, 1)) {
        this.starsYellowGroup.create(game.config.width, Phaser.Math.Between(0, game.config.height), "star-yellow");
        this.starsYellowGroup.setVelocityX(-gameOptions.dudeSpeed/4);
    }
}

function addRedStars() {
    if (Phaser.Math.Between(0, 1)) {
        this.starsRedGroup.create(game.config.width, Phaser.Math.Between(0, game.config.height), "star-red");
        this.starsRedGroup.setVelocityX(-gameOptions.dudeSpeed/4);
    }
}

function collectYellowStar (dude, star) {
    star.disableBody(true, true);
    this.score++;
    this.scoreText.setText(this.score);
}

function collectRedStar (dude, star) {
    star.disableBody(true, true);
    this.score = this.score + 3;
    this.scoreText.setText(this.score);
}


function update() {
    // Basic Movement
    if (this.cursors.left.isDown) {
        this.dude.body.velocity.x = -gameOptions.dudeSpeed;
        this.dude.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
        this.dude.body.velocity.x = gameOptions.dudeSpeed;
        this.dude.anims.play("right", true);
    } else {
        this.dude.body.velocity.x = 0;
        this.dude.anims.play("right", true);
    }

    // Jump
    if (this.cursors.up.isDown && this.dude.body.touching.down) {
        this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.25;
    }

    // Climb
    if (this.cursors.up.isDown && (this.dude.body.touching.right || this.dude.body.touching.left)) {
        this.dude.body.velocity.y = -gameOptions.dudeGravity / 2;
    }

    //Shoot
    if (this.cursors.space.isDown) {
        if (this.time.now > gameOptions.weaponNextFire) {
            gameOptions.weaponNextFire = this.time.now + gameOptions.weaponFireRate;
            this.bulletsGroup.create(this.dude.x+20, this.dude.y, "bullet");
            this.bulletsGroup.setVelocityX(gameOptions.dudeSpeed*2)
        } 
    }

    // Game over
    if (this.dude.y > game.config.height) {
        this.scene.restart();
    }
}