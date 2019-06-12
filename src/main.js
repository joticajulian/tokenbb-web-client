
import Vue from 'vue';

import App from './App.vue';

import { registerSW } from './registerServiceWorker';
import router from './router';
import store from './store/index.js';

import steemEditor from 'steem-editor';
import 'steem-editor/dist/css/index.css';
import VueAnalytics from 'vue-analytics';

import { formatDate, formatDateTimeFromNow } from './utils/content';
import { getDomainForum } from './services/api.service.js';

import { Toast } from 'buefy/dist/components/toast';
import { errorAlertOptions } from './utils/notifications.js';

registerSW();

const contextMap = {
  default: { theme: 'theme-default', forum: 'monsters', icon: 'favicon.ico' },
  monsters: { theme: 'theme-monsters', forum: 'monsters', icon: 'themes/monsters/favicon_teeth.png' },
  drugwars: { theme: 'theme-drugwars', forum: 'drugwars', icon: 'themes/drugwars/small.png' },
  nextcolony: { theme: 'theme-nextcolony', forum: 'nextcolony', icon: 'themes/nextcolony/favicon.png' },
  localhost: { theme: 'theme-drugwars', forum: 'monsters', icon: 'favicon.ico' },
};

function setUpForum( forumContext, forum ) {
  let context = contextMap.default;
  if ( contextMap.hasOwnProperty( forumContext ) ) {
    context = contextMap[forumContext];
  }
  context.forum = forum;
  console.log( `Loading TokenBB on ${ context.forum } with ${ context.theme }` );
  document.documentElement.className = `${ context.theme }`;
  global.forumname = context.forum;
  document.title = `TokenBB ${global.forumname}`;

  const link = document.querySelector( 'link[rel*=\'icon\']' ) || document.createElement( 'link' );
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = `${ process.env.VUE_APP_BASE_URL }/${ context.icon }`;
  document.getElementsByTagName( 'head' )[0].appendChild( link );

  Vue.config.productionTip = false;

  Vue.use( VueAnalytics, {
    id: process.env.VUE_APP_GA_ID,
    router,
    autoTracking: {
      exception: true,
      exceptionLogs: true,
    },
    batch: {
      enabled: true,
      amount: 5,
      delay: 500,
    },
  } );

  window.setGAUserID = setGAUserID;
  function setGAUserID( userID ) {
    Vue.$ga.set( 'userId', userID );
  }

  Vue.use( steemEditor );

  Vue.filter( 'formatDate', formatDate );
  Vue.filter( 'fromNow', formatDateTimeFromNow );

  Vue.filter( 'usernameDisplay', ( username, owner ) => {
    if ( username === process.env.VUE_APP_ANON_USER ) {
      return `GuestUser#${owner.substring( 4, 10 )}`;
    }
    return username;
  } );

  new Vue( {
    router,
    store,
    render: ( h ) => h( App ),
  } ).$mount( '#app' );
}

const subs = ( new URL( window.location ) ).hostname.split( '.' );
const urlForum = subs[0];
const urlIsTokenbbDomain = subs.length >= 2 && subs[1] === 'tokenbb';

console.log( `Forum: ${urlForum} domain: ${( new URL( window.location ) ).hostname}` );

if ( urlForum !== 'app' && !process.env.VUE_APP_WRAPPER_IFRAME_ORIGIN ) {
  setUpForum( urlForum, urlIsTokenbbDomain ? urlForum : contextMap.default.forum );
} else {
  console.log( 'Setting up proxy keychain communication for iframe.' );
  let steemKeychainCallId = 1;
  const steemKeychainCallbacks = {};

  // Set up keychain communication to parent iframe
  window.steem_keychain = new Proxy( {}, {
    get: ( obj, method ) => {
      return ( ...args ) => {
        steemKeychainCallId++;
        steemKeychainCallbacks[steemKeychainCallId] = args[args.length - 1];
        window.parent.postMessage( { type: 'tokenbb_wrapper_keychain',
          method,
          args: args.slice( 0, args.length - 1 ),
          call_id: steemKeychainCallId,
        }, process.env.VUE_APP_WRAPPER_IFRAME_ORIGIN );
      };
    },
  } );
  window.addEventListener( 'message', ( e ) => {
    if ( e.data.type === 'tokenbb_wrapper_keychain_response' ) {
      if ( steemKeychainCallbacks[e.data.call_id] ) {
        steemKeychainCallbacks[e.data.call_id]( e.data.response );
        steemKeychainCallbacks[e.data.call_id] = null;
      }
    } else if ( e.data.type === 'tokenbb_wrapper_forum' ) {
      console.log( `querying forum name ${e.origin} for ${( new URL( e.origin ) ).hostname}` );

      // Look up forum for domain.
      getDomainForum( ( new URL( e.origin ) ).hostname )
        .then( ( forum ) => {
          console.log( `found forum name ${forum.data.slug}` );
          setUpForum( forum.data.slug, forum.data.slug );
        } )
        .catch( ( err ) => {
          Toast.open( errorAlertOptions( `Could not find forum for domain ${e.origin}`, err ) );
          console.error( err );
        } );
    } else if ( e.data.type === 'tokenbb_wrapper_nav' ) {
      const urlParams = new URLSearchParams( e.data.search );
      const query = {};
      for ( const pair of urlParams.entries() ) {
        query[pair[0]] = pair[1];
      }
      router.replace( { path: e.data.pathname, query } );
    } else if ( e.data.type === 'tokenbb_wrapper_keychain_methods' ) {
      e.data.methods.forEach( ( m ) => {
        window.steem_keychain[m] = m;
      } );
    }
  } );
}

