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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bible_highlights: {
        Row: {
          created_at: string
          id: string
          note: string | null
          reference: string
          user_id: string
          verse_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          reference: string
          user_id: string
          verse_text: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          reference?: string
          user_id?: string
          verse_text?: string
        }
        Relationships: []
      }
      bible_reflections: {
        Row: {
          content: string
          created_at: string
          id: string
          prompt: string | null
          reference: string
          reflection_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          prompt?: string | null
          reference: string
          reflection_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          prompt?: string | null
          reference?: string
          reflection_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          last_streak_sent_on: string | null
          last_verse_sent_on: string | null
          last_workout_sent_on: string | null
          streak_at_risk_enabled: boolean
          streak_at_risk_time: string
          timezone: string
          updated_at: string
          user_id: string
          verse_enabled: boolean
          verse_time: string
          workout_reminder_enabled: boolean
          workout_reminder_time: string
        }
        Insert: {
          created_at?: string
          last_streak_sent_on?: string | null
          last_verse_sent_on?: string | null
          last_workout_sent_on?: string | null
          streak_at_risk_enabled?: boolean
          streak_at_risk_time?: string
          timezone?: string
          updated_at?: string
          user_id: string
          verse_enabled?: boolean
          verse_time?: string
          workout_reminder_enabled?: boolean
          workout_reminder_time?: string
        }
        Update: {
          created_at?: string
          last_streak_sent_on?: string | null
          last_verse_sent_on?: string | null
          last_workout_sent_on?: string | null
          streak_at_risk_enabled?: boolean
          streak_at_risk_time?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          verse_enabled?: boolean
          verse_time?: string
          workout_reminder_enabled?: boolean
          workout_reminder_time?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reading_plan_progress: {
        Row: {
          completed_on: string
          created_at: string
          day_index: number
          id: string
          plan_id: string
          user_id: string
        }
        Insert: {
          completed_on?: string
          created_at?: string
          day_index: number
          id?: string
          plan_id: string
          user_id: string
        }
        Update: {
          completed_on?: string
          created_at?: string
          day_index?: number
          id?: string
          plan_id?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          unit: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          log_date: string
          unit?: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          unit?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      workout_goals: {
        Row: {
          created_at: string
          deadhang_seconds: number
          id: string
          ladder_percent: number
          plank_seconds: number
          pushups: number
          situps: number
          squat_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadhang_seconds?: number
          id?: string
          ladder_percent?: number
          plank_seconds?: number
          pushups?: number
          situps?: number
          squat_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadhang_seconds?: number
          id?: string
          ladder_percent?: number
          plank_seconds?: number
          pushups?: number
          situps?: number
          squat_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          created_at: string
          deadhang_seconds: number
          id: string
          ladder_percent: number
          notes: string
          plank_seconds: number
          pushups: number
          situps: number
          squat_count: number
          squat_unit: string
          squat_weight: number
          updated_at: string
          user_id: string | null
          workout_date: string
        }
        Insert: {
          created_at?: string
          deadhang_seconds?: number
          id?: string
          ladder_percent?: number
          notes?: string
          plank_seconds?: number
          pushups?: number
          situps?: number
          squat_count?: number
          squat_unit?: string
          squat_weight?: number
          updated_at?: string
          user_id?: string | null
          workout_date: string
        }
        Update: {
          created_at?: string
          deadhang_seconds?: number
          id?: string
          ladder_percent?: number
          notes?: string
          plank_seconds?: number
          pushups?: number
          situps?: number
          squat_count?: number
          squat_unit?: string
          squat_weight?: number
          updated_at?: string
          user_id?: string | null
          workout_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_cron_secret: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
