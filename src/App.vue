<template>
  <div id="app">
    <Navbar />
    <section
      v-if="loaded"
      class="section"
    >
      <router-view />
    </section>
    <footer class="footer-main">
      <p class="has-text-centered">
        Powered by <a href="https://tokenbb.io">TokenBB</a>, Handcrafted by <a href="https://buildteam.io/">BuildTeam</a>
      </p>
    </footer>
  </div>
</template>

<style lang="scss">
@import "./themes/default.scss";
@import "./themes/drugwars.scss";
@import "./themes/monsters.scss";
@import "./themes/lightmode.scss";
@import "./themes/darkmode.scss";
@import "./themes/nextcolony.scss";
</style>

<script>
import Navbar from './components/Navbar.vue';


export default {
  components: {
    Navbar,
  },
  data() {
    return {
      loaded: false,
      theme: 'theme-default',
    };
  },
  watch: {
    '$route'( to ) {
      if ( process.env.VUE_APP_WRAPPER_IFRAME_ORIGIN ) {
        window.parent.postMessage( {
          type: 'tokenbb_wrapper_route',
          payload: to.fullPath,
        }, process.env.VUE_APP_WRAPPER_IFRAME_ORIGIN );
      }
    },
  },
  mounted() {
    this.$nextTick( () => {

      this.$store.commit( 'auth/init', this.$store );

      const category = this.$route.query.category;
      this.$store.dispatch( 'forum/fetch' )
        .then( () => this.$store.dispatch( 'categories/fetchAll' ) )
        .then( () => this.$store.dispatch( 'topics/fetchAll', { category } ) )
        .then( () => {
          this.loaded = true;
        } );
    } );
  },
};
</script>
