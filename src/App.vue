<template>
  <div id="app">
    <AppHeader />
    <main>
      <Config />
      <p v-if="anyViewsShowing">
        No matter which of the views are mounted, only one request will be sent for any change in the config.
      </p>
      <CatCarousel v-if="show.carousel" />
      <DownloadCat v-if="show.download" />
      <ListOfLinks v-if="show.links" />
      <p v-if="!anyViewsShowing">
        If you check your network panel, you'll see that no requests are sent out, even if you change the config.
      </p>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ListOfLinks from './components/ListOfLinks.vue';
import CatCarousel from './components/CatCarousel.vue';
import DownloadCat from './components/DownloadCat.vue';
import Config from './components/Config.vue';
import AppHeader from './components/AppHeader.vue';

export default {
  name: 'app',
  components: {
    ListOfLinks,
    DownloadCat,
    CatCarousel,
    Config,
    AppHeader,
  },
  computed: {
    ...mapState({
      show: state => state.Config.show,
    }),
    anyViewsShowing() {
      return Object.keys(this.show)
        .filter(v => this.show[v])
        .length > 0;
    },
  },
}
</script>

<style>
body {
  margin-top: 0;
  margin-right: 0;
  margin-left: 0;
  width: 100%;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
main {
  margin-top: 20px;
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
