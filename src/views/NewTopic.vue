<template>
  <div class="container">
    <form
      class="new-topic"
      @submit.prevent="onSubmit"
    >
      <b-field
        class="input-title"
        label="Title"
      >
        <b-input
          v-model="title"
          grouped
          placeholder="Type title here"
          :maxlength="64"
          expanded
          @input="handleTitleChange"
        />
      </b-field>
      <b-field label="Category">
        <CategoryDropdown
          :selected-id="selectedCategory ? selectedCategory._id : null"
          :label-for-all="'-- Select a Category --'"
          @change="onSelectCategory"
        />
      </b-field>
      <b-field label="Message">
        <TextEditor
          :fetching="fetching"
          :initial-content="content"
          @input="handleTextChange"
        />
      </b-field>
      <button
        class="button is-small"
        role="submit"
        :class="{ 'is-loading': fetching }"
      >
        Post Topic
      </button>
          &nbsp;
      <button
        class="button is-small"
        role="cancel"
        :class="{ 'is-loading': fetching }"
        @click="onCancel"
      >
        Cancel
      </button>
      <span class="label is-small has-text-grey-light">
        This forum takes {{ (beneficiaries.max/100).toFixed(2) }}% beneficiaries
        <template v-if="beneficiaries.topic_starter > 0">
          (you get {{ (beneficiaries.topic_starter/100).toFixed(2) }}% reply beneficiaries as the topic starter)
        </template>
      </span>
    </form>
  </div>
</template>

<script>

import { mapState } from 'vuex';

import Field from 'buefy/src/components/field/Field';
import Input from 'buefy/src/components/input/Input';

import TextEditor from '../components/TextEditor.vue';
import CategoryDropdown from '../components/CategoryDropdown.vue';

import { Toast } from 'buefy/dist/components/toast';
import { localStorageGetItem, localStorageSetItem, localStorageRemoveItem } from '../utils/localStorage';

export default {
  name: 'NewTopic',
  components: {
    BField: Field,
    BInput: Input,
    TextEditor,
    CategoryDropdown,
  },
  data() {
    return {
      fetching: false,
      selectedCategory: null,
      title: this.$route.query.title ? this.$route.query.title : '',
      content: this.$route.query.content ? this.$route.query.content : '',
    };
  },
  computed: {
    ...mapState( 'categories', [
      'categoryList',
    ] ),
    ...mapState( 'forum', [
      'beneficiaries',
    ] ),
  },
  watch: {
    categoryList( value ) {
      this.setSelectedCategory( value );
    },
  },
  async mounted() {
    this.setSelectedCategory( this.categoryList );
    const title = await localStorageGetItem( this.$route.fullPath + '-TITLE' );
    if ( !title || title === 'null' ) {
      await localStorageSetItem( this.$route.fullPath + '-TITLE', this.title );
    } else {
      this.title = title;
    }
  },
  methods: {
    setSelectedCategory( categoryList ) {
      if ( !categoryList || categoryList.length === 0 ) {
        return;
      }
      const queryCategory = this.$route.query.category;
      if ( this.$route.query.category && !this.selectedCategory ) {
        const selectedCategory = categoryList.find( ( category ) => {
          return category.slug === queryCategory
            || category._id === queryCategory;
        } ) || {};
        this.selectedCategory = selectedCategory;
      }
    },
    async onSubmit() {
      if ( !this.selectedCategory ) {
        return Toast.open( {
          type: 'is-danger',
          message: 'Please select a category',
        } );
      }

      const payload = {
        title: this.title,
        category: this.selectedCategory.slug,
        content: this.content,
      };

      this.fetching = true;

      try {
        await this.$store.dispatch( 'topics/createTopic', payload );
        await localStorageRemoveItem( this.$route.fullPath );
        await localStorageRemoveItem( this.$route.fullPath + '-TITLE' );
        await this.$store.dispatch( 'topics/fetchAll' );
        this.$router.push( { path: '/topic-list', query: { category: this.selectedCategory.slug } } );
        Toast.open( {
          message: 'Your topic has been posted.',
          type: 'is-primary',
        } );
      } catch ( err ) {
        console.error( err );
        Toast.open( {
          message: 'Oops! Could not create your topic at this moment. ' + err.message,
          type: 'is-danger',
        } );
        this.fetching = false;
      }
    },
    onSelectCategory( selected ) {
      this.selectedCategory = selected;
    },
    async handleTextChange( text ) {
      this.content = text;
      await localStorageSetItem( this.$route.fullPath, text );
    },
    async handleTitleChange( text ) {
      await localStorageSetItem( this.$route.fullPath + '-TITLE', text );
    },
    async onCancel( evt ) {
      await localStorageRemoveItem( this.$route.fullPath );
      await localStorageRemoveItem( this.$route.fullPath + '-TITLE' );
      evt.preventDefault();
      this.$router.go( -1 );
    },
  },
};
</script>
