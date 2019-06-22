<template>
  <form
    class="new-reply"
    @submit.prevent="$emit('submit')"
  >
    <b-field>
      <TextEditor
        ref="editor"
        :fetching="fetching"
        @input="handleTextChange"
      />
    </b-field>

    <b-field>
      <button
        class="button is-small is-topic"
        role="submit"
        :disabled="text.length == 0"
        :class="{ 'is-loading': fetching }"
      >
        Reply
      </button>
    </b-field>
    <span class="label is-small has-text-grey-light">
      This forum takes {{ (beneficiaries.max/100).toFixed(2) }}% beneficiaries
      <template v-if="beneficiaries.topic_starter > 0">
        (includes {{ (beneficiaries.topic_starter/100).toFixed(2) }}% to the topic starter)
      </template>
    </span>
  </form>
</template>

<script>

import Field from 'buefy/src/components/field/Field';
import { mapState } from 'vuex';

import TextEditor from './TextEditor.vue';

export default {
  components: {
    BField: Field,
    TextEditor,
  },
  props: {
    fetching: Boolean,
    text: { type: String, default: '' },
    quote: { type: String, default: '' },
    quoteAuthor: { type: String, default: '' },
  },
  data() {
    return {
      content: '',
      customToolbar: [
        [ { 'header': [ 1, 2, 3, 4, 5, 6, false ] } ],
        [ 'bold', 'italic', 'underline' ],
        [ { 'list': 'ordered' }, { 'list': 'bullet' } ],
        [ 'code-block' ],
      ],
    };
  },
  computed: {
    ...mapState( 'forum', [
      'beneficiaries',
    ] ),
  },
  methods: {
    handleTextChange( value ) {
      this.$emit( 'input', value );
    },
  },
};
</script>
