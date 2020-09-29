module Bot {
  namespace FetchFactory {
    interface IOptions {
      timeout?: number,
      allowed_updates?: ALLOWED_UPDATES[]
    }
  }

  type onCallback<T = any> = ( update: T ) => void | Promise<void>;
}