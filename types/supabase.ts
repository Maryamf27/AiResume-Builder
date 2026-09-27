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
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          type: "Bug Report" | "Feature Request" | "General Feedback";
          message: string;
          page_url: string | null;
          status: "new" | "reviewed" | "resolved";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: "Bug Report" | "Feature Request" | "General Feedback";
          message: string;
          page_url?: string | null;
          status?: "new" | "reviewed" | "resolved";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: "Bug Report" | "Feature Request" | "General Feedback";
          message?: string;
          page_url?: string | null;
          status?: "new" | "reviewed" | "resolved";
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Profile = Tables<"profiles">;

export interface SignupFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}
