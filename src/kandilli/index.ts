#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as cheerio from "cheerio";


interface DepremBuyukluk {
  MD: number | null;  // Duration Magnitude
  ML: number | null;  // Local Magnitude (Richter)
  Mw: number | null;  // Moment Magnitude
}

interface DepremKonum {
  enlem: string;
  boylam: string;
  derinlikKm: string;
  yer: string;
}

interface DepremTarih {
  raw: string;        // "2025.03.29 11:08:44"
  timestamp: number;  // Unix timestamp (ms)
  iso: string;        // "2025-03-29T11:08:44+03:00"
}

interface DepremVeri {
  tarih: DepremTarih;
  konum: DepremKonum;
  buyukluk: DepremBuyukluk;
  //cozumNiteligi: string; // "İlksel", "REVIZE01" vb.
  id?: string;           // Opsiyonel unique ID
}

interface DepremResponse {
  metadata: {
    kaynak: string;
    sonGuncelleme: string;
    toplamDeprem: number;
  };
  depremler: DepremVeri[];
}


const TOOLS: Tool[] = [
  {
    name: "son_depremler",
    description: "Son depremleri listeler (varsayılan: son 50 deprem)",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Gösterilecek maksimum deprem sayısı",
          default: 50
        },
        min_buyukluk: {
          type: "number",
          description: "Minimum deprem büyüklüğü (ML)",
          default: 0
        }
      }
    }
  },
  {
    name: "istanbul_depremleri",
    description: "İstanbul ve Marmara bölgesindeki depremleri listeler",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Gösterilecek maksimum deprem sayısı",
          default: 20
        },
        saat_icerisinde: {
          type: "number",
          description: "Son kaç saat içindeki depremler (0=tümü)",
          default: 0
        }
      }
    }
  },
  {
    name: "buyuk_depremler",
    description: "Büyük depremleri listeler (ML ≥ 4.0 varsayılan)",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Gösterilecek maksimum deprem sayısı",
          default: 10
        },
        min_buyukluk: {
          type: "number",
          description: "Minimum deprem büyüklüğü (ML)",
          default: 4.0
        },
        gun_icerisinde: {
          type: "number",
          description: "Son kaç gün içindeki depremler (0=tümü)",
          default: 7
        }
      }
    }
  },
  {
    name: "son_saat_depremleri",
    description: "Son 1 saat içindeki depremleri listeler",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Gösterilecek maksimum deprem sayısı",
          default: 30
        }
      }
    }
  }
];


async function getSonDepremler(): Promise<DepremResponse> {
  const url = 'http://www.koeri.boun.edu.tr/scripts/lst5.asp';
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);
    const preText = $("pre").text().trim(); 
    
    if (!preText) throw new Error('Deprem verisi bulunamadı');

    const lines = preText.split("\n").slice(6) || [];
    const depremler: DepremVeri[] = [];

    // Satır başlıklarını atla (ilk 5 satır)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      try {
        const tarihStr = line.slice(0, 10).trim();
        const saatStr = line.slice(11, 19).trim();
        
        //Tarih validasyon
        if (!/^\d{4}\.\d{2}\.\d{2}$/.test(tarihStr) || !/^\d{2}:\d{2}:\d{2}$/.test(saatStr)) {
          continue;
        }

        const date = new Date(`${tarihStr.replace(/\./g, '-')}T${saatStr}+03:00`);

        const deprem: DepremVeri = {
          tarih: {
            raw: `${tarihStr} ${saatStr}`,
            timestamp: date.getTime(),
            iso: date.toISOString()
          },
          konum: {
            enlem: line.slice(20, 28).trim(),
            boylam: line.slice(29, 40).trim(),
            derinlikKm: line.slice(41, 55).trim(),
            yer: line.slice(71, 119).trim()
          },
          buyukluk: {
            MD: parseNullableFloat(line.slice(55, 58)),
            ML: parseNullableFloat(line.slice(60, 63)),
            Mw: parseNullableFloat(line.slice(65, 68))
          },
          id: generateDepremId(line) // Opsiyonel unique ID
        };

        depremler.push(deprem);
      } catch (err) {
        console.error(`Satır parse hatası (${i}):`, err);
      }
    }

    return {
      metadata: {
        kaynak: 'Boğaziçi Üniversitesi Kandilli Rasathanesi',
        sonGuncelleme: new Date().toISOString(),
        toplamDeprem: depremler.length
      },
      depremler
    };

  } catch (error) {
    console.error('Hata:', error);
    throw new Error('Deprem verileri alınamadı');
  }
}

