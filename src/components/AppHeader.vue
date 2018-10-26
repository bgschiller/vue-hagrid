<template>
  <header>
    <h1>Demo of vue-hagrid</h1>
    <p>
      Declaratively specify the data that would cause actions to need refreshing, and the components that rely on the results of actions.
    </p>
    <p>
      Learn more at <a href="https://github.com/bgschiller/vue-hagrid">github.com/bgschiller/vue-hagrid</a>
    </p>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
};
</script>

<style scoped>
header {
  background-color: #1d791d;
  color: gainsboro;
  padding-bottom: 20px;
}
h1 {
  margin-top: 0;
  padding-top: 10px;
}
p {
  margin-left: 10px;
  margin-right: 10px;
}
a {
  color: white;
}
</style>
