<template>
  <div class="cat-carousel">
    <Carousel v-if="catStatus === 'complete'" :navigationEnabled="true">
      <Slide v-for="img in imgs" :key="img.id">
        <img :src="img.url" />
      </Slide>>
    </Carousel>
    <p v-else>
      Loading...
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Carousel, Slide } from 'vue-carousel';

export default {
  name: 'CatCarousel',
  hagridActions: ['Cats/fetch'],
  components: {
    Carousel,
    Slide,
  },
  computed: {
    ...mapState({
      imgs: state => state.Cats.imgs,
      catStatus: state => state.Cats.status,
    }),
  },
};

</script>

<style>
.cat-carousel img {
  max-height: 400px;
}
</style>
