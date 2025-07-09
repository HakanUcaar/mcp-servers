import { InitialQueryResponse, QueryRequest, ServiceResponse } from './types';
import { Quotation } from './quotation.types';
import * as cheerio from "cheerio";
import vm from 'vm'; 

interface SSRWindow {
	ssr_inquryProducts?: any;
	[key: string]: any;
}

function defineModel<T extends object>(fields: (keyof T)[]) {
	return {
		fields,
		pick(obj: T): T {
			const result: Partial<T> = {};
			for (const key of fields) {
				if (key in obj) {
					result[key] = obj[key];
				}
			}
			return result as T;
		}
	};
}

const QuotationModel = defineModel<Quotation>([
	'id', 
  'code', 
  'name', 
  'humanize_name', 
  'mautic_name', 
  'network_name',
	'plan_type', 
  'sale_age_text', 
  'is_active', 
  'company_id', 
  'product_id',
	'product_type_id', 
  'has_outpatient', 
  'has_inpatient', 
  'has_pregnancy',
	'has_abroad', 
  'has_covid', 
  'has_emergency_treatment', 
  'has_pregnancy_routine_checks',
	'can_be_show_while_pregnant', 
  'created_at', 
  'updated_at', 
  'deleted_at', 
  'hospitals_tab',
	'out_of_guarantees_tab', 
  'newborn_tab', 
  'price_tab', 
  'useful_information_tab',
	'out_of_guarantee_conditions', 
  'waiting_month_conditions', 
  'newborn_conditions',
	'tss_humanize_network_name', 
  'ds_humanize_network_name', 
  'rpa_priority', 
  'rpa_order_num',
	'rpa_active', 
  'use_product_prices_on_rpa', 
  'show_city_select_on_rpa', 
  'min_start_age',
	'max_start_age', 
  'duration_day', 
  'medical_treatment', 
  'medical_treatment_limit',
	'medical_consultancy', 
  'emergency_medical_transfer', 
  'repatriation_of_mortal_remains',
	'pet_type', 
  'pregnancy_waiting_time', 
  'available_institutions_text', 
  'installment_count',
	'show_on_inquiry', 
  'price_min_sum', 
  'price_max_sum', 
  'sort_price', 
  'is_liked',
	'total_available_institutions_count', 
  'hospital_count',
  'guarantees', 
  'formatted_guarantees',
	'formatted_product_package', 
  'crawled_company_policy_types', 
  'company', 'product',
	'tab_descriptions', 
  'guarantee_info_boxes', 
  'company_forms'
]);

async function getWindowData(url: string, variableName: string): Promise<ServiceResponse<any>> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    let scriptContent = await getScriptContent(html);
    if (!scriptContent) {
      return {
        success: false,
        error: {
          message: 'Script content not found',
          code: 'SCRIPT_NOT_FOUND'
        }
      };
    }

    const sandbox: { window: SSRWindow } = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(scriptContent, sandbox);

    const products = sandbox.window?.ssr_inquryProducts || [];
    return {
      success: true,
      data: products
    };  

  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SCRIPT_EVALUATION_ERROR',
        details: error
      }
    };
  }
}

async function getScriptContent(html: string): Promise<string> 
{
  const $ = cheerio.load(html);
  const scriptContent = $('script')
  .filter((_, elem) => {
      const content = $(elem).html();
      if (content) {
          console.log('Script content found:', content.substring(0, 100));
      }
      return content !== null && content.includes('window.ssr_inquryProducts');
  })
  .first()
  .html();
  
  return scriptContent || '';
}

export class TamamlayiciSaglikService {
  private readonly baseUrl = 'https://www.tamamlayicisaglik.com';

  async getInitialQuery(queryData: QueryRequest): Promise<ServiceResponse<InitialQueryResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/internal-api/inquries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryData),
      });
  
      if (!response.ok) {
        return {
          success: false,
          error: {
            message: `HTTP error! status: ${response.status}`,
            code: 'HTTP_ERROR',
            details: { status: response.status }
          }
        };
      }
  
      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'REQUEST_FAILED',
          details: error
        }
      };
    }    
  }

  async getQuotationData(queryUrl: string): Promise<ServiceResponse<Quotation[]>> { 
    const windowDataResponse = await getWindowData(queryUrl, 'ssr_inquryProducts');
  
    if (!windowDataResponse.success) {
      return windowDataResponse;
    }

    try {        
      const quotations: Quotation[] = windowDataResponse.data.map(QuotationModel.pick);
      return {
        success: true,
        data: quotations
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to parse offers',
          code: 'PARSE_ERROR',
          details: error
        }
      };
    }
  }

  async getQuotations(queryData: QueryRequest): Promise<ServiceResponse<any>> {
    const initialQueryResponse = await this.getInitialQuery(queryData);
    
    if (!initialQueryResponse.success) {
      return initialQueryResponse;
    }

    return this.getQuotationData(initialQueryResponse.data?.data.url || '');
  }
}

export default TamamlayiciSaglikService;