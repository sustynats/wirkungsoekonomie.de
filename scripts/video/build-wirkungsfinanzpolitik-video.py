#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
SCRIPT_SOURCE = Path("/Users/hagen/.codex/attachments/01124b42-40f4-4e11-b570-2ff41981ee1b/pasted-text.txt")
AUDIO_SOURCE = Path("/Users/hagen/Downloads/wirkungsfinanzpolitik-esv2-92p-bg-10p-music-10p.wav")
OUT_DIR = ROOT / "assets" / "video"
WORK_DIR = ROOT / "tmp" / "wirkungsfinanzpolitik-video"
VIDEO_TARGET = OUT_DIR / "wirkungsfeld-wirkungsfinanzpolitik.mp4"
POSTER_TARGET = OUT_DIR / "wirkungsfeld-wirkungsfinanzpolitik-poster.png"
STORYBOARD_TARGET = WORK_DIR / "storyboard.json"

BLOG_IMAGE = ROOT / "assets" / "img" / "blog" / "2026-06-11-wirkungsfinanzpolitik-schulden-ohne-wirkung.png"

WIDTH = 1280
HEIGHT = 720
FPS = 24

FONT_REGULAR = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
FONT_ITALIC = Path("/System/Library/Fonts/Supplemental/Arial Italic.ttf")

NAVY = "#0b1f3a"
INK = "#172033"
MUTED = "#536273"
GREEN = "#47772f"
GREEN_DARK = "#31591f"
LIGHT_GREEN = "#e8f1e3"
CREAM = "#f7f4ec"
PAPER = "#fffdf7"
LINE = "#d9deca"
WARNING = "#9f5f2b"
RED = "#8b2f2f"
BLUE = "#28577a"


@dataclass(frozen=True)
class Scene:
    anchor: str
    kicker: str
    title: str
    subtitle: str
    bullets: tuple[str, ...]
    visual: str


