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
      body_measurements: {
        Row: {
          arms: number | null
          chest: number | null
          created_at: string
          id: string
          log_date: string
          thigh: number | null
          unit: string
          updated_at: string
          user_id: string
          waist: number | null
        }
        Insert: {
          arms?: number | null
          chest?: number | null
          created_at?: string
          id?: string
          log_date?: string
          thigh?: number | null
          unit?: string
          updated_at?: string
          user_id: string
          waist?: number | null
        }
        Update: {
          arms?: number | null
          chest?: number | null
          created_at?: string
          id?: string
          log_date?: string
          thigh?: number | null
          unit?: string
          updated_at?: string
          user_id?: string
          waist?: number | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          message: string
          to_user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          message: string
          to_user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string
          to_user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      cheers: {
        Row: {
          created_at: string
          emoji: string
          from_user_id: string
          id: string
          to_user_id: string
          workout_log_id: string | null
        }
        Insert: {
          created_at?: string
          emoji?: string
          from_user_id: string
          id?: string
          to_user_id: string
          workout_log_id?: string | null
        }
        Update: {
          created_at?: string
          emoji?: string
          from_user_id?: string
          id?: string
          to_user_id?: string
          workout_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cheers_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_exercise_logs: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          log_date: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          log_date?: string
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          log_date?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "custom_exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "custom_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_exercises: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          target: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          target?: number
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          target?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          last_chance_enabled: boolean
          last_chance_sent_on: string | null
          last_reengagement_sent_on: string | null
          last_streak_sent_on: string | null
          last_verse_sent_on: string | null
          last_workout_sent_on: string | null
          reengagement_enabled: boolean
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
          last_chance_enabled?: boolean
          last_chance_sent_on?: string | null
          last_reengagement_sent_on?: string | null
          last_streak_sent_on?: string | null
          last_verse_sent_on?: string | null
          last_workout_sent_on?: string | null
          reengagement_enabled?: boolean
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
          last_chance_enabled?: boolean
          last_chance_sent_on?: string | null
          last_reengagement_sent_on?: string | null
          last_streak_sent_on?: string | null
          last_verse_sent_on?: string | null
          last_workout_sent_on?: string | null
          reengagement_enabled?: boolean
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
      partnerships: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          invitee_id: string | null
          inviter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          invitee_id?: string | null
          inviter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          invitee_id?: string | null
          inviter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          favorite_verse: string | null
          id: string
          is_public: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          favorite_verse?: string | null
          id: string
          is_public?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          favorite_verse?: string | null
          id?: string
          is_public?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          created_at: string
          id: string
          note: string | null
          photo_date: string
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          photo_date?: string
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          photo_date?: string
          storage_path?: string
          user_id?: string
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
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          rewarded: boolean
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          rewarded?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          rewarded?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      routine_progress: {
        Row: {
          completed_on: string
          created_at: string
          day_index: number
          id: string
          routine_id: string
          user_id: string
        }
        Insert: {
          completed_on?: string
          created_at?: string
          day_index: number
          id?: string
          routine_id: string
          user_id: string
        }
        Update: {
          completed_on?: string
          created_at?: string
          day_index?: number
          id?: string
          routine_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_progress_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          days: Json
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number
          last_workout_date: string | null
          total_workouts: number
          updated_at: string
          user_id: string
          weekly_workouts: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          last_workout_date?: string | null
          total_workouts?: number
          updated_at?: string
          user_id: string
          weekly_workouts?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          last_workout_date?: string | null
          total_workouts?: number
          updated_at?: string
          user_id?: string
          weekly_workouts?: number
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
      accept_partner_invite: { Args: { _code: string }; Returns: string }
      get_cron_secret: { Args: never; Returns: string }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_partner_of: { Args: { _a: string; _b: string }; Returns: boolean }
      join_group_by_code: { Args: { _code: string }; Returns: string }
      shares_group_with: { Args: { _a: string; _b: string }; Returns: boolean }
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
