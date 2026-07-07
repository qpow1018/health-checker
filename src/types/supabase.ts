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
      bathroom_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          kind: "urine" | "bowel" | "both";
          urgency: "relaxed" | "ordinary" | "urgent" | null;
          woke_from_sleep: boolean | null;
          note: string | null;
          urine_pain: boolean | null;
          urine_color_unusual: boolean | null;
          stool_state: "usual" | "loose" | "hard" | null;
          bowel_pain: boolean | null;
          possible_blood: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          kind: "urine" | "bowel" | "both";
          urgency?: "relaxed" | "ordinary" | "urgent" | null;
          woke_from_sleep?: boolean | null;
          note?: string | null;
          urine_pain?: boolean | null;
          urine_color_unusual?: boolean | null;
          stool_state?: "usual" | "loose" | "hard" | null;
          bowel_pain?: boolean | null;
          possible_blood?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          logged_at?: string;
          kind?: "urine" | "bowel" | "both";
          urgency?: "relaxed" | "ordinary" | "urgent" | null;
          woke_from_sleep?: boolean | null;
          note?: string | null;
          urine_pain?: boolean | null;
          urine_color_unusual?: boolean | null;
          stool_state?: "usual" | "loose" | "hard" | null;
          bowel_pain?: boolean | null;
          possible_blood?: boolean | null;
          created_at?: string;
          updated_at?: string;
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
