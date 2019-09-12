<template>
  <AdminNav>
    <div class="container column">
      <div class="dashboard__section">
        <section>
          <h2 class="sub-header">
            Update Forum
          </h2>
          <form
            class="dashboard__form"
            @submit.prevent="patchForum"
          >
            <b-field
              horizontal
              class="input-title"
              label="Name"
            >
              <b-input
                :value="name"
                placeholder="Type name here"
                class=""
                @input="updateName"
              />
            </b-field>
            <b-field
              horizontal
              class="input-title"
              label="Description"
            >
              <b-input
                :value="description"
                placeholder="Type description here"
                class=""
                @input="updateDescription"
              />
            </b-field>
            <b-field
              horizontal
              class="input-title"
              label="Discoverable"
            >
              <b-checkbox
                :value="discoverable"
                @input="updateDiscoverable"
              />
            </b-field>
            <button
              role="submit"
              :class="{ 'is-loading': fetching }"
              class="button is-small save"
            >
              Save
            </button>
          </form>
        </section>
      </div>
    </div>
  </AdminNav>
</template>
<script>
import AdminNav from '../../components/admin/AdminNav.vue';
import Checkbox from 'buefy/src/components/checkbox/Checkbox';
import Field from 'buefy/src/components/field/Field';
import Input from 'buefy/src/components/input/Input';
import { mapState } from 'vuex';

export default {
  name: 'Settings',
  components: {
    AdminNav,
    BCheckbox: Checkbox,
    BField: Field,
    BInput: Input,
  },
  computed: {
    ...mapState( 'forum', [ 'name', 'description', 'discoverable', 'fetching' ] ),
  },
  mounted() {
    this.$store.dispatch( 'forum/fetch', /* withModData= */ false );
  },
  methods: {
    async patchForum() {
      const patch = {
        name: this.name,
        description: this.description,
        discoverable: this.discoverable,
      };
      try {
        await this.$store.dispatch( 'forum/patch', patch );
      } catch ( err ) {
        console.error( err );
      }
    },
    updateName( value ) {
      this.$store.commit( 'forum/updateForumProperty', { name: 'name', value } );
    },
    updateDescription( value ) {
      this.$store.commit( 'forum/updateForumProperty', { name: 'description', value } );
    },
    updateDiscoverable( value ) {
      this.$store.commit( 'forum/updateForumProperty', { name: 'discoverable', value } );
    },
  },
};
</script>
