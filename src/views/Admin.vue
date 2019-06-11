<template>
  <div class="container dashboard">
    <h1>Admins & Mods</h1>
    <section class="main-content columns is-fullheight">
      <aside class="column is-2 is-narrow-mobile is-fullheight section is-hidden-mobile">
        <p class="menu-label is-hidden-touch">
          Navigation
        </p>
        <ul class="menu-list">
          <li>
            <a
              href="/settings"
              class=""
            >
              Forum Settings
            </a>
          </li>
          <li>
            <a href="/statistics">
              Forum Statistics
            </a>
          </li>
          <li>
            <a href="/admin">
              Admins & Mods
            </a>
          </li>
          <li>
            <a href="/categories">
              Categories
            </a>
          </li>
          <li>
            <a href="/beneficiaries">
              Beneficiaries
            </a>
          </li>
          <li>
            <a href="/tokenization">
              Tokenization
            </a>
          </li>
        </ul>
      </aside>
      <div class="container column is-10">
        <div class="section">
          <b-table
            :data="ownerData"
            :loading="fetching"
            mobile-cards
          >
            <template slot-scope="oprops">
              <div class="columns is-tablet box">
                <div class="column">
                  {{ oprops.row.username }}
                </div>
                <div class="column">
                  <button
                    class="button is-small"
                    :class="{ 'is-loading': fetching }"
                    :disabled="fetching"
                    @click="removeAdmin(oprops.row.username)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </template>
          </b-table>
          <form
            @submit.prevent="addAdmin"
          >
            <b-field
              label="Add Admin"
            >
              <b-input
                v-model="newAdmin"
                placeholder="BT username"
              />
            </b-field>
            <button
              role="submit"
              :class="{ 'is-loading': fetching }"
              class="button is-small"
            >
              Add
            </button>
          </form>

          <h3 class="title">
            Mods
          </h3>
          <b-table
            :data="modData"
            :loading="fetching"
            mobile-cards
          >
            <template slot-scope="mprops">
              <div class="columns is-tablet box">
                <div class="column">
                  {{ mprops.row.username }}
                </div>
                <div class="column">
                  <button
                    class="button is-small"
                    :class="{ 'is-loading': fetching }"
                    :disabled="fetching"
                    @click="removeMod(mprops.row.username)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </template>
          </b-table>
          <form
            @submit.prevent="addMod"
          >
            <b-field
              label="Add Mod"
            >
              <b-input
                v-model="newMod"
                placeholder="BT username"
              />
            </b-field>
            <button
              role="submit"
              :class="{ 'is-loading': fetching }"
              class="button is-small"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>


<script>
import Field from 'buefy/src/components/field/Field';
import Input from 'buefy/src/components/input/Input';
import Table from 'buefy/src/components/table/Table';
import { mapState } from 'vuex';

export default {
  name: 'Admin',
  components: {
    BField: Field,
    BInput: Input,
    BTable: Table,
  },
  data() {
    return {
      admins: [],
      newAdmin: '',
      newMod: '',
    };
  },
  computed: {
    ...mapState( 'forum', [ 'ownerData', 'modData' ] ),
  },
  mounted() {
    this.$store.dispatch( 'forum/fetch', /* withModData= */ true );
  },
  methods: {
    async addAdmin() {
      await this.$store.dispatch( 'forum/addForumAdmin', this.newAdmin );
      await this.$store.dispatch( 'forum/fetch', true );
    },
    async removeAdmin( username ) {
      await this.$store.dispatch( 'forum/removeForumAdmin', username );
      await this.$store.dispatch( 'forum/fetch', true );
    },
    async addMod() {
      await this.$store.dispatch( 'forum/addForumMod', this.newMod );
      await this.$store.dispatch( 'forum/fetch', true );
    },
    async removeMod( username ) {
      await this.$store.dispatch( 'forum/removeForumMod', username );
      await this.$store.dispatch( 'forum/fetch', true );
    },
  },
};
</script>
