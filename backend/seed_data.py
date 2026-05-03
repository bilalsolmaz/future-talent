"""
LocalShop — Gerçekçi Kategori ve Ürün Seed Script
Mevcut veritabanına güncel e-ticaret kategorileri ve ürünleri ekler.
"""

import requests
import sys

BASE = "http://localhost:8000/api"

# Admin login
def get_admin_token():
    r = requests.post(f"{BASE}/auth/login", data={"username": "test@gmail.com", "password": "123456"})
    if r.status_code != 200:
        print("❌ Admin login başarısız:", r.text)
        sys.exit(1)
    return r.json()["access_token"]

def seed():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # ─── KATEGORİLER ──────────────────────────────────────
    categories = [
        "Akıllı Telefonlar",
        "Bilgisayar & Tablet",
        "TV & Görüntü",
        "Kulaklık & Ses Sistemleri",
        "Giyim & Moda",
        "Ev & Yaşam",
        "Kişisel Bakım",
        "Spor & Outdoor",
    ]

    cat_map = {}
    for cat_name in categories:
        r = requests.post(f"{BASE}/kategoriler/", json={"isim": cat_name}, headers=headers)
        if r.status_code in (200, 201):
            cat_map[cat_name] = r.json()["id"]
            print(f"  ✅ Kategori: {cat_name} (ID: {cat_map[cat_name]})")
        else:
            print(f"  ⚠️ Kategori atlandı: {cat_name} — {r.text}")

    # ─── ÜRÜNLER ───────────────────────────────────────────
    products = [
        # Akıllı Telefonlar
        {
            "isim": "iPhone 15 Pro Max 256GB",
            "aciklama": "Apple A17 Pro çip, 48MP kamera sistemi, titanyum tasarım, USB-C, 6.7 inç Super Retina XDR OLED ekran. iOS 17 ile en gelişmiş iPhone deneyimi.",
            "fiyat": 74999.99,
            "stok": 25,
            "kategori": "Akıllı Telefonlar",
            "resim_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600"
        },
        {
            "isim": "Samsung Galaxy S24 Ultra",
            "aciklama": "Snapdragon 8 Gen 3 işlemci, 200MP kamera, S Pen desteği, 6.8 inç Dynamic AMOLED 2X ekran, Galaxy AI yapay zekâ özellikleri.",
            "fiyat": 69999.99,
            "stok": 30,
            "kategori": "Akıllı Telefonlar",
            "resim_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600"
        },
        {
            "isim": "Xiaomi 14 Pro",
            "aciklama": "Leica optik kamera sistemi, Snapdragon 8 Gen 3, 120W hızlı şarj, 6.73 inç LTPO AMOLED ekran, 50MP ana kamera.",
            "fiyat": 34999.99,
            "stok": 40,
            "kategori": "Akıllı Telefonlar",
            "resim_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600"
        },
        {
            "isim": "Google Pixel 8 Pro",
            "aciklama": "Google Tensor G3 çip, 50MP ana kamera, 7 yıl Android güncelleme garantisi, AI fotoğraf düzenleme, 6.7 inç LTPO OLED ekran.",
            "fiyat": 39999.99,
            "stok": 15,
            "kategori": "Akıllı Telefonlar",
            "resim_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600"
        },

        # Bilgisayar & Tablet
        {
            "isim": "MacBook Air M3 15 inç",
            "aciklama": "Apple M3 çip, 8 çekirdekli CPU, 10 çekirdekli GPU, 16GB RAM, 512GB SSD, 18 saat pil ömrü. Fanless tasarım, MagSafe şarj.",
            "fiyat": 54999.99,
            "stok": 20,
            "kategori": "Bilgisayar & Tablet",
            "resim_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600"
        },
        {
            "isim": "iPad Pro M4 11 inç",
            "aciklama": "Apple M4 çip, Ultra Retina XDR Tandem OLED ekran, Apple Pencil Pro desteği, 256GB SSD, Face ID, Wi-Fi 6E.",
            "fiyat": 44999.99,
            "stok": 18,
            "kategori": "Bilgisayar & Tablet",
            "resim_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600"
        },
        {
            "isim": "ASUS ROG Strix G16 Gaming Laptop",
            "aciklama": "Intel Core i9-14900HX, NVIDIA RTX 4070 8GB, 32GB DDR5 RAM, 1TB NVMe SSD, 16 inç 240Hz QHD+ ekran. RGB klavye, Dolby Atmos.",
            "fiyat": 89999.99,
            "stok": 10,
            "kategori": "Bilgisayar & Tablet",
            "resim_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600"
        },
        {
            "isim": "Lenovo ThinkPad X1 Carbon Gen 12",
            "aciklama": "Intel Core Ultra 7, 16GB LPDDR5x, 512GB SSD, 14 inç 2.8K OLED ekran, MIL-STD-810H dayanıklılık, 1.08 kg ağırlık.",
            "fiyat": 62999.99,
            "stok": 12,
            "kategori": "Bilgisayar & Tablet",
            "resim_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600"
        },

        # TV & Görüntü
        {
            "isim": "Samsung 65\" Neo QLED 4K Smart TV",
            "aciklama": "QN85D serisi, Neural Quantum 4K işlemci, Dolby Atmos, 120Hz, Gaming Hub, SmartThings entegrasyonu, Slim One Connect.",
            "fiyat": 49999.99,
            "stok": 8,
            "kategori": "TV & Görüntü",
            "resim_url": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600"
        },
        {
            "isim": "LG 55\" OLED C4 4K Smart TV",
            "aciklama": "OLED evo, α9 AI Gen7 işlemci, Dolby Vision & Atmos, 120Hz VRR, webOS 24, 4x HDMI 2.1, Ultra İnce Tasarım.",
            "fiyat": 42999.99,
            "stok": 10,
            "kategori": "TV & Görüntü",
            "resim_url": "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600"
        },
        {
            "isim": "Sony PlayStation 5 Slim",
            "aciklama": "825GB SSD, DualSense kablosuz kumanda, 4K 120fps oyun desteği, Ray Tracing, PS VR2 uyumlu, %30 daha kompakt tasarım.",
            "fiyat": 18999.99,
            "stok": 35,
            "kategori": "TV & Görüntü",
            "resim_url": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600"
        },

        # Kulaklık & Ses Sistemleri
        {
            "isim": "Apple AirPods Pro 2 (USB-C)",
            "aciklama": "H2 çip, Aktif Gürültü Engelleme, Adaptif Ses, Kişiselleştirilmiş Spatial Audio, 6 saat pil, MagSafe şarj kutusu.",
            "fiyat": 9499.99,
            "stok": 50,
            "kategori": "Kulaklık & Ses Sistemleri",
            "resim_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600"
        },
        {
            "isim": "Sony WH-1000XM5",
            "aciklama": "Endüstri lideri gürültü engelleme, 30 saat pil ömrü, LDAC Hi-Res Audio, Speak-to-Chat, çoklu cihaz bağlantısı, katlanır tasarım.",
            "fiyat": 11999.99,
            "stok": 30,
            "kategori": "Kulaklık & Ses Sistemleri",
            "resim_url": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600"
        },
        {
            "isim": "JBL Charge 5 Bluetooth Hoparlör",
            "aciklama": "IP67 su ve toz geçirmez, 20 saat pil ömrü, JBL Pro Sound, Powerbank özelliği, PartyBoost ile çoklu hoparlör bağlantısı.",
            "fiyat": 4999.99,
            "stok": 45,
            "kategori": "Kulaklık & Ses Sistemleri",
            "resim_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"
        },
        {
            "isim": "Marshall Stanmore III",
            "aciklama": "Bluetooth 5.2, dinamik geniş sahne, bas ve tiz ayarı, vintage rock tasarım, RCA ve 3.5mm giriş, Marshall uygulaması desteği.",
            "fiyat": 12499.99,
            "stok": 15,
            "kategori": "Kulaklık & Ses Sistemleri",
            "resim_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600"
        },

        # Giyim & Moda
        {
            "isim": "Nike Air Force 1 '07",
            "aciklama": "Efsanevi beyaz deri sneaker, Air yastıklama teknolojisi, dayanıklı kauçuk taban, klasik basketball DNA, her kombine uyumlu.",
            "fiyat": 3799.99,
            "stok": 60,
            "kategori": "Giyim & Moda",
            "resim_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
        },
        {
            "isim": "Levi's 501 Original Fit Jean",
            "aciklama": "1873'ten beri ikonik düz kesim, %100 pamuk denim, düğmeli kapama, orta bel, zaman geçtikçe güzelleşen yıkama. Klasik indigo mavi.",
            "fiyat": 2499.99,
            "stok": 80,
            "kategori": "Giyim & Moda",
            "resim_url": "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600"
        },
        {
            "isim": "The North Face 1996 Retro Nuptse Ceket",
            "aciklama": "700 fill power kaz tüyü dolgulu, su itici DryVent dış yüzey, ikonik puffer tasarım, -20°C'ye kadar sıcaklık. Siyah renk.",
            "fiyat": 8999.99,
            "stok": 25,
            "kategori": "Giyim & Moda",
            "resim_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
        },
        {
            "isim": "Ray-Ban Wayfarer Classic Güneş Gözlüğü",
            "aciklama": "Polarize G-15 cam lens, asetat çerçeve, UV400 koruma, ikonik 1956 tasarımı, İtalya yapımı. Siyah/yeşil cam.",
            "fiyat": 3299.99,
            "stok": 40,
            "kategori": "Giyim & Moda",
            "resim_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"
        },

        # Ev & Yaşam
        {
            "isim": "Dyson V15 Detect Kablosuz Süpürge",
            "aciklama": "Lazer toz algılama, LCD ekranda parçacık analizi, 60 dakika çalışma süresi, HEPA filtreleme, Click-in batarya.",
            "fiyat": 24999.99,
            "stok": 15,
            "kategori": "Ev & Yaşam",
            "resim_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600"
        },
        {
            "isim": "Nespresso Vertuo Next Kahve Makinesi",
            "aciklama": "Centrifusion teknolojisi, 5 farklı fincan boyutu (espresso'dan carafe'a), tek tuşla kullanım, 30 saniyede ısınma, %54 geri dönüştürülmüş plastik.",
            "fiyat": 5499.99,
            "stok": 30,
            "kategori": "Ev & Yaşam",
            "resim_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600"
        },
        {
            "isim": "iRobot Roomba j9+ Robot Süpürge",
            "aciklama": "PrecisionVision navigasyon, otomatik çöp boşaltma istasyonu, 3 aşamalı temizlik, evcil hayvan tüyü uzmanı, akıllı haritalama.",
            "fiyat": 29999.99,
            "stok": 8,
            "kategori": "Ev & Yaşam",
            "resim_url": "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600"
        },
        {
            "isim": "Philips Airfryer XXL HD9285",
            "aciklama": "7.3L kapasite (5 kişilik), Rapid Air teknolojisi, %90 daha az yağ, dijital dokunmatik ekran, 7 ön ayarlı program, bulaşık makinesine uygun.",
            "fiyat": 6999.99,
            "stok": 22,
            "kategori": "Ev & Yaşam",
            "resim_url": "https://images.unsplash.com/photo-1648398798875-a03ae2cff0d3?w=600"
        },

        # Kişisel Bakım
        {
            "isim": "Dyson Airwrap Complete Long",
            "aciklama": "Coanda etkisi ile saç şekillendirme, 6 farklı başlık, akıllı ısı kontrolü, uzun saçlar için optimize edilmiş, 1300W motor.",
            "fiyat": 17999.99,
            "stok": 12,
            "kategori": "Kişisel Bakım",
            "resim_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600"
        },
        {
            "isim": "Oral-B iO Series 9 Elektrikli Diş Fırçası",
            "aciklama": "Manyetik iO teknolojisi, 3D izleme sensörü, renkli OLED ekran, 7 temizlik modu, AI fırçalama koçu, seyahat çantası dahil.",
            "fiyat": 5499.99,
            "stok": 25,
            "kategori": "Kişisel Bakım",
            "resim_url": "https://images.unsplash.com/photo-1559591937-abc1f8f90c9d?w=600"
        },
        {
            "isim": "Philips OneBlade Pro QP6551",
            "aciklama": "360° esnek başlık, hassas tarak sistemi (14 kademe), ıslak ve kuru kullanım, 120 dakika pil ömrü, LED gösterge.",
            "fiyat": 2299.99,
            "stok": 35,
            "kategori": "Kişisel Bakım",
            "resim_url": "https://images.unsplash.com/photo-1621607505099-7125e08c1e96?w=600"
        },

        # Spor & Outdoor
        {
            "isim": "Apple Watch Ultra 2",
            "aciklama": "49mm titanyum kasa, 3000 nit ekran, çift frekanslı GPS, 100m su direnci, 36 saat pil ömrü, Action Button. En dayanıklı Apple Watch.",
            "fiyat": 29999.99,
            "stok": 20,
            "kategori": "Spor & Outdoor",
            "resim_url": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600"
        },
        {
            "isim": "Garmin Fenix 8 AMOLED",
            "aciklama": "1.4 inç AMOLED ekran, solar şarj, çoklu uydu desteği, 100m dalış direnci, gelişmiş antrenman metrikleri, TopoActive haritalar.",
            "fiyat": 24999.99,
            "stok": 10,
            "kategori": "Spor & Outdoor",
            "resim_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
        },
        {
            "isim": "Nike Dri-FIT ADV Running Tişört",
            "aciklama": "Gelişmiş nem yönetimi, hafif ve nefes alabilir kumaş, reflektif detaylar, düz kesim, gece koşuları için görünürlük. Siyah/Gümüş.",
            "fiyat": 1299.99,
            "stok": 100,
            "kategori": "Spor & Outdoor",
            "resim_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"
        },
        {
            "isim": "Under Armour HOVR Phantom 3",
            "aciklama": "UA HOVR yastıklama, UA Flow taban, Bluetooth adım ve mesafe takibi, IntelliKnit üst, MapMyRun uyumlu. Hafif ve esnek koşu ayakkabısı.",
            "fiyat": 4799.99,
            "stok": 35,
            "kategori": "Spor & Outdoor",
            "resim_url": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600"
        },
    ]

    print(f"\n📦 {len(products)} ürün ekleniyor...\n")
    success = 0
    for p in products:
        payload = {
            "isim": p["isim"],
            "aciklama": p["aciklama"],
            "fiyat": p["fiyat"],
            "stok": p["stok"],
            "kategori_id": cat_map.get(p["kategori"]),
            "resim_url": p.get("resim_url"),
        }
        r = requests.post(f"{BASE}/urunler/", json=payload, headers=headers)
        if r.status_code in (200, 201):
            success += 1
            print(f"  ✅ {p['isim']} — ₺{p['fiyat']:,.2f} ({p['stok']} adet)")
        else:
            print(f"  ❌ {p['isim']} — {r.text}")

    print(f"\n🎉 Tamamlandı! {success}/{len(products)} ürün başarıyla eklendi.")
    print(f"   {len(cat_map)} kategori eklendi.")

if __name__ == "__main__":
    seed()
