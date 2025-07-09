# Kandilli MCP

Bu paket, Kandilli Rasathanesi üzerinden son depremleri sorgulamak için bir Model Context Protocol (MCP) aracıdır.

## Özellikler

- Son depremleri listeleme (filtreleme seçenekleri ile)
- İstanbul ve Marmara bölgesi depremlerini sorgulama
- Büyük depremleri filtreleme (ML ≥ 4.0)
- Son 1 saat içindeki depremleri görüntüleme
- Detaylı deprem bilgileri (büyüklük, konum, derinlik, zaman)

## Kurulum

```bash
npm install @hakan.ucar/kandilli-mcp
```

## Kullanım

```typescript
import { son_depremler, istanbul_depremleri, buyuk_depremler, son_saat_depremleri } from '@hakan.ucar/kandilli-mcp';

// Son depremleri listele
const sonuc1 = await son_depremler({
  limit: 50,          // Gösterilecek maksimum deprem sayısı
  min_buyukluk: 3.0   // Minimum deprem büyüklüğü (ML)
});

// İstanbul/Marmara depremleri
const sonuc2 = await istanbul_depremleri({
  limit: 20,             // Gösterilecek maksimum deprem sayısı
  saat_icerisinde: 24    // Son 24 saat içindeki depremler
});

// Büyük depremleri listele
const sonuc3 = await buyuk_depremler({
  limit: 10,             // Gösterilecek maksimum deprem sayısı
  min_buyukluk: 4.0,     // Minimum deprem büyüklüğü (ML)
  gun_icerisinde: 7      // Son 7 gün içindeki depremler
});

// Son 1 saat içindeki depremler
const sonuc4 = await son_saat_depremleri({
  limit: 30              // Gösterilecek maksimum deprem sayısı
});
```

## Lisans

MIT

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun
