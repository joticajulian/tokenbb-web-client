<template>
  <div class="container">
    <section class="main-content columns is-fullheight">
      <aside class="column is-2 is-narrow-mobile is-fullheight section is-hidden-mobile">
        <p class="menu-label is-hidden-touch">
          Navigation
        </p>
        <ul class="menu-list">
          <li>
            <a
              href="#"
              class=""
            >
              Forum Settings
            </a>
          </li>
          <li>
            <a href="#">
              Forum Statistics
            </a>
          </li>
          <li>
            <a href="#">
              Admins & Mods
            </a>
          </li>
          <li>
            <a href="">
              Categories
            </a>
          </li>
          <li>
            <a href="">
              Beneficiaries
            </a>
          </li>
          <li>
            <a href="">
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


          <h3 class="title">
            Categories
          </h3>

          <div class="card-content content">
            <div v-if="orderEdit">
              <button
                class="button is-small"
                :class="{ 'is-loading': fetching }"
                :disabled="fetching"
                @click="saveOrdering()"
              >
                Save Ordering
              </button>
              <button
                class="button is-small"
                :class="{ 'is-loading': fetching }"
                :disabled="fetching"
                @click="cancelOrdering()"
              >
                Cancel
              </button>
            </div>
            <div v-else>
              <button
                class="button is-small"
                :class="{ 'is-loading': fetching }"
                :disabled="fetching || activeEdits"
                @click="enableOrderingEdit()"
              >
                Modify Order
              </button>
            </div>
            <Tree
              :data="[ categoryTree.tree ]"
              draggable
            >
              <template slot-scope="props">
                <div
                  v-if="props.data.isGroup"
                  class="is-tablet box cat-style"
                >
                  <b-field
                    v-if="props.data.edit"
                  >
                    <b-input
                      v-model="props.data.edit.name"
                      placeholder="Name"
                      :maxlength="64"
                      :has-counter="false"
                    />
                    <button
                      v-if="props.data.edit"
                      class="button is-small"
                      :class="{ 'is-loading': fetching }"
                      :disabled="fetching"
                      @click="saveGroup( props.data.nav )"
                    >
                      Save
                    </button>
                    <button
                      class="button is-small"
                      :class="{ 'is-loading': fetching }"
                      :disabled="fetching"
                      @click="cancelGroupEdit( props.data.nav )"
                    >
                      Cancel
                    </button>
                  </b-field>
                  <div
                    v-else
                  >
                    <a
                      class=""
                      @click="props.store.toggleOpen( props.data )"
                    >
                      <b-icon
                        :icon="props.data.open ? 'menu-up' : 'menu-down'"
                      />
                    </a>
                    {{ props.data.name }}
                    <button
                      class="button is-small"
                      :class="{ 'is-loading': fetching }"
                      :disabled="fetching || activeEdits"
                      @click="enableGroupEdit(props.data.nav)"
                    >
                      Edit
                    </button>
                    <button
                      v-if="props.data.children.length == 0"
                      class="button is-small"
                      :class="{ 'is-loading': fetching }"
                      :disabled="fetching || activeEdits"
                      @click="removeGroup(props.data.nav)"
                    >
                      Remove
                    </button>
                  </div>
                  <div v-if="props.data.open">
                    <button
                      class="button is-small"
                      :class="{ 'is-loading': fetching }"
                      :disabled="fetching || activeEdits"
                      @click="addGroupToGroup(props.data.nav)"
                    >
                      Add Category Group
                    </button>
                    <button
                      class="button is-small"
                      :class="{ 'is-loading': fetching }"
                      :disabled="fetching || activeEdits"
                      @click="addCategoryToGroup(props.data.nav)"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
                <div
                  v-else
                  class="columns is-tablet box cat-style"
                >
                  <div class="column cat-stats">
                    <span class="cprops-title">{{ props.data.slug }}</span>
                  </div>
                  <div class="column cat-stats">
                    <b-field
                      v-if="props.data.edit"
                    >
                      Name
                      <b-input
                        v-model="props.data.edit.name"
                        placeholder="Name"
                        :maxlength="64"
                        :has-counter="false"
                      />
                    </b-field>
                    <div
                      v-else
                    >
                      {{ props.data.name }}
                    </div>
                  </div>
                  <div class="column cat-stats">
                    <b-field
                      v-if="props.data.edit"
                    >
                      Title
                      <b-input
                        v-model="props.data.edit.title"
                        placeholder="Title"
                        :maxlength="64"
                        :has-counter="false"
                      />
                    </b-field>
                    <div
                      v-else
                    >
                      {{ props.data.title }}
                    </div>
                  </div>
                  <div class="column cat-stats">
                    <b-field
                      v-if="props.data.edit"
                    >
                      Description
                      <b-input
                        v-model="props.data.edit.description"
                        placeholder="Description"
                        :maxlength="320"
                        :has-counter="false"
                      />
                    </b-field>
                    <div
                      v-else
                    >
                      {{ props.data.description }}
                    </div>
                  </div>
                  <div class="column cat-stats">
                    <b-field
                      v-if="props.data.edit"
                    >
                      <b-checkbox
                        v-model="props.data.edit.hidden"
                      >
                        Hidden
                      </b-checkbox>
                    </b-field>
                    <div
                      v-else
                    >
                      <b-checkbox
                        v-model="props.data.hidden"
                        disabled
                      >
                        Hidden
                      </b-checkbox>
                    </div>
                  </div>
                  <div class="column">
                    <button
                      v-if="props.data.edit"
                      class="button is-small"
                      style="min-width: 40px; max-width: 40px ; width: 40px"
                      :class="{ 'is-loading': fetching }"
                      :disabled="fetching"
                      @click="props.data.slug ? saveCategory( props.data.slug ) : addCategory( props.data.nav )"
                    >
                      Save
                    </button>
                    <button
                      class="button is-small"
                      style="min-width: 40px; max-width: 40px ; width: 40px"
                      :class="{ 'is-loading': fetching }"
                      :disabled="fetching || ( !props.data.edit && activeEdits )"
                      @click="props.data.slug ? toggleCategoryEdit( props.data.slug ) : cancelAdd( props.data.nav )"
                    >
                      <div v-if="props.data.edit">
                        Cancel
                      </div>
                      <div v-else>
                        Edit
                      </div>
                    </button>
                  </div>
                </div>
              </template>
            </Tree>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Checkbox from 'buefy/src/components/checkbox/Checkbox';
