<template>
  <transition name="t00lt1p" :duration="250">
    <div
      v-if="show"
      class="t00lt1p"
      :style="{ left: tooltipPosition.left, top: tooltipPosition.top }"
    >
      {{ text }}
    </div>
  </transition>
</template>

<script>
import getElementPosition from '../../assets/utils/getElementPosition';

export default {
  name: 'Tooltip',

  data() {
    return {
      show: false,
      text: '',
      position: {
        top: 0,
        left: 0,
      },
    };
  },

  mounted() {
    this.$root.$on('showTooltip', this.showTooltip);
    this.$root.$on('hideTooltip', this.hideTooltip);
  },

  computed: {
    tooltipPosition() {
      return {
        left: `${this.position.left}px`,
        top: `${this.position.top}px`,
      };
    },
  },

  methods: {
    showTooltip(element, text) {
      this.show = true;
      this.text = text;
      const position = getElementPosition(element);
      this.position.left = position.left;
      this.position.top = position.top;
    },

    hideTooltip() {
      this.show = false;
      this.text = '';
    },
  },
};
</script>

<style lang="scss">
  .t00lt1p {
    position: fixed;
    transform: translate(-100%, -100%) scale(1);
    background: #455A64;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    overflow: hidden;
    transition: all .25s;
    z-index: 3;

    &-enter, &-leave-active {
      opacity: 1;
      transform: translate(-100%, -100%) scale(1);
    }

    &-enter-active, &-leave-to {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
    }
  }
</style>