// HELPER FUNCTIONS
function parseNullableFloat(str: string): number | null {
  const val = str.trim();
  return val === '-.-' ? null : parseFloat(val);
}

function generateDepremId(line: string): string {
  // Tarih + Saat + Enlem + Boylam hash'i
  const hash = line.substr(0, 19).replace(/\s/g, '');
  return `deprem-${hash}`;
}


// Tool handler
async function handleToolCall(name: string, args: any) {
  try {
    const data = await getSonDepremler();
    let filteredDepremler: DepremVeri[] = [];
    let baslik = "";

    switch (name) {
      case "son_depremler":
        filteredDepremler = data.depremler
          .filter(d => args.min_buyukluk ? (d.buyukluk.ML || 0) >= args.min_buyukluk : true)
          .slice(0, args.limit || 50);
        baslik = `Son ${filteredDepremler.length} Deprem` + 
                (args.min_buyukluk ? ` (ML ≥ ${args.min_buyukluk})` : "");
        break;

      case "istanbul_depremleri":
        filteredDepremler = data.depremler
          .filter(d => 
            (d.konum.yer.includes('İSTANBUL') || 
            d.konum.yer.includes('MARMARA')) &&
            (args.saat_icerisinde ? 
              d.tarih.timestamp > Date.now() - (args.saat_icerisinde * 3600000) : true)
          )
          .slice(0, args.limit || 20);
        baslik = `İstanbul/Marmara Depremleri` +
                (args.saat_icerisinde ? ` (Son ${args.saat_icerisinde} Saat)` : "");
        break;

      case "buyuk_depremler":
        filteredDepremler = data.depremler
          .filter(d => 
            (d.buyukluk.ML || 0) >= (args.min_buyukluk || 4.0) &&
            (args.gun_icerisinde ? 
              d.tarih.timestamp > Date.now() - (args.gun_icerisinde * 86400000) : true)
          )
          .sort((a, b) => (b.buyukluk.ML || 0) - (a.buyukluk.ML || 0))
          .slice(0, args.limit || 10);
        baslik = `Büyük Depremler (ML ≥ ${args.min_buyukluk || 4.0})` +
                (args.gun_icerisinde ? ` (Son ${args.gun_icerisinde} Gün)` : "");
        break;

      case "son_saat_depremleri":
        const birSaatOnce = Date.now() - 3600000;
        filteredDepremler = data.depremler
          .filter(d => d.tarih.timestamp > birSaatOnce)
          .slice(0, args.limit || 30);
        baslik = "Son 1 Saatteki Depremler";
        break;

      default:
        return {
          content: [{ type: "text", text: `Bilinmeyen tool: ${name}` }],
          isError: true
        };
    }

    const formattedText = formatDepremSonuc({
      baslik,
      depremler: filteredDepremler
    });

    return {
      content: [{ type: "text", text: formattedText }],
      isError: false
    };

  } catch (error) {
    return {
      content: [{ type: "text", text: `Hata: ${(error as Error).message}` }],
      isError: true
    };
  }
}

// Yardımcı fonksiyon: Deprem sonuçlarını formatlama
function formatDepremSonuc(result: { baslik: string; depremler: DepremVeri[] }): string {
  let text = `=== ${result.baslik} ===\n`;
  
  if (result.depremler.length === 0) {
    return text + "Kayıt bulunamadı";
  }

  //text += JSON.stringify(result.depremler, null, 2)
  result.depremler.forEach((dep, i) => {
    text += `\n${i+1}. [${dep.tarih.raw}]\n` +
            `   → Büyüklük: ML ${dep.buyukluk.ML}, Derinlik: ${dep.konum.derinlikKm} km\n` +
            `   → Yer : ${dep.konum.yer}\n`+
            `   → Konum: ${dep.konum.enlem}°N ${dep.konum.boylam}°E`;
  });

  return text;
}

// Server setup
const server = new Server(
  { name: "kandilli-server", version: "0.1.0" },
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