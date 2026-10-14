const Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Query = Matter.Query,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

// ---------- Ajustes de audio ----------
const MUTE_DB = -80;          // apagado por la tecla
const FLOOR_DB = -30;         // volumen mínimo cuando está activa pero abandonada (nunca silencio)
const DECAY_SECONDS = 10;     // segundos que tarda en bajar de 0 dB al piso si no la tocas
const RISE_SECONDS = 0.3;     // qué tan rápido recupera volumen cuando la tocas
const MOVE_THRESHOLD = 1.0;   // cuánto movimiento cuenta como "estar interactuando"
const HOVER_COUNTS = true;    // true: pasar el mouse encima también mantiene el volumen

// ---------- Reacción al clic ----------
const CLICK_SQUISH = 5;       // fuerza del "esquishe" (0 = nada, 8 = muy exagerado)
const CLICK_NUDGE = 3;        // empujoncito horizontal (se bambolea, no salta)
const CLICK_SPIN = 0.06;      // cuánto gira según en qué lado la tocas

// ---------- Suelo con tapizado halftone ----------
const FLOOR_RATIO = 0.15;            // alto del suelo (15% de la pantalla, igual que en el CSS)
const DOT_SPACING = 16;              // distancia entre puntos de una misma fila
const DOT_MAX = 9;                   // diámetro de los puntos en el borde de arriba
const DOT_MIN = 1.5;                 // diámetro de los puntos en el borde de abajo
const DOT_COLOR = [150, 55, 55];     // tono rojizo, parecido al fondo
const DOT_ALPHA = 55;                // opacidad 0-255 (más bajo = más sutil)

let engine;
let letters = [];
let failedFiles = [];
let mConstraint;
let audioStarted = false;
let assetsReady = false;

let floorY;
let floorPattern;

let tracks = {};
let images = {};

// ---------- Overlay: se registra FUERA de setup() para que siempre responda ----------
const overlay = document.getElementById('start-overlay');
const statusEl = document.getElementById('status');

overlay.addEventListener('click', async () => {
    if (!assetsReady || audioStarted) return; // aún cargando o ya iniciado

    try {
        await Tone.start();
        const t0 = Tone.now() + 0.1; // todas las pistas de todos los grupos arrancan sincronizadas
        Object.values(tracks).forEach(group => group.players.forEach(p => p.start(t0)));
        audioStarted = true;

        overlay.style.opacity = "0";
        setTimeout(() => overlay.style.display = "none", 500);
    } catch (e) {
        console.error('Error al iniciar audio:', e);
        statusEl.textContent = "Error al iniciar el audio (revisa la consola)";
    }
});

// Crea un grupo: varias pistas -> un solo bus de volumen
function makeGroup(files) {
    const bus = new Tone.Volume(MUTE_DB).toDestination();
    const players = files.map(f =>
        new Tone.Player({
            url: f,
            loop: true,
            onerror: (e) => {
                console.error('No cargó el audio:', f, e);
                failedFiles.push(f);
            }
        }).connect(bus)
    );
    return { bus, players };
}

function preload() {
    const img = (f) => loadImage(f, () => {}, () => console.error('No carga la imagen:', f));

    images.V = img('assets/v.png');
    images.A = img('assets/a.png');
    images.N = img('assets/n.png');
    images.S = img('assets/s.png');

    // V: voz líder + coros + backing (cambia los nombres por los de tus archivos reales)
    tracks.V = makeGroup([
        "assets/vocal.mp3",
        "assets/coros.mp3",
        "assets/backing.mp3"
    ]);
    tracks.A = makeGroup([
        "assets/guitar.mp3",
        "assets/guitar2.mp3",
        "assets/guitar3.mp3",
        "assets/guitar4.mp3"
    ]);  // A = guitarra
    tracks.N = makeGroup([
        "assets/bass.mp3",
        "assets/bass2.mp3",
        "assets/bass3.mp3"
    ]);  // N = bajo
    tracks.S = makeGroup(["assets/drums.mp3"]);   // S = batería
}

