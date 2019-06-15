import { createReply } from '../services/post.service.js';
import Timeout from 'await-timeout';


export default {
  namespaced: true,
  state: {
    fetching: false,
  },
  mutations: {
    setFetching( state, fetching ) {
      state.fetching = fetching;
    },
  },
  actions: {
    submitReply( { commit }, { parentComment, content } ) {
      commit( 'setFetching', true );

      const author = this.state.auth.current;

      return createReply( parentComment, author, content )
        .then( async ( reply ) => {
          commit( 'setFetching', false );
          commit( 'auth/setVpRcBars' );
          await Timeout.set( 3000 );
          commit( 'auth/setVpRcBars' );
          return reply;
        } )
        .catch( ( err ) => {
          commit( 'setFetching', false );

          throw err;
        } );
    },
  },
};
