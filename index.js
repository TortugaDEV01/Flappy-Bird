console.log(`Feito por TortugaDev[Cristiano Araújo]`);
console.log(`[TortugaDEV] Flappy bird`);

// Files
const sound_HIT = new Audio()
sound_HIT.src = './effects/hit.wav'
const sprites = new Image()
sprites.src = './sprites.png'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

let frames = 0

// FlappyBird
function CreateFlappyBird() {
    const flappyBird = {
        spriteX: 0,
        spriteY: 0,
        spriteW: 33,
        spriteH: 24,
        w: 40,
        h: 31,
        x: 10,
        y: 50,
        gravity: 0.30,
        speed: 0,
        jump_speed: 5.6,
        moviments: [
            { spriteX: 0, spriteY: 26 }, // asa no meio
            { spriteX: 0, spriteY: 0 }, // asa para cima
            { spriteX: 0, spriteY: 26 }, // asa no meio
            { spriteX: 0, spriteY: 52 }, // asa para baixo
        ],
        frameCurrent: 0,
        UpdateFrameCurrent() {
            const interval_frames = 10
            const passed_interval = frames % interval_frames === 0;

            if (passed_interval) {
                const increment = this.frameCurrent + 1
                const base_repet = this.moviments.length
                this.frameCurrent = increment % base_repet
            }
        },
        Draw() {
            const { spriteX, spriteY } = this.moviments[this.frameCurrent]

            ctx.drawImage(
                sprites,
                spriteX, spriteY,
                this.spriteW, this.spriteH,
                this.x, this.y,
                this.w, this.h,
            )

        },
        Jump() {
            this.speed = -this.jump_speed
        },
        CollisionVerify(obj_main, obj_collide) {
            const obj_mainY = obj_main.y + obj_main.h
            const obj_collideY = obj_collide.y

            if (obj_mainY >= obj_collideY) {
                sound_HIT.play()
                return true
            }
        },
        Update() {
            this.UpdateFrameCurrent()
            if (this.CollisionVerify(flappyBird, global.floor)) {
                SwitchScreens(Windows.GameOver)
                return
            }

            if (this.y < 0) {
                this.speed = 0
            }

            this.speed += this.gravity
            this.y += this.speed
        },
    }
    return flappyBird
}

// Chão
function CreateFloor() {
    const floor = {
        spriteX: 0,
        spriteY: 610,
        spriteW: 224,
        spriteH: 112,
        w: 280,
        h: 150,
        x: 0,
        y: canvas.height - 150,
        Draw() {
            ctx.drawImage(
                sprites,
                this.spriteX, this.spriteY,
                this.spriteW, this.spriteH,
                this.x, this.y,
                this.w, this.h
            )

            ctx.drawImage(
                sprites,
                this.spriteX, this.spriteY,
                this.spriteW, this.spriteH,
                this.x + this.w, this.y,
                this.w, this.h
            )
        },
        Update() {
            const repeat = this.w / 2
            const moviment = this.x - 2

            this.x = moviment % repeat
        }
    }

    return floor
}

// Pipe
function CreatePipe() {
    const pipe = {
        spriteW: 52,
        spriteH: 400,
        floor: {
            spriteX: 0,
            spriteY: 169,
            x: 0,
            y: 0,
        },
        sky: {
            spriteX: 52,
            spriteY: 169,
            x: 0,
            y: 0,
        },
        w: 65,
        h: 400,
        spacing: 140,
        Draw() {
            this.couple.forEach(par => {
                // Sky pipe
                this.sky.x = par.x
                this.sky.y = par.y


                ctx.drawImage(
                    sprites,
                    this.sky.spriteX, this.sky.spriteY,
                    this.spriteW, this.spriteH,
                    this.sky.x, this.sky.y,
                    this.w, this.h
                )

                // Floor pipe
                this.floor.x = par.x
                this.floor.y = this.h + this.spacing + par.y

                ctx.drawImage(
                    sprites,
                    this.floor.spriteX, this.floor.spriteY,
                    this.spriteW, this.spriteH,
                    this.floor.x, this.floor.y,
                    this.w, this.h
                )

                par.skyPipe = {
                    x: this.sky.x,
                    y: this.h + this.sky.y
                }
                par.floorPipe = {
                    x: this.floor.x,
                    y: this.floor.y
                }
            })
        },
        CollisionFlappyBird(par) {
            const head_FlappyBird = global.flappyBird.y
            const foot_FlappyBird = global.flappyBird.y + global.flappyBird.h

            if (global.flappyBird.x + global.flappyBird.w >= par.x) {
                if (head_FlappyBird <= par.skyPipe.y) {
                    return true
                }

                if (foot_FlappyBird >= par.floorPipe.y) {
                    return true
                }
            }
            return false
        },
        couple: [],
        Update() {
            const number_framesPassed = frames % 150 === 0
            const randomY_min = -150
            const randomY_max = -320
            const y_random = -150 * (Math.random() + 1)

            if (number_framesPassed) {
                this.couple.push({ x: canvas.width, y: y_random })
            }

            this.couple.forEach(par => {
                par.x -= 2

                if (this.CollisionFlappyBird(par)) {
                    sound_HIT.play()
                    SwitchScreens(Windows.GameOver)
                    return
                }

                if (par.x <= -this.w) {
                    this.couple.shift()
                }

                if (global.flappyBird.x - global.flappyBird.w === par.x) {
                    global.scoring.score += 1
                }
            })
        }
    }

    return pipe
}

