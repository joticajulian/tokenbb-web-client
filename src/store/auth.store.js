import jwtdecode from 'jwt-decode';

import { Toast } from 'buefy/dist/components/toast';

import steem from '../services/steem.service';
import { getVotingPower } from '../services/api.service.js';
import { errorAlertOptions } from '../utils/notifications.js';
import { Client } from 'dsteem';

const client = new Client( 'https://api.steemit.com' );

export default {
  namespaced: true,
  state: {
    username: '',
    user: '',
    id: '',
    accounts: [],
    level: '',
    roles: {
      admin: false,
      mod: false,
    },
    current: 'anon',
    manageLink: '',
    addLink: '',
    autoMode: '',
    vp: '',
    scotVp: '',
    rc: '',
  },
  mutations: {
    init( state, store ) {
      window.BTSSO.init( {
        product: 'tokenbb',
      } );
      window.BTSSO.on( 'user', ( user ) => {
        store.commit( 'auth/setUser', user );
        store.dispatch( 'auth/fetchRoles' );
      } );
      window.BTSSO.on( 'username', ( username ) => {
        store.commit( 'auth/setUsername', username );
      } );
      window.BTSSO.on( 'level', ( level ) => {
        store.commit( 'auth/setLevel', level );
      } );
      window.BTSSO.on( 'accounts', ( accounts ) => {
        store.commit( 'auth/setAccounts', accounts );
      } );
      window.BTSSO.on( 'error', ( e ) => {
        console.error( e );
      } );
      window.BTSSO.on( 'needsSetup', () => {
        window.BTSSO.setup();
      } );
    },
    addSteemAccount() {
      window.BTSSO.addSteemAccount();
    },
    logout( state ) {
      state.username = '';
      window.BTSSO.logout();
    },
    toggleAccountModal() {
      window.BTSSO.modal();
    },
    setUser( state, user ) {
      if ( !user ) {
        state.user = '';
        state.username = '';
        state.accounts = [];
        return;
      }
      state.user = user;
      try {
        state.id = jwtdecode( user ).user_id;
      } catch ( decodeError ) {
        console.error( 'Could not decode auth token, logging out!', decodeError );
        window.BTSSO.logout();
        return;
      }
      if ( !user ) {
        state.accounts = [];
        state.current = 'anon';
        window.setGAUserID();
      } else {
        steem.token = user;
        window.setGAUserID( state.id );
      }
      state.manageLink = window.BTSSO.getAccountManageLink();
      state.addLink = window.BTSSO.addSteemAccount;
      state.autoMode = () => {
        console.log( state );
        const json = JSON.stringify( {
          'account': state.current,
          'referrer': 'buildteam',
          'auto': 'true',
        } );
        window.steem_keychain.requestCustomJson( state.current, 'minnowbooster.settings', 'Posting', json, 'Enable MB Auto Mode',
          ( response ) => {
            console.log( response );
          } );

      };
    },
    setUsername( state, username ) {
      state.username = username;
    },
    setCurrent( state, username ) {
      state.current = username;
      window.BTSSO.rememberSteemAccountForApp( `${global.forumname}.tokenbb`, username );
    },
    setRoles( state, { mod, admin } ) {
      state.roles.mod = mod;
      state.roles.admin = admin;
    },
    setLevel( state, level ) {
      state.level = level;
    },
    setAccounts( state, accounts ) {
      state.accounts = accounts;

      const saved = window.BTSSO.getSteemAccountForApp( `${global.forumname}.tokenbb` );
      if ( state.accounts.filter( ( account ) => account.account === saved && account.authority.posting ).length > 0 ) {
        state.current = saved;
        console.log( `Using saved account ${ saved }` );
      } else {
        const first = state.accounts.filter( ( account ) => account.authority.posting )[0];
        const current = first ? first.account : 'anon';
        console.log( `Using first account ${ current }` );
        state.current = current;
        window.BTSSO.rememberSteemAccountForApp( `${global.forumname}.tokenbb`, current );
      }

      client.database.getAccounts( [ state.current ] ).then( ( _accounts ) => {
        const account = _accounts[0];

        client.database.getDynamicGlobalProperties().then( ( props ) => {
          const CURRENT_UNIX_TIMESTAMP = parseInt( ( new Date( props.time ).getTime() / 1000 ) );
          const totalShares = parseFloat( account.vesting_shares ) + parseFloat( account.received_vesting_shares ) - parseFloat( account.delegated_vesting_shares );
          const elapsed = CURRENT_UNIX_TIMESTAMP - account.voting_manabar.last_update_time;
          const maxMana = totalShares * 1000000;
          let currentMana = parseFloat( account.voting_manabar.current_mana ) + elapsed * maxMana / 432000;
          if ( currentMana > maxMana ) {
            currentMana = maxMana;
          }
          const currentManaPerc = ( currentMana * 100 / maxMana ).toFixed( 2 );
          state.rc = currentManaPerc;
        } );

        const lastVote = ( new Date() - new Date( account.last_vote_time + 'Z' ) ) / 1000;
        let votingPower = account.voting_power + ( 10000 * lastVote / 432000 );
        votingPower = Math.min( votingPower * 100, 100 ).toFixed( 2 );
        state.vp = votingPower;
      } );

      getVotingPower( state.current ).then( ( body ) => {
        const lastVoteScot = ( new Date() - new Date( body.SPT.last_vote_time + 'Z' ) ) / 1000;
        let votingPowerScot = body.SPT.voting_power + ( 10000 * lastVoteScot / 432000 );
        votingPowerScot = Math.min( votingPowerScot * 100, 100 ).toFixed( 2 );
        state.scotVp = votingPowerScot;
      } );
    },
  },
  computed: {
    decoded() {
      try {
        return jwtdecode( this.user );
      } catch ( e ) {
        return null;
      }
    },
    loading() {
      return this.user === false;
    },
    authenticated() {
      return Boolean( this.user );
    },
  },
  actions: {
    fetchRoles( { commit, state } ) {
      this.dispatch( 'forum/fetch' )
        .then( ( ) => {
          const { owners, mods } = this.getters['forum/getRoles'];
          const isAdmin = owners.includes( state.id );
          const isMod = isAdmin || mods.includes( state.id );
          commit( 'setRoles', { admin: isAdmin, mod: isMod } );
        } )
        .catch( ( err ) => {
          Toast.open( errorAlertOptions( `Error fetching roles: ${err.message}`, err ) );
          console.error( err );
        } );
    },
  },
};
