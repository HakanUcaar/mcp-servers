interface ProductType {
    id: number;
    name: string;
    is_active: boolean;
    identifier: string;
    branch: string;
    slug: string;
    created_at: string;
    updated_at: string;
    is_virtual: boolean;
    parent_product_type_id: null | number;
    query_identifier: null | string;
    can_shown_contracted_hospital: number;
    identifier_text: string;
  }
  
  interface InitialQueryResponse {
    data: {
      id: string;
      url: string;
      product_type: ProductType;
    }
  }
  
  interface QueryRequest {
    city_id: number;
    gender: number;
    persons: {
      myself: PersonInfo;
      partner: PersonInfo;
      mother: PersonInfo;
      father: PersonInfo;
      sons: PersonInfo[];
      daughters: PersonInfo[];
    };
    product_type_id: number;
    dob: string;
  }
  
  interface PersonInfo {
    isActive: boolean;
    age: number | null;
  }

  interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: {
      message: string;
      code?: string;
      details?: any;
    };
  }
  
  export { InitialQueryResponse, QueryRequest, ProductType, PersonInfo, ServiceResponse };