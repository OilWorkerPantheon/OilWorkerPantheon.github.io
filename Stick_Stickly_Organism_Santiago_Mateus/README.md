# Stick Stickly — By Santiago Mateus

## Concepto
Instrumento visual web para interpretar "Stick Stickly" de Attack Attack! en vivo.
La propuesta representa un cuerpo humano/organismo construido como ecosistema autónomo:
biología reconocible + colores fluorescentes incompatibles con la anatomía real, tomando la
estética scene/emo como contradicción deliberada.

La pista integrada es `assets/stick_stickly.mp3`. El botón INICIAR ORGANISMO comienza la
reproducción y el análisis FFT detecta golpes en los graves para producir contracciones breves.
El intérprete conserva el control: puede intervenir con A, S, D, F y el mouse mientras los
agentes responden en tiempo real.

## Sistemas
- Flocking: agentes sanguíneos/celulares. Perciben vecinos cercanos y combinan separación,
  alineación y cohesión con el flujo global.
- Steering / seek: impulsos nerviosos. Perciben objetivos anatómicos y calculan una velocidad
  deseada hacia ellos, con perturbación controlada.
- Flow field: el sistema circulatorio consulta un campo vectorial espacial que combina
  turbulencia matemática, atracción al corazón y perturbación del mouse.
- Physarum: una colonia de agentes deposita y sigue rastros locales, generando redes
  emergentes parecidas a tejido, vasos o crecimiento anómalo.

## Controles
A = PULSE
S = FLOW
D = IMPULSE
F = GROWTH
Mouse = campo de influencia; mantener click para tocar el tejido.
INICIAR ORGANISMO = reproducir el track integrado y activar la detección de beats.
H = ocultar panel.
Space = fullscreen.
Doble click = reinicio suave para ensayo.

## Score v1
Los tiempos son puntos de referencia iniciales para ensayo. Deben ajustarse escuchando
la grabación exacta que se vaya a interpretar.

0:00 INTRO — reposo, observar.
0:16 ACUMULACIÓN — abrir FLOW progresivamente.
0:30 PRE-CHORUS — preparar PULSE.
0:33 CHORUS — PULSE + FLOW.
0:56 VERSE — soltar PULSE, dejar respirar.
1:06 BRIDGE — IMPULSE puntual.
1:11 BREAKDOWN — GROWTH + FLOW; llevar el tejido fuera de equilibrio.
2:01 CHORUS 2 — PULSE + mouse, máxima intervención.
2:23 CODA/OUTRO — soltar controles y dejar una cicatriz residual.

## Próximo desarrollo
1. Revisar densidad, legibilidad del cuerpo y rendimiento en el computador de presentación.
2. Hacer una prueba de 30–60 s con canción real y registrar qué controles se sienten expresivos.
3. Afinar el score según la versión exacta de la canción.
4. Documentar cada cambio en la bitácora de GitHub.
