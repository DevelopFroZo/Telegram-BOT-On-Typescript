import fetchFactory from "./utils/fetchFactory";
import preprocess from "./utils/preprocess";
import replace from "./preprocessors/replace";

class Bot{
  private fetch;
  private timeout: number;
  private allowed_updates?: Bot.API.ALLOWED_UPDATES[];
  private handlers: Bot.Handlers = {};

  constructor( token: string, fetch: Function, options?: Bot.InitOptions ){
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

  private getUpdates( offset?: number ){
    return this.fetch<Bot.API.Update[]>( "getUpdates", {
      offset,
      timeout: this.timeout,
      allowed_updates: this.allowed_updates
    } );
  }

  private async handle( updates: object[] ){
    for( const update of updates ){
      const name = Object.keys( update )[1];

      if( name in this.handlers ){
        for( const { callback, preprocessors } of this.handlers[ name ] ){
          const ctx = { target: update };

          if( await preprocess( ctx, preprocessors ) ){
            await callback( ctx );
          }
        }
      }
    }
  }

  private async process( offset?: number ){
    const updates = await this.getUpdates( offset );
    const lastUpdateId = updates.length > 0 ? updates[ updates.length - 1 ].update_id + 1 : offset;

    await this.handle( updates );

    this.process( lastUpdateId );
  }

  start( offset?: number ){
    // #fix get update_id from "driver"
    this.process( offset );
  }

  getMe(){
    return this.fetch<Bot.API.User>( "getMe" );
  }

  // #fix support options (disable_web_page_preview, disable_notification, reply_to_message_id, reply_markup)
  sendMessage( { id: chat_id }: Bot.API.Chat, text: string, options?: object ): Promise<Bot.API.Message>{
    return this.fetch<Bot.API.Message>( "sendMessage", { chat_id, text, ...options } );
  }

  on<T = any, R = {}>( eventName: string, callback: Bot.callback<T, R>, ...preprocessors: Bot.preprocessor<T, R>[] ){
    if( !( eventName in this.handlers ) ){
      this.handlers[ eventName ] = [];
    }

    this.handlers[ eventName ].push( { callback, preprocessors } );
  }

  onMessage<R = {}>( callback: Bot.callback<Bot.API.Message, R>, ...preprocessors: Bot.preprocessor<Bot.API.Message, R>[] ){
    this.on( "message", callback, replace( "message" ), ...preprocessors );
  }

  onSticker<R = {}>( callback: Bot.callback<Bot.API.Message, R>, ...preprocessors: Bot.preprocessor<Bot.API.Message, R>[] ){
    this.onMessage( callback, ( { target } ) => "sticker" in target, ...preprocessors );
  }
}

export default Bot;