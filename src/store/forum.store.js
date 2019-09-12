import { ToastProgrammatic as Toast } from 'buefy';

import {
  listRoles,
  listForums,
  setCategoryOrdering,
  getUsers,
  modifyForumPermission,
  getTokenIcon,
  patchForum,
} from '../services/api.service.js';
import { errorAlertOptions } from '../utils/notifications.js';

async function sendModifyForumPermission( commit, action, type, username ) {
  commit( 'setFetching', true );
  try {
    await modifyForumPermission( action, type, username );
  } catch ( err ) {
    Toast.open( errorAlertOptions( `Error with forum ${type} ${action} for ${username}`, err ) );
    console.error( err );
  } finally {
    commit( 'setFetching', false );
  }
}

export default {
  namespaced: true,
  state: {
    fetching: true,
    categoryOrdering: Object,
    owners: [],
    mods: [],
    ownerData: [],
    modData: [],
    token: {
      enabled: false,
      symbol: '',
      precision: 3,
      icon: '',
    },
    beneficiaries: {
      max: 1000,
      topic_starter: 0,
      split: [],
    },
    forumList: [],
    name: '',
    description: '',
    discoverable: false,
  },
  mutations: {
    setTokenIcon( state, icon ) {
      state.token.icon = icon;
    },
    setFetching( state, fetching ) {
      state.fetching = fetching;
    },
    updateForumList( state, forumList ) {
      state.forumList = forumList;
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
      if ( forum.ownerData ) {
        state.ownerData = forum.ownerData;
      }
      if ( forum.modData ) {
        state.modData = forum.modData;
      }
      state.token.enabled = Boolean( forum.token && forum.token.SCOT );
      state.token.symbol = ( forum.token && forum.token.symbol ) || '';
      state.token.precision = ( forum.token && forum.token.precision ) || 3;
      state.beneficiaries.max = ( forum.beneficiaries && forum.beneficiaries.max ) || 1000;
      state.beneficiaries.topic_starter = ( forum.beneficiaries && forum.beneficiaries.topic_starter ) || 0;
      state.beneficiaries.split = ( forum.beneficiaries && forum.beneficiaries.split ) || [];
      let overallRewards = 0;
      const beneficiaries = state.beneficiaries.split
        .map( ( beneficiary ) => {
          const weight = beneficiary.share;
          const account = beneficiary.steemaccount;
          overallRewards += weight;
          return { account, weight };
        } );
      const btWeight = Math.floor( state.beneficiaries.max - overallRewards );
      if ( btWeight > 0 ) {
        beneficiaries.push( {
          account: 'tokenbb',
          weight: btWeight,
        } );
      }
      state.name = forum.name;
      state.description = forum.description;
      state.discoverable = forum.discoverable;
      this.commit( 'categories/updateCategoryList' );
    },
    updateForumProperty( state, property ) {
      state[property.name] = property.value;
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
    async fetch( { commit, state }, withModData ) {
      commit( 'setFetching', true );

      try {
        const forum = await listRoles();

        if ( withModData ) {
          forum.data.ownerData = ( await getUsers( forum.data.owners ) ).data.users;
          forum.data.modData = ( await getUsers( forum.data.mods ) ).data.users;
        }

        commit( 'updateForum', forum.data );

        if ( state.token.enabled ) {
          const tokenIconAnswer = await getTokenIcon( state.token.symbol );
          commit( 'setTokenIcon', JSON.parse( tokenIconAnswer.result[0].metadata ).icon );
        }

        commit( 'setFetching', false );
      } catch ( err ) {
        commit( 'setFetching', false );
        Toast.open( errorAlertOptions( 'Error fetching forum', err ) );
        console.error( err );
      }
    },
    async fetchForums( { commit, state }, args ) {
      commit( 'setFetching', true );

      try {
        const forumList = await listForums( args );
        commit( 'updateForumList', forumList.data );
        commit( 'setFetching', false );
      } catch ( err ) {
        commit( 'setFetching', false );
        Toast.open( errorAlertOptions( 'Error fetching forum list', err ) );
        console.error( err );
      }
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
    async addForumAdmin( { commit }, username ) {
      await sendModifyForumPermission( commit, 'add', 'admin', username );
    },
    async removeForumAdmin( { commit }, username ) {
      await sendModifyForumPermission( commit, 'remove', 'admin', username );
    },
    async addForumMod( { commit }, username ) {
      await sendModifyForumPermission( commit, 'add', 'mod', username );
    },
    async removeForumMod( { commit }, username ) {
      await sendModifyForumPermission( commit, 'remove', 'mod', username );
    },
    async patch( { commit }, forum ) {
      commit( 'setFetching', true );
      try {
        const saved = await patchForum( forum );
        commit( 'updateForum', saved.data );
        commit( 'setFetching', false );
        Toast.open( 'Successfully saved forum settings!' );
      } catch ( err ) {
        commit( 'setFetching', false );
        Toast.open( errorAlertOptions( 'Error patching forum', err ) );
        console.error( err );
      }
    },
  },
};
