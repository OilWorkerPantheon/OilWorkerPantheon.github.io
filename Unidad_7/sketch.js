
/* =========================================================
   VANS · Interactive Typography
   Letras V-A-N-S recorribles en patineta
   ========================================================= */

/* ---------- Siluetas de fondo ---------- */

let skaterImg;
let rockerImg;
let silhouettes = [];

function preload() {
    skaterImg = loadImage(
        "assets/skater.png",
        () => {},
        () => console.warn("No se pudo cargar assets/skater.png")
    );

    rockerImg = loadImage(
        "assets/rocker.png",
        () => {},
        () => console.warn("No se pudo cargar assets/rocker.png")
    );
}

/* ---------- Geometría de las letras ---------- */

const LETTER_H = 600;
const STROKE = 112;
const ROAD = 80;
const SLANT = 0.2;
const YELLOW = [196, 190, 93];

let route = [];
let letters = [];
let trail = [];
let camY = LETTER_H / 2;
let totalLength = 0;

/* ---------- Jugador ---------- */

let distance = 0;
let speed = 0;

const MAX_SPEED = 18;
const ACCEL = 0.6;
const FRICTION = 0.96;

/* ---------- Patineta ---------- */

let boardAngle = 0;
let facing = 0;

/* ---------- Salto ---------- */

let jumpY = 0;
let jumpVel = 0;
let isJumping = false;

const GRAVITY = -1.2;
const JUMP_FORCE = 18;

/* ---------- Estado del juego ---------- */

let score = 0;
let timeLeft = 15;
let gameStarted = false;
let gameOver = false;
let startTime = 0;

/* ---------- Elementos HTML ---------- */

let hudTime;
let hudScore;
let gameOverScreen;
let finalScoreText;

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);

    canvas.position(0, 0);
    canvas.style("z-index", "0");
    canvas.style("display", "block");

    hudTime = document.getElementById("hud-time");
    hudScore = document.getElementById("hud-score");
    gameOverScreen = document.getElementById("game-over");
    finalScoreText = document.getElementById("final-score");

    const resetBtn = document.getElementById("reset-btn");
    const playAgainBtn = document.getElementById("play-again-btn");

    if (resetBtn) {
        resetBtn.addEventListener("click", restartGame);
    }

    if (playAgainBtn) {
        playAgainBtn.addEventListener("click", restartGame);
    }

    // Controles que también funcionan sobre la pantalla de Game Over.
    document.addEventListener("keydown", handleGlobalKeys);

    // Ocultar explícitamente la pantalla de Game Over al iniciar.
    if (gameOverScreen) {
        gameOverScreen.classList.add("hidden");
    }

    // Crear el collage de fondo.
    for (let i = 0; i < 16; i++) {
        silhouettes.push({
            nx: random(0.05, 0.95),
            ny: random(0.05, 0.95),
            s: random(0.5, 1.2),
            r: random(-PI / 6, PI / 6),
            type: i % 2
        });
    }

    buildTrack();
    updateBoardAngle(true);
}

/* =========================================================
   BUCLE PRINCIPAL
   ========================================================= */

function draw() {
    background(255);

    drawSilhouettes();

    if (!gameOver) {
        handleMovement();
        updateGameLogic();
    }

    const pos = getPathPos(distance);

    updateBoardAngle(false);

    // Escala y cámara.
    const sc = min(1, (height * 0.86) / (LETTER_H + STROKE));
    const lowLimit = LETTER_H + 50;

    const camTarget = pos.y <= lowLimit
        ? LETTER_H / 2
        : LETTER_H / 2 + (pos.y - lowLimit) * 0.9;

    camY += (camTarget - camY) * 0.06;

    push();

    translate(width / 2, height * 0.52);
    scale(sc);
    translate(-pos.x, -camY);

    noFill();
    strokeCap(ROUND);
    strokeJoin(ROUND);

    // 1. Carreteras.
    stroke(74);
    strokeWeight(ROAD);

    for (const segment of trail) {
        if (segment.road) {
            drawPolyline(segment.pts);
        }
    }

    // 2. Letras gruesas.
    stroke(0);
    strokeWeight(STROKE);

    for (const letter of letters) {
        drawPolyline(letter);
    }

    // 3. Línea amarilla discontinua.
    drawingContext.setLineDash([36, 28]);

    stroke(YELLOW[0], YELLOW[1], YELLOW[2]);
    strokeWeight(6);

    drawPolyline(route);

    drawingContext.setLineDash([]);

    // 4. Patineta.
    push();

    translate(pos.x, pos.y);
    rotate(boardAngle);
    translate(0, -jumpY - 32);

    drawSkateboard();

    pop();
    pop();
}

