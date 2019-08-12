<template lang="pug">
  .pages
    button.page-button.material-icons(@click='previous', :disabled='page === 1') arrow_back
    input.page-input(
      type='number', v-model.number='page', step='1',
      @wheel='scroll', @keypress='noDot', @paste.prevent
    )
    button.page-button.material-icons(@click='next', :disabled='page === total') arrow_forward
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
  border: none;
}

.page-button {
  @include select(none);

  width: 40px;
  height: 32px;
  background: rgba(0, 0, 0, 0.2);
  line-height: 0;
  vertical-align: middle;
  box-shadow: none;
  border: none;

  &:disabled {
    transform: none;
  }
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
