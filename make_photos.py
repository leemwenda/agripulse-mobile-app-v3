from PIL import Image
import os
d = os.path.expanduser("~/agripulse-node/client/public")
for src, out in [("farm-hero.jpg","hero.jpg"),("journey1.jpg","farmer.jpg"),("cow3.jpg","buyer.jpg"),("vet1.jpg","vet.jpg")]:
    im = Image.open(os.path.join(d, src)).convert("RGB")
    im.thumbnail((900, 1400))
    im.save("public/img/" + out, quality=78, optimize=True, progressive=True)
    print(out, im.size, os.path.getsize("public/img/" + out) // 1024, "KB")