SCENES = [
    Scene(
        "Stell dir vor, du hast ein Haus.",
        "Einstieg",
        "Jeder Euro muss wirken",
        "Wirkungsfinanzpolitik einfach erklärt",
        ("Ein Haus", "ein undichtes Dach", "eine aufgeschobene Rechnung"),
        "house",
    ),
    Scene(
        "Jetzt gibt es zwei Möglichkeiten.",
        "Hauslogik",
        "Sparen kann teuer werden",
        "Wenn Reparatur nur verschoben wird, wächst der Schaden.",
        ("Heute nichts tun", "morgen viel mehr zahlen", "Zukunft wird belastet"),
        "repair_choice",
    ),
    Scene(
        "Und genau so ist es manchmal auch beim Staat.",
        "Der Staat",
        "Das große öffentliche Haus",
        "Schulen, Brücken, Pflege, Sicherheit, Demokratie und Vertrauen.",
        ("Infrastruktur", "Daseinsvorsorge", "demokratische Stabilität"),
        "state_house",
    ),
    Scene(
        "Wenn der Staat Geld ausgibt, ist das dann gut oder schlecht?",
        "Debatte",
        "Die alte Frage reicht nicht",
        "Schuldenangst und Gelddenken greifen beide zu kurz.",
        ("Schulden belasten?", "Staat ist kein Privathaushalt?", "Was fehlt?"),
        "two_sides",
    ),
    Scene(
        "Denn die wichtigste Frage fehlt.",
        "Kernfrage",
        "Was bewirkt das Geld?",
        "Nicht die Buchung ist entscheidend, sondern die reale Veränderung.",
        ("Risiken kleiner?", "Zukunft sicherer?", "Nebenwirkungen sichtbar?"),
        "big_question",
    ),
    Scene(
        "Nehmen wir eine Brücke.",
        "Beispiel",
        "Eine sanierte Brücke entlastet Zukunft",
        "Schulden können Sicherheit schaffen und spätere Kosten vermeiden.",
        ("Arbeitswege bleiben offen", "Unfälle werden verhindert", "Reparatur wird günstiger"),
        "bridge",
    ),
    Scene(
        "Jetzt nehmen wir ein anderes Beispiel.",
        "Gegenbeispiel",
        "Nicht jede Ausgabe schützt Zukunft",
        "Geld kann auch alte Probleme künstlich am Leben halten.",
        ("Energieverschwendung", "Klimaschaden", "neue Abhängigkeiten"),
        "harmful_tech",
    ),
    Scene(
        "Beides steht im Haushalt vielleicht ähnlich da:",
        "Haushalt",
        "Gleiche Buchung, andere Wirklichkeit",
        "Kreditaufnahme ist nicht automatisch gut oder schlecht.",
        ("Zukunft reparieren", "Zukunft verbrauchen", "Wirkung unterscheiden"),
        "comparison",
    ),
    Scene(
        "Und genau darum geht es bei der **Wirkungsfinanzpolitik**.",
        "Definition",
        "Wirkungsfinanzpolitik",
        "Sie fragt, was sich durch öffentliches Geld wirklich verändert.",
        ("nicht nur Kosten", "sondern Zustandsveränderung", "für Mensch, Planet und Demokratie"),
        "definition",
    ),
    Scene(
        "Wird eine Schule besser?",
        "Wirkungsfragen",
        "Was verändert sich wirklich?",
        "Gute Finanzpolitik prüft reale Verbesserungen.",
        ("bessere Schulen", "saubere Luft", "stärkere Demokratie", "kleinere Risiken"),
        "impact_questions",
    ),
    Scene(
        "In der Wirkungsökonomie nennen wir Wirkung nicht einfach eine gute Absicht.",
        "Absicht vs. Wirkung",
        "Eine gute Absicht ist noch keine Wirkung",
        "Wirkung entsteht erst, wenn sich Zustände nachweisbar verbessern.",
        ("Können Kinder besser lesen?", "Wird Armut kleiner?", "Wächst Vertrauen?"),
        "intention",
    ),
    Scene(
        "Man kann sich das wie bei Strom vorstellen.",
        "Strombild",
        "Wirkleistung, Blindleistung, Verlustleistung",
        "Auch öffentliche Ausgaben können antreiben, nur kreisen oder schaden.",
        ("Wirkleistung", "Blindleistung", "Verlustleistung"),
        "electricity",
    ),
    Scene(
        "Bei Staatsschulden kann man deshalb genauer unterscheiden.",
        "Schuldentypen",
        "Nicht jede Schuld wirkt gleich",
        "Entscheidend ist die Wirkungsqualität der Schulden.",
        ("Wirkschulden", "Blindschulden", "Verlustschulden", "Reparaturschulden"),
        "debt_types",
    ),
    Scene(
        "Es gibt **Wirkschulden**.",
        "Wirkschulden",
        "Schulden, die Zukunft besser machen",
        "Sie senken Risiken, stärken Resilienz und vermeiden spätere Kosten.",
        ("Bildung", "Pflege", "Klimaanpassung", "Cybersicherheit"),
        "effective_debt",
    ),
    Scene(
        "Dann gibt es **Blindschulden**.",
        "Blindschulden",
        "Geld bewegt sich, Wirkung bleibt unklar",
        "Niemand kann richtig zeigen, was besser geworden ist.",
        ("viel Verwaltung", "wenig Veränderung", "keine belastbaren Daten"),
        "blind_debt",
    ),
    Scene(
        "Dann gibt es **Verlustschulden**.",
        "Verlustschulden",
        "Schulden, die Zukunft schlechter machen",
        "Sie stabilisieren schädliche Strukturen.",
        ("alte Abhängigkeiten", "höhere Schäden", "weniger Handlungsfähigkeit"),
        "loss_debt",
    ),
    Scene(
        "Und es gibt **Reparaturschulden**.",
        "Reparaturschulden",
        "Zu spät reparieren wird teuer",
        "Wer Prävention verschiebt, bezahlt später oft mehrfach.",
        ("marode Brücke", "undichtes Dach", "Krise statt Vorsorge"),
        "repair_debt",
    ),
    Scene(
        "Darum ist Sparen nicht automatisch klug.",
        "Versteckte Schulden",
        "Die größte Staatsschuld steht nicht immer im Haushalt",
        "Sie kann in dem liegen, was wir heute nicht tun.",
        ("kaputte Brücke", "schlechte Schule", "Pflegekrise", "Vertrauensverlust"),
        "hidden_debt",
    ),
    Scene(
        "Jetzt gibt es eine Theorie, die heißt Modern Monetary Theory.",
        "MMT",
        "Der Staat ist kein Privathaushalt",
        "MMT hilft, einen alten Denkfehler zu erkennen.",
        ("kein fixer Topf", "andere Finanzierungslogik", "aber noch keine Wirkungsantwort"),
        "mmt",
    ),
    Scene(
        "MMT öffnet die Tür.",
        "Anschluss",
        "MMT öffnet die Tür",
        "Wirkungsfinanzpolitik zeigt, wohin man gehen sollte.",
        ("Was kann der Staat finanzieren?", "Was soll er finanzieren?", "Welche Wirkung entsteht?"),
        "door_compass",
    ),
    Scene(
        "Ein wichtiger Begriff dabei ist: **Public Purpose**.",
        "Public Purpose",
        "Öffentlicher Zweck wird prüfbar",
        "Staatliches Geld soll Mensch, Planet und Demokratie stärken.",
        ("Wer profitiert?", "Wer wird belastet?", "Was passiert langfristig?"),
        "public_purpose",
    ),
    Scene(
        "Denn das ist der Maßstab der Wirkungsökonomie:",
        "Maßstab",
        "Mensch. Planet. Demokratie.",
        "Eine Ausgabe muss wirken, nicht nur teuer oder billig sein.",
        ("Mensch", "Planet", "Demokratie"),
        "mpd",
    ),
    Scene(
        "Ein Beispiel: Bildung.",
        "Beispiel Bildung",
        "Bildung wirkt langsam",
        "Manchmal wächst Wirkung über Jahre.",
        ("besser lernen", "Demokratie verstehen", "selbst Wirkung entfalten"),
        "education",
    ),
    Scene(
        "Ein anderes Beispiel: Klimaanpassung.",
        "Beispiel Klimaanpassung",
        "Vorsorge ist oft billiger als Reparatur",
        "Bäume, Entsiegelung und Wasserspeicher schützen die Stadt.",
        ("Hitzeschutz", "weniger Überflutung", "sinkende Gesundheitskosten"),
        "climate_adaptation",
    ),
    Scene(
        "Ein drittes Beispiel: Sicherheit.",
        "Beispiel Sicherheit",
        "Die Kosten des Nichthandelns zählen mit",
        "Auch Sicherheitspolitik braucht Wirkungsprüfung.",
        ("Unsicherheit", "Erpressbarkeit", "Freiheit und Stabilität"),
        "security",
    ),
    Scene(
        "Damit ein Staat das lernen kann, braucht er einen anderen Haushalt.",
        "Wirkungshaushalt",
        "Ein anderer Haushalt",
        "Nicht nur Mittel verteilen, sondern Wirkung planen und prüfen.",
        ("Was soll sich verbessern?", "Woran erkennen wir das?", "Was lernen wir?"),
        "budget",
    ),
    Scene(
        "Sondern einen **Wirkungshaushalt**.",
        "Steuerung",
        "Der Wirkungshaushalt",
        "Er verbindet Geld, Daten, Nebenwirkungen und Lernen.",
        ("Ziele", "Daten", "Rückkopplung", "Korrektur"),
        "dashboard",
    ),
    Scene(
        "Darum ist die neue Regel nicht einfach:",
        "Neue Regel",
        "Nicht mehr Schulden. Nicht keine Schulden.",
        "Die Regel lautet: Jeder Euro muss wirken.",
        ("genauer prüfen", "besser begründen", "lernend korrigieren"),
        "rule",
    ),
    Scene(
        "Denn Wirkungsfinanzpolitik ist keine Ausrede für beliebiges Geldausgeben.",
        "Disziplin",
        "Keine Ausrede für beliebiges Geldausgeben",
        "Wirkungsfinanzpolitik fragt strenger hin.",
        ("Fachkräfte?", "Material?", "Zeit?", "Vertrauen?", "Nebenwirkungen?"),
        "discipline",
    ),
    Scene(
        "Man kann Geld schaffen.",
        "Reale Grenzen",
        "Man kann keine Pflegekräfte drucken",
        "Geld ersetzt keine realen Ressourcen.",
        ("keine Lehrkräfte drucken", "keine intakten Böden drucken", "keine sichere Brücke drucken"),
        "real_limits",
    ),
    Scene(
        "Darum braucht öffentliche Finanzierung immer zwei Prüfungen.",
        "Doppelte Prüfung",
        "Finanzierbar? Und wirksam?",
        "Die zweite Frage entscheidet über Zukunftsfähigkeit.",
        ("Ist sie finanzierbar?", "Ist sie wirksam?", "Was verbessert sich wirklich?"),
        "two_checks",
    ),
    Scene(
        "Die Wirkungsfinanzpolitik sagt:",
        "Staat",
        "Der Staat ist eine Wirkungsarchitektur",
        "Er sammelt Geld ein, setzt Regeln, schützt Rechte und ermöglicht Zukunft.",
        ("Infrastruktur", "Rechte", "Schutz", "Zukunft"),
        "architecture",
    ),
    Scene(
        "Also, wenn das nächste Mal jemand fragt:",
        "Neue Frage",
        "Können wir es uns leisten, es nicht zu tun?",
        "Danach kommt die wichtigste Frage: Welche Wirkung entsteht?",
        ("Kosten", "Nicht-Handeln", "Wirkung"),
        "not_to_act",
    ),
    Scene(
        "Denn Schulden sind nicht automatisch gut.",
        "Fazit",
        "Schlecht sind Schulden ohne Wirkung",
        "Gut begründet sind Schulden, die Zukunft sichern und Risiken senken.",
        ("positive Netto-Wirkung", "Mensch", "Planet", "Demokratie"),
        "final_balance",
    ),
    Scene(
        "Oder ganz einfach:",
        "Schlusssatz",
        "Nicht jeder Euro muss gespart werden",
        "Aber jeder Euro muss wirken.",
        ("Jeder Euro", "Wirkung", "Zukunft"),
        "final",
    ),
]


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(cmd, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode != 0:
        raise RuntimeError("Command failed:\n" + " ".join(cmd) + "\nSTDOUT:\n" + result.stdout + "\nSTDERR:\n" + result.stderr)
    return result


def audio_duration(path: Path) -> float:
    result = run([
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        str(path),
    ])
    return float(json.loads(result.stdout)["format"]["duration"])


def font(size: int, bold: bool = False, italic: bool = False) -> ImageFont.FreeTypeFont:
    if bold:
        return ImageFont.truetype(str(FONT_BOLD), size)
    if italic:
        return ImageFont.truetype(str(FONT_ITALIC), size)
    return ImageFont.truetype(str(FONT_REGULAR), size)


def words(value: str) -> list[str]:
    return re.findall(r"[\wÄÖÜäöüß:-]+", value)


def clean_markdown(value: str) -> str:
    value = re.sub(r"^#+\s*", "", value, flags=re.M)
    value = value.replace("**", "").replace("„", "\"").replace("“", "\"")
    return value.strip()


def locate_segments(script: str) -> list[tuple[Scene, str]]:
    positions: list[tuple[int, Scene]] = []
    for scene in SCENES:
        index = script.find(scene.anchor)
        if index == -1:
            raise ValueError(f"Anchor not found: {scene.anchor}")
        positions.append((index, scene))
    positions.sort(key=lambda item: item[0])
    segments: list[tuple[Scene, str]] = []
    for idx, (start, scene) in enumerate(positions):
        end = positions[idx + 1][0] if idx + 1 < len(positions) else len(script)
        segments.append((scene, script[start:end]))
    return segments


def fit_cover(path: Path, size: tuple[int, int]) -> Image.Image:
    image = Image.open(path).convert("RGB")
    iw, ih = image.size
    tw, th = size
    scale = max(tw / iw, th / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    image = image.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return image.crop((left, top, left + tw, top + th))


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    if not text:
        return 0, 0
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in str(text).split("\n"):
        current = ""
        for word in paragraph.split():
            candidate = f"{current} {word}".strip()
            if text_size(draw, candidate, fnt)[0] <= max_width or not current:
                current = candidate
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines


def draw_multiline(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill: str,
    max_width: int,
    line_gap: int = 8,
) -> int:
    x, y = xy
    for line in wrap(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += text_size(draw, line, fnt)[1] + line_gap
    return y


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str, outline: str | None = None, width: int = 2, radius: int = 20) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def shadowed_card(base: Image.Image, box: tuple[int, int, int, int], fill: str = PAPER, outline: str = LINE, radius: int = 22) -> ImageDraw.ImageDraw:
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((box[0] + 8, box[1] + 10, box[2] + 8, box[3] + 10), radius=radius, fill=(16, 29, 49, 34))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    base.alpha_composite(shadow)
    draw = ImageDraw.Draw(base)
    rounded(draw, box, fill, outline, 2, radius)
    return draw


def background() -> Image.Image:
    image = Image.new("RGBA", (WIDTH, HEIGHT), CREAM)
    draw = ImageDraw.Draw(image)
    for i in range(0, WIDTH, 40):
        color = (232, 236, 224, 28) if (i // 40) % 2 else (255, 255, 255, 18)
        draw.line((i, 0, i - 260, HEIGHT), fill=color, width=2)
    draw.ellipse((-260, -220, 460, 420), fill=(232, 241, 227, 115))
    draw.ellipse((850, 390, 1460, 980), fill=(226, 235, 221, 105))
    return image


def draw_header(draw: ImageDraw.ImageDraw, scene: Scene, index: int, duration: float, total_duration: float, elapsed: float) -> None:
    draw.text((52, 32), "WIRKUNGSÖKONOMIE", font=font(20, bold=True), fill=NAVY)
    draw.text((52, 62), scene.kicker.upper(), font=font(15, bold=True), fill=GREEN_DARK)
    time_label = f"{int(elapsed // 60):02d}:{int(elapsed % 60):02d} / {int(total_duration // 60):02d}:{int(total_duration % 60):02d}"
    draw.text((WIDTH - 52 - text_size(draw, time_label, font(15))[0], 42), time_label, font=font(15), fill=MUTED)
    progress = max(0.0, min(1.0, elapsed / total_duration))
    draw.rounded_rectangle((52, HEIGHT - 34, WIDTH - 52, HEIGHT - 24), radius=5, fill="#e4e6da")
    draw.rounded_rectangle((52, HEIGHT - 34, 52 + int((WIDTH - 104) * progress), HEIGHT - 24), radius=5, fill=GREEN)
    draw.text((52, HEIGHT - 62), f"Kapitel {index + 1:02d}", font=font(15, bold=True), fill=MUTED)
    draw.text((WIDTH - 230, HEIGHT - 62), "Jeder Euro muss wirken", font=font(15, bold=True), fill=MUTED)


def draw_title_block(draw: ImageDraw.ImageDraw, scene: Scene) -> None:
    title_font = font(46, bold=True)
    subtitle_font = font(24)
    y = draw_multiline(draw, (64, 128), clean_markdown(scene.title), title_font, NAVY, 540, 10)
    draw_multiline(draw, (64, y + 14), clean_markdown(scene.subtitle), subtitle_font, INK, 560, 8)


def draw_bullets(draw: ImageDraw.ImageDraw, scene: Scene, x: int = 76, y: int = 360, max_width: int = 500) -> None:
    bullet_font = font(23, bold=True)
    for bullet in scene.bullets:
        clean = clean_markdown(bullet)
        draw.ellipse((x, y + 8, x + 12, y + 20), fill=GREEN)
        y = draw_multiline(draw, (x + 28, y), clean, bullet_font, INK, max_width, 6) + 8


def draw_house(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float = 1.0) -> None:
    s = scale
    draw.polygon([(x, y + 120 * s), (x + 150 * s, y), (x + 300 * s, y + 120 * s)], fill="#7a4126")
    draw.rectangle((x + 35 * s, y + 120 * s, x + 265 * s, y + 300 * s), fill="#f6d7a7", outline=NAVY, width=3)
    draw.rectangle((x + 135 * s, y + 210 * s, x + 190 * s, y + 300 * s), fill="#7e5534")
    draw.rectangle((x + 65 * s, y + 150 * s, x + 115 * s, y + 200 * s), fill="#b7d5df", outline=NAVY, width=2)
    for dx in [70, 170, 230]:
        draw.arc((x + dx * s, y + 75 * s, x + (dx + 42) * s, y + 138 * s), 190, 350, fill=BLUE, width=4)
        draw.line((x + (dx + 20) * s, y + 140 * s, x + (dx + 16) * s, y + 172 * s), fill=BLUE, width=3)


def draw_bridge(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    draw.line((x, y + 170, x + 430, y + 170), fill=NAVY, width=10)
    for i in range(6):
        px = x + 35 + i * 70
        draw.line((px, y + 170, px + 20, y + 260), fill=NAVY, width=5)
    draw.arc((x + 20, y + 60, x + 410, y + 260), 190, 350, fill=GREEN, width=7)
    for i in range(5):
        draw.line((x + 80 + i * 62, y + 115 + i % 2 * 8, x + 80 + i * 62, y + 170), fill=GREEN_DARK, width=3)
    draw.rounded_rectangle((x - 10, y + 260, x + 440, y + 292), radius=12, fill="#d7e7e7")
    draw.text((x + 110, y + 305), "sicherer Weg", font=font(22, bold=True), fill=GREEN_DARK)


def draw_factory(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    draw.rectangle((x, y + 130, x + 360, y + 300), fill="#d7d0c2", outline=NAVY, width=3)
    for i in range(4):
        draw.polygon([(x + i * 75, y + 130), (x + 42 + i * 75, y + 82), (x + 75 + i * 75, y + 130)], fill="#b9b1a1")
    for i in range(3):
        draw.rectangle((x + 42 + i * 88, y + 170, x + 92 + i * 88, y + 220), fill="#f3a65b", outline=NAVY, width=2)
    draw.rectangle((x + 292, y + 35, x + 330, y + 130), fill="#84776a", outline=NAVY, width=3)
    for i, r in enumerate([34, 48, 62]):
        draw.ellipse((x + 270 + i * 25, y - r, x + 330 + i * 25, y - 5), fill=(90, 90, 90), outline=None)
    draw.line((x + 30, y + 320, x + 335, y + 320), fill=RED, width=8)


def draw_compass(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int = 110) -> None:
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=NAVY, width=5, fill="#f8fbf6")
    draw.line((cx, cy - r + 12, cx, cy + r - 12), fill=LINE, width=2)
    draw.line((cx - r + 12, cy, cx + r - 12, cy), fill=LINE, width=2)
    draw.polygon([(cx, cy - r + 24), (cx + 30, cy + 20), (cx, cy + 6), (cx - 30, cy + 20)], fill=GREEN)
    draw.polygon([(cx, cy + r - 24), (cx + 25, cy - 8), (cx, cy - 4), (cx - 25, cy - 8)], fill=WARNING)
    draw.text((cx - 14, cy - r - 34), "W", font=font(22, bold=True), fill=NAVY)


def draw_scale(draw: ImageDraw.ImageDraw, x: int, y: int, left_label: str, right_label: str) -> None:
    draw.line((x + 210, y + 40, x + 210, y + 285), fill=NAVY, width=5)
    draw.line((x + 65, y + 80, x + 355, y + 80), fill=NAVY, width=5)
    draw.ellipse((x + 196, y + 25, x + 224, y + 53), fill=GREEN)
    draw.arc((x + 30, y + 80, x + 145, y + 210), 0, 180, fill=NAVY, width=4)
    draw.arc((x + 275, y + 80, x + 390, y + 210), 0, 180, fill=NAVY, width=4)
    draw.rounded_rectangle((x + 15, y + 180, x + 160, y + 235), radius=18, fill=LIGHT_GREEN, outline=GREEN, width=3)
    draw.rounded_rectangle((x + 260, y + 180, x + 405, y + 235), radius=18, fill="#f2dfd9", outline=RED, width=3)
    draw.text((x + 32, y + 194), left_label, font=font(17, bold=True), fill=GREEN_DARK)
    draw.text((x + 275, y + 194), right_label, font=font(17, bold=True), fill=RED)


def draw_visual(draw: ImageDraw.ImageDraw, base: Image.Image, scene: Scene) -> None:
    box = (650, 120, 1218, 606)
    shadowed_card(base, box, fill="#fbfaf4", outline="#e3e0d2", radius=28)
    draw = ImageDraw.Draw(base)
    x, y = 690, 155
    v = scene.visual
    if v == "house":
        draw_house(draw, x + 90, y + 50, 1.15)
    elif v == "repair_choice":
        draw_house(draw, x + 20, y + 20, 0.75)
        draw_house(draw, x + 300, y + 70, 0.75)
        draw.line((x + 250, y + 225, x + 300, y + 225), fill=WARNING, width=6)
        draw.polygon([(x + 300, y + 225), (x + 282, y + 213), (x + 282, y + 237)], fill=WARNING)
        draw.text((x + 10, y + 335), "rechtzeitig", font=font(22, bold=True), fill=GREEN_DARK)
        draw.text((x + 300, y + 335), "aufgeschoben", font=font(22, bold=True), fill=RED)
    elif v == "state_house":
        labels = ["Schulen", "Brücken", "Pflege", "Gerichte", "Netze", "Vertrauen"]
        for i, label in enumerate(labels):
            cx = x + 70 + (i % 3) * 160
            cy = y + 70 + (i // 3) * 155
            draw.rounded_rectangle((cx - 55, cy - 45, cx + 55, cy + 55), radius=18, fill=LIGHT_GREEN if i % 2 == 0 else "#edf1f5", outline=LINE, width=2)
            draw.rectangle((cx - 25, cy - 10, cx + 25, cy + 35), fill=PAPER, outline=NAVY, width=2)
            draw.polygon([(cx - 35, cy - 10), (cx, cy - 40), (cx + 35, cy - 10)], fill=GREEN)
            tw = text_size(draw, label, font(18, bold=True))[0]
            draw.text((cx - tw / 2, cy + 72), label, font=font(18, bold=True), fill=NAVY)
    elif v == "two_sides":
        draw.rounded_rectangle((x, y + 70, x + 230, y + 295), radius=20, fill="#f2dfd9", outline=RED, width=3)
        draw.rounded_rectangle((x + 280, y + 70, x + 510, y + 295), radius=20, fill=LIGHT_GREEN, outline=GREEN, width=3)
        draw.text((x + 35, y + 110), "Schulden", font=font(30, bold=True), fill=RED)
        draw.text((x + 63, y + 152), "belasten", font=font(30, bold=True), fill=RED)
        draw.text((x + 320, y + 110), "Staat ist", font=font(30, bold=True), fill=GREEN_DARK)
        draw.text((x + 318, y + 152), "anders", font=font(30, bold=True), fill=GREEN_DARK)
        draw.text((x + 218, y + 335), "Was fehlt?", font=font(30, bold=True), fill=NAVY)
    elif v == "big_question":
        draw.text((x + 95, y + 20), "?", font=font(250, bold=True), fill=GREEN)
        draw.text((x + 210, y + 135), "€", font=font(90, bold=True), fill=WARNING)
        draw_compass(draw, x + 385, y + 240, 80)
    elif v == "bridge" or v == "effective_debt":
        draw_bridge(draw, x + 45, y + 35)
        draw.text((x + 80, y + 385), "Zukunft entlasten", font=font(30, bold=True), fill=GREEN_DARK)
    elif v == "harmful_tech" or v == "loss_debt":
        draw_factory(draw, x + 70, y + 45)
        draw.text((x + 118, y + 385), "Problem verlängern", font=font(30, bold=True), fill=RED)
    elif v == "comparison" or v == "final_balance":
        draw_scale(draw, x + 42, y + 55, "Wirkung", "Schaden")
        draw.text((x + 118, y + 365), "gleiche Buchung?", font=font(27, bold=True), fill=NAVY)
    elif v == "definition":
        draw_compass(draw, x + 260, y + 170, 120)
        draw.text((x + 85, y + 340), "Wirkungskompass", font=font(34, bold=True), fill=NAVY)
    elif v == "impact_questions":
        labels = ["Schule", "Luft", "Demokratie", "Risiko"]
        for i, label in enumerate(labels):
            bx = x + 25 + (i % 2) * 250
            by = y + 70 + (i // 2) * 155
            draw.rounded_rectangle((bx, by, bx + 205, by + 100), radius=20, fill=LIGHT_GREEN, outline=GREEN, width=2)
            draw.text((bx + 24, by + 28), label, font=font(25, bold=True), fill=NAVY)
            draw.text((bx + 156, by + 24), "?", font=font(36, bold=True), fill=GREEN)
    elif v == "intention":
        draw.rounded_rectangle((x + 25, y + 70, x + 245, y + 285), radius=22, fill="#fff6dc", outline=WARNING, width=3)
        draw.rounded_rectangle((x + 300, y + 70, x + 520, y + 285), radius=22, fill=LIGHT_GREEN, outline=GREEN, width=3)
        draw.text((x + 65, y + 120), "Absicht", font=font(32, bold=True), fill=WARNING)
        draw.text((x + 348, y + 120), "Wirkung", font=font(32, bold=True), fill=GREEN_DARK)
        draw.line((x + 245, y + 180, x + 300, y + 180), fill=NAVY, width=5)
        draw.polygon([(x + 300, y + 180), (x + 282, y + 168), (x + 282, y + 192)], fill=NAVY)
    elif v == "electricity":
        rows = [("Wirkleistung", GREEN), ("Blindleistung", WARNING), ("Verlustleistung", RED)]
        for i, (label, color) in enumerate(rows):
            yy = y + 80 + i * 105
            draw.line((x + 40, yy + 28, x + 420, yy + 28), fill=color, width=8)
            if i == 1:
                for k in range(4):
                    draw.arc((x + 150 + k * 42, yy - 6, x + 215 + k * 42, yy + 62), 0, 330, fill=color, width=4)
            if i == 2:
                for k in range(5):
                    draw.line((x + 215 + k * 28, yy + 8, x + 235 + k * 28, yy + 48), fill=color, width=3)
            draw.text((x + 50, yy + 45), label, font=font(25, bold=True), fill=NAVY)
    elif v == "debt_types":
        items = [("Wirk-", GREEN), ("Blind-", WARNING), ("Verlust-", RED), ("Reparatur-", BLUE)]
        for i, (label, color) in enumerate(items):
            bx = x + 30 + (i % 2) * 255
            by = y + 65 + (i // 2) * 145
            draw.rounded_rectangle((bx, by, bx + 215, by + 105), radius=18, fill="#ffffff", outline=color, width=4)
            draw.text((bx + 26, by + 29), label + "schulden", font=font(23, bold=True), fill=color)
    elif v == "blind_debt":
        for i in range(5):
            bx = x + 50 + i * 85
            draw.rectangle((bx, y + 90 + i * 8, bx + 55, y + 260 + i * 8), fill="#e4e0d5", outline=MUTED, width=2)
        draw.line((x + 80, y + 345, x + 455, y + 345), fill=WARNING, width=7)
        draw.text((x + 106, y + 368), "viel Bewegung", font=font(29, bold=True), fill=WARNING)
    elif v == "repair_debt":
        draw_house(draw, x + 120, y + 40, 1.0)
        draw.text((x + 128, y + 370), "spät = teuer", font=font(34, bold=True), fill=RED)
    elif v == "hidden_debt":
        draw.polygon([(x + 70, y + 120), (x + 455, y + 120), (x + 355, y + 330), (x + 140, y + 330)], fill="#dff0f4", outline=BLUE)
        draw.rectangle((x + 60, y + 205, x + 470, y + 218), fill=BLUE)
        draw.text((x + 150, y + 70), "sichtbar", font=font(25, bold=True), fill=NAVY)
        draw.text((x + 127, y + 360), "versteckte Schulden", font=font(30, bold=True), fill=BLUE)
    elif v == "mmt":
        draw.rounded_rectangle((x + 80, y + 70, x + 250, y + 320), radius=8, fill="#d8e4ef", outline=NAVY, width=4)
        draw.ellipse((x + 215, y + 190, x + 235, y + 210), fill=GREEN)
        draw.text((x + 125, y + 345), "kein Privathaushalt", font=font(27, bold=True), fill=NAVY)
        draw.text((x + 355, y + 130), "€", font=font(120, bold=True), fill=WARNING)
    elif v == "door_compass":
        draw.rounded_rectangle((x + 75, y + 70, x + 230, y + 330), radius=10, fill="#d8e4ef", outline=NAVY, width=4)
        draw.polygon([(x + 230, y + 70), (x + 350, y + 120), (x + 350, y + 380), (x + 230, y + 330)], fill="#f1ead8", outline=NAVY)
        draw_compass(draw, x + 420, y + 225, 82)
    elif v == "public_purpose":
        draw_compass(draw, x + 260, y + 170, 105)
        draw.text((x + 105, y + 330), "öffentlicher Zweck", font=font(32, bold=True), fill=GREEN_DARK)
    elif v == "mpd":
        labels = [("Mensch", GREEN), ("Planet", BLUE), ("Demokratie", NAVY)]
        for i, (label, color) in enumerate(labels):
            cx = x + 105 + i * 165
            draw.ellipse((cx - 52, y + 100, cx + 52, y + 204), fill="#ffffff", outline=color, width=5)
            draw.text((cx - text_size(draw, label, font(22, bold=True))[0] / 2, y + 232), label, font=font(22, bold=True), fill=color)
        draw.text((x + 135, y + 340), "der Maßstab", font=font(36, bold=True), fill=NAVY)
    elif v == "education":
        draw.rectangle((x + 100, y + 90, x + 430, y + 320), fill="#f4e1b8", outline=NAVY, width=4)
        for i in range(5):
            draw.line((x + 140, y + 135 + i * 32, x + 395, y + 135 + i * 32), fill=GREEN, width=3)
        draw.text((x + 150, y + 360), "Wirkung wächst", font=font(32, bold=True), fill=GREEN_DARK)
    elif v == "climate_adaptation":
        for i in range(4):
            tx = x + 80 + i * 105
            draw.rectangle((tx + 18, y + 220, tx + 34, y + 320), fill="#7a4e2d")
            draw.ellipse((tx - 20, y + 120, tx + 75, y + 230), fill=GREEN)
        draw.arc((x + 80, y + 290, x + 460, y + 390), 0, 180, fill=BLUE, width=8)
        draw.text((x + 130, y + 380), "Vorsorge", font=font(34, bold=True), fill=GREEN_DARK)
    elif v == "security":
        draw.polygon([(x + 250, y + 70), (x + 420, y + 130), (x + 385, y + 315), (x + 250, y + 390), (x + 115, y + 315), (x + 80, y + 130)], fill="#dfe8f2", outline=NAVY)
        draw.text((x + 165, y + 210), "Risiko", font=font(42, bold=True), fill=NAVY)
        draw.line((x + 105, y + 365, x + 410, y + 365), fill=GREEN, width=8)
    elif v in {"budget", "dashboard"}:
        draw.rounded_rectangle((x + 45, y + 60, x + 475, y + 350), radius=22, fill="#ffffff", outline=NAVY, width=3)
        rows = [("Ziel", GREEN), ("Daten", BLUE), ("Wirkung", GREEN_DARK), ("Lernen", WARNING)]
        for i, (label, color) in enumerate(rows):
            yy = y + 105 + i * 54
            draw.text((x + 80, yy), label, font=font(23, bold=True), fill=NAVY)
            draw.rounded_rectangle((x + 220, yy + 4, x + 420, yy + 24), radius=10, fill="#e6e8dd")
            draw.rounded_rectangle((x + 220, yy + 4, x + 220 + 45 + i * 35, yy + 24), radius=10, fill=color)
        draw.text((x + 118, y + 383), "Wirkungshaushalt", font=font(28, bold=True), fill=GREEN_DARK)
    elif v == "rule":
        draw.text((x + 105, y + 90), "JEDER", font=font(60, bold=True), fill=NAVY)
        draw.text((x + 130, y + 160), "EURO", font=font(78, bold=True), fill=GREEN)
        draw.text((x + 72, y + 255), "MUSS WIRKEN", font=font(48, bold=True), fill=NAVY)
    elif v == "discipline":
        checks = ["Fachkräfte", "Material", "Zeit", "Vertrauen", "Nebenwirkungen"]
        for i, label in enumerate(checks):
            yy = y + 70 + i * 62
            draw.rounded_rectangle((x + 80, yy, x + 130, yy + 38), radius=8, fill=LIGHT_GREEN, outline=GREEN, width=3)
            draw.line((x + 90, yy + 18, x + 104, yy + 31), fill=GREEN_DARK, width=4)
            draw.line((x + 104, yy + 31, x + 123, yy + 8), fill=GREEN_DARK, width=4)
            draw.text((x + 155, yy + 4), label, font=font(25, bold=True), fill=NAVY)
    elif v == "real_limits":
        for i, label in enumerate(["Pflege", "Lehre", "Böden", "Brücke"]):
            bx = x + 42 + (i % 2) * 245
            by = y + 70 + (i // 2) * 145
            draw.rounded_rectangle((bx, by, bx + 205, by + 100), radius=20, fill="#fffaf0", outline=WARNING, width=3)
            draw.text((bx + 38, by + 30), label, font=font(28, bold=True), fill=NAVY)
        draw.line((x + 55, y + 345, x + 475, y + 345), fill=RED, width=7)
        draw.text((x + 106, y + 368), "nicht druckbar", font=font(30, bold=True), fill=RED)
    elif v == "two_checks":
        draw.rounded_rectangle((x + 55, y + 100, x + 255, y + 270), radius=25, fill="#edf1f5", outline=BLUE, width=4)
        draw.rounded_rectangle((x + 305, y + 100, x + 505, y + 270), radius=25, fill=LIGHT_GREEN, outline=GREEN, width=4)
        draw.text((x + 83, y + 150), "finanzierbar?", font=font(24, bold=True), fill=BLUE)
        draw.text((x + 358, y + 150), "wirksam?", font=font(26, bold=True), fill=GREEN_DARK)
        draw.text((x + 228, y + 320), "+", font=font(64, bold=True), fill=NAVY)
    elif v == "architecture":
        draw.rectangle((x + 100, y + 250, x + 435, y + 330), fill="#d9e5eb", outline=NAVY, width=3)
        for i in range(4):
            px = x + 130 + i * 78
            draw.rectangle((px, y + 120, px + 45, y + 250), fill=PAPER, outline=NAVY, width=3)
        draw.polygon([(x + 92, y + 120), (x + 267, y + 40), (x + 442, y + 120)], fill=GREEN, outline=NAVY)
        draw.text((x + 110, y + 365), "Wirkungsarchitektur", font=font(30, bold=True), fill=NAVY)
    elif v == "not_to_act":
        draw.text((x + 90, y + 110), "leisten?", font=font(44, bold=True), fill=NAVY)
        draw.text((x + 120, y + 190), "nicht tun?", font=font(44, bold=True), fill=RED)
        draw_compass(draw, x + 390, y + 240, 82)
    elif v == "final":
        hero = fit_cover(BLOG_IMAGE, (520, 315))
        hero = ImageEnhance.Color(hero).enhance(0.92)
        base.alpha_composite(hero.convert("RGBA"), (674, 150))
        draw.rounded_rectangle((674, 150, 1194, 465), radius=26, outline="#ffffff", width=4)
        draw.text((x + 80, y + 360), "Jeder Euro muss wirken.", font=font(35, bold=True), fill=GREEN_DARK)
    else:
        draw_compass(draw, x + 260, y + 190, 120)


def render_slide(scene: Scene, index: int, duration: float, total_duration: float, elapsed: float, target: Path) -> None:
    base = background()
    draw = ImageDraw.Draw(base)
    draw_header(draw, scene, index, duration, total_duration, elapsed)
    draw_title_block(draw, scene)
    draw_bullets(draw, scene)
    draw_visual(draw, base, scene)
    base.convert("RGB").save(target, "PNG", optimize=True)


def build() -> None:
    if not SCRIPT_SOURCE.exists():
        raise FileNotFoundError(SCRIPT_SOURCE)
    if not AUDIO_SOURCE.exists():
        raise FileNotFoundError(AUDIO_SOURCE)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    for old in WORK_DIR.glob("slide-*.png"):
        old.unlink()

    script = SCRIPT_SOURCE.read_text(encoding="utf-8")
    segments = locate_segments(script)
    total_audio = audio_duration(AUDIO_SOURCE)
    weights = [max(1, len(words(segment))) for _, segment in segments]
    total_weight = sum(weights)
    durations = [total_audio * weight / total_weight for weight in weights]
    scale = total_audio / sum(durations)
    durations = [duration * scale for duration in durations]

    elapsed = 0.0
    storyboard = []
    concat_lines: list[str] = []
    for idx, ((scene, segment), duration) in enumerate(zip(segments, durations)):
        slide = WORK_DIR / f"slide-{idx:02d}.png"
        render_slide(scene, idx, duration, total_audio, elapsed, slide)
        storyboard.append({
            "index": idx,
            "start": round(elapsed, 3),
            "duration": round(duration, 3),
            "title": scene.title,
            "anchor": scene.anchor,
            "words": weights[idx],
        })
        concat_lines.append(f"file '{slide.as_posix()}'")
        concat_lines.append(f"duration {duration:.6f}")
        elapsed += duration
    concat_lines.append(f"file '{(WORK_DIR / f'slide-{len(segments)-1:02d}.png').as_posix()}'")
    (WORK_DIR / "concat.txt").write_text("\n".join(concat_lines) + "\n", encoding="utf-8")
    STORYBOARD_TARGET.write_text(json.dumps({
        "audio": str(AUDIO_SOURCE),
        "duration": total_audio,
        "slides": storyboard,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    first_slide = WORK_DIR / "slide-00.png"
    Image.open(first_slide).save(POSTER_TARGET, "PNG", optimize=True)

    run([
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(WORK_DIR / "concat.txt"),
        "-i",
        str(AUDIO_SOURCE),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-vf",
        f"fps={FPS},format=yuv420p",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "27",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-movflags",
        "+faststart",
        "-t",
        f"{total_audio:.3f}",
        str(VIDEO_TARGET),
    ])

    print(f"Wrote {VIDEO_TARGET.relative_to(ROOT)}")
    print(f"Wrote {POSTER_TARGET.relative_to(ROOT)}")
    print(f"Slides: {len(segments)}, duration: {total_audio:.3f}s")


if __name__ == "__main__":
    build()
