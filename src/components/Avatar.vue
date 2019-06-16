<template>
  <b-tooltip
    :label="author | usernameDisplay(owner)"
    size="is-small"
    type="is-black is-top"
  >
    <component
      :is="avatarLink(author)?'a':'span'"
      :href="avatarLink(author)"
      target="_blank"
      rel="noopener"
      class="align-middle"
    >
      <figure
        class="image avatar"
        :class="classes"
      >
        <img
          class="is-rounded"
          :title="author | usernameDisplay(owner)"
          :src="avatarURL(author, owner)"
        >
      </figure>
    </component>
  </b-tooltip>
</template>

<script>

import Tooltip from 'buefy/src/components/tooltip/Tooltip';

const SIZES = {
  small: 'is-16x16',
  medium: 'is-32x32',
  large: 'is-48x48',
};

export default {
  components: {
    BTooltip: Tooltip,
  },
  props: {
    author: { type: String, default: '' },
    owner: { type: String, default: '' },
    size: { type: String, default: '' },
  },
  computed: {
    classes() {
      return SIZES[this.size];
    },
  },
  methods: {
    avatarURL( author, owner ) {
      if ( author !== process.env.VUE_APP_ANON_USER ) {
        return `https://img.busy.org/@${author}`;
      }
      return `https://robohash.org/${owner}.png?set=set4`;
    },
    avatarLink( author ) {
      if ( author !== process.env.VUE_APP_ANON_USER ) {
        return `https://steempeak.com/@${author}`;
      }
      return '';
    },
  },
};
</script>
