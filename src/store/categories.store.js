import { Toast } from 'buefy/dist/components/toast';

import { addCategory, editCategory, listCategories, removeCategory } from '../services/api.service';
import { errorAlertOptions } from '../utils/notifications.js';
import { stringToSlug } from '../utils/slug.js';

function computeCategoryOrderingData( categories, categoryOrdering ) {
  const categoriesBySlug = {};
  const categoriesById = {};
  const processed = new Set();

  categories.forEach( ( category ) => {
    categoriesById[category._id] = category;
    categoriesBySlug[category.slug] = category;
  } );

  const categoryGroupsByNav = {};
  function processCategoryOrdering( ordering, nav = '' ) {
    const slug = stringToSlug( ordering.slug );
    const currentNav = nav + ( nav !== '' ? '/' : '' ) + slug;
    const categoryGroup = {
      name: ordering.name,
      slug: ordering.slug,
      collapseByDefault: ordering.collapseByDefault,
      nav: currentNav,
    };
    categoryGroupsByNav[currentNav] = categoryGroup;
    categoryGroup.groups = ordering.groups.map( ( g ) => {
      return processCategoryOrdering( g, currentNav );
    } );
    categoryGroup.categories = ordering.categories.map( ( c ) => {
      const found = categoriesBySlug[c];
      if ( found ) {
        found.nav = currentNav;
        processed.add( c );
      }
      return found;
    } ).filter( ( c ) => c );
    return categoryGroup;
  }

  let homeCategory = {
    name: 'Home',
    nav: 'home',
    slug: 'home',
    groups: [],
    categories: [],
  };

  // when getter not ready, categoryOrdering {__ob__: Observer... }
  if ( categoryOrdering && typeof categoryOrdering === 'object' ) {
    if ( Array.isArray( categoryOrdering ) ) {
      homeCategory.groups = categoryOrdering;
      homeCategory = processCategoryOrdering( homeCategory );
    } else if ( categoryOrdering.name && categoryOrdering.slug ) {
      homeCategory = processCategoryOrdering( categoryOrdering );
    }
  }

  // Place other categories on root level.
  homeCategory.categories = homeCategory.categories.concat(
    categories
      .filter( ( c ) => !processed.has( c.slug ) )
      .map( ( c ) => {
        c.nav = homeCategory.nav;
        return c;
      } ) );
  homeCategory.categoryGroupsByNav = categoryGroupsByNav;

  return {
    categories,
    categoriesById,
    categoriesBySlug,
    categoriesByBreadcrumb: homeCategory,
  };
}

export default {
  namespaced: true,
  state: {
    fetching: true,
    categoryList: [],
    categoriesById: {},
    categoriesBySlug: {},
    categoriesByBreadcrumb: null,
  },
  mutations: {
    setFetching( state, fetching ) {
      state.fetching = fetching;
    },
    add( state, category ) {
      state.categoryList.push( category );
    },
    remove( state, category ) {
      const index = state.categoryList.findIndex( ( c ) => c._id === category._id );
      delete state.categoriesById[category._id];
      state.categoryList.splice( index, 1 );
    },
    updateCategoryList( state, categories ) {
      const data = computeCategoryOrderingData( categories ? categories : state.categoryList, this.getters['forum/getCategoryOrdering'] );

      state.categoryList = data.categories;
      state.categoriesById = data.categoriesById;
      state.categoriesBySlug = data.categoriesBySlug;
      state.categoriesByBreadcrumb = data.categoriesByBreadcrumb;
    },
  },
  actions: {
    async add( { commit }, category ) {
      commit( 'setFetching', true );
      try {
        await addCategory( category );
      } catch ( err ) {
        Toast.open( errorAlertOptions( `Error adding category ${category.name}`, err ) );
        console.error( err );
      } finally {
        commit( 'setFetching', false );
      }
    },
    async edit( { commit }, category ) {
      commit( 'setFetching', true );

      try {
        await editCategory( category );
      } catch ( err ) {
        Toast.open( errorAlertOptions( `Error editing category ${category.name}`, err ) );
        console.error( err );
      } finally {
        commit( 'setFetching', false );
      }
    },
    remove( { commit }, category ) {
      commit( 'setFetching', true );

      removeCategory( category.name )
        .then( () => {
          commit( 'setFetching', false );
        } )
        .catch( ( err ) => {
          commit( 'setFetching', false );
          Toast.open( errorAlertOptions( `Error removing category ${category.name}`, err ) );
          console.error( err );
        } );
    },
    fetchAll( { commit } ) {
      commit( 'setFetching', true );

      listCategories()
        .then( ( categories ) => {
          commit( 'updateCategoryList', categories.data );
          commit( 'setFetching', false );
        } )
        .catch( ( err ) => {
          commit( 'setFetching', false );
          Toast.open( errorAlertOptions( 'Error fetching categories', err ) );
          console.error( err );
        } );
    },
  },
};
