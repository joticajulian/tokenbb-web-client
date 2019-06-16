<template>
  <router-link :to="categoryRoute(category)">
    {{ category.name }}
  </router-link>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    categoryId: { type: String, default: '' },
  },
  computed: {
    ...mapState( {
      category( state ) {
        const byId = state.categories.categoriesById || {};
        const category = byId[this.categoryId];
        return category ? category : { name: 'oops' };
      },
    } ),

  },
  methods: {
    categoryRoute( cat ) {
      return {
        path: '/topic-list',
        query: {
          category: cat.slug,
        },
      };
    },
  },
};
</script>
