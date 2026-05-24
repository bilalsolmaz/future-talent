# 🎨 DesignSystem.md — LocalShop Tasarım Sistemi

> Renk paleti, tipografi, component kuralları ve UI standartları.

---

## 1. Renk Paleti

LocalShop'un renk sistemi TailwindCSS 4'ün `@theme` bloğu üzerinden tanımlanmıştır.  
Tüm renkler semantik alias'lar ile kullanılır — doğrudan hex/rgb yerine design token'lar tercih edilir.

### Ana Renkler (Primary)

| Token | Tailwind Karşılığı | Kullanım |
|-------|---------------------|----------|
| `primary-50` | `blue-50` | Hover arka plan, seçili öğe tonu |
| `primary-100` | `blue-100` | Badge arka plan, bildirim tonu |
| `primary-200` | `blue-200` | Metin seçim rengi (selection) |
| `primary-500` | `blue-500` | Focus ring, aktif göstergeler |
| `primary-600` | `blue-600` | **Ana buton arka planı**, link rengi |
| `primary-700` | `blue-700` | Buton hover durumu |
| `primary-900` | `blue-900` | Seçili metin rengi |

### Vurgu Renkleri (Accent)

| Token | Tailwind Karşılığı | Kullanım |
|-------|---------------------|----------|
| `accent-400` | `amber-400` | İkon vurgusu, rozet |
| `accent-500` | `amber-500` | **Vurgu buton arka planı** |
| `accent-600` | `amber-600` | Vurgu buton hover |

### Yüzey Renkleri (Surface / Neutral)

| Token | Tailwind Karşılığı | Kullanım |
|-------|---------------------|----------|
| `surface-50` | `slate-50` | Sayfa arka planı (`body`) |
| `surface-100` | `slate-100` | Kart kenarlıkları, bölme çizgileri |
| `surface-200` | `slate-200` | Input kenarlıkları, tablo ayırıcıları |
| `surface-300` | `slate-300` | Dashed border (upload alanı) |
| `surface-400` | `slate-400` | İkincil ikon rengi, placeholder |
| `surface-500` | `slate-500` | Alt metin, açıklama |
| `surface-600` | `slate-600` | Normal gövde metni (ikincil) |
| `surface-700` | `slate-700` | Güçlü ikincil metin |
| `surface-800` | `slate-800` | İkincil buton metin rengi |
| `surface-900` | `slate-900` | **Ana gövde metni**, başlıklar |

### Durum Renkleri

| Durum | Arka Plan | Metin | Kullanım |
|-------|-----------|-------|----------|
| Başarılı | `green-100` | `green-700` | Stok yeterli badge, onay |
| Uyarı | `amber-100` | `amber-700` | Bekleyen durum, dikkat |
| Hata | `red-100` | `red-700` | Düşük stok, silme, hata mesajı |
| Bilgi | `blue-100` | `blue-700` | Bilgilendirme, ipucu |
| AI/Premium | `purple-50` | `purple-600` | AI butonları, sparkle efekti |

---

## 2. Tipografi

### Font Aileleri

| Amaç | Font | Fallback | Kullanım |
|------|------|----------|----------|
| **Gövde metni** | `Inter` | `system-ui, -apple-system, sans-serif` | Paragraflar, butonlar, input'lar, tablolar |
| **Başlıklar** | `Outfit` | `system-ui, -apple-system, sans-serif` | h1-h6, sayfa başlıkları, modal başlıkları |

### Başlık Stilleri

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);   /* Outfit */
  font-weight: 600;                    /* semibold */
  letter-spacing: -0.025em;            /* tracking-tight */
  color: var(--color-surface-900);     /* Koyu slate */
}
```

### Metin Boyutları

| Eleman | Sınıf | Kullanım |
|--------|-------|----------|
| Sayfa başlığı | `text-2xl font-bold` | Admin panel başlıkları |
| Modal başlığı | `text-xl font-bold` | Form modal başlıkları |
| Kart başlığı | `text-lg font-semibold` | Dashboard kartları |
| Gövde metni | `text-sm` | Genel metin, tablo hücreleri |
| Küçük metin | `text-xs` | Badge, etiket, alt açıklama |
| Mikro metin | `text-[10px]` | Dosya boyutu ipucu, fallback etiketleri |

---

## 3. Component Kuralları

### 3.1 Butonlar

```css
/* Temel buton */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;     /* rounded-lg */
  padding: 0.5rem 1rem;       /* py-2 px-4 */
  font-weight: 500;           /* medium */
  transition: all;
  active: scale(0.95);        /* tıklama efekti */
}

