import fetch from "node-fetch";
import { transliterate as tr, slugify } from "transliteration";
import config from "./config";
import Bot from "./bot/index";
import schedule from "./schedule";

function checkStartCommands( commandNames: string | string[], field: string = "command" ){
  if( typeof commandNames === "string" ){
    commandNames = [ commandNames ];
  }

  return ( ctx: Bot.PreprocessContext<Bot.API.Message> ) => {
    const { entities, text } = ctx.target;

    if( !entities || !text ){
      return false;
    }

    for( const { type, offset, length } of entities ){
      if( type === "bot_command" && offset === 0 ){
        const name = text.slice( 1, length );

        if( commandNames.includes( name ) ){
          ctx[ field ] = {
            name,
            payload: text.slice( length + 1, text!.length )
          };

          return;
        }
      }
    }
  
    return false;
  };
}

function checkFileUniqueIds( fileUniqueIds: string | string[] ){
  if( typeof fileUniqueIds === "string" ){
    fileUniqueIds = [ fileUniqueIds ];
  }

  return ( { target: { sticker } }: Bot.PreprocessContext<Bot.API.Message> ) => fileUniqueIds.includes( sticker!.file_unique_id );
}

// #fix вынести в бота как плагин
function baseParamsParser( text: string ){
  return text.trim().replace( /  /g, " " ).split( " " );
}

function index(){
  const bot = new Bot( config.token, fetch );

  bot.onMessage( async ( { target: message, command: { name, payload } } ) => {
    if( [ "tr", "slug" ].includes( name ) && payload === "" ) return;

    let result: string = "string";
    let parse_mode: string | undefined;

    switch( name ){
      case "tr": result = tr( payload ); break;
      case "slug": result = slugify( payload ); break;
      default:
        const params = baseParamsParser( payload );
        const day = params[0] === "today" ? "today" : undefined;

        try{
          result = ( await schedule( fetch, 24, day ) ) || "Пар нет";
          parse_mode = "HTML";
        } catch( error ) {
          console.log( error );
        }
    }

    bot.sendMessage( message.chat, result, { reply_to_message_id: message.message_id, parse_mode } );
  }, checkStartCommands( [ "tr", "slug", "rasp" ] ) );

  bot.onSticker( async ( { target: message } ) => {
    const { file_unique_id } = message.sticker!;
    let result;

    if( file_unique_id === "AgADIAADvHSgEw" ) result = ( await schedule( fetch, 24 ) ) || "Пар нет";
    else result = ( await schedule( fetch, 24, "today" ) ) || "Пар нет";

    bot.sendMessage( message.chat, result, { reply_to_message_id: message.message_id, parse_mode: "HTML" } );
  }, checkFileUniqueIds( [ "AgADIAADvHSgEw", "AgAD6gUAAq05MEo" ] ) );

  try{
    bot.start();
  } catch( error ) {
    console.error( error );
  }
}

index();