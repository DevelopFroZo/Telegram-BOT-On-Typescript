import TBotException from "./TBotException";

// #fix Function type
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

    const result: Bot.API.Response.Base = await response.json();

    if( !result.ok ){
      throw new TBotException( result as Bot.API.Response.Error );
    }

    return result.result;
  }
}

export default index;