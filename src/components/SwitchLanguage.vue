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
  name: 'SwitchLocale',
  data() {
    return { langs: ['de', 'en'] }
  }
}
</script>
<style>
select {
  cursor: pointer;
}

#language-switch {
  float: right;
}
</style>