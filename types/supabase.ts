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
      template_events: {
        Row: {
          id: string;
          template_id: string;
          user_id: string | null;
          event_type: "selected" | "downloaded";
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          user_id?: string | null;
          event_type: "selected" | "downloaded";
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          user_id?: string | null;
          event_type?: "selected" | "downloaded";
          created_at?: string;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          category: string | null;
          html: string;
          css: string;
          thumbnail_url: string | null;
          version: number;
          is_published: boolean;
          sort_order: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          category?: string | null;
          html: string;
          css?: string;
          thumbnail_url?: string | null;
          version?: number;
          is_published?: boolean;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          html?: string;
          css?: string;
          thumbnail_url?: string | null;
          version?: number;
          is_published?: boolean;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: "user" | "admin";
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
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Profile = Tables<"profiles">;
export type Template = Tables<"templates">;
export type TemplateEvent = Tables<"template_events">;
export type ResumeRow = Tables<"resumes">;

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