/* Varyantlar */
.btn-primary   → bg-primary-600, text-white, hover:bg-primary-700
.btn-secondary → bg-white, text-surface-800, border, hover:bg-surface-50
.btn-accent    → bg-accent-500, text-white, hover:bg-accent-600
```

**Kurallar:**
- Her buton `disabled:opacity-50 disabled:pointer-events-none` ile devre dışı durumu destekler
- Gölge: Primary ve accent butonlarda `shadow-sm shadow-[renk]-500/20` ile hafif renk gölgesi
- İkon butonları: `p-1.5` padding, sadece ikon

### 3.2 Kartlar

```css
.card {
  background: white;
  border-radius: 0.75rem;     /* rounded-xl */
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-surface-100);
  overflow: hidden;
  transition: all;
}
```

**Kurallar:**
- Kartlar her zaman `bg-white` arka plan
- Kenarlık `border-surface-100` ile çok hafif
- Modal kartlar: `rounded-2xl shadow-xl`
- Hover etkileşimi olan kartlar: `hover:shadow-floating` ile yükseltme efekti

### 3.3 Form Input'ları

```css
.input-field {
  width: 100%;
  border-radius: 0.5rem;     /* rounded-lg */
  border: 1px solid var(--color-surface-200);
  background: white;
  padding: 0.625rem 1rem;    /* py-2.5 px-4 */
  font-size: 0.875rem;       /* text-sm */
  transition: all;
}

/* Focus durumu */
.input-field:focus {
  border-color: var(--color-primary-500);
  ring: 2px var(--color-primary-500) / 20%;
}
```

**Kurallar:**
- Disabled durumda: `bg-surface-50 text-surface-500`
- Select elemanları da `.input-field` kullanır
- Textarea: `.input-field min-h-[120px]`
- Dosya yükleme alanı: `border-2 border-dashed border-surface-300 rounded-xl`

### 3.4 Tablo

```
Tablo kapsayıcı: .card overflow-hidden
Thead: bg-surface-50, border-b, text-sm uppercase tracking-wider
Tbody satır: hover:bg-surface-50 transition-colors
Tbody hücre: p-4 text-sm
Stok badge: px-2 py-1 rounded-full text-xs font-medium
  → stok < 10: bg-red-100 text-red-700
  → stok >= 10: bg-green-100 text-green-700
```

### 3.5 Modal

```
Overlay: fixed inset-0 z-[100] bg-surface-900/40 backdrop-blur-sm
Modal kutu: bg-white rounded-2xl shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto
Başlık: p-6 border-b sticky top-0 bg-white/90 backdrop-blur z-10
İçerik: p-6 space-y-5
Alt butonlar: flex justify-end gap-3 pt-4 border-t
```

### 3.6 Badge / Chip

```
Varsayılan: px-2 py-1 rounded-full text-xs font-medium
Renk varyantları:
  → Başarılı: bg-green-100 text-green-700
  → Uyarı:   bg-amber-100 text-amber-700
  → Hata:    bg-red-100 text-red-700
  → Bilgi:   bg-blue-100 text-blue-700
```

---

## 4. Gölge Sistemi

| Token | Değer | Kullanım |
|-------|-------|----------|
| `shadow-subtle` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Butonlar, küçük elemanlar |
| `shadow-card` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Kartlar, paneller |
| `shadow-floating` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Dropdown, hover kartları |
| `shadow-xl` | TailwindCSS varsayılan | Modallar |

---

## 5. Erişilebilirlik (Accessibility)

### Focus Ring
```css
*:focus-visible {
  outline: none;
  ring: 2px solid var(--color-primary-500);
  ring-offset: 2px;
  ring-offset-color: var(--color-surface-50);
}
```

### Metin Seçimi
```css
body {
  selection-background: var(--color-primary-200);
  selection-color: var(--color-primary-900);
}
```

---

## 6. Animasyonlar

| Animasyon | Sınıf | Kullanım |
|-----------|-------|----------|
| Buton tıklama | `active:scale-95` | Tüm `.btn` elemanları |
| Mobil menü girişi | `animate-slide-in-left` | Navbar hamburger menü |
| Spinner | `animate-spin` | Yükleniyor göstergeleri (Loader2 ikonu) |
| Geçiş | `transition-all` / `transition-colors` | Hover, focus değişimleri |
| Ürün kartı | `hover:shadow-floating` + `hover:-translate-y-1` | Ürün kartları (ProductCard) |

---

## 7. Responsive Breakpoint'ler

TailwindCSS 4 varsayılan breakpoint'leri kullanılır:

| Prefix | Min Genişlik | Kullanım |
|--------|-------------|----------|
| `sm:` | 640px | İki sütunlu form grid'i |
| `md:` | 768px | Tablet layout |
| `lg:` | 1024px | Desktop sidebar, geniş grid |
| `xl:` | 1280px | Maks içerik genişliği (`max-w-7xl`) |

### Layout Kuralları
- Sayfa konteyneri: `max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8`
- Admin sidebar: Sabit genişlik, sol tarafta
- Form grid: `grid grid-cols-1 sm:grid-cols-2 gap-5`
- Tablo: `overflow-x-auto` ile yatay kaydırma

---

## 8. İkon Kuralları

Proje genelinde **Lucide React** ikon kütüphanesi kullanılır.

| Bağlam | Boyut | Örnek |
|--------|-------|-------|
| Buton içi ikon | `size={18}` | `<Plus size={18} className="mr-2" />` |
| Tablo aksiyon | `size={16}` | `<Edit2 size={16} />` |
| Upload alanı | `size={24}` | `<Upload size={24} />` |
| Modal ikon | `size={32}` | `<Trash2 size={32} />` (Silme onay) |
| AI badge | `size={12}` | `<Sparkles size={12} />` |

---

*LocalShop DesignSystem.md — 2025–2026*
