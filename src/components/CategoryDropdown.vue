<template>
  <b-dropdown @change="onChange">
    <button
      slot="trigger"
      class="button is-small"
      type="button"
    >
      <span>{{ selected ? selected.name : allCategories.name }}</span>
      <b-icon icon="menu-down" />
    </button>

    <b-dropdown-item :value="allCategories">
      <span>{{ allCategories.name }}</span>
    </b-dropdown-item>

    <b-dropdown-item
      v-for="category in categoryList"
      :key="category._id"
      :value="category"
    >
      <span>{{ category.name }}</span>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import { mapState } from 'vuex';

import Dropdown from 'buefy/src/components/dropdown/Dropdown';
import DropdownItem from 'buefy/src/components/dropdown/DropdownItem';
import Icon from 'buefy/src/components/icon/Icon';

const ALL = { name: 'All Categories' };

export default {
  components: {
    BDropdown: Dropdown,
    BDropdownItem: DropdownItem,
    BIcon: Icon,
  },
  props: {
    selectedId: { type: Function, default: () => 1 },
    labelForAll: { type: Object, default: () => {} },
  },
  data() {
    return {
      selected: ALL,
      all: ALL,
    };
  },
  computed: {
    allCategories() {
      return this.labelForAll
        ? Object.assign( this.all, { name: this.labelForAll } )
        : this.all;
    },
    ...mapState( 'categories', [
      'fetching',
      'categoryList',
      'categoriesById',
    ] ),
  },
  watch: {
    selectedId( value ) {
      this.selected = this.categoriesById[value];
    },
  },
  methods: {
    onChange( value ) {
      this.$emit( 'change', value || null );
    },
  },
};
</script>
