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
          this.dispatch( 'auth/getVpRcBars' );
          await Timeout.set( 3000 );
          this.dispatch( 'auth/getVpRcBars' );
          return reply;
        } )
        .catch( ( err ) => {
          commit( 'setFetching', false );

          throw err;
        } );
    },
  },
};
