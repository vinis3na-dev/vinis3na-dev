<div align="center">

# 🐙 vinis3na-dev

Desenvolvedor de jogos, simuladores e ferramentas de IA. Criador de experiências imersivas com Godot, Three.js, C++/Vulkan e Python.

</div>

---

## 🐙 O Polvo do Portfólio

<div align="center">

```svg
<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="octoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
      <feOffset dx="2" dy="4" result="offsetblur" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  
  <!-- Olhos -->
  <circle cx="120" cy="110" r="14" fill="#FFFFFF" />
  <circle cx="120" cy="110" r="6" fill="#000000" />
  <circle cx="124" cy="108" r="2" fill="#FFFFFF" />
  
  <circle cx="180" cy="110" r="14" fill="#FFFFFF" />
  <circle cx="180" cy="110" r="6" fill="#000000" />
  <circle cx="184" cy="108" r="2" fill="#FFFFFF" />
  
  <!-- Cabeça -->
  <path d="M 120,130 Q 150,90 180,130 Q 200,160 180,190 Q 160,210 150,190 Q 140,210 120,190 Q 100,160 120,130 Z" fill="url(#octoGradient)" filter="url(#shadow)" />
  
  <!-- Tentáculos animados -->
  <path id="tentacle1" d="M 130,190 Q 110,240 100,300" fill="none" stroke="url(#octoGradient)" stroke-width="8" stroke-linecap="round">
    <animate attributeName="d" values="M 130,190 Q 110,240 100,300; M 130,190 Q 120,240 110,300; M 130,190 Q 110,240 100,300" dur="3s" repeatCount="indefinite" />
  </path>
  <path id="tentacle2" d="M 150,190 Q 140,240 130,300" fill="none" stroke="url(#octoGradient)" stroke-width="8" stroke-linecap="round">
    <animate attributeName="d" values="M 150,190 Q 140,240 130,300; M 150,190 Q 150,240 140,300; M 150,190 Q 140,240 130,300" dur="3.5s" repeatCount="indefinite" />
  </path>
  <path id="tentacle3" d="M 170,190 Q 170,240 160,300" fill="none" stroke="url(#octoGradient)" stroke-width="8" stroke-linecap="round">
    <animate attributeName="d" values="M 170,190 Q 170,240 160,300; M 170,190 Q 180,240 170,300; M 170,190 Q 170,240 160,300" dur="3s" repeatCount="indefinite" />
  </path>
  <path id="tentacle4" d="M 190,190 Q 200,240 200,300" fill="none" stroke="url(#octoGradient)" stroke-width="8" stroke-linecap="round">
    <animate attributeName="d" values="M 190,190 Q 200,240 200,300; M 190,190 Q 210,240 210,300; M 190,190 Q 200,240 200,300" dur="3.5s" repeatCount="indefinite" />
  </path>
  
  <!-- Bolhas -->
  <circle cx="210" cy="260" r="6" fill="#FFFFFF" fill-opacity="0.3">
    <animate attributeName="cy" values="260;220" dur="2s" repeatCount="indefinite" />
    <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
  </circle>
  <circle cx="90" cy="240" r="5" fill="#FFFFFF" fill-opacity="0.3">
    <animate attributeName="cy" values="240;200" dur="2.5s" repeatCount="indefinite" />
    <animate attributeName="opacity" values="0.3;0" dur="2.5s" repeatCount="indefinite" />
  </circle>
  <circle cx="240" cy="200" r="4" fill="#FFFFFF" fill-opacity="0.3">
    <animate attributeName="cy" values="200;160" dur="3s" repeatCount="indefinite" />
    <animate attributeName="opacity" values="0.3;0" dur="3s" repeatCount="indefinite" />
  </circle>
</svg>

</div>

---

## 🚀 Repositórios em Destaque

### 🎮 Jogos e Simuladores 3D

| Repositório | Descrição | Tecnologia |
|---|---|---|
| [N3xuscom](https://github.com/vinis3na-dev/N3xuscom) | Nexus Office — escritório 3D com servidor Python, painel web, voz e tela compartilhada | Godot 4.7 + Python |
| [AsteriaFrontier](https://github.com/vinis3na-dev/AsteriaFrontier) | Exploração espacial procedural — pousar, minerar, craftar, salvar | Godot 4.7 + GDScript |
| [ocean-survival-3d](https://github.com/vinis3na-dev/ocean-survival-3d) | Sobrevivência no mar — crafting, clima dinâmico, tubarões, ilhas | Godot 4.7 |
| [AFTERFALL](https://github.com/vinis3na-dev/AFTERFALL) | Jogo de sobrevivência — Alpha RC1 com código fonte recuperado | Godot 4.7 |
| [cw-cyberpunk-neon-alley](https://github.com/vinis3na-dev/cw-cyberpunk-neon-alley) | Mapa GTA V/FiveM vanilla — tema cyberpunk, CodeWalker | Lua + CodeWalker |
| [rocky](https://github.com/vinis3na-dev/rocky) | FPS em primeira pessoa — C++20 + Vulkan, câmera FPS, Mark 23 | C++ + Vulkan |
| [star](https://github.com/vinis3na-dev/star) | Jogo 3D de sobrevivência — ECS, Jolt Physics, OpenGL 4.6 PBR | C++20 |
| [skyhawk](https://github.com/vinis3na-dev/skyhawk) | Simulador de voo — Three.js + TypeScript + Vite | Three.js + TS |
| [piratas](https://github.com/vinis3na-dev/piratas) | Jogo 3D de piratas — mundo aberto, dia/noite, comércio | Three.js + JS |

### 🤖 IA e Automação

| Repositório | Descrição | Tecnologia |
|---|---|---|
| [control-center](https://github.com/vinis3na-dev/control-center) | Painel local para modelos Ollama/Colibri/OpenAI integrado ao OpenCode | Python |
| [sync-hub](https://github.com/vinis3na-dev/sync-hub) | Control room de agentes IA — fila, orçamento, escritório 3D | React + Express + Three.js |
| [kraken](https://github.com/vinis3na-dev/kraken) | Laboratório genômico — 21 espécies, mecanismos candidatos, benchmark | Python |
| [automathon](https://github.com/vinis3na-dev/automathon) | Automação de publicação YouTube — FastAPI + React + CustomTkinter | Python + React |
| [youtube-automation](https://github.com/vinis3na-dev/youtube-automation) | Programa desktop único para automação de publicação YouTube | Python |
| [tribuna-capixaba-app](https://github.com/vinis3na-dev/tribuna-capixaba-app) | Painel de curadoria de notícias RSS com IA — WordPress + redes sociais | Python |

### 🌐 Web

| Repositório | Descrição | Tecnologia |
|---|---|---|
| [last-delivery](https://github.com/vinis3na-dev/last-delivery) | Jogo pós-apocalíptico — sobrevivência/entrega, HTML5 Canvas puro | HTML5 + JS |

---

## 🛠️ Tecnologias Principais

<div align="center">

[![Godot](https://img.shields.io/badge/Godot-4.7-478C8F?logo=godotengine&logoColor=white)](https://godotengine.org)
[![Three.js](https://img.shields.io/badge/Three.js-r180-000000?logo=threedotjs&logoColor=white)](https://threejs.org)
[![C++](https://img.shields.io/badge/C%2B%2B-20-00599C?logo=cplusplus&logoColor=white)](https://isocpp.org)
[![Vulkan](https://img.shields.io/badge/Vulkan-1.2-36957B?logo=vulkan&logoColor=white)](https://vulkan.org)
[![OpenGL](https://img.shields.io/badge/OpenGL-4.6-5A6EA7?logo=opengl&logoColor=white)](https://www.opengl.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 📊 Estatísticas

<div align="center">

![Total de repositórios](https://img.shields.io/badge/Repositórios-17-8B5CF6?style=for-the-badge)
![Linguagens principais](https://img.shields.io/badge/Linguagens-5-3B82F6?style=for-the-badge)
![Projetos privados](https://img.shields.io/badge/Privados-17-10B981?style=for-the-badge)

</div>

---

## 🤝 Vamos Conectar

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-vinis3na-dev-181717?logo=github&logoColor=white)](https://github.com/vinis3na-dev)
[![OpenCode](https://img.shields.io/badge/OpenCode-Dev-5A6EA7?logo=visualstudiocode&logoColor=white)](https://opencode.ai)

</div>

---

<div align="center">

**Feito com 🐙 e muito café por vinis3na-dev**

</div>