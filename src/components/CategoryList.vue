<template>
  <div>
    <div class="card-content">
      <div class="content">
        <div>
          <b-table
            v-if="categoryGroups.length > 0"
            :data="categoryGroups"
            :loading="fetching"
            mobile-cards
          >
            <template slot-scope="cgprops">
              <b-collapse
                v-if="cgprops.row.groups.length > 0 || cgprops.row.categories.length > 0"
                :open="openGroupsByDefault"
                class="card box-style"
                aria-id="contentIdForA11y3"
              >
                <div
                  slot="trigger"
                  slot-scope="cardprops"
                  class="card-header"
                  role="button"
                  aria-controls="contentIdForA11y3"
                >
                  <h5 class="card-header-title">
                    <router-link :to="{ path: '/', query: { nav: cgprops.row.nav } }">
                      {{ cgprops.row.name }}
                    </router-link>
                  </h5>
                  <a class="card-header-icon">
                    <b-icon
                      :icon="cardprops.open ? 'menu-up' : 'menu-down'"
                    />
                  </a>
                </div>
                <CategoryGroup
                  :categories-by-breadcrumb="cgprops.row"
                  :fetching="fetching"
                />
              </b-collapse>
            </template>
          </b-table>

          <b-table
            v-if="categories.length > 0"
            :loading="fetching"
            :data="categories"
            class=""
            mobile-cards
          >
            <template slot-scope="cprops">
              <router-link :to="{ path: 'topic-list', query: { category : cprops.row.slug } }">
                <div class="columns is-tablet box cat-style">
                  <div class="column is-half cat-title">
                    <span class="cprops-title">{{ cprops.row.title }}</span><br>
                    <span class="cprops-description">{{ cprops.row.description }}</span>
                  </div>
                  <div class="column cat-stats">
                    <div class="level-item">
                      <span>{{ cprops.row.meta ? cprops.row.meta.topics : '' }} Topics</span>
                    </div>
                    <div class="level-item">
                      <span>{{ cprops.row.meta ? cprops.row.meta.views : '' }} Views</span>
                    </div>
                  </div>
                  <div class="column cat-stats">
                    <span
                      v-if="cprops.row.meta.replies > 0"
                      class="level-item"
                    >
                      Last Activity
                    </span>
                    <span
                      v-if="cprops.row.meta.replies > 0"
                      class="level-item category-activity"
                    >
                      <DateTimeTag
                        :last-reply="cprops.row.meta.last_action"
                        :number-of-replies="cprops.row.meta.replies"
                      />
                    </span>
                  </div>
                </div>
              </router-link>
            </template>
          </b-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import Icon from 'buefy/src/components/icon/Icon';
import Collapse from 'buefy/src/components/collapse/Collapse';
import Table from 'buefy/src/components/table/Table';

import DateTimeTag from '../components/DateTimeTag';

export default {
  name: 'CategoryGroup',
  components: {
    DateTimeTag,
    BTable: Table,
    BIcon: Icon,
    BCollapse: Collapse,
  },
  props: {
    fetching: {
      type: Boolean,
      default: true,
    },
    categoriesByBreadcrumb: {
      type: Object,
      default: null,
    },
  },
  computed: {
    nav() {
      return this.categoriesByBreadcrumb ? this.categoriesByBreadcrumb.nav : '';
    },
    categories() {
      return this.categoriesByBreadcrumb ? this.categoriesByBreadcrumb.categories.filter( ( cat ) => !cat.hidden ) : [];
    },
    categoryGroups() {
      return this.categoriesByBreadcrumb ? this.categoriesByBreadcrumb.groups : [];
    },
    openGroupsByDefault() {
      return !this.categoriesByBreadcrumb || this.categoriesByBreadcrumb.groups.length <= 2;
    },
  },
};
</script>
