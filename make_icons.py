from PIL import Image
import os
p = os.path.expanduser("~/agripulse-node/client/public/favicon-512.png")
src = Image.open(p).convert("RGBA")
src.save("public/brand-logo-source.png")
W = (255, 255, 255, 255)

def place(size, scale, fill):
    c = Image.new("RGBA", (size, size), fill)
    w = int(size * scale)
    h = int(w * src.height / src.width)
    c.paste(src.resize((w, h), Image.LANCZOS), ((size - w) // 2, (size - h) // 2), src.resize((w, h), Image.LANCZOS))
    return c

place(1024, 0.86, W).save("assets/icon-only.png")
place(1024, 0.60, (0, 0, 0, 0)).save("assets/icon-foreground.png")
Image.new("RGBA", (1024, 1024), W).save("assets/icon-background.png")
place(2732, 0.18, W).save("assets/splash.png")
place(2732, 0.18, W).save("assets/splash-dark.png")
print("ok")
