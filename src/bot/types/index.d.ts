module Bot {
  interface InitOptions {
    timeout?: number,
    allowed_updates?: ALLOWED_UPDATES[]
  }

  interface PreprocessContext<T = any> {
    target: T,
    [key: string]: any
  }

  type callback<T = any, R = {}> = ( ctx: PreprocessContext<T> & R ) => any | Promise<any>;
  type preprocessor<T = any, R = {}> = ( ctx: PreprocessContext<T> & R ) => any | Promise<any>;

  interface Handlers {
    [key: string]: {
      callback: Function,
      preprocessors: Function[]
    }[]
  }
}