import Field from 'buefy/src/components/field/Field';
import Icon from 'buefy/src/components/icon/Icon';
import Input from 'buefy/src/components/input/Input';
import Table from 'buefy/src/components/table/Table';
import { DraggableTree } from 'vue-draggable-nested-tree';
import Vue from 'vue';
import { mapState } from 'vuex';
import { stringToSlug } from '../utils/slug.js';

function getCategoryOrdering( treeGroup ) {
  const categories = [];
  const groups = [];
  for ( let i = 0; i < treeGroup.children.length; i++ ) {
    const child = treeGroup.children[i];
    if ( child.isGroup ) {
      groups.push( getCategoryOrdering( child ) );
    } else {
      categories.push( child.slug );
    }
  }
  return {
    slug: treeGroup.slug,
    name: treeGroup.name,
    categories,
    groups,
  };
}

export default {
  name: 'Settings',
  components: {
    BCheckbox: Checkbox,
    BIcon: Icon,
    BField: Field,
    BInput: Input,
    Tree: DraggableTree,
    BTable: Table,
  },
  data() {
    return {
      orderEdit: false,
      editingCategory: {},
      editingGroup: {},
      admins: [],
      newAdmin: '',
      newMod: '',
    };
  },
  computed: {
    ...mapState( 'forum', [ 'ownerData', 'modData' ] ),
    ...mapState( 'categories', [
      'categoryList',
      'fetching',
      'categoriesByBreadcrumb',
    ] ),
    categoryTree() {
      if ( !this.categoriesByBreadcrumb ) {
        return {};
      }
      const categoriesBySlug = {};
      const groupsByNav = {};
      const editingCategory = this.editingCategory;
      const editingGroup = this.editingGroup;
      const orderEdit = this.orderEdit;
      function convertTree( categoryGroup ) {
        const cats = categoryGroup.categories.map( ( cat ) => {
          return {
            slug: cat.slug,
            name: cat.name,
            title: cat.title,
            description: cat.description,
            hidden: Boolean( cat.hidden ),
            edit: editingCategory[cat.slug],
            draggable: orderEdit,
            droppable: false,
            isGroup: false,
          };
        } );
        categoryGroup.categories.forEach( ( cat ) => {

          // copy main properties before Tree modifies
          // them for rendering
          categoriesBySlug[cat.slug] = { ...cat };
        } );
        const groups = categoryGroup.groups.map( ( g ) => {
          return convertTree( g );
        } );
        const group = {
          name: categoryGroup.name,
          slug: categoryGroup.slug,
          nav: categoryGroup.nav,
          edit: editingGroup[categoryGroup.nav],
          children: groups.concat( cats ),
          draggable: orderEdit,
          isGroup: true,
        };
        groupsByNav[categoryGroup.nav] = group;

        // Check if user added category for this group.
        if ( editingCategory[categoryGroup.nav] ) {
          group.children.unshift( {
            slug: '',
            nav: categoryGroup.nav,
            edit: editingCategory[categoryGroup.nav],
            draggable: false,
            droppable: false,
            isGroup: false,
          } );
        }
        const newGroupNav = categoryGroup.nav + '/__NEW__';
        if ( editingGroup[newGroupNav] ) {
          const newGroup = {
            slug: '',
            nav: newGroupNav,
            edit: editingGroup[newGroupNav],
            draggable: false,
            isGroup: true,
          };
          group.children.unshift( newGroup );
          groupsByNav[newGroupNav] = newGroup;
        }
        return group;
      }
      const tree = convertTree( this.categoriesByBreadcrumb );
      return {
        tree,
        categoriesBySlug,
        groupsByNav,
      };
    },
    activeEdits() {
      return Object.values( this.editingCategory ).filter( ( e ) => e ).length > 0
         || Object.values( this.editingGroup ).filter( ( e ) => e ).length > 0
         || this.orderEdit;
    },
  },
  mounted() {
    this.$store.dispatch( 'forum/fetch', /* withModData= */ true );
  },
  methods: {
    enableOrderingEdit() {
      this.orderEdit = true;
      this.editingCategory = {};
    },
    async saveOrdering() {

      // get category ordering.
      const categoryOrdering = getCategoryOrdering( this.categoryTree.tree );
      try {
        await this.$store.dispatch( 'forum/editCategoryOrdering', categoryOrdering );
        await this.$store.dispatch( 'forum/fetch' );
        await this.$store.dispatch( 'categories/fetchAll' );
      } catch ( err ) {
        console.error( err );
      } finally {
        this.orderEdit = false;
      }
    },
    cancelOrdering() {
      this.orderEdit = false;
      this.$store.dispatch( 'categories/fetchAll' );
    },
    enableGroupEdit( nav ) {
      const thisGroup = this.categoryTree.groupsByNav[nav];
      Vue.set( this.editingGroup, nav, { name: thisGroup.name, slug: thisGroup.slug } );
    },
    async removeGroup( nav ) {
      const thisGroup = this.categoryTree.groupsByNav[nav];
      console.log( thisGroup );
      thisGroup.parent.children = thisGroup.parent.children.filter( ( c ) => c.nav !== thisGroup.nav );
      await this.saveOrdering();
    },
    cancelGroupEdit( nav ) {
      Vue.set( this.editingGroup, nav, null );
    },
    async saveGroup( nav ) {
      const group = this.categoryTree.groupsByNav[nav];
      group.name = this.editingGroup[nav].name;
      if ( !this.editingGroup[nav].slug ) {
        group.slug = stringToSlug( group.name );
      }
      await this.saveOrdering();
      Vue.set( this.editingGroup, nav, null );
    },
    addGroupToGroup( nav ) {

      // Used to indicate something is being edited
      const newGroup = {
        name: '',
      };
      Vue.set( this.editingGroup, nav + '/__NEW__', newGroup );
    },
    addCategoryToGroup( nav ) {

      // Used to indicate something is being edited
      const newCat = {
        name: '',
        title: '',
        description: '',
        hidden: false,
      };
      Vue.set( this.editingCategory, nav, newCat );
    },
    cancelAdd( nav ) {
      Vue.set( this.editingCategory, nav, null );
    },
    toggleCategoryEdit( slug ) {
      const thisCategory = this.categoryTree.categoriesBySlug[slug];
      if ( !this.editingCategory[slug] ) {
        Vue.set( this.editingCategory, slug, { ...thisCategory } );
      } else {
        Vue.set( this.editingCategory, slug, null );
      }
    },
    async addCategory( nav ) {
      try {
        await this.$store.dispatch( 'categories/add', {
          ...this.editingCategory[nav],
          nav,
        } );
        this.editingCategory[nav] = null;
        await this.$store.dispatch( 'forum/fetch' );
        await this.$store.dispatch( 'categories/fetchAll' );
      } catch ( err ) {
        console.error( err );
      } finally {
        this.fetching = false;
      }
    },
    saveCategory( slug ) {
      this.$store.dispatch( 'categories/edit', this.editingCategory[slug] )
        .then( () => {
          this.editingCategory[slug] = null;
          this.$nextTick( () => this.$store.dispatch( 'categories/fetchAll' ) );
        }, ( err ) => {
          console.error( err );
          this.editingCategory[slug] = null;
          this.fetching = false;
        } );
    },
    remove( category ) {
      this.$store.dispatch( 'categories/remove', category )
        .then( () => this.$nextTick( () => this.$store.dispatch( 'categories/fetchAll' ) ) )
        .catch( ( err ) => {
          console.error( err );
          this.fetching = false;
        } );
    },
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
