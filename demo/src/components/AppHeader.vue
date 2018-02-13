<template>
  <header>
    <h1>Demo of vue-hagrid</h1>
    <p>
      Declaratively specify the data that would cause actions to need refreshing, and the components that rely on the results of actions.
    </p>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
};
</script>

<style>
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
</style>
