<template lang="pug">
  .dropdown(v-click-outside='hide')
    .dropdown-button(@click='isDropped = !isDropped')
      slot(name='button')
    transition(name='dropdown')
      .dropdown-content(v-if='isDropped', :class='[align]')
        slot(name='content')
</template>

<script>
import ClickOutside from 'vue-click-outside'

export default {
  props: {
    align: {
      type: String,
      default: 'right',
      validator: (val) => ['left', 'right'].includes(val)
    }
  },
  methods: {
    hide () {
      this.isDropped = false
    }
  },
  data () {
    return {
      isDropped: false
    }
  },
  directives: {
    ClickOutside
  }
}
</script>

<style lang="scss">
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.dropdown-content {
  position: absolute;
  z-index: 1;
}

.dropdown-content.left {
  left: 0;
}

.dropdown-content.right {
  right: 0;
}

.dropdown-enter-active {
  animation: dropdown-mask .1s;
}

.dropdown-leave-active {
  animation: dropdown-mask .1s reverse;
}

@keyframes dropdown-mask {
  0% {
    clip-path: inset(0 0 100% 0)
  }
  100% {
    clip-path: inset(0 0 0 0)
  }
}
</style>
