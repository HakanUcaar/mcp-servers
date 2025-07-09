
interface Quotation {
  // Basic Info
  id: number;
  code: string;
  name: string;
  humanize_name: string;
  mautic_name: string;
  network_name: string;
  plan_type: string;
  sale_age_text: string;
  is_active: number;

  // IDs and Relations
  company_id: number;
  product_id: number;
  product_type_id: number;

  // Feature Flags
  has_outpatient: number;
  has_inpatient: number;
  has_pregnancy: number;
  has_abroad: number;
  has_covid: number;
  has_emergency_treatment: number;
  has_pregnancy_routine_checks: number;
  can_be_show_while_pregnant: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Tabs and Content
  hospitals_tab: string | null;
  out_of_guarantees_tab: string | null;
  newborn_tab: string | null;
  price_tab: string | null;
  useful_information_tab: string | null;

  // Conditions and Settings
  out_of_guarantee_conditions: string | null;
  waiting_month_conditions: string | null;
  newborn_conditions: string | null;
  
  // Network Names
  tss_humanize_network_name: string;
  ds_humanize_network_name: string | null;

  // RPA Settings
  rpa_priority: number;
  rpa_order_num: number;
  rpa_active: number;
  use_product_prices_on_rpa: boolean;
  show_city_select_on_rpa: string | null;

  // Age and Duration
  min_start_age: number | null;
  max_start_age: number | null;
  duration_day: number | null;

  // Medical Settings
  medical_treatment: number;
  medical_treatment_limit: string | null;
  medical_consultancy: number;
  emergency_medical_transfer: number;
  repatriation_of_mortal_remains: number;

  // Additional Settings
  pet_type: string | null;
  pregnancy_waiting_time: number;
  available_institutions_text: string | null;
  installment_count: number | null;
  show_on_inquiry: number;

  // Pricing
  price_min_sum: number;
  price_max_sum: number;
  sort_price: number;
  is_liked: boolean;

  // Counts
  total_available_institutions_count: number;
  hospital_count: number;

  // Arrays and Objects
  guarantees: any[];
  formatted_guarantees: any[];
  //available_institutions: AvailableInstitution[];
  formatted_product_package: FormattedProductPackage;
  crawled_company_policy_types: CrawledCompanyPolicyType[];
  company: Company;
  product: Product;
  tab_descriptions: any[];
  guarantee_info_boxes: any[];
  company_forms: any[];
}

interface InstitutionPivot {
  crawled_company_policy_type_id: number;
  institution_id: number;
}

interface AvailableInstitution {
  id: number;
  name: string;
  city_id: number;
  pivot: InstitutionPivot;
}

interface FormattedProductPackage {
  // Basic Coverage
  teeth: number;
  eye: number;
  emergency_ambulance: number;
  home_care: number;
  nutritionist: number;
  emergency_medicine_delivery: number;
  daily_hospital_coverage: number;
  medical_advice: number;
  online_doctor: number;
  checkup: number;

  // Additional Services
  mammography: string;
  children_vaccinations: string;
  free_parking_and_valet_service: string | null;
  doctor_inspection_limit: string | null;
  doctor_inspection_description: string | null;

  // Medical Tests
  x_ray: string | null;
  analysis: string | null;
  modern_diagnostics: string | null;
  laboratory_examinations: string | null;
  imaging_operations: string | null;
  physiotheraphy: string | null;

  // Treatment Coverage
  operation: string;
  hospitalization_for_medical_treatment: string;
  minor_intervention: string;
  surgical_material: string;
  intensive_care: string;
  crowns_angiography: string;
  chemotherapy: string;
  radiotherapy: string;
  dialysis: string;
  single_room: string;
  companion: string;
  artificial_limb: string;
  physical_therapy_after_surgical: string;

  // Product Features
  has_swap_between_products: boolean;
  has_previous_treatments: boolean;
  has_renew_guarantee: boolean;
  renew_guarantee_year: number;
  has_lifetime_renew_guarantee: boolean;
  lifetime_renew_guarantee_year: number | null;
  one_child_minimum_age: number;
  family_discount_percent: number;

