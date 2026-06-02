"""
gerar-favicon.py
Gera todos os tamanhos de favicon com bordas arredondadas
a partir da imagem original do ícone.

Uso:
  1. Salve o ícone (o símbolo do "3" com ondas) como:
        dbAparelhosAuditivos/images/logo-icon.png
  2. Execute:
        python gerar-favicon.py
  3. Os arquivos serão criados automaticamente em images/

Requisito: pip install Pillow
"""

from PIL import Image, ImageDraw
import os

# Caminho da imagem original do ícone (o símbolo, sem o texto "dB medical")
SRC = os.path.join("images", "logo-icon.png")

# Tamanhos a gerar
SIZES = {
    "favicon-16.png":  16,
    "favicon-32.png":  32,
    "favicon-180.png": 180,   # Apple Touch Icon
    "favicon-192.png": 192,   # Android Chrome
}

# Raio de arredondamento (proporção — 22% é padrão iOS-like)
RADIUS_RATIO = 0.22


def make_rounded(img: Image.Image, size: int, radius_ratio: float) -> Image.Image:
    """Redimensiona para `size x size` e aplica bordas arredondadas."""
    # Redimensionar mantendo qualidade
    img = img.convert("RGBA")
    img = img.resize((size, size), Image.LANCZOS)

    # Criar máscara com bordas arredondadas
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    r = int(size * radius_ratio)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)

    # Fundo branco
    background = Image.new("RGBA", (size, size), (255, 255, 255, 255))

    # Aplicar ícone sobre fundo
    background.paste(img, (0, 0), img)

    # Aplicar máscara arredondada
    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    result.paste(background, (0, 0), mask)

    return result


def main():
    if not os.path.exists(SRC):
        print(f"ERRO: Arquivo '{SRC}' não encontrado.")
        print("Salve o ícone (símbolo 3dB) como 'images/logo-icon.png' e execute novamente.")
        return

    original = Image.open(SRC)
    print(f"Imagem original: {original.size} — {original.mode}")

    for filename, size in SIZES.items():
        out_path = os.path.join("images", filename)
        icon = make_rounded(original, size, RADIUS_RATIO)
        icon.save(out_path, "PNG", optimize=True)
        print(f"  ✓ Gerado: {out_path} ({size}x{size}px)")

    # Gerar também .ico (16 e 32 juntos)
    ico_path = os.path.join("images", "favicon.ico")
    icon16 = make_rounded(original, 16, RADIUS_RATIO).convert("RGBA")
    icon32 = make_rounded(original, 32, RADIUS_RATIO).convert("RGBA")
    icon16.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32)],
                append_images=[icon32])
    print(f"  ✓ Gerado: {ico_path} (multi-size .ico)")

    print("\nPronto! Todos os favicons foram gerados.")
    print("O SVG (images/favicon.svg) já está configurado e usa images/logo-icon.png.")


if __name__ == "__main__":
    main()