/* =========================================================
   COLLAGE DE SILUETAS
   ========================================================= */

function drawSilhouettes() {
    push();

    tint(0, 30);
    imageMode(CENTER);

    for (const sil of silhouettes) {
        const img = sil.type === 0 ? skaterImg : rockerImg;

        if (img && img.width > 0) {
            push();

            translate(sil.nx * width, sil.ny * height);
            rotate(sil.r);
            scale(sil.s);

            image(img, 0, 0, 350, 350);

            pop();
        }
    }

    pop();
}

/* =========================================================
   DIBUJO DE POLILÍNEAS
   ========================================================= */

function drawPolyline(pts) {
    if (!pts || pts.length === 0) return;

    beginShape();

    for (const p of pts) {
        vertex(p.x, p.y);
    }

    endShape();
}

/* =========================================================
   MOVIMIENTO Y LÓGICA DEL JUEGO
   ========================================================= */

function handleMovement() {
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        speed += ACCEL;

        if (!gameStarted) {
            startGame();
        }
    } else if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        speed -= ACCEL;

        if (!gameStarted) {
            startGame();
        }
    } else {
        speed *= FRICTION;
    }

    speed = constrain(speed, -MAX_SPEED / 2, MAX_SPEED);
}

function updateGameLogic() {
    // Mantener la distancia dentro del circuito cerrado.
    distance = ((distance + speed) % totalLength + totalLength)
        % totalLength;

    // Física del salto.
    if (isJumping) {
        jumpY += jumpVel;
        jumpVel += GRAVITY;

        if (jumpY <= 0) {
            jumpY = 0;
            isJumping = false;
            jumpVel = 0;

            if (gameStarted && speed > 2) {
                score++;

                if (hudScore) {
                    hudScore.innerText = "JUMP SCORE: " + score;
                }
            }
        }
    }

    // Temporizador de 15 segundos.
    if (gameStarted) {
        const elapsed = floor((millis() - startTime) / 1000);

        timeLeft = max(0, 15 - elapsed);

        if (hudTime) {
            hudTime.innerText = "TIME: " + timeLeft + "s";
        }

        if (timeLeft <= 0) {
            triggerGameOver();
        }
    }
}

/* =========================================================
   CONTROLES DE TECLADO
   ========================================================= */

function handleGlobalKeys(event) {
    const keyChar = event.key.toLowerCase();

    // Reiniciar desde cualquier estado.
    if (keyChar === "r") {
        event.preventDefault();
        restartGame();
        return;
    }

    // Ocultar o mostrar el menú.
    if (keyChar === "h" && !event.repeat) {
        const menu = document.getElementById("comic-menu");

        if (menu) {
            menu.classList.toggle("hidden");
        }
    }
}

function keyPressed() {
    // Saltar con la barra espaciadora.
    if (
        keyCode === 32 &&
        !isJumping &&
        !gameOver
    ) {
        isJumping = true;
        jumpVel = JUMP_FORCE;

        if (!gameStarted) {
            startGame();
        }

        return false;
    }

    // Evitar el desplazamiento de la página con espacio.
    if (keyCode === 32) {
        return false;
    }
}

function startGame() {
    if (gameStarted || gameOver) return;

    gameStarted = true;
    startTime = millis();
}

