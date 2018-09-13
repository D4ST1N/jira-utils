<template>
  <div class="switcher">
    <div
      v-for="option in options"
      :key="option.name"
      :class="{
        switcher__item: true,
        'switcher__item--selected': option.name === selected
      }"
      @click="switchOption(option)"
    >
      {{ option.text }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Switcher',
  props: {
    options: {
      type: Array,
    },
    selected: {
      type: String,
    },
  },

  methods: {
    switchOption(option) {
      this.$emit('switch', option);
    },
  },
};
</script>

<style lang="scss">
  .switcher {
    display: flex;

    &__item {
      color: #fff;
      padding: 5px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      opacity: .75;
      transition: all .375s;

      &--selected {
        opacity: 1;
        border-bottom-color: #fff;
      }
    }
  }
</style>
