import { Toast } from 'buefy/dist/components/toast';

import { listRoles, setCategoryOrdering, getTokenIcon } from '../services/api.service.js';
import { errorAlertOptions } from '../utils/notifications.js';


export default {
  namespaced: true,
  state: {
    fetching: true,
    categoryOrdering: Object,
    owners: [],
    mods: [],
    token: {
      enabled: false,
      symbol: '',
      precision: 3,
      icon: '',
    },
  },
  mutations: {
    setFetching( state, fetching ) {
      state.fetching = fetching;
    },
    updateForum( state, forum ) {
      try {
        state.categoryOrdering = JSON.parse( forum.categoryOrdering );
      } catch ( e ) {
        console.error( `Invalid categoryOrdering JSON ${forum.categoryOrdering}: `, e );
        state.categoryOrdering = {};
      }
      state.owners = forum.owners;
      state.mods = forum.mods;
      state.token.enabled = Boolean( forum.token && forum.token.SCOT );
      state.token.symbol = ( forum.token && forum.token.symbol ) || '';
      state.token.precision = ( forum.token && forum.token.precision ) || 3;
      getTokenIcon( state.token.symbol ).then( ( body ) => {
        state.token.icon = JSON.parse( body.result[0].metadata ).icon;
      } );
      this.commit( 'categories/updateCategoryOrderingData' );
    },
  },
  getters: {
    getRoles( { owners, mods } ) {
      return {
        owners,
        mods,
      };
    },
    getCategoryOrdering( { categoryOrdering } ) {
      return categoryOrdering;
    },
  },
  actions: {
    fetch( { commit } ) {
      commit( 'setFetching', true );

      listRoles()
        .then( ( forum ) => {
          commit( 'updateForum', forum.data );
          commit( 'setFetching', false );
        } )
        .catch( ( err ) => {
          commit( 'setFetching', false );
          Toast.open( errorAlertOptions( 'Error fetching forum', err ) );
          console.error( err );
        } );
    },
    async editCategoryOrdering( { commit }, categoryOrdering ) {
      commit( 'setFetching', true );
      try {
        await setCategoryOrdering( categoryOrdering );
      } catch ( err ) {
        Toast.open( errorAlertOptions( 'Error editing category ordering', err ) );
        console.error( err );
      } finally {
        commit( 'setFetching', false );
      }
    },
  },
};
