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
// --- //
@import "./themes/bitsports.scss";
//@import "./themes/darkmode.scss";
@import "./themes/droneshot.scss";
@import "./themes/drugwars.scss";
//@import "./themes/lightmode.scss";
@import "./themes/monsters.scss";
@import "./themes/nextcolony.scss";
@import "./themes/sct.scss";
@import "./themes/steem.scss";
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
    async '$route'( to ) {
      if ( process.env.VUE_APP_WRAPPER_IFRAME_ORIGIN ) {
        window.parent.postMessage( {
          type: 'tokenbb_wrapper_route',
          payload: to.fullPath,
        }, process.env.VUE_APP_WRAPPER_IFRAME_ORIGIN );
      }

      // On initial load, route appears to be '/' and then adjusts to correct one.
      try {
        await this.$store.commit( 'auth/init', this.$store );

        const category = this.$route.query.category;
        await this.$store.dispatch( 'forum/fetch' );
        await this.$store.dispatch( 'categories/fetchAll' );
        if ( this.$route.path.startsWith( '/topic-list' ) ) {
          const page = this.$route.query.page ? this.$route.query.page : 1;
          const pageSize = this.$route.query.page_size ? this.$route.query.page_size : 10;
          await this.$store.dispatch( 'topics/fetchAll', { category, page, pageSize } );
        }
        this.loaded = true;
      } catch ( err ) {
        console.error( err );
      }
    },
  },
};
</script>
