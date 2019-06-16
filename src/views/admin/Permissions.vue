<template>
  <AdminNav>
    <div class="container column">
      <div class="dashboard__section">
        <section class="administrators">
          <h2 class="sub-header">
            Administrators
          </h2>
          <b-table
            :data="ownerData"
            :loading="fetching"
            mobile-cards
          >
            <template slot-scope="oprops">
              <div class="level is-tablet dashboard__admins">
                <div class="level-left dashboard__username">
                  {{ oprops.row.username }}
                </div>
                <div class="level-right">
                  <button
                    class="button is-small"
                    :class="{ 'is-loading': fetching }"
                    :disabled="fetching || !auth.roles.admin"
                    @click="removeAdmin(oprops.row.username)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </template>
          </b-table>
          <form
            class="dashboard__form level"
            @submit.prevent="addAdmin"
          >
            <b-field>
              <b-input
                v-model="newAdmin"
                placeholder="BT username"
                class="level-left"
                :disabled="!auth.roles.admin"
              />
            </b-field>
            <button
              role="submit"
              :class="{ 'is-loading': fetching }"
              class="button is-small level-right"
              :disabled="!auth.roles.admin"
            >
              Add
            </button>
          </form>
        </section>
        <section class="moderators">
          <h2 class="sub-header">
            Moderators
          </h2>
          <b-table
            :data="modData"
            :loading="fetching"
            mobile-cards
          >
            <template slot-scope="mprops">
              <div class="level dashboard__mods">
                <div class="level-left dashboard__username">
                  {{ mprops.row.username }}
                </div>
                <div class="level-right">
                  <button
                    class="button is-small"
                    :class="{ 'is-loading': fetching }"
                    :disabled="fetching || !auth.roles.admin"
                    @click="removeMod(mprops.row.username)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </template>
          </b-table>
          <form
            class="level"
            @submit.prevent="addMod"
          >
            <b-field>
              <b-input
                v-model="newMod"
                placeholder="BT username"
                class="level-left"
                :disabled="!auth.roles.admin"
              />
            </b-field>
            <button
              role="submit"
              :class="{ 'is-loading': fetching }"
              class="button is-small level-right"
              :disabled="!auth.roles.admin"
            >
              Add
            </button>
          </form>
        </section>
      </div>
    </div>
  </AdminNav>
</template>


<script>
import Field from 'buefy/src/components/field/Field';
import Input from 'buefy/src/components/input/Input';
import Table from 'buefy/src/components/table/Table';
import { mapState } from 'vuex';
import AdminNav from '../../components/admin/AdminNav.vue';

export default {
  name: 'Admin',
  components: {
    AdminNav,
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
    ...mapState( 'forum', [ 'ownerData', 'modData', 'fetching' ] ),
    ...mapState( [ 'auth' ] ),
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
