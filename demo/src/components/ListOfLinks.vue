<template>
  <div class="list-of-links">
    <ul v-if="catStatus === 'complete'">
      <li v-for="img in imgs" :key="img.id">
        <a :href="img.url">
          {{ img.url }}
        </a>
      </li>
    </ul>
    <p v-else>
      Loading...
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ListOfLinks',
  hagridActions: ['Cats/fetch'],
  computed: {
    ...mapState({
      imgs: state => state.Cats.imgs,
      catStatus: state => state.Cats.status,
    }),
  },
};

</script>
