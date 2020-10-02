import TBotException from "./TBotException";

function index( fetch: Function, token: string ){
  // #fix вынести
  const URL = `https://api.telegram.org/bot${token}`;

  return async <T = any>( method: string, body?: object ): Promise<T> => {
    const response: Response = await fetch( `${URL}/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify( body )
    } );

    const result: Bot.API.Base = await response.json();

    if( !result.ok ){
      throw new TBotException( result as Bot.API.Error );
    }

    return result.result;
  }
}

export default index;