<template>
  <div id="app" :style="{ 'font-family': font }">
    <MainMenu />
    <Tooltip />
    <NotificationCenter />
    <FontNavigator />
  </div>
</template>

<script>
import MainMenu from './components/MainMenu.vue';
import Tooltip from './components/ui/Tooltip.vue';
import NotificationCenter from './components/ui/NotificationCenter.vue';
import FontNavigator from './components/FontNavigator.vue';
import settings from './assets/configs/settings';

export default {
  name: 'app',
  components: {
    MainMenu,
    Tooltip,
    NotificationCenter,
    FontNavigator,
  },

  data() {
    return {
      font: settings.get('ui.fontFamily'),
    };
  },

  mounted() {
    this.loadFont();
    this.$root.$on('settingsChanges', () => {
      this.font = settings.get('ui.fontFamily');
      this.loadFont();
    });
  },

  methods: {
    loadFont() {
      let link = document.getElementById('JiraUtilsFont');

      if (!link) {
        link = document.createElement('link');
        link.id = 'JiraUtilsFont';
        document.head.appendChild(link);
      }

      link.href = `https://fonts.googleapis.com/css?family=${this.font}`;
      link.rel = 'stylesheet';
    },
  }
};
</script>
