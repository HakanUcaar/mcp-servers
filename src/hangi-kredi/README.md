# Hangikredi MCP

Bu paket, Hangikredi.com üzerinden ihtiyaç kredisi tekliflerini sorgulamak için bir Model Context Protocol (MCP) aracıdır.

## Özellikler

- İhtiyaç kredisi tekliflerini otomatik sorgulama
- En iyi teklifi otomatik tespit etme
- Tüm banka tekliflerini karşılaştırmalı görüntüleme
- Faiz oranı, taksit tutarı, toplam geri ödeme gibi detaylı bilgiler
- Türkçe para birimi formatında sonuçlar

## Mcp Server Ekleme

```json
{    
    "mcpServers": {
        "hangikredi_mcp": {
            "command": "npx",
            "args": ["-y","@hakan.ucar/hangi-kredi-mcp"]
        }
    }
} 
```

## Kullanım
Claude desktop uygulamasına ekle
![image](https://github.com/user-attachments/assets/65e6ffe6-88ab-4466-883f-e8d652939ff1)

![image](https://github.com/user-attachments/assets/613e2d4e-9b3a-4e3b-9885-7fa96e349a0f)

![image](https://github.com/user-attachments/assets/3b104491-e53d-4590-810e-8bd988b513a7)

![image](https://github.com/user-attachments/assets/70d676e8-1599-4c7e-93c4-45670d611ca3)



## Lisans

MIT

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun
