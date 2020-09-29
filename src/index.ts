import fetch from "node-fetch";
import { transliterate as tr, slugify } from "transliteration";
import config from "./config";
import Bot from "./bot/index";
import schedule from "./schedule";

// #fix вынести в бота как фильтр
function getStartCommand( { entities = [], text }: Bot.API.Response.Message ): [string, string] | false{
  for( const { type, offset, length } of entities ){
    if( type === "bot_command" && offset === 0 ){
      return [ text!.slice( 1, length ), text!.slice( length + 1, text!.length ) ];
    }
  }

  return false;
}

// #fix вынести в бота как плагин
function baseParamsParser( text: string ){
  return text.trim().replace( /  /g, " " ).split( " " );
}

function index(){
  const bot = new Bot( config.token, fetch );

  bot.onMessage( async message => {
    // let command;
    
    // if( !( command = getStartCommand( message ) ) ) return;

    // const [ name, text ] = command;
    
    // if( [ "tr", "slug" ].includes( name ) && text === "" ) return;

    // let result: string = "Error";

    // switch( name ){
    //   case "tr": result = tr( text ); break;
    //   case "slug": result = slugify( text ); break;
    //   case "rasp":
    //     const day = baseParamsParser( text )[0] === "today" ? "today" : undefined;

    //     try{
    //       result = await schedule( fetch, 24, day );
    //     } catch( error ) {
    //       console.log( error );
    //     }
    //   break;
    //   default: return;
    // }

    // bot.sendMessage( message.chat, result, { reply_to_message_id: message.message_id, parse_mode: "HTML" } );
    
    if( !( "sticker" in message ) ) return;

    const { file_unique_id } = message.sticker!;

    if( ![ "AgADIAADvHSgEw", "AgAD6gUAAq05MEo" ].includes( file_unique_id ) ) return;

    let result = "Error";

    try{
      switch( file_unique_id ){
        case "AgADIAADvHSgEw": result = await schedule( fetch, 24 ); break;
        case "AgAD6gUAAq05MEo": result = await schedule( fetch, 24, "today" ); break;
        default: return;
      }
    } catch( error ) {
      console.log( error );
    }

    bot.sendMessage( message.chat, result, { reply_to_message_id: message.message_id, parse_mode: "HTML" } );
  } );

  try{
    bot.start();
  } catch( error ) {
    console.error( error );
  }
}

index();