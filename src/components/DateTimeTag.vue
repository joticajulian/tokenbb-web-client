<template>
  <div class="align-middle">
    <b-icon
      icon="clock"
      size="is-small"
    />
    {{ timeRelative }}
    <template v-if="!time && numberOfReplies > 0">
      <span>by</span>
      <Avatar
        class="align-middle"
        :author="lastReply.author"
        :owner="lastReply.owner"
        size="small"
      />
    </template>
  </div>
</template>

<script>

import Icon from 'buefy/src/components/icon/Icon';

import Avatar from '../components/Avatar.vue';

import { DateTime } from 'luxon';

import { formatDateTimeAbsolute, formatDateTimeRelative } from '../utils/content';

export default {
  components: {
    BIcon: Icon,
    Avatar,
  },
  props: {
    time: { type: String, default: '' },
    lastReply: {
      type: Object,
      default: () => {},
      time: { type: String, default: '' },
      author: { type: String, default: '' },
      owner: { type: String, default: '' },
    },
    numberOfReplies: { type: Number, default: 1 },
  },
  data() {
    return {
      ticker: 0,
      timeout: 1000,
      timeoutHandle: 0,
    };
  },
  computed: {
    timeRelative() {
      // eslint-disable-next-line no-unused-vars
      const dummyTicker = this.$data.ticker;

      return formatDateTimeRelative( this.time || this.lastReply.time );
    },
    timeAbsolute() {
      // eslint-disable-next-line no-unused-vars
      const dummyTicker = this.$data.ticker;
      return formatDateTimeAbsolute( this.time || this.lastReply.time );
    },
  },
  mounted() {
    // eslint-disable-next-line no-shadow
    const self = this;
    clearTimeout( self.$data.timeoutHandle );
    self.$data.timeoutHandle = setTimeout( updateTime, self.$data.timeout );
    function updateTime() {
      const timeString = self.$props.time || self.$props.lastReply.time;
      const time = DateTime.fromISO( timeString );
      const minutesDiff = DateTime.local().diff( time, 'minutes' ).as( 'minutes' );
      if ( minutesDiff < 1 ) {
        self.$data.timeout = 1000;
      } else if ( minutesDiff < 10 ) {
        self.$data.timeout = 10 * 1000;
      } else if ( minutesDiff < 60 ) {
        self.$data.timeout = 60 * 1000;
      } else if ( minutesDiff < 24 * 60 ) {
        self.$data.timeout = 10 * 60 * 1000;
      } else {
        self.$data.timeout = 60 * 60 * 1000;
      }
      if ( self.$data.timeout > 1000 ) {
        self.$data.timeout -= parseInt( Math.random() * 0.1 * self.$data.timeout );
      }
      self.$data.ticker += 1;
      clearTimeout( self.$data.timeoutHandle );
      self.$data.timeoutHandle = setTimeout( updateTime, self.$data.timeout );
    }
  },
  beforeDestroy() {
    clearTimeout( this.$data.timeoutHandle );
  },
};
</script>
