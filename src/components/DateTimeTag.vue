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
      return formatDateTimeRelative( this.time || this.lastReply.time );
    },
    timeAbsolute() {
      return formatDateTimeAbsolute( this.time || this.lastReply.time );
    },
  },
  mounted() {
    clearTimeout( this.$data.timeoutHandle );
    this.$data.timeoutHandle = setTimeout( updateTime, this.$data.timeout );
    function updateTime() {
      const timeString = this.$props.time || this.$props.lastReply.time;
      const time = DateTime.fromISO( timeString );
      const minutesDiff = DateTime.local().diff( time, 'minutes' ).as( 'minutes' );
      if ( minutesDiff < 1 ) {
        this.$data.timeout = 1000;
      } else if ( minutesDiff < 10 ) {
        this.$data.timeout = 10 * 1000;
      } else if ( minutesDiff < 60 ) {
        this.$data.timeout = 60 * 1000;
      } else if ( minutesDiff < 24 * 60 ) {
        this.$data.timeout = 10 * 60 * 1000;
      } else {
        this.$data.timeout = 60 * 60 * 1000;
      }
      if ( this.$data.timeout > 1000 ) {
        this.$data.timeout -= parseInt( Math.random() * 0.1 * this.$data.timeout );
      }
      this.$data.ticker += 1;
      clearTimeout( this.$data.timeoutHandle );
      this.$data.timeoutHandle = setTimeout( updateTime, this.$data.timeout );
    }
  },
  beforeDestroy() {
    clearTimeout( this.$data.timeoutHandle );
  },
};
</script>
