export interface ConversationRow {
  id: string
  tenant_id: string
  other_user_name: string
  other_user_initials: string
  property_title: string | null
  property_info: string | null
  last_message_preview: string | null
  last_message_at: string
  created_at: string
}

export interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}