/* =========================================================
   GAME OVER Y REINICIO
   ========================================================= */

function triggerGameOver() {
    if (gameOver) return;

    gameOver = true;
    speed = 0;
    isJumping = false;
    jumpVel = 0;

    if (finalScoreText) {
        finalScoreText.innerText = "FINAL SCORE: " + score;
    }

    if (gameOverScreen) {
        gameOverScreen.classList.remove("hidden");
    }
}

function restartGame() {
    // Restablecer el estado completo de la partida.
    distance = 0;
    speed = 0;
    score = 0;
    timeLeft = 15;

    gameStarted = false;
    gameOver = false;

    isJumping = false;
    jumpY = 0;
    jumpVel = 0;

    facing = 0;
    camY = LETTER_H / 2;

    // Actualizar los elementos visuales.
    if (hudTime) {
        hudTime.innerText = "TIME: 15s";
    }

    if (hudScore) {
        hudScore.innerText = "JUMP SCORE: 0";
    }

    if (finalScoreText) {
        finalScoreText.innerText = "FINAL SCORE: 0";
    }

    if (gameOverScreen) {
        gameOverScreen.classList.add("hidden");
    }

    // Devolver la patineta a su orientación inicial.
    updateBoardAngle(true);
}

/* =========================================================
   PATINETA
   ========================================================= */

function updateBoardAngle(snap) {
    const a = getPathPos(distance - 40);
    const b = getPathPos(distance + 40);

    const dx = b.x - a.x;

    if (dx < -25) {
        facing = PI;
    } else if (dx > 25) {
        facing = 0;
    }

    const target = atan2(b.y - a.y, b.x - a.x) + facing;

    if (snap) {
        boardAngle = target;
    } else {
        const diff =
            ((target - boardAngle + PI) % TWO_PI + TWO_PI) % TWO_PI - PI;

        boardAngle += diff * 0.2;
    }
}


function drawSkateboard() {
    // Ruedas negras con centros blancos.
    noStroke();
    fill(255);

    ellipse(-45, 20, 24, 24);
    ellipse(45, 20, 24, 24);

    fill(255);
    ellipse(-45, 20, 7, 7);
    ellipse(45, 20, 7, 7);

    // Tabla roja con borde negro.
    fill("#C8102E");
    stroke(0);
    strokeWeight(4);

    ellipse(0, 0, 160, 55);

    // Logotipo blanco inspirado en el estilo VANS.
    noStroke();
    fill(255);

    textAlign(CENTER, CENTER);
    textFont("Arial Black");
    textStyle(BOLD);
    textSize(29);

    // Letras compactas y ligeramente inclinadas.
    push();
    shearX(-0.12);
    text("VANS", 0, 1);
    pop();

    // Barra superior extendida del logotipo.
    stroke(255);
    strokeWeight(5);
    strokeCap(SQUARE);

    line(-4, -17, 45, -17);
}


/* =========================================================
   CONSTRUCCIÓN DE LA PISTA
   ========================================================= */

function arcPoints(cx, cy, rx, ry, a0, a1, n = 40) {
    const pts = [];

    for (let i = 0; i <= n; i++) {
        const a = radians(lerp(a0, a1, i / n));

        pts.push({
            x: cx + rx * cos(a),
            y: cy + ry * sin(a)
        });
    }

    return pts;
}

function chaikin(pts, iterations) {
    for (let k = 0; k < iterations; k++) {
        const out = [pts[0]];

        for (let i = 0; i < pts.length - 1; i++) {
            const p = pts[i];
            const q = pts[i + 1];

            out.push({
                x: lerp(p.x, q.x, 0.25),
                y: lerp(p.y, q.y, 0.25)
            });

            out.push({
                x: lerp(p.x, q.x, 0.75),
                y: lerp(p.y, q.y, 0.75)
            });
        }

        out.push(pts[pts.length - 1]);
        pts = out;
    }

    return pts;
}

