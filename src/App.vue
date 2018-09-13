<template>
  <div id="app">
    <MainMenu />
    <Tooltip />
    <NotificationCenter />
  </div>
</template>

<script>
import MainMenu from './components/MainMenu.vue';
import Tooltip from './components/ui/Tooltip.vue';
import NotificationCenter from './components/ui/NotificationCenter.vue';

export default {
  name: 'app',
  components: {
    MainMenu,
    Tooltip,
    NotificationCenter,
  },
};
</script>
