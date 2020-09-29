module Bot {
  namespace API {
    namespace Response {
      /* ==================== BASE ==================== */
      interface Base {
        ok: boolean,
        description?: string,
        error_code?: number,
        result?: any
      }
      
      interface Error extends Required<Omit<Base, "result">> {}

      /* ==================== SUCCESS RESPONSE TYPES (result) ==================== */
      interface User {
        id: number,
        is_bot: boolean,
        first_name: string,
        last_name?: string,
        username?: string,
        language_code?: string,
        can_join_groups?: boolean,
        can_read_all_group_messages?: boolean,
        supports_inline_queries?: boolean
      }

      interface MessageEntity {
        type: string,
        offset: number,
        length: number,
        url?: string,
        user?: User,
        language?: string
      }

      interface Chat {
        id: number
      }

      interface Sticker {
        file_unique_id: string
      }

      interface Message {
        message_id: number,
        from?: User,
        date: number,
        chat: Chat
        text?: string,
        sticker?: Sticker,
        entities?: MessageEntity[]
      }

      interface Update {
        update_id: number,
        message?: Message
      }
    }
  }
}