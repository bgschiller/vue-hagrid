<template>
  <div id="app">
    <Config />
    <ListOfLinks v-if="show.links" />
    <CatCarousel v-if="show.carousel" />
    <DownloadCat v-if="show.download" />
    <div v-if="noneOfTheAbove">
      If you check your network panel, you'll see that no requests are sent out, even if you change the config.
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ListOfLinks from './components/ListOfLinks.vue';
import CatCarousel from './components/CatCarousel.vue';
import DownloadCat from './components/DownloadCat.vue';
import Config from './components/Config.vue';

export default {
  name: 'app',
  components: {
    ListOfLinks,
    DownloadCat,
    CatCarousel,
    Config,
  },
  computed: {
    ...mapState({
      show: state => state.Config.show,
    }),
    noneOfTheAbove() {
      return Object.keys(this.show)
        .filter(v => this.show[v])
        .length === 0;
    },
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
