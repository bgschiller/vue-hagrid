<template>
  <div class="config">
    <div class="cat-options">
      <label>
        Num Results
        <input type="number" v-model.number="numResults">
      </label>
      <label>
        Size
        <select v-model="size">
          <option v-for="sz in possibleSizes" :key="sz" :value="sz">
            {{ sz }}
          </option>
        </select>
      </label>
      <label>
        Category
        <select v-model="categoryId">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </label>
    </div>
    <div class="view-options">
      <label>
        Show Carousel
        <input
          type="checkbox"
          :checked="showViews.carousel"
          @change="toggleView('carousel')"
        />
      </label>
      <label>
        Show Links
        <input
          type="checkbox"
          :checked="showViews.links"
          @change="toggleView('links')"
        />
      </label>
      <label>
        Show Download
        <input
          type="checkbox"
          :checked="showViews.download"
          @change="toggleView('download')"
        />
      </label>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Config',
  mounted() {
    this.$store.dispatch('Config/retrieveCategories');
  },
  computed: {
    ...mapState({
      categories: state => state.Config.categories,
      possibleSizes: state => state.Config.possibleSizes,
      showViews: state => state.Config.show,
    }),
    numResults: {
      get() { return this.$store.state.Config.numResults; },
      set(val) { this.$store.dispatch('Config/setNumResults', val); },
    },
    categoryId: {
      get() { return this.$store.state.Config.selectedCategoryId; },
      set(val) { this.$store.dispatch('Config/selectCategory', val); },
    },
    size: {
      get() { return this.$store.state.Config.size; },
      set(val) { this.$store.dispatch('Config/setSize', val); },
    },
  },
  methods: {
    ...mapActions({
      toggleView: 'Config/toggleShow',
    }),
  },
};
</script>
