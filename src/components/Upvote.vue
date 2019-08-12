<template class="upvote">
  <ShowIfLoggedIn :hidden="true">
    <span class="upvote-control">
      <b-tooltip
        :label="'Payout in Steem-Engine tokens of: ' + token_value + ' and in Steem Blockchain tokens of: ' + value"
        size="is-small"
        type="is-black is-center"
      >
        <span
          v-if="token.enabled"
          class="upvote-value"
        >{{ token_value }}</span>
        <span
          v-else
          class="upvote-value"
        >{{ value }}</span>
      </b-tooltip>
      <span class="upvote-lenght"><b-icon
        icon="arrow-up-drop-circle-outline"
        size="is-small"
      />{{ votes.length }}</span>
    </span>

    <b-dropdown
      v-if="!disabled"
      position="is-top-left"
      hoverable
      :disabled="voted"
      class="upvote-drop-control"
    >
      <span
        slot="trigger"
        class="upvote-slider"
      >
        <a
          class="is-small"
          :class="{ 'is-loading': fetching }"
          :disabled="voted"
          @click="handleClick"
        >
          <!--<span>Upvote</span>-->
          <b-icon
            icon="arrow-up-drop-circle-outline"
            size="is-medium"
          />
        </a>
      </span>
      <b-dropdown-item custom>
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item percent-label">
              {{ percent }}%
            </div>
            <div class="level-item">
              <input
                ref="slider"
                orient="horizontal"
                class="slider is-primary is-circle"
                step="1"
                min="1"
                max="100"
                :value="percent"
                type="range"
                @input="handleChange"
              >
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <a
                class="is-small upvote-dropdownbutton"
                :class="{ 'is-loading': fetching }"
                :disabled="voted"
                @click="handleClick"
              >
                <!--<span>Upvote</span>-->
                <b-icon
                  icon="arrow-up-drop-circle-outline"
                  size="is-medium"
                />
              </a>
            </div>
          </div>
        </div>
      </b-dropdown-item>
    </b-dropdown>
  </ShowIfLoggedIn>
</template>

<script>

import Tooltip from 'buefy/src/components/tooltip/Tooltip';
import Dropdown from 'buefy/src/components/dropdown/Dropdown';
import DropdownItem from 'buefy/src/components/dropdown/DropdownItem';
import Icon from 'buefy/src/components/icon/Icon';


import { Client } from 'dsteem';
import { mapState } from 'vuex';

import { getScotTokenPayout, vote } from '../services/api.service.js';
import ShowIfLoggedIn from './ShowIfLoggedIn.vue';

import Timeout from 'await-timeout';

const client = new Client( 'https://api.steemit.com' );

export default {
  components: {
    BTooltip: Tooltip,
    BDropdown: Dropdown,
    BDropdownItem: DropdownItem,
    BIcon: Icon,
    ShowIfLoggedIn,
  },
  props: {
    author: { type: String, default: '' },
    permlink: { type: String, default: '' },
    disabled: Boolean,
  },
  data() {
    return {
      percent: 100,
      fetching: false,
      paid: 0,
      token_paid: 0,
      value: '$ 0.000',
      token_value: '0.000',
      votes: [],
      token_votes: [],
    };
  },
  computed: {
    ...mapState( 'forum', [
      'token',
    ] ),
    voted() {
      return this.fetching || this.paid > 0
        || this.$store.state.auth.current === 'anon'
        || this.votes.filter( ( _vote ) => _vote.voter === this.$store.state.auth.current ).length > 0;
    },
  },
  watch: {
    author( newVal, oldVal ) {
      if ( newVal !== oldVal ) {
        this.updateValue();
      }
    },
    permlink( newVal, oldVal ) {
      if ( newVal !== oldVal ) {
        this.updateValue();
      }
    },
  },
  mounted() {
    this.updateValue();
  },
  methods: {
    handleChange() {
      this.percent = this.$refs.slider.value;
    },
    async updateValue() {
      if ( this.token.enabled ) {
        const tokenData = await getScotTokenPayout( this.author, this.permlink );
        const tokenPayout = tokenData[this.token.symbol] || {
          pending_token: 0,
          total_payout_value: 0,
          precision: this.token.precision || 3,
          active_votes: [],
        };
        const precision = tokenPayout.precision || this.token.precision || 3;
        const precisionDiv = Math.pow( 10, precision );
        const tokenPending = tokenPayout.pending_token / precisionDiv;
        this.token_paid = tokenPayout.total_payout_value / precisionDiv;
        this.token_value = ( this.paid + tokenPending ).toFixed( precision ) + ' ' + this.token.symbol;
        this.token_votes = tokenPayout.active_votes;
      }

      const data = await client.call( 'condenser_api', 'get_content', [ this.author, this.permlink ] );
      const pending = parseFloat( data.pending_payout_value.split( ' ' )[0] );
      this.paid = parseFloat( data.total_payout_value.split( ' ' )[0] );
      this.value = '$ ' + ( this.paid + pending ).toFixed( 3 );
      this.votes = data.active_votes;
      this.$store.dispatch( 'auth/getVpRcBars' );
    },
    async handleClick() {
      if ( this.voted ) {
        return this.$buefy.toast.open( {
          message: 'Oops! Already voted!.',
          type: 'is-danger',
        } );
      }
      this.fetching = true;

      try {
        await vote( this.author, this.permlink, this.$store.state.auth.current, this.percent );
        this.$buefy.toast.open( {
          message: 'Upvoted!',
          type: 'is-primary',
        } );
        await this.updateValue();
        await Timeout.set( 3000 );
        await this.updateValue();

        // check ever 5 seconds to make sure to update SPT once available
        for ( let i = 0; i < 12; i++ ) {
          await Timeout.set( 5000 );
          await this.updateValue();
        }
      } catch ( err ) {
        console.error( 'oops!', err );
        this.$buefy.toast.open( {
          message: 'Oops! Could not upvote at this time. ' + err,
          type: 'is-danger',
        } );
      }
      this.fetching = false;
    },
  },
};
</script>
