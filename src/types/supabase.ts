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
      is_allowed_user: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
