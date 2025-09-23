export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      email_templates: {
        Row: {
          brevo_template_id: number
          created_at: string | null
          description: string | null
          id: string
          key: string | null
          updated_at: string | null
        }
        Insert: {
          brevo_template_id: number
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string | null
          updated_at?: string | null
        }
        Update: {
          brevo_template_id?: number
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_likes: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          city: string | null
          created_at: string | null
          description: string | null
          ends_at: string
          id: string
          images: Json | null
          organization_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          capacity?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          ends_at: string
          id?: string
          images?: Json | null
          organization_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          capacity?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          images?: Json | null
          organization_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          payload: Json | null
          status: Database["public"]["Enums"]["notification_status"] | null
          subject: string | null
          template_key: string | null
          to_email: string | null
          type: Database["public"]["Enums"]["notification_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          subject?: string | null
          template_key?: string | null
          to_email?: string | null
          type?: Database["public"]["Enums"]["notification_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          subject?: string | null
          template_key?: string | null
          to_email?: string | null
          type?: Database["public"]["Enums"]["notification_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          qty: number
          ticket_type_id: string | null
          unit_price_cents: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          qty: number
          ticket_type_id?: string | null
          unit_price_cents: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          qty?: number
          ticket_type_id?: string | null
          unit_price_cents?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          total_cents: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_cents?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_cents?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["org_member_role"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["org_member_role"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["org_member_role"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          billing_country: string | null
          billing_email: string | null
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          siret_number: string | null
          slug: string | null
          stripe_account_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          billing_country?: string | null
          billing_email?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          siret_number?: string | null
          slug?: string | null
          stripe_account_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          billing_country?: string | null
          billing_email?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          siret_number?: string | null
          slug?: string | null
          stripe_account_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          id: string
          order_id: string | null
          provider: string | null
          provider_event: string | null
          raw_payload: Json | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id?: string | null
          provider?: string | null
          provider_event?: string | null
          raw_payload?: Json | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id?: string | null
          provider?: string | null
          provider_event?: string | null
          raw_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          order_id: string | null
          pdf_path: string | null
          qr_code: string | null
          status: Database["public"]["Enums"]["registration_status"] | null
          ticket_pdf_url: string | null
          ticket_qr_url: string | null
          ticket_type_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          order_id?: string | null
          pdf_path?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          ticket_pdf_url?: string | null
          ticket_qr_url?: string | null
          ticket_type_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          order_id?: string | null
          pdf_path?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          ticket_pdf_url?: string | null
          ticket_qr_url?: string | null
          ticket_type_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          created_at: string | null
          currency: string | null
          event_id: string | null
          id: string
          max_per_order: number | null
          name: string
          price_cents: number
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          event_id?: string | null
          id?: string
          max_per_order?: number | null
          name: string
          price_cents: number
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          event_id?: string | null
          id?: string
          max_per_order?: number | null
          name?: string
          price_cents?: number
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_validations: {
        Row: {
          created_at: string
          id: string
          registration_id: string
          status: string
          validated_at: string
          validated_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          registration_id: string
          status?: string
          validated_at?: string
          validated_by?: string
        }
        Update: {
          created_at?: string
          id?: string
          registration_id?: string
          status?: string
          validated_at?: string
          validated_by?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string | null
          id: string
          provider: string | null
          raw_payload: Json | null
          received_at: string | null
          type: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          provider?: string | null
          raw_payload?: Json | null
          received_at?: string | null
          type?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          provider?: string | null
          raw_payload?: Json | null
          received_at?: string | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_org_owner: {
        Args: { org_id: string }
        Returns: boolean
      }
    }
    Enums: {
      event_status: "draft" | "published" | "archived"
      notification_status: "queued" | "sent" | "failed"
      notification_type: "email"
      order_status: "pending" | "paid" | "canceled" | "refunded"
      org_member_role: "owner" | "admin" | "editor" | "viewer"
      registration_status: "issued" | "checked_in" | "void"
      user_role: "participant" | "organizer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_status: ["draft", "published", "archived"],
      notification_status: ["queued", "sent", "failed"],
      notification_type: ["email"],
      order_status: ["pending", "paid", "canceled", "refunded"],
      org_member_role: ["owner", "admin", "editor", "viewer"],
      registration_status: ["issued", "checked_in", "void"],
      user_role: ["participant", "organizer", "admin"],
    },
  },
} as const
