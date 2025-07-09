#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { JSDOM } from 'jsdom';  
import fetch from 'node-fetch'; 

interface BankBilgileri {
  Name: string;
}

interface UrunBilgileri {
  Bank: BankBilgileri;
  Amount: number;
  Maturity: number;
  InterestRate: number;
  MonthlyInstallment: number;
  TotalAmount: number;
  TotalInterest: number;
}

interface KrediBilgileri {
  bankName: string;
  krediTutari: number;
  vadeSuresi: number;
  faizOrani: number;
  aylikTaksit: number;
  toplamGeriOdeme: number;
  toplamFaiz: number;
}

interface KrediSonuc {
  enIyiTeklif: KrediBilgileri;
  tumTeklifler: KrediBilgileri[];
  ozet: string;
}

// Tool tanımları
const TOOLS: Tool[] = [{
  name: "hangikredi_sorgu",
  description: "Hangikredi.com ihtiyaç kredisi sorgulama",
  inputSchema: {
    type: "object",
    properties: {
      amount: { type: "number", description: "Kredi tutarı" },
      maturity: { type: "number", description: "Vade süresi (ay)" }
    },
    required: ["amount", "maturity"]
  }
}];


async function getKrediTeklifleri(args: { amount: number, maturity: number }) {
  const url = `https://www.hangikredi.com/kredi/ihtiyac-kredisi/sorgulama/${args.maturity}-ay-${args.amount}-tl-kredi`;
  
  try {
    // 1. HTML'i çek
    const response = await fetch(url);
    const html = await response.text();

    // 2. Script içindeki products'ı bul
    const dom = new JSDOM(html);
    const scripts = dom.window.document.querySelectorAll('script');
    
    for (const script of scripts) {
      const content = script.textContent || '';
      if (content.includes('var products =')) {
        const match = content.match(/var products = (\[.*?\]);/s);
        if (match) {
          return JSON.parse(match[1]) as UrunBilgileri[];
        }
      }
    }

    throw new Error('Products verisi bulunamadı');
  } catch (error) {
    console.error('Hata:', error);
    return null;
  }
}

// Tool handler
async function handleToolCall(name: string, args: any) {

  if (name === "hangikredi_sorgu") {
    try {

      const products = await getKrediTeklifleri(args);
      
      if (!products || products.length === 0) {
        return {
          content: [{ type: "text", text: "Kredi teklifi bulunamadı." }],
          isError: false
        };
      }      

      if (!products) {
        return {
          content: [{ type: "text", text: "Kredi teklifleri bulunamadı veya parse edilemedi. Lütfen daha sonra tekrar deneyiniz." }],
          isError: true
        };
      }

      if (products.length === 0) {
        return {
          content: [{ type: "text", text: "Bu kredi tutarı ve vade için teklif bulunamadı." }],
          isError: false
        };
      }

      const krediBilgileriListesi: KrediBilgileri[] = products.map((urun: UrunBilgileri) => ({
        bankName: urun.Bank.Name,
        krediTutari: urun.Amount,
        vadeSuresi: urun.Maturity,
        faizOrani: urun.InterestRate,
        aylikTaksit: urun.MonthlyInstallment,
        toplamGeriOdeme: urun.TotalAmount,
        toplamFaiz: urun.TotalInterest
      }));

      // En düşük faiz oranlı teklifi bul
      const enIyiTeklif = krediBilgileriListesi.reduce((prev, current) => 
        prev.faizOrani < current.faizOrani ? prev : current
      );

      // Sonuç özetini oluştur
      const sonuc: KrediSonuc = {
        enIyiTeklif,
        tumTeklifler: krediBilgileriListesi,
        ozet: `💰 ${args.amount.toLocaleString('tr-TR')} TL için ${args.maturity} ay vadeli en iyi teklif:
        
🏦 ${enIyiTeklif.bankName}
📊 Faiz Oranı: %${enIyiTeklif.faizOrani}
💳 Aylık Taksit: ${enIyiTeklif.aylikTaksit.toLocaleString('tr-TR')} TL
💵 Toplam Geri Ödeme: ${enIyiTeklif.toplamGeriOdeme.toLocaleString('tr-TR')} TL
📈 Toplam Faiz: ${enIyiTeklif.toplamFaiz.toLocaleString('tr-TR')} TL
ℹ️ Diğer ${krediBilgileriListesi.length - 1} banka teklifinin faiz oranları: %${krediBilgileriListesi
          .filter(teklif => teklif.bankName !== enIyiTeklif.bankName)
          .map(teklif => teklif.faizOrani)
          .sort((a, b) => a - b)
          .join(', %')}`
      };

      return {
        content: [{ type: "text", text: JSON.stringify(sonuc, null, 2) }],
        isError: false
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Hata: ${(error as Error).message}` }],
        isError: true
      };
    }
  }

  return {
    content: [{ type: "text", text: `Bilinmeyen tool: ${name}` }],
    isError: true
  };
}

// Server setup
const server = new Server(
  { name: "hangikredi-server", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, req => 
  handleToolCall(req.params.name, req.params.arguments)
);

// Server başlatma
async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

start().catch(err => {
  console.error('Server hatası:', err);
  process.exit(1);
});

// Temizlik
process.on('SIGINT', () => {
  server.close();
  process.exit();
}); 