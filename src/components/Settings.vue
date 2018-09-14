<template>
  <div v-if="show" class="settings">
    <div class="settings__content">
      <div
        v-for="setting in pluginSettings"
        :key="setting.key"
        v-if="!setting.hidden"
        class="settings__item"
      >
        <label class="settings__label">
          <span class="settings__label-value">{{ setting.text }}</span>
          <span v-if="setting.type === 'range'" class="settings__range-wrapper">
            <span class="settings__range-value">{{ setting.value }}</span>
            <input
              type="range"
              :min="setting.min"
              :max="setting.max"
              :step="setting.step"
              v-model="setting.value"
            >
          </span>
          <input v-else :type="setting.type" v-model="setting.value">
        </label>
      </div>
      <div class="settings__fonts-section">
        <Button text="Select Font" type="blue" @click="showFonts" />
        current: {{ font() }}
      </div>
      <Button text="Save" type="green" @click="saveSettings"></Button>
    </div>
  </div>
</template>

<script>
import pluginSettings from '../assets/configs/pluginSettings';
import settings from '../assets/configs/settings';

export default {
  name: 'Settings',
  data() {
    return {
      pluginSettings,
      show: false,
      settings: {},
    };
  },

  mounted() {
    this.updateSettings();
    this.$root.$on('showSettings', () => {
      this.show = !this.show;
    });
  },

  methods: {
    font() {
      return settings.get('ui.fontFamily');
    },

    showFonts() {
      this.$root.$emit('showFontNavigator');
    },

    updateSettings() {
      this.pluginSettings.forEach((setting) => {
        setting.value = settings.get(setting.key);
      });
    },

    toggle() {
      this.show = !this.show;
    },

    saveSettings() {
      this.pluginSettings.forEach((setting) => {
        this.settings[setting.key] = setting.value;
      });
      settings.save(this.settings);
      this.$root.$emit('settingsChanges');
      this.toggle();
    },
  },
};
</script>

<style lang="scss">
  .settings {
    &__content {
      position: fixed;
      bottom: 220px;
      right: 20px;
      box-shadow: 4px 4px 12px 0 rgba(0,0,0,.4);
      padding: 10px;
      background: #fff;
    }

    &__label {
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
    }

    &__range-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__fonts-section {
      margin-bottom: 15px;
    }
  }
</style>
