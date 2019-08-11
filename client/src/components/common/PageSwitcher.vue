<template lang="pug">
  .pages
    button(@click='previous') <
    input.page-input(
      type='number', v-model.number='page', step='1',
      @wheel='scroll', @keypress='noDot', @paste.prevent
    )
    button(@click='next') >
</template>

<script>
export default {
  props: {
    total: {
      type: Number,
      default: 1
    }
  },
  methods: {
    next () {
      if (this.page === this.total) return
      this.page++
    },
    previous () {
      if (this.page === 1) return
      this.page--
    },
    scroll (e) {
      e.preventDefault()
      if (e.deltaY < 0) this.next()
      else this.previous()
    },
    noDot (e) {
      if (e.keyCode === 46) {
        e.preventDefault()
      }
    }
  },
  data () {
    return {
      page: 1
    }
  },
  watch: {
    page (newValue, oldValue) {
      if (newValue > this.total) this.page = this.total
      if (newValue < 1) this.page = 1
      if (newValue % 1 !== 0) this.page = parseInt(newValue)

      this.$emit('change', this.page)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-input {
  width: 30px;
  text-align: center;
  color: #aaa;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
  -moz-appearance:textfield; /* Firefox */
}
</style>
