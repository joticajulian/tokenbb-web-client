<template>
  <div class="container topic-view">
    <div
      v-if="fetching"
      class="spacer"
    >
      <b-loading
        :is-full-page="false"
        :active="fetching"
      />
    </div>

    <div v-if="!fetching">
      <div class="post-page">
        <header class="has-text-left">
          <h1 class="title is-3">
            {{ topic.title }}
          </h1>
          <div class="level-left breadcrumb-wrapper">
            <Breadcrumb :crumbs="breadcrumb" />
          </div>
          <div class="nav-control">
            <a
              class="topic-nav topic-nav-to-end"
              @click="scrollToEndOfTopic()"
            >Jump to end
            </a>
          </div>
        </header>

        <br>

        <main ref="posts">
          <Post :data="topic" />
          <b-pagination
            v-if="replySize > perPage"
            :total="replySize"
            :current.sync="current"
            order="is-centered"
            size="is-normal"
            :simple="false"
            :rounded="false"
            :per-page="perPage"
          />
          <Post
            v-for="(reply, index) in currentPage"
            :key="index"
            :data="reply"
            :is-reply="true"
          />
          <a
            class="topic-nav topic-nav-to-top"
            @click="scrollTo('topOfPage')"
          >
            Back to Top
          </a>
          <b-pagination
            v-if="replySize > perPage"
            :total="replySize"
            :current.sync="current"
            order="is-centered"
            size="is-normal"
            :simple="false"
            :rounded="false"
            :per-page="perPage"
          />
        </main>

        <br>
        <a id="endOfTopic" />
        <ShowIfLoggedIn>
          <ReplyForm
            :fetching="$store.state.replies.fetching"
            :text="replyText"
            :quote="quote"
            :quote-author="quoteAuthor"
            @input="onReplyInput"
            @submit="onReplySubmit"
          />
        </ShowIfLoggedIn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import Loading from 'buefy/src/components/loading/Loading';
import Pagination from 'buefy/src/components/pagination/Pagination';

import Breadcrumb from '../components/Breadcrumb.vue';
import Post from '../components/Post.vue';
import ReplyForm from '../components/ReplyForm.vue';
import ShowIfLoggedIn from '../components/ShowIfLoggedIn.vue';
import { getTopic } from '../services/post.service.js';
import { errorAlertOptions } from '../utils/notifications.js';
import { localStorageSetItem, localStorageRemoveItem } from '../utils/localStorage';

export default {
  name: 'Topic',
  components: {
    BLoading: Loading,
    BPagination: Pagination,
    Breadcrumb,
    Post,
    ReplyForm,
    ShowIfLoggedIn,
  },
  data() {
    return {
      fetching: true,
      topic: {},
      replyText: '',
      total: 0,
      current: this.$route.query && this.$route.query.page ? this.$route.query.page : 1,
      perPage: this.$route.query && this.$route.query.page_size ? this.$route.query.page_size : 10,
    };
  },
  computed: {
    ...mapState( 'categories', [
      'categoriesById',
      'categoriesByBreadcrumb',
    ] ),
    replySize() {
      return this.topic.numberOfReplies || 0;
    },
    currentPage() {
      return this.topic.replies || [];
    },
    lastPage() {
      return Math.ceil( this.replySize / this.perPage );
    },
    quote() {
      const arr = this.currentPage;
      if ( arr && arr.length > 0 ) {
        return arr[arr.length - 1].body.trim();
      } else if ( this.topic.body ) {
        return this.topic.body.trim();
      }
      return '';
    },
    quoteAuthor() {
      const topic = this.topic;
      return topic.lastReply.author === '' ? topic.author.user : topic.lastReply.author;
    },
    breadcrumb() {
      const breadcrumb = [];
      const category = this.categoriesById[this.topic.categoryId];
      if ( category ) {
        let nav = '';
        if ( category.nav ) {
          category.nav.split( '/' ).forEach( ( crumb ) => {
            nav = nav + ( nav !== '' ? '/' : '' ) + crumb;
            const group = this.categoriesByBreadcrumb.categoryGroupsByNav[nav];
            if ( group ) {
              breadcrumb.push( { path: '/', query: { nav }, name: group.name } );
            }
          } );
        }
        breadcrumb.push( { path: '/topic-list', query: { category: category.slug }, name: category.title } );
        breadcrumb.push( { path: this.$route.path, query: this.$route.query, name: this.topic.title } );
      }
      return breadcrumb;
    },
  },
  watch: {
    current( value ) {
      const query = { ...this.$route.query };
      query.page = value;
      this.$router.push( { path: this.$route.path, query } );
    },
  },
  created() {
    this.fetchTopic( Boolean( this.$route.query && (
      this.$route.query.postId
      || this.$route.query.scrollToEnd ) ) );
    this.$root.$on( 'topicRefresh', this.fetchTopic );
  },
  beforeRouteUpdate( to, from, next ) {
    const { author, permlink } = this.$route.params;
    const page = to.query.page ? to.query.page : 1;
    const pageSize = to.query.page_size ? to.query.page_size : 10;
    this.fetching = true;
    return getTopic( author, permlink, page, pageSize ).then( ( topic ) => {
      this.topic = topic;
      this.fetching = false;
      next();
    } );
  },
  methods: {
    async onReplyInput( text ) {
      this.replyText = text;
      await localStorageSetItem( this.$route.fullPath, text );
    },
    async onReplySubmit() {
      const payload = {
        parentComment: this.topic,
        content: this.replyText,
      };

      try {
        const reply = await this.$store.dispatch( 'replies/submitReply', payload );
        await localStorageRemoveItem( this.$route.fullPath );
        if ( reply ) {
          this.fetchTopic( true );
          this.replyText = '';
        }
      } catch ( err ) {
        console.log( err );
        this.$buefy.toast.open( errorAlertOptions( 'Oops! Could not submit reply at this moment', err ) );
        this.$ga.exception( err );
      }
    },
    fetchTopic( scrollDown ) {
      const { author, permlink } = this.$route.params;

      this.fetching = true;

      return getTopic( author, permlink, this.current, this.perPage ).then( ( topic ) => {
        if ( !topic ) {
          return this.$router.push( '/' );
        }

        this.topic = topic;
        this.fetching = false;

        // Hack to prevent scrolling down on load
        this.$nextTick( () => {
          if ( scrollDown ) {
            if ( this.$route.query && this.$route.query.postId ) {
              this.scrollTo( this.$route.query.postId );
            } else {
              this.scrollToEndOfTopic();
            }
          } else {
            this.scrollTo( 'topOfPage' );
          }
        } );
      } );
    },
    scrollTo( id ) {
      window.scrollTo( 0, document.getElementById( id ).offsetTop );
    },
    scrollToEndOfTopic() {
      this.current = this.lastPage;
      this.scrollTo( 'endOfTopic' );
    },
  },
};
</script>
