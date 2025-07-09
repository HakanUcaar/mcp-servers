# Tamamlayıcı Sağlık MCP

Bu paket, tamamlayıcı sağlık sigortası tekliflerini sorgulamak için bir Model Context Protocol (MCP) aracıdır.

## Özellikler

- Tamamlayıcı sağlık sigortası tekliflerini listeleme
- Detaylı teklif bilgileri (fiyat, teminatlar, hastaneler)
- Şirket bazlı filtreleme
- Anlaşmalı kurumları görüntüleme
- Teminat detaylarını sorgulama

## Kurulum

```bash
npm install @hakan.ucar/tamamlayici-saglik-mcp
```

## Kullanım

```typescript
import { TamamlayiciSaglikService } from '@hakan.ucar/tamamlayici-saglik-mcp';

// Servis örneği oluştur
const service = new TamamlayiciSaglikService();

// Teklifleri getir
const teklifler = await service.getOffers('https://www.tamamlayicisaglik.com/teklif?...');

// Query parametreleri ile sorgula
const queryResponse = await service.getInitialQuery({
    city_id: 34,
    birth_date: '1990-01-01',
    gender: 'E'
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
