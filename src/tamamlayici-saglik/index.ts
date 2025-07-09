#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { TamamlayiciSaglikService } from './service.js';
import { QueryRequest } from './types';
import { Quotation } from "./quotation.types";


const service = new TamamlayiciSaglikService();

const TOOLS: Tool[] = [
  {
    name: "tamamlayici_saglik_sorgula",
    description: "Tamamlayıcı sağlık sigortası teklifleri için sorgulama yapar",
    inputSchema: {
      type: "object",
      properties: {
        city_id: {
          type: "number",
          description: "Şehir ID'si (örn: İstanbul=34, İzmir=35)",
        },
        gender: {
          type: "number",
          description: "Cinsiyet (1=Erkek, 2=Kadın)",
          enum: [1, 2]
        },
        age: {
          type: "number",
          description: "Yaş"
        }
      },
      required: ["city_id", "gender", "age"]
    }
  }
];

async function handleTamamlayiciSaglik(args: any) {

  const query: QueryRequest = {
    city_id: args.city_id,
    gender: args.gender,
    persons: {
      myself: { isActive: true, age: args.age },
      partner: { isActive: false, age: null },
      mother: { isActive: false, age: null },
      father: { isActive: false, age: null },
      sons: [{ isActive: false, age: null }],
      daughters: [{ isActive: false, age: null }]
    },
    product_type_id: 1,
    dob: ""
  };

  try {
    let data = await service.getQuotations(query)
    if(data && data.data.length > 0) {
      // let sonuc = '';
      // data.data.forEach((item : Quotation, index : number) => {
      //   sonuc += `\n${index + 1}. ${item.company.name} \n` +
      //            ` → ${item.mautic_name} - ${item.product.code} \n` +
      //            ` → total min :  ${item.price_min_sum} TL  max : ${item.price_max_sum} TL \n` +
      //            ` → age : ${item.product.ds_min_start_age} - ${item.product.ds_max_start_age} \n` 
      //             ;
      // });

      return {
        content: [{ type: "text", text: data.data }],
        isError: false
      };
    }    

    return {
      content: [{ type: "text", text: "Data not found" }],
      isError: false
    };

  } catch (error) {
    return {
      content: [{ type: "text", text: `Hata: ${(error as Error).message}` }],
      isError: true
    };
  }
}

async function handleToolCall(name: string, args: any) {
  try {

    switch (name) {
      case "tamamlayici_saglik_sorgula":
        return handleTamamlayiciSaglik(args);
      default:
        return {
          content: [{ type: "text", text: `Bilinmeyen tool: ${name}` }],
          isError: true
        };
    }

  } catch (error) {
    return {
      content: [{ type: "text", text: `Hata: ${(error as Error).message}` }],
      isError: true
    };
  }
}

// Server setup
const server = new Server(
  { name: "tamamlayici-saglik-server", version: "0.0.1" },
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
  console.error('Server error :', err);
  process.exit(1);
});

// Temizlik
process.on('SIGINT', () => {
  server.close();
  process.exit();
}); 