// Dibuja UNA vez el tapizado halftone del suelo (rejilla a 45°, puntos que se achican hacia abajo)
function buildFloorPattern() {
    const h = height - floorY;
    floorPattern = createGraphics(width, h);
    floorPattern.noStroke();
    floorPattern.fill(DOT_COLOR[0], DOT_COLOR[1], DOT_COLOR[2], DOT_ALPHA);

    const rowStep = DOT_SPACING / 2;
    for (let r = 0, y = rowStep / 2; y < h; r++, y += rowStep) {
        const t = y / h;                               // 0 arriba, 1 abajo
        const d = lerp(DOT_MAX, DOT_MIN, pow(t, 0.8)); // tamaño del punto en esta fila
        const offset = (r % 2) * (DOT_SPACING / 2);    // filas alternas desplazadas = diagonal
        for (let x = offset; x < width + DOT_SPACING; x += DOT_SPACING) {
            floorPattern.circle(x, y, d);
        }
    }
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('position', 'absolute');
    canvas.style('top', '0');
    canvas.style('z-index', '1');

    engine = Engine.create();

    // La caja: suelo, techo y paredes gruesas para que nada se escape
    floorY = height - (height * FLOOR_RATIO);
    let floor = Bodies.rectangle(width / 2, floorY + 250, width * 2, 500, { isStatic: true, friction: 1 });
    let ceiling = Bodies.rectangle(width / 2, -250, width * 2, 500, { isStatic: true });
    let leftWall = Bodies.rectangle(-250, height / 2, 500, height * 2, { isStatic: true });
    let rightWall = Bodies.rectangle(width + 250, height / 2, 500, height * 2, { isStatic: true });
    World.add(engine.world, [floor, ceiling, leftWall, rightWall]);

    buildFloorPattern();

    let spacing = 250;
    let startX = width / 2 - (spacing * 1.5);

    // Cada letra recibe el BUS de su grupo (controla todas sus pistas a la vez)
    letters.push(new PlayableLetter('V', startX, 200, tracks.V.bus, images.V));
    letters.push(new PlayableLetter('A', startX + spacing, 100, tracks.A.bus, images.A));
    letters.push(new PlayableLetter('N', startX + spacing * 2, 300, tracks.N.bus, images.N));
    letters.push(new PlayableLetter('S', startX + spacing * 3, 50, tracks.S.bus, images.S));

    // Arrastrar con el mouse
    let canvasMouse = Mouse.create(canvas.elt);
    canvasMouse.pixelRatio = pixelDensity();
    mConstraint = MouseConstraint.create(engine, {
        mouse: canvasMouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });
    World.add(engine.world, mConstraint);

    // Botón de Reset en la UI
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetLetters);
    }

    // Esperar a que carguen TODOS los mp3 antes de permitir el clic
    Tone.loaded()
    .then(() => {
        const notLoaded = Object.values(tracks)
            .flatMap(g => g.players)
            .filter(p => !p.loaded);

        if (failedFiles.length || notLoaded.length) {
            throw new Error('Faltan audios: ' + failedFiles.join(', '));
        }

        assetsReady = true;
        statusEl.textContent = "Amps ready and set to play... (click anywhere to start)";
    })
    .catch(e => {
        console.error('Error cargando audios:', e);
        statusEl.textContent = "No cargaron: " + (failedFiles.join(', ') || "revisa la consola (F12)");
    });
}

function draw() {
    clear();

    // Tapizado del suelo (va debajo de las letras)
    if (floorPattern) {
        imageMode(CORNER);
        image(floorPattern, 0, floorY);
    }

    Engine.update(engine);

    for (let l of letters) {
        l.update();
        l.show();
    }
}

// Reorganiza todas las letras a su posición inicial
function resetLetters() {
    for (let l of letters) {
        l.resetPosition();
    }
}

// Tecla = interruptor: enciende / apaga la pista de esa letra
// H = ocultar/mostrar menú, R = reorganizar VANS
function keyPressed() {
    let keyChar = key.toUpperCase();

    // Interruptor del menú con la tecla H
    if (keyChar === 'H') {
        let menu = document.getElementById('comic-menu');
        if (menu) menu.classList.toggle('hidden');
        return;
    }

    // Reorganizar VANS con la tecla R
    if (keyChar === 'R') {
        resetLetters();
        return;
    }

    if (!audioStarted) return;

    for (let l of letters) {
        if (l.id === keyChar) {
            Body.setVelocity(l.body, { x: random(-10, 10), y: -20 });
            Body.setAngularVelocity(l.body, random(-0.3, 0.3));
            l.toggleAudio();
        }
    }
}

// Clic directo sobre una letra: reacciona (esquishe + bamboleo) y recupera volumen
function mousePressed(event) {
    if (!audioStarted) return;

    // Ignorar clics que no son sobre el canvas (botones del menú, etc.)
    if (event && event.target && event.target.tagName !== 'CANVAS') return;

    let p = { x: mouseX, y: mouseY };
    for (let l of letters) {
        if (Query.point([l.body], p).length > 0) {
            l.poke(p.x);
            break; // solo la letra de arriba
        }
    }
}

