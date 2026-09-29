# Setup — Stick Stickly (By Santiago Mateus)

Este proyecto está preparado para abrirse con **VS Code + Live Server**.

## 1. Descomprimir
Descomprime `Stick_Stickly_Organism_Santiago_Mateus.zip`.

La carpeta debe quedar así:

```text
Stick_Stickly_Organism_Santiago_Mateus/
├─ index.html
└─ assets/
   ├─ body_mask.png
   ├─ anatomy_texture.png
   ├─ body_outline.png
   └─ stick_stickly.mp3
```

No abras `index.html` con doble clic. El proyecto carga los assets desde `assets/`, por lo que conviene servirlo con Live Server.

## 2. Abrir en VS Code
En VS Code usa:

**File → Open Folder...**

y selecciona la carpeta `Stick_Stickly_Organism_Santiago_Mateus`.

## 3. Instalar Live Server
En la barra lateral de Extensions busca:

`Live Server`

Instala la extensión **Live Server**.

## 4. Ejecutar
Con `index.html` abierto:

**clic derecho → Open with Live Server**

El navegador se abrirá con una dirección local parecida a:

`http://127.0.0.1:5500/`

o

`http://localhost:5500/`

## 5. Controles
- `A` = PULSE
- `S` = FLOW
- `D` = IMPULSE
- `F` = GROWTH
- Botón `INICIAR ORGANISMO` = reproducir `assets/stick_stickly.mp3` y activar la detección de beats.
- Mouse = campo de influencia
- Mantener click = tocar/perturbar el tejido
- `H` = ocultar interfaz
- `Space` = fullscreen
- `R` = reset suave
- Doble click = reset suave

## 6. Si sale una pantalla de carga
Revisa que `assets/` esté exactamente dentro de la misma carpeta que `index.html` y que los tres PNG y el MP3 tengan sus nombres originales.

El proyecto no necesita npm, Node, Unity ni instalación de librerías JavaScript.
