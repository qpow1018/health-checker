export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      allowed_users: {
        Row: {
          created_at: string;
          email: string;
          is_active: boolean;
        };
        Insert: {
          created_at?: string;
          email: string;
          is_active?: boolean;
        };
        Update: {
          created_at?: string;
          email?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      food_recommendations: {
        Row: {
          created_at: string;
          foods: Json;
          id: string;
          last_used_at: string;
          normalized_key: string | null;
          search_text: string | null;
          source: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          foods: Json;
          id?: string;
          last_used_at?: string;
          source?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          foods?: Json;
          id?: string;
          last_used_at?: string;
          source?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      health_records: {
        Row: {
          category: string;
          created_at: string;
          details: Json;
          details_version: number;
          id: string;
          recorded_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          details?: Json;
          details_version?: number;
          id?: string;
          recorded_at: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          details?: Json;
          details_version?: number;
          id?: string;
          recorded_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      reference_sources: {
        Row: {
          created_at: string;
          id: string;
          organization: string;
          status: string;
          title: string;
          topic: string;
          updated_at: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization: string;
          status?: string;
          title: string;
          topic: string;
          updated_at?: string;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization?: string;
          status?: string;
          title?: string;
          topic?: string;
          updated_at?: string;
          url?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      food_recommendation_key_v1: {
        Args: {
          food_items: Json;
          source_value: string;
        };
        Returns: string;
      };
      food_recommendation_search_text_v1: {
        Args: {
          food_items: Json;
          source_value: string;
        };
        Returns: string;
      };
      is_allowed_user: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
