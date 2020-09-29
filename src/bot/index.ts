import fetchFactory from "./fetchFactory";

class Bot{
  private fetch;
  private timeout: number;
  private allowed_updates?: Bot.API.ALLOWED_UPDATES[];
  private lastUpdateId: number = -1;
  private handlers: { [key: string]: Bot.onCallback } = {};

  // #fix Function type
  constructor( token: string, fetch: Function, options?: Bot.FetchFactory.IOptions ){
    let timeout: number | undefined = 10;
    let allowed_updates: Bot.API.ALLOWED_UPDATES[] | undefined;

    if( options ){
      ( { timeout, allowed_updates } = options );

      if( timeout && timeout < 0 ){
        throw new TypeError( 'Parameter "timeout" must be integer type and >=0' );
      }
    }

    this.fetch = fetchFactory( fetch, token );
    this.timeout = timeout as number;
    this.allowed_updates = allowed_updates;
  }

  getMe(){
    return this.fetch<Bot.API.Response.User>( "getMe" );
  }

  getUpdates( offset?: number ){
    return this.fetch<Bot.API.Response.Update[]>( "getUpdates", {
      offset,
      timeout: this.timeout,
      allowed_updates: this.allowed_updates
    } );
  }

  async handle( updates: Bot.API.Response.Update[] ){
    for( const update of updates ){
      const [ name, update_ ]: [ string, any ] = Object.entries( update )[1];

      if( name in this.handlers ){
        await this.handlers[ name ]( update_ );
      }
    }
  }

  async process( offset?: number ){
    const updates = await this.getUpdates( offset );
    const lastUpdateId = updates.length > 0 ? updates[ updates.length - 1 ].update_id + 1 : offset;

    await this.handle( updates );

    this.process( lastUpdateId );
  }

  start( offset?: number ){
    // #fix get update_id from "driver"
    this.process( offset );
  }

  on<T>( event: string, callback: Bot.onCallback<T> ){
    this.handlers[ event ] = callback;
  }

  onMessage( callback: Bot.onCallback<Bot.API.Response.Message> ){
    this.on( "message", callback );
  }

  // #fix support options (disable_web_page_preview, disable_notification, reply_to_message_id, reply_markup)
  sendMessage( { id: chat_id }: Bot.API.Response.Chat, text: string, options?: object ): Promise<Bot.API.Response.Message>{
    return this.fetch<Bot.API.Response.Message>( "sendMessage", { chat_id, text, ...options } );
  }
}

export default Bot;