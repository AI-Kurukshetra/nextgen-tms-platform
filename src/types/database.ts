export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          role: "admin" | "dispatcher" | "customer";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          role?: "admin" | "dispatcher" | "customer";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          role?: "admin" | "dispatcher" | "customer";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      carriers: {
        Row: {
          id: string;
          name: string;
          code: string;
          transport_mode: "truck" | "rail" | "air" | "ocean" | "intermodal";
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          rating: number | null;
          status: "active" | "inactive" | "suspended";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          transport_mode: "truck" | "rail" | "air" | "ocean" | "intermodal";
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          rating?: number | null;
          status?: "active" | "inactive" | "suspended";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          transport_mode?: "truck" | "rail" | "air" | "ocean" | "intermodal";
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          rating?: number | null;
          status?: "active" | "inactive" | "suspended";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          code: string;
          city: string;
          state: string;
          address: string | null;
          capacity_sqft: number | null;
          status: "active" | "inactive" | "maintenance";
          manager_name: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          city: string;
          state: string;
          address?: string | null;
          capacity_sqft?: number | null;
          status?: "active" | "inactive" | "maintenance";
          manager_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          city?: string;
          state?: string;
          address?: string | null;
          capacity_sqft?: number | null;
          status?: "active" | "inactive" | "maintenance";
          manager_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drivers: {
        Row: {
          id: string;
          full_name: string;
          license_number: string;
          license_expiry: string;
          phone: string;
          email: string | null;
          carrier_id: string | null;
          vehicle_number: string | null;
          vehicle_type: "truck" | "mini_truck" | "trailer" | "container" | null;
          status: "available" | "on_trip" | "off_duty" | "suspended";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          license_number: string;
          license_expiry: string;
          phone: string;
          email?: string | null;
          carrier_id?: string | null;
          vehicle_number?: string | null;
          vehicle_type?: "truck" | "mini_truck" | "trailer" | "container" | null;
          status?: "available" | "on_trip" | "off_duty" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          license_number?: string;
          license_expiry?: string;
          phone?: string;
          email?: string | null;
          carrier_id?: string | null;
          vehicle_number?: string | null;
          vehicle_type?: "truck" | "mini_truck" | "trailer" | "container" | null;
          status?: "available" | "on_trip" | "off_duty" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      routes: {
        Row: {
          id: string;
          name: string;
          origin_city: string;
          origin_state: string;
          destination_city: string;
          destination_state: string;
          distance_km: number;
          estimated_hours: number;
          transport_mode: "truck" | "rail" | "air" | "ocean" | "intermodal";
          toll_charges: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          origin_city: string;
          origin_state: string;
          destination_city: string;
          destination_state: string;
          distance_km: number;
          estimated_hours: number;
          transport_mode: "truck" | "rail" | "air" | "ocean" | "intermodal";
          toll_charges?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          origin_city?: string;
          origin_state?: string;
          destination_city?: string;
          destination_state?: string;
          distance_km?: number;
          estimated_hours?: number;
          transport_mode?: "truck" | "rail" | "air" | "ocean" | "intermodal";
          toll_charges?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipments: {
        Row: {
          id: string;
          shipment_number: string;
          origin_city: string;
          origin_state: string;
          destination_city: string;
          destination_state: string;
          origin_warehouse_id: string | null;
          destination_warehouse_id: string | null;
          cargo_type:
            | "general"
            | "perishable"
            | "hazardous"
            | "fragile"
            | "oversized"
            | "electronics";
          weight_kg: number;
          volume_cbm: number | null;
          status:
            | "draft"
            | "confirmed"
            | "assigned"
            | "in_transit"
            | "delivered"
            | "delayed"
            | "cancelled";
          carrier_id: string | null;
          driver_id: string | null;
          route_id: string | null;
          assigned_by: string | null;
          customer_id: string | null;
          scheduled_pickup: string | null;
          scheduled_delivery: string | null;
          actual_pickup: string | null;
          actual_delivery: string | null;
          distance_km: number | null;
          freight_cost: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_number: string;
          origin_city: string;
          origin_state: string;
          destination_city: string;
          destination_state: string;
          origin_warehouse_id?: string | null;
          destination_warehouse_id?: string | null;
          cargo_type:
            | "general"
            | "perishable"
            | "hazardous"
            | "fragile"
            | "oversized"
            | "electronics";
          weight_kg: number;
          volume_cbm?: number | null;
          status?:
            | "draft"
            | "confirmed"
            | "assigned"
            | "in_transit"
            | "delivered"
            | "delayed"
            | "cancelled";
          carrier_id?: string | null;
          driver_id?: string | null;
          route_id?: string | null;
          assigned_by?: string | null;
          customer_id?: string | null;
          scheduled_pickup?: string | null;
          scheduled_delivery?: string | null;
          actual_pickup?: string | null;
          actual_delivery?: string | null;
          distance_km?: number | null;
          freight_cost?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shipment_number?: string;
          origin_city?: string;
          origin_state?: string;
          destination_city?: string;
          destination_state?: string;
          origin_warehouse_id?: string | null;
          destination_warehouse_id?: string | null;
          cargo_type?:
            | "general"
            | "perishable"
            | "hazardous"
            | "fragile"
            | "oversized"
            | "electronics";
          weight_kg?: number;
          volume_cbm?: number | null;
          status?:
            | "draft"
            | "confirmed"
            | "assigned"
            | "in_transit"
            | "delivered"
            | "delayed"
            | "cancelled";
          carrier_id?: string | null;
          driver_id?: string | null;
          route_id?: string | null;
          assigned_by?: string | null;
          customer_id?: string | null;
          scheduled_pickup?: string | null;
          scheduled_delivery?: string | null;
          actual_pickup?: string | null;
          actual_delivery?: string | null;
          distance_km?: number | null;
          freight_cost?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tracking_events: {
        Row: {
          id: string;
          shipment_id: string;
          event_type:
            | "status_change"
            | "location_update"
            | "note_added"
            | "carrier_assigned"
            | "delay_reported";
          old_status: string | null;
          new_status: string | null;
          location: string | null;
          description: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          event_type:
            | "status_change"
            | "location_update"
            | "note_added"
            | "carrier_assigned"
            | "delay_reported";
          old_status?: string | null;
          new_status?: string | null;
          location?: string | null;
          description: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          event_type?:
            | "status_change"
            | "location_update"
            | "note_added"
            | "carrier_assigned"
            | "delay_reported";
          old_status?: string | null;
          new_status?: string | null;
          location?: string | null;
          description?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      document_types: {
        Row: {
          id: string;
          code: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          file_name: string;
          file_url: string;
          file_type: string;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      shipment_documents: {
        Row: {
          id: string;
          shipment_id: string;
          document_id: string;
          document_type_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          document_id: string;
          document_type_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          document_id?: string;
          document_type_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          shipment_id: string;
          invoice_number: string;
          subtotal_inr: number;
          tax_inr: number;
          total_inr: number;
          status: "draft" | "issued" | "paid" | "overdue" | "cancelled";
          due_at: string | null;
          issued_at: string | null;
          paid_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          invoice_number: string;
          subtotal_inr: number;
          tax_inr?: number;
          total_inr: number;
          status?: "draft" | "issued" | "paid" | "overdue" | "cancelled";
          due_at?: string | null;
          issued_at?: string | null;
          paid_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          invoice_number?: string;
          subtotal_inr?: number;
          tax_inr?: number;
          total_inr?: number;
          status?: "draft" | "issued" | "paid" | "overdue" | "cancelled";
          due_at?: string | null;
          issued_at?: string | null;
          paid_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          amount_inr: number;
          method: "bank_transfer" | "upi" | "card" | "cash" | "other";
          reference_no: string | null;
          paid_at: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          amount_inr: number;
          method: "bank_transfer" | "upi" | "card" | "cash" | "other";
          reference_no?: string | null;
          paid_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          amount_inr?: number;
          method?: "bank_transfer" | "upi" | "card" | "cash" | "other";
          reference_no?: string | null;
          paid_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      gps_locations: {
        Row: {
          id: string;
          shipment_id: string;
          latitude: number;
          longitude: number;
          speed_kmph: number | null;
          heading_degrees: number | null;
          accuracy_meters: number | null;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          latitude: number;
          longitude: number;
          speed_kmph?: number | null;
          heading_degrees?: number | null;
          accuracy_meters?: number | null;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          latitude?: number;
          longitude?: number;
          speed_kmph?: number | null;
          heading_degrees?: number | null;
          accuracy_meters?: number | null;
          recorded_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