function buildTrack() {
    const B = LETTER_H;
    const W = 440;
    const GAP = 780;

    // Inclinar las letras hacia la derecha en la parte superior.
    const slant = (pts) => pts.map(p => ({
        x: p.x + (B - p.y) * SLANT,
        y: p.y
    }));

    // V.
    const V = slant([
        { x: 0, y: 0 },
        { x: W / 2, y: B },
        { x: W, y: 0 }
    ]);

    // A.
    const ax = GAP;

    const A = slant([
        { x: ax, y: B },
        { x: ax + W / 2, y: 0 },
        { x: ax + W, y: B }
    ]);

    // Travesaño decorativo de la A.
    const barT = 0.62;

    const Abar = slant([
        {
            x: ax + (W / 2) * (1 - barT),
            y: B * barT
        },
        {
            x: ax + W - (W / 2) * (1 - barT),
            y: B * barT
        }
    ]);

    // N.
    const nx = GAP * 2;

    const N = slant([
        { x: nx, y: B },
        { x: nx, y: 0 },
        { x: nx + W, y: B },
        { x: nx + W, y: 0 }
    ]);

    // S construida mediante dos arcos.
    const sx = GAP * 3 + W / 2;

    const upper = arcPoints(
        sx, B * 0.25, W / 2, B * 0.25, -20, -270
    );

    const lower = arcPoints(
        sx, B * 0.75, W / 2, B * 0.25, -90, 160
    );

    const S = slant(upper.concat(lower.slice(1)));
    const Srev = S.slice().reverse();

    letters = [V, A, Abar, N, S];

    // Pista de regreso por debajo de las letras.
    const last = (arr) => arr[arr.length - 1];

    const sEnd = last(Srev);
    const floorY = B + 300;

    const back = chaikin([
        sEnd,
        { x: sEnd.x + 80, y: B * 0.9 },
        { x: sEnd.x + 80, y: floorY },
        { x: -560, y: floorY },
        V[0]
    ], 3);

    // Tramos que componen la pista.
    trail = [
        { pts: V, road: false },
        { pts: [last(V), A[0]], road: true },
        { pts: A, road: false },
        { pts: [last(A), N[0]], road: true },
        { pts: N, road: false },
        { pts: [last(N), Srev[0]], road: true },
        { pts: Srev, road: false },
        { pts: back, road: true }
    ];

    // Unir los tramos en una ruta continua.
    const raw = trail.flatMap(segment => segment.pts);

    route = [{
        x: raw[0].x,
        y: raw[0].y,
        dist: 0
    }];

    let acc = 0;

    // Densificar la ruta para calcular posiciones suaves.
    for (let i = 1; i < raw.length; i++) {
        const p0 = raw[i - 1];
        const p1 = raw[i];

        const steps = max(
            1,
            ceil(dist(p0.x, p0.y, p1.x, p1.y) / 5)
        );

        for (let s = 1; s <= steps; s++) {
            const t = s / steps;

            const x = lerp(p0.x, p1.x, t);
            const y = lerp(p0.y, p1.y, t);

            const previous = route[route.length - 1];

            acc += dist(previous.x, previous.y, x, y);

            route.push({
                x: x,
                y: y,
                dist: acc
            });
        }
    }

    totalLength = acc;
}

/* =========================================================
   POSICIÓN SOBRE LA RUTA
   ========================================================= */

function getPathPos(d) {
    if (route.length < 2 || totalLength <= 0) {
        return { x: 0, y: LETTER_H / 2 };
    }

    d = ((d % totalLength) + totalLength) % totalLength;

    let lo = 0;
    let hi = route.length - 1;

    // Búsqueda binaria del segmento correspondiente.
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;

        if (route[mid].dist <= d) {
            lo = mid;
        } else {
            hi = mid;
        }
    }

    const a = route[lo];
    const b = route[hi];

    const t = b.dist === a.dist
        ? 0
        : (d - a.dist) / (b.dist - a.dist);

    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t)
    };
}

/* =========================================================
   REDIMENSIONAR VENTANA
   ========================================================= */

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
