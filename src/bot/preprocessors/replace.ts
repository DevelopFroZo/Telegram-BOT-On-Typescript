function replace( fields: string | string[] ){
  return ( ctx: Bot.PreprocessContext ) => {
    if( typeof fields === "string" ){
      fields = [ fields ];
    }

    for( const field of fields ){
      if( !( field in ctx.target ) ){
        return false;
      }

      ctx.target = ctx.target[ field ];
    }
  };
}

export default replace;