// Scoring
function CreateScoring() {
    const scoring = {
        score: 0,
        Draw() {
            ctx.font = '40px "VT323"'
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.fillText(this.score, canvas.width / 2, 50)
        },
        Update() {

        }
    }

    return scoring
}

// Background
const background = {
    spriteX: 390,
    spriteY: 0,
    spriteW: 275,
    spriteH: 204,
    w: 275,
    h: 204,
    x: 0,
    y: canvas.height - 204 - 45,
    Draw() {
        ctx.fillStyle = '#70c5ce'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.drawImage(
            sprites,
            this.spriteX, this.spriteY,
            this.spriteW, this.spriteH,
            this.x, this.y,
            this.w, this.h
        )

        ctx.drawImage(
            sprites,
            this.spriteX, this.spriteY,
            this.spriteW, this.spriteH,
            this.x + this.w, this.y,
            this.w, this.h
        )
    }
}

// Mensagem inicial
const messageGetReady = {
    spriteX: 134,
    spriteY: 0,
    spriteW: 174,
    spriteH: 152,
    w: 174 + 20,
    h: 152 + 20,
    x: (canvas.width / 2) - (174 + 20) / 2,
    y: 120,
    Draw() {
        ctx.fillStyle = '#00000030'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.drawImage(
            sprites,
            this.spriteX, this.spriteY,
            this.spriteW, this.spriteH,
            this.x, this.y,
            this.w, this.h
        )
    }
}

const messageGameOver = {
    spriteX: 134,
    spriteY: 153,
    spriteW: 226,
    spriteH: 200,
    w: 226 + 20,
    h: 200 + 20,
    x: (canvas.width / 2) - (226 + 20) / 2,
    y: 120,
    medal: {
        spriteW: 44,
        spriteH: 44,
        w: 44,
        h: 44,
        x: 30,
        y: 98,
    },
    spriteMedals: [
        {
            spriteX: 0,
            spriteY: 124,
            scoreMax: 45,
            scoreMin: 35,
        },
        {
            spriteX: 48,
            spriteY: 124,
            scoreMax: 35,
            scoreMin: 25,
        },
        {
            spriteX: 48,
            spriteY: 78,
            scoreMax: 25,
            scoreMin: 10,
        },
        {
            spriteX: 0,
            spriteY: 78,
            scoreMax: 10,
            scoreMin: 0,
        },
    ],
    MedalVerify(score) {
        this.spriteMedals.forEach((m, i) => {
            if (score < m.scoreMax & score >= m.scoreMin) {
                this.medal_current = i
                this.best = i + 1
            }
        })
    },
    medal_current: 0,
    best: 0,
    Draw() {
        // GameOver
        ctx.fillStyle = '#00000030'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.drawImage(
            sprites,
            this.spriteX, this.spriteY,
            this.spriteW, this.spriteH,
            this.x, this.y,
            this.w, this.h
        )
        // Score
        ctx.fillStyle = '#ffffffff'
        ctx.font = '25px "VT323"'
        ctx.textAlign = 'center'
        ctx.fillText(global.scoring.score, 200 + this.x, 100 + this.y)

        // Best
        ctx.fillStyle = '#ffffffff'
        ctx.font = '25px "VT323"'
        ctx.textAlign = 'center'
        ctx.fillText(`#${this.best}`, 200 + this.x, 145 + this.y)

        // Medals
        const spriteMedal = this.spriteMedals[this.medal_current]
        this.MedalVerify(global.scoring.score)

        ctx.drawImage(
            sprites,
            spriteMedal.spriteX, spriteMedal.spriteY,
            this.medal.spriteW, this.medal.spriteH,
            this.medal.x + this.x, this.medal.y + this.y,
            this.medal.w, this.medal.h
        )
    }
}

// Windows
const global = {}
let windowActive = {}

function SwitchScreens(newWindow) {
    windowActive = newWindow

    if (windowActive.Initialize) {
        windowActive.Initialize()
    }
}

const Windows = {
    Start: {
        Initialize() {
            global.flappyBird = CreateFlappyBird()
            global.floor = CreateFloor()
            global.pipe = CreatePipe()
        },
        Draw() {
            background.Draw()
            global.floor.Draw()
            global.flappyBird.Draw()
            messageGetReady.Draw()
        },
        Click() {
            SwitchScreens(Windows.Game)
        },
        Update() {
            global.floor.Update()
            global.flappyBird.UpdateFrameCurrent()
        }
    },

    Game: {
        Initialize() {
            global.scoring = CreateScoring()
        },
        Draw() {
            background.Draw()
            global.pipe.Draw()
            global.floor.Draw()
            global.flappyBird.Draw()
            global.scoring.Draw()
        },
        Click() {
            global.flappyBird.Jump()
        },
        Update() {
            global.flappyBird.Update()
            global.floor.Update()
            global.pipe.Update()
            global.scoring.Update()
        }
    },

    GameOver: {
        //Initialize() {
        //  global.scoring = CreateScoring()
        //},
        Draw() {
            background.Draw()
            global.pipe.Draw()
            global.floor.Draw()
            global.flappyBird.Draw()
            global.scoring.Draw()
            messageGameOver.Draw()
        },
        Click() {
            SwitchScreens(Windows.Start)
        },
        Update() {

        }
    }
}

function LoopFps() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    windowActive.Draw()
    windowActive.Update()

    frames += 1

    requestAnimationFrame(LoopFps)
}

window.addEventListener('click', () => {
    if (windowActive.Click) {
        windowActive.Click()
    }
})

SwitchScreens(Windows.Start)
LoopFps()