let useProxy = false;

export async function localStorageGetItem( key ) {
  if ( !useProxy ) {
    try {
      return window.localStorage.getItem( key );
    } catch ( err ) {
      useProxy = true;
    }
  }

  return await new Promise( ( resolve ) => {
    window.localStorageProxy.getItem( key, ( response ) => {
      resolve( response );
    } );
  } );
}

export async function localStorageSetItem( key, value ) {
  if ( !useProxy ) {
    try {
      return window.localStorage.setItem( key, value );
    } catch ( err ) {
      useProxy = true;
    }
  }

  await new Promise( ( resolve ) => {
    window.localStorageProxy.setItem( key, value, () => {
      resolve();
    } );
  } );
}

export async function localStorageRemoveItem( key ) {
  if ( !useProxy ) {
    try {
      return window.localStorage.removeItem( key );
    } catch ( err ) {
      useProxy = true;
    }
  }

  await new Promise( ( resolve ) => {
    window.localStorageProxy.removeItem( key, () => {
      resolve();
    } );
  } );
}