class PlayableLetter {
    constructor(id, x, y, audioTrack, img) {
        this.id = id;
        this.initialX = x;    // posición de inicio (para el reset)
        this.initialY = y;
        this.w = 230;
        this.h = 280;

        this.audio = audioTrack;   // aquí llega el bus de volumen del grupo
        this.img = img;
        this.isAudioActive = false;
        this.energy = 0;      // 1 = recién tocada (0 dB), 0 = abandonada (piso)
        this.holdUntil = 0;   // evita pelear con el fade-in al encender
        this.squish = 0;      // deformación elástica del clic (resorte)
        this.squishVel = 0;

        this.body = Bodies.rectangle(x, y, this.w * 0.75, this.h * 0.75, {
            restitution: 0.7,
            friction: 0.8,
            density: 0.05
        });
        World.add(engine.world, this.body);
    }

    // Restablece posición, rotación y sube el volumen si la pista estaba activa
    resetPosition() {
        Body.setPosition(this.body, { x: this.initialX, y: this.initialY });
        Body.setAngle(this.body, 0);
        Body.setVelocity(this.body, { x: 0, y: 0 });
        Body.setAngularVelocity(this.body, 0);

        this.squish = 0;
        this.squishVel = 0;

        if (this.isAudioActive) {
            this.energy = 1;
            this.holdUntil = millis() + 250;
            this.audio.volume.rampTo(0, 0.2);
        }
    }

    toggleAudio() {
        this.isAudioActive = !this.isAudioActive;

        if (this.isAudioActive) {
            this.energy = 1;
            this.holdUntil = millis() + 250;
            this.audio.volume.rampTo(0, 0.2);
        } else {
            this.audio.volume.rampTo(MUTE_DB, 0.5);
        }
    }

    // Reacción al clic directo
    poke(clickX) {
        // Esquishe: se aplasta y rebota como un resorte
        this.squishVel = CLICK_SQUISH;

        // Empujoncito + giro según el lado donde la tocaste (sin saltar)
        let dx = constrain((this.body.position.x - clickX) / (this.w / 2), -1, 1);
        Body.setVelocity(this.body, {
            x: this.body.velocity.x + dx * CLICK_NUDGE,
            y: this.body.velocity.y
        });
        Body.setAngularVelocity(this.body, this.body.angularVelocity - dx * CLICK_SPIN);

        // Si está sonando, el volumen vuelve a subir de inmediato
        if (this.isAudioActive) {
            this.energy = 1;
            this.holdUntil = millis() + 200;
            this.audio.volume.rampTo(0, 0.12);
        }
    }

    // ¿El usuario (o la física) está "manejando" esta letra ahora mismo?
    isBeingTouched() {
        // 1. Arrastrándola / presionándola con el mouse
        if (mConstraint.body === this.body) return true;

        // 2. Moviéndose: rebotando, rodando, volando
        let speed = Math.hypot(this.body.velocity.x, this.body.velocity.y);
        let spin = Math.abs(this.body.angularVelocity) * 20;
        if (speed + spin > MOVE_THRESHOLD) return true;

        // 3. Mouse encima (apuntándola)
        if (HOVER_COUNTS) {
            let m = mConstraint.mouse.position;
            if (Query.point([this.body], m).length > 0) return true;
        }

        return false;
    }

    update() {
        // Resorte del esquishe (corre siempre, suene o no la letra)
        let sdt = Math.min(deltaTime / 1000, 0.033);
        this.squishVel += (-300 * this.squish - 14 * this.squishVel) * sdt;
        this.squish += this.squishVel * sdt;

        if (!audioStarted || !this.isAudioActive) return;

        let dt = deltaTime / 1000;

        if (this.isBeingTouched()) {
            this.energy = Math.min(1, this.energy + dt / RISE_SECONDS);
        } else {
            this.energy = Math.max(0, this.energy - dt / DECAY_SECONDS);
        }

        // Esperar a que termine el fade-in de la tecla
        if (millis() < this.holdUntil) return;

        // energy 1 -> 0 dB, energy 0 -> FLOOR_DB
        this.audio.volume.value = FLOOR_DB * (1 - this.energy);
    }

    show() {
        let pos = this.body.position;
        let angle = this.body.angle;
        let vy = this.body.velocity.y;

        // Efecto cartoon (squash & stretch)
        let stretch = 1 + (abs(vy) * 0.015);
        let squash = 1 / stretch;

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        // squash/stretch por velocidad + esquishe elástico del clic
        scale(squash * (1 + 0.6 * this.squish), stretch * (1 - 0.6 * this.squish));

        if (!this.isAudioActive) {
            tint(255, 150);                               // apagada: translúcida
        } else {
            tint(255, 200 + 55 * this.energy);           // activa: se va apagando con la energía
        }

        imageMode(CENTER);
        image(this.img, 0, 0, this.w, this.h);
        pop();
    }
}
