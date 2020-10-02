module Bot {
  namespace API {
    enum ALLOWED_UPDATES {
      "message",
      "edited_message",
      "channel_post",
      "edited_channel_post",
      "inline_query",
      "chosen_inline_result",
      "callback_query",
      "shipping_query",
      "pre_checkout_query",
      "poll",
      "poll_answer"
    }

    /* ==================== BASE ==================== */
    interface Base {
      ok: boolean,
      description?: string,
      error_code?: number,
      result?: any
    }
    
    interface Error extends Required<Omit<Base, "result">> {}

    /* ==================== API TYPES ==================== */
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
      id: number,
      type: "private" | "group" | "supergroup" | "channel"
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