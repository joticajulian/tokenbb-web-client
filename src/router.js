import Vue from 'vue';
import Router from 'vue-router';

function loadView( view ) {
  return () => import( /* webpackChunkName: "view-[request]" */ `@/views/${view}.vue` );
}

// xwebpackPrefetch: true
Vue.use( Router );

const router = new Router( {
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/',
      name: 'home',
      component: loadView( 'Home' ),
    },
    {
      path: '/forums',
      name: 'forums',
      component: loadView( 'ForumList' ),
    },

    {
      path: '/topic-list',
      name: 'topic-list',
      component: loadView( 'TopicList' ),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: loadView( 'Dashboard' ),
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: loadView( 'admin/Settings' ),
    },
    {
      path: '/admin/statistics',
      name: 'admin-statistics',
      component: loadView( 'admin/Statistics' ),
    },
    {
      path: '/admin/permissions',
      name: 'admin-permissions',
      component: loadView( 'admin/Permissions' ),
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: loadView( 'admin/Categories' ),
    },
    {
      path: '/admin/beneficiaries',
      name: 'admin-beneficiaries',
      component: loadView( 'admin/Beneficiaries' ),
    },
    {
      path: '/admin/tokenization',
      name: 'admin-tokenization',
      component: loadView( 'admin/Tokenization' ),
    },
    {
      path: '/create-forum',
      name: 'create-forum',
      component: loadView( 'NewForum' ),
    },
    {
      path: '/new',
      name: 'new-topic',
      component: loadView( 'NewTopic' ),
    },
    {
      path: '/topics/:author/:permlink',
      name: 'topic',
      component: loadView( 'Topic' ),
    },
    {
      path: '/@:author',
      name: 'author',
      beforeEnter( to ) {
        window.open( `https://steempeak.com/@${ to.params.author }`, '_blank' );
        if ( window.location.href !== document.referrer ) {
          window.location.href = document.referrer;
        }
      },
    },
    {
      path: '/404',
      name: 'not-found',
      component: loadView( 'NotFound' ),
    },
    {
      path: '*',
      name: 'wildcard-unmatched',
      redirect: '/404',
    },
  ],
} );

export default router;
