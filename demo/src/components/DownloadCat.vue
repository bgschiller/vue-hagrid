<template>
  <div class="download-cat">
    <a
      v-if="catStatus === 'complete' && img"
      :href="img && img.url"
      @click="newImg"
      download
    >
      <button>Download Random Cat</button>
    </a>
    <p v-else>
      Loading...
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  name: 'DownloadCat',
  hagridActions: ['Cats/fetch'],
  data() {
    return {
      imgIx: 0,
    };
  },
  computed: {
    ...mapState({
      imgs: state => state.Cats.imgs,
      catStatus: state => state.Cats.status,
    }),
    img() {
      return this.imgs[this.imgIx];
    },
  },
  methods: {
    newImg() {
      this.imgIx = getRandomInt(0, this.imgs.length - 1);
    },
  },
  watch: {
    imgs() { if (this.imgs) this.newImg(); },
  },
};

</script>

<style>

</style>
