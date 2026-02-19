# Stargate - Zastřel si svého Jaffu 2
## Game Design Document - Contra Style Edition

### Vizuální Styl
**16-bitový Pixel Art** inspirovaný Contra: Hard Corps (Sega Genesis/Mega Drive)

### Herní Koncept
**Run-and-gun shooter** ve stylu Contra s multiplayer co-op podporou

### Hratelné Postavy (SG-1 Team)

| Postava | Zdraví | Rychlost | Speciální Vlastnost |
|---------|--------|----------|---------------------|
| **Teal'c** | ❤️❤️❤️❤️❤️ (5) | ⭐⭐⭐ (3/5) | Staff Weapon master - vyšší damage |
| **Jack O'Neill** | ❤️❤️❤️❤️ (4) | ⭐⭐⭐⭐ (4/5) | All-rounder - vyvážené stats |
| **Samantha Carter** | ❤️❤️❤️ (3) | ⭐⭐⭐⭐⭐ (5/5) | Tech expert - speciální gadgety |
| **Daniel Jackson** | ❤️❤️❤️❤️ (4) | ⭐⭐⭐⭐ (4/5) | Ancient weapons - rychlé nabíjení |

### Contra-Style Mechaniky

**Ovládání:**
- **Pohyb:** WASD nebo šipky
- **Střelba:** Mezerník nebo J
- **Skok:** W nebo šipka nahoru
- **Změna zbraně:** Q/E nebo 1-4
- **8-směrové míření:** Automatické podle směru pohybu + nahoru/dolů

**Herní Prvky:**
- Rychlý run-and-gun gameplay
- Skok a střelba ve vzduchu
- Vlny nepřátel z různých směrů
- Power-upy padající z poražených nepřátel
- Boss fighty na konci levelů
- Destruktivní prostředí

### Zbraně & Power-ups

**Základní Zbraně:**
1. **Staff Weapon** - střední damage, střední rychlost
2. **Zat'nik'atel** - rychlá střelba, nižší damage
3. **P90** - velmi rychlá střelba, spray pattern
4. **Ancient Drone Weapon** - homing missiles (power-up)

**Power-ups:**
- 🔵 **Rapid Fire** - zdvojnásobená rychlost střelby (10s)
- 🟢 **Shield** - dočasná nesmrtelnost (5s)
- 🔴 **Spread Shot** - trojitá střelba (15s)
- ⭐ **Extra Life** - +1 život

### Nepřátelé

**Běžní Nepřátelé:**
- **Jaffa Warrior** - 1 HP, 10 bodů
- **Elite Jaffa** - 2 HP, 25 bodů, střílí zpět
- **Serpent Guard** - 3 HP, 50 bodů, rychlejší

**Boss Nepřátelé:**
- **Kull Warrior** - 20 HP, 500 bodů
- **Goa'uld System Lord** - 50 HP, 1000 bodů
- **Ha'tak Mothership** - 100 HP, 2500 bodů (finální boss)

### Multiplayer Režimy

**Local Co-op:**
- 2-4 hráči na jedné obrazovce (split-screen nebo shared screen)
- Společné životy nebo individuální
- Kooperativní scoring

**Online Multiplayer:**
- WebSocket real-time synchronizace
- Host/Join systém
- Latency compensation

### Level Design

**Level 1: Chulak (Jaffa Homeworld)**
- Prostředí: Pouštní planina s pyramidami
- Nepřátelé: Jaffa Warriors, Elite Jaffa
- Boss: Kull Warrior

**Level 2: Ha'tak Mothership**
- Prostředí: Interiér vesmírné lodi
- Nepřátelé: Serpent Guards, Death Gliders
- Boss: Goa'uld System Lord

**Level 3: Stargate Command Defense**
- Prostředí: SGC base pod útokem
- Nepřátelé: Všechny typy
- Boss: Ha'tak Mothership

### Technická Implementace

**Frontend Stack:**
- React 19 + TypeScript
- HTML5 Canvas API pro rendering
- Custom game engine s game loop
- Sprite animation system
- Collision detection (AABB)
- Particle system pro efekty

**Multiplayer:**
- WebSocket pro real-time komunikaci
- State synchronizace
- Input prediction & lag compensation

**Audio:**
- Web Audio API
- Chiptune soundtrack
- Retro sound effects
