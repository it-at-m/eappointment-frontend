import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import ServiceFinder from './../../src/components/ServiceFinder.vue'
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

store.dispatch = jest.fn()
store.state.services = [
    {
        id: 1,
        name: "Meldebescheinigung",
        maxQuantity: 3
    },
    {
        id: 2,
        name: "Haushaltsbescheinigung",
        maxQuantity: 2
    },
    {
        id: 3,
        name: "Fahrzeug wieder anmelden",
        maxQuantity: 2
    }
]

store.state.data.appointmentCounts[1] = 0
store.state.data.appointmentCount = 0

const wrapper = mount(ServiceFinder, {
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

const wrapperWithServiceId = mount(ServiceFinder, {
    Vue,
    store,
    i18n,
    vuetify: new Vuetify({
        icons: {
            iconfont: 'mdiSvg'
        }
    }),
    propsData: {
        serviceId: 1
    }
})

describe('Service Finder', () => {
    it('Component is shown', () => {
        expect(wrapper.exists()).toBe(true)
    })

    it('Selected service is shown', async () => {
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.appointment-count').text()).toContain('1')
        expect(wrapper.html()).toContain('Meldebescheinigung')
    })

    it('Service dropdown not visible if service is preselected', async () => {
        expect(wrapperWithServiceId.html()).not.toContain('service-finder-select')
    })

    it('Suggestion returns right services', async () => {
        wrapper.vm.$refs = {
            autocomplete: {
                isMenuActive: true
            }
        }

        wrapper.vm.suggest({target: {value: 'meld'}})

        expect(wrapper.vm.filteredServices[0].id).toBe(1)
        expect(wrapper.vm.filteredServices[1].id).toBe(3)
        expect(wrapper.vm.$refs.autocomplete.isMenuActive).toBeFalsy()
    })

    it('Suggestion returns no services', async () => {
        wrapper.vm.$refs = {
            autocomplete: {
                isMenuActive: true
            }
        }

        wrapper.vm.suggest({target: {value: 'Wohnung anmelden'}})

        expect(wrapper.vm.filteredServices).toStrictEqual([])
    })

    it('Increase count of services works', async () => {
        const commit = jest.fn()
        store.commit = commit
        wrapper.vm.$refs = {
            autocomplete: {
                isMenuActive: true
            }
        }

        wrapper.vm.increaseAppointments({
            id: 1,
            name: "Meldebescheinigung",
            maxQuantity: 3
        })

        expect(wrapper.emitted().changed).toBeDefined()
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit.mock.calls[0]).toStrictEqual(['data/increaseAppointmentCount', 1])
    })

    it('Decrease count of services works', async () => {
        const commit = jest.fn()
        store.commit = commit
        wrapper.vm.$refs = {
            autocomplete: {
                isMenuActive: true
            }
        }

        wrapper.vm.decreaseAppointments({
            id: 1,
            name: "Meldebescheinigung",
            maxQuantity: 3
        })

        expect(wrapper.emitted().changed).toBeDefined()
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit.mock.calls[0]).toStrictEqual(['data/decreaseAppointmentCount', 1])
    })

    it('Service is selected', async () => {
        const commit = jest.fn()
        store.commit = commit
        wrapper.vm.$refs = {
            autocomplete: {
                isMenuActive: true
            }
        }

        wrapper.vm.onChange({
            id: 1,
            name: "Meldebescheinigung",
            maxQuantity: 3
        })

        expect(wrapper.emitted().changed).toBeDefined()
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit.mock.calls[0]).toStrictEqual([
            'data/setService',
            {
                id: 1,
                name: "Meldebescheinigung",
                maxQuantity: 3
            }
        ])
    })

    it('Next step button is disabled if there is no selected service', async () => {
        wrapperWithServiceId.vm.$store.state.data.appointmentCount = 0
        await wrapper.vm.$nextTick()

        wrapperWithServiceId.find('.button-next')

        expect(wrapperWithServiceId.html()).toContain('v-btn--disabled')
    })

    it('Next step trigger next event', async () => {
        await wrapper.vm.nextStep()

        expect(wrapper.emitted().next).toBeDefined()
    })
})