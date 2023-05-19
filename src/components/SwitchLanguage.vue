<template>
  <div id="language-switch">
    {{ $t("language") }}:
    <select v-model="$i18n.locale">
      <option
          v-for="(lang, i) in langs"
          :key="`lang-${i}`"
          :value="lang">
        {{ $t("languages." + lang) }}
      </option>
    </select>
  </div>
</template>
<script>
export default {
  name: 'SwitchLanguage',
  data() {
    return { langs: ['de', 'en'] }
  }
}
</script>
<style scoped>
select {
  cursor: pointer;
}

#language-switch {
  float: right;
}
</style>