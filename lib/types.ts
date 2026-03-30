// TypeScript types for Sample Order Management System

export interface Client {
  id: number;
  name: string;
  email: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface SampleOrder {
  id: number;
  order_id: string;
  client_id: number;
  status: 'draft' | 'submitted' | 'in_review' | 'sampling_in_progress' | 'ready' | 'dispatched';
  created_by: 'client' | 'admin' | 'automation';
  updated_by?: 'client' | 'admin' | 'system';
  order_source: 'quick' | 'structured' | 'email';
  delivery_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sample_type?: string;
  notes?: string;
  batch_id?: string;
  is_order_created: boolean;
  assigned_to?: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  client?: Client;
  styles?: OrderStyle[];
}

export interface OrderStyle {
  id: number;
  order_id: number;
  item_number: string;
  style_number?: string;
  style_name: string;
  print_type: 'solid_dyed' | 'printed';
  color_name?: string;
  pantone_number?: string;
  design_name?: string;
  fabric?: string;
  quantity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface DesignFile {
  id: number;
  style_id: number;
  file_name: string;
  file_url: string;
  file_type?: string;
  storage_provider: 'supabase' | 's3' | 'cloudinary';
  uploaded_at: string;
  is_deleted: boolean;
}

export interface Logo {
  id: number;
  style_id: number;
  logo_name?: string;
  logo_type: 'printed' | 'embroidered';
  position?: string;
  file_url: string;
  storage_provider: 'supabase' | 's3' | 'cloudinary';
  notes?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface OrderFile {
  id: number;
  order_id: number;
  file_name: string;
  file_url: string;
  file_type?: string;
  storage_provider: 'supabase' | 's3' | 'cloudinary';
  uploaded_at: string;
  is_deleted: boolean;
}

// API Request/Response types
export interface CreateOrderRequest {
  client_id: number;
  status?: SampleOrder['status'];
  created_by?: SampleOrder['created_by'];
  order_source?: SampleOrder['order_source'];
  delivery_date?: string;
  priority?: SampleOrder['priority'];
  sample_type?: string;
  notes?: string;
  batch_id?: string;
  assigned_to?: number;
  styles: {
    item_number: string;
    style_number?: string;
    style_name: string;
    print_type: OrderStyle['print_type'];
    color_name?: string;
    pantone_number?: string;
    design_name?: string;
    fabric?: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: SampleOrder;
  errors?: string[];
  error?: string;
}

export interface ListOrdersResponse {
  success: boolean;
  data: SampleOrder[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  errors?: string[];
}