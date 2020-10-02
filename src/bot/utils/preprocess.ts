async function preprocess( ctx: Bot.PreprocessContext, preprocessors: Function[] ): Promise<boolean>{
  for( const fn of preprocessors ){
    if( await fn( ctx ) === false ){
      return false;
    }
  }

  return true;
}

export default preprocess;