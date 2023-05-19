import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import SwitchLanguage from './../../src/components/SwitchLanguage.vue'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import translations from './../../src/translations'
import store from './../../src/store'
import Vue from 'vue'

Vue.use(VueI18n)
Vue.use(Vuetify)
Vue.use(Vuex)

const i18n = new VueI18n({
    locale: store.state.locale,
    messages: translations,
})

const wrapper = mount(SwitchLanguage, {
    Vue,
    store,
    i18n,
    vuetify: new Vuetify({
        icons: {
            iconfont: 'mdiSvg'
        }
    }),
    propsData: {}
})

describe('SwitchLanguage', () => {
    it('Component is shown', () => {
        expect(wrapper.exists()).toBe(true)

        expect(wrapper.html()).toContain('option value="de"')
        expect(wrapper.html()).toContain('Deutsch')
        expect(wrapper.html()).toContain('option value="en"')
        expect(wrapper.html()).toContain('Englisch')
        expect(wrapper.html()).toContain('Sprache:')
    })

    it('english is shown', async () => {
        wrapper.vm.$i18n.locale = 'en'

        await wrapper.vm.$nextTick()

        expect(wrapper.html()).toContain('option value="de"')
        expect(wrapper.html()).toContain('German')
        expect(wrapper.html()).toContain('option value="en"')
        expect(wrapper.html()).toContain('English')
        expect(wrapper.html()).toContain('Language:')
    })
})