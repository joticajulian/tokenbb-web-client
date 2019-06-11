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
      path: '/settings',
      name: 'settings',
      component: loadView( 'Settings' ),
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: loadView( 'Statistics' ),
    },
    {
      path: '/admin',
      name: 'admin',
      component: loadView( 'Admin' ),
    },
    {
      path: '/categories',
      name: 'categories',
      component: loadView( 'Categories' ),
    },
    {
      path: '/beneficiaries',
      name: 'beneficiaries',
      component: loadView( 'Beneficiaries' ),
    },
    {
      path: '/tokenization',
      name: 'tokenization',
      component: loadView( 'Tokenization' ),
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
      beforeEnter( to, from, next ) {
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
