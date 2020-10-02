class TBotException extends Error{
  private code: number;

  constructor( { error_code: code, description: message }: Bot.API.Error ){
    super( `${code} ${message}` );

    this.code = code;
  }
}

export default TBotException;
