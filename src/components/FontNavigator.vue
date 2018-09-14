<template>
  <div v-if="show" class="font-navigator">
    <div class="font-navigator__wrapper">
      <div
        v-for="font in fontPack"
        :key="font.family"
        class="font-navigator__item"
        @click="selectFont(font)"
      >
        <div class="font-navigator__font-family">{{ font.family }}</div>
        <div
          class="font-navigator__font-content"
          :style="{ 'font-family': font.family }"
        >
          {{ fontString }}
        </div>
      </div>
      <div class="font-navigator__pagination">
        <Button v-if="showLeft" text="&lt; Previous" type="blue" @click="prev" />
        <Button v-if="showRight" text="Next &gt;" type="blue" @click="next" />
        <Button text="Close" type="red" @click="close" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import settings from '../assets/configs/settings';

export default {
  name: 'FontNavigator',

  data() {
    return {
      show: false,
      fonts: [],
      sort: 'popularity',
      key: 'AIzaSyAXzwYqs1hoO_NodfzaVtHOhjuus6asvDs',
      perPage: 10,
      pointer: 0,
      styleId: 'jiraUtilsFontStyles',
      fontString: 'abcdefghijklmnopqrstuvwxvzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    };
  },

  mounted() {
    this.$root.$on('showFontNavigator', () => {
      this.show = true;
    });
    this.loadFonts();
  },

  watch: {
    show() {
      if (this.show === true) {
        this.$nextTick(this.loadFontPack);
      }
    },
  },

  computed: {
    fontPack() {
      return this.fonts.slice(this.pointer, this.pointer + this.perPage);
    },

    showLeft() {
      return this.pointer !== 0;
    },

    showRight() {
      return this.pointer < this.fonts.length;
    },
  },

  methods: {
    close() {
      this.show = false;
      this.$root.$emit('showSettings');
    },

    selectFont(font) {
      settings.set('ui.fontFamily', font.family);
      this.$root.$emit('settingsChanges');
    },

    prev() {
      this.pointer -= this.perPage;
      this.loadFontPack();
    },

    next() {
      this.pointer += this.perPage;
      this.loadFontPack();
    },

    loadFonts() {
      axios
        .get(`https://www.googleapis.com/webfonts/v1/webfonts?sort=${this.sort}&key=${this.key}`)
        .then((response) => {
          console.log(response);
          this.fonts = response.data.items;
        })
        .catch(console.error);
    },

    loadFontPack() {
      let styles = document.getElementById(this.styleId);

      if (!styles) {
        styles = document.createElement('style');
        styles.type = 'text/css';
        styles.id = this.styleId;
        this.$el.appendChild(styles);
      }

      let fontStyles = '';

      this.fontPack.forEach((font) => {
        fontStyles += `@import url('https://fonts.googleapis.com/css?family=${font.family}');`;
      });

      styles.innerHTML = fontStyles;
    },
  },
};
</script>

<style lang="scss">
  .font-navigator {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0,0,0,.75);

    &__wrapper {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      max-width: 700px;
    }

    &__item {
      width: calc(50% - 10px);
      padding: 10px;
      margin-bottom: 20px;
      cursor: pointer;
      box-sizing: border-box;
    }

    &__font-family {
      font-size: 20px;
      font-weight: 600;
      border-bottom: 2px solid #000;
      margin-bottom: 10px;
    }

    &__font-content {
      overflow-wrap: break-word;
    }

    &__pagination {
      display: flex;
      justify-content: center;
      width: 100%;
    }
  }
</style>
