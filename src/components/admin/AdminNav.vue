<template>
  <div class="container dashboard">
    <h1>Forum Administration Area</h1>
    <h1
      v-if="!auth.roles.admin"
      class="admin-warning"
    >
      WARNING: you can only edit these settings, if you're an admin!
    </h1>
    <section class="main-content columns is-fullheight">
      <aside class="column is-2 is-narrow-mobile is-fullheight section is-hidden-mobile">
        <p class="menu-label is-hidden-touch">
          Navigation
        </p>
        <ul class="menu-list">
          <li>
            <router-link
              :to="{ path: '/admin/settings' }"
              exact-active-class="noop"
              class="navbar-item"
            >
              Forum Settings
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ path: '/admin/statistics' }"
              exact-active-class="noop"
              class="navbar-item"
            >
              Forum Statistics
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ path: '/admin/permissions' }"
              exact-active-class="noop"
              class="navbar-item"
            >
              Admins & Mods
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ path: '/admin/categories' }"
              exact-active-class="noop"
              class="navbar-item"
            >
              Categories
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ path: '/admin/beneficiaries' }"
              exact-active-class="noop"
              class="navbar-item"
            >
              Beneficiaries
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ path: '/admin/tokenization' }"
              exact-active-class="noop"
              class="navbar-item"
            >
              Tokenization
            </router-link>
          </li>
        </ul>
      </aside>

      <slot />
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AdminNav',
  computed: {
    ...mapState( [ 'auth' ] ),
  },
};
</script>

<style scoped lang="scss">
</style>