  // Pregnancy Related
  newborn: number;
  pregnancy: number;
  pregnancy_description: string | null;
  pregnancy_waiting_time: string | null;
  pregnancy_limit: string | null;
  pregnancy_control_limit: string | null;
  is_pregnant_insurance: boolean;
  natural_childbirth: string | null;
  cesarean_childbirth: string | null;
  pregnancy_doctor_inseption: string | null;
  pregnancy_analysis: string | null;
  pregnancy_tests: string | null;
  pregnancy_complications: string | null;
  newborn_costs: string | null;
  newborn_conditions: string | null;

  // Additional Features
  psychological_counseling: boolean;
  breastfeeding_training_and_counseling: boolean;
  prenatal_information_seminar: boolean;

  // COVID Related
  corona_hospital_treatment: string | null;
  corona_treatments: string | null;
  corona_complications: string | null;
  corona_online_doctor: string | null;
  corona_home_blood_treatment: string | null;
  corona_waiting_time: string | null;

  // Information Tabs
  hospitals_tab: string;
  out_of_guarantees_tab: string;
  price_tab: string;
  useful_information_tab: string;
  newborn_tab: string | null;

  // Additional Info
  hospital_count: number | null;
  inpatient_limit: string;
  inpatient_waiting_month: string;
  outpatient_limit: string | null;
  specialConditionUrl: string;
  informationFormUrl: string;
  sale_age_text: string;
  product_sale_age_text: string;
  installment_count: number;
  participation_share: string | null;
  has_covid: number;
}

interface InstitutionPivot {
  crawled_company_policy_type_id: number;
  institution_id: number;
}

interface Institution {
  id: number;
  name: string;
  city_id: number;
  pivot: InstitutionPivot;
}

interface PolicyPivot {
  product_package_id: number;
  crawled_company_policy_type_id: number;
}

interface CrawledCompanyPolicyType {
  id: number;
  name: string;
  network_name: string;
  shown_by_default: number;
  product_type_id: number;
  institutions_count: number;
  pivot: PolicyPivot;
  institutions: Institution[];
}

interface Company {
  id: number;
  name: string;
  svg_name: string;
  slug: string;
  svg_url: string;
  hospitals_counts: never[];
}

interface Product {
  id: number;
  is_active: boolean;
  name: string;
  code: string;
  product_type_id: number;
  company_id: number;
  has_outpatient: boolean;
  outpatient_limit_type: number;
  outpatient_limit: number;
  outpatient_limit_description: string | null;
  outpatient_waiting_month: number;
  has_inpatient: boolean;
  inpatient_limit: string;
  inpatient_waiting_month: number;
  has_renew_guarantee: boolean;
  renew_guarantee_year: number;
  has_lifetime_renew_guarantee: boolean;
  lifetime_renew_guarantee_year: number | null;
  has_swap_between_products: boolean;
  has_previous_treatments: boolean;
  min_start_age: number;
  max_start_age: number;
  one_child_minimum_age: number;
  doctor_inspection_limit: number;
  doctor_inspection_description: string | null;
  laboratory_examinations: number;
  imaging_operations: number;
  physiotheraphy: string;
  operation: string;
  hospitalization_for_medical_treatment: string;
  minor_intervention: string;
  surgical_material: string;
  intensive_care: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  hospitals_tab: string;
  out_of_guarantees_tab: string;
  newborn_tab: string | null;
  price_tab: string;
  useful_information_tab: string;
  is_family_offer: number;
  is_multiple_child_offer: number;
  max_child_start_age: number;
  sale_age_text: string;
  company_forms: any[]; 
  ds_min_start_age: number;
  ds_max_start_age: number;
}

export type { Quotation, Institution, FormattedProductPackage, AvailableInstitution, CrawledCompanyPolicyType, Company };