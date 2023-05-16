import {mount, shallowMount} from '@vue/test-utils'
import Vuex from 'vuex'
import Calendar from './../../src/components/Calendar.vue'
import Calendar2 from './../../src/components/Calendar.vue'
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
        maxQuantity: 3,
        providers: [
            {
                id: 1,
                name: "Provider 1"
            },
            {
                id: 2,
                name: "Provider 2"
            }
        ]
    },
    {
        id: 2,
        name: "Haushaltsbescheinigung",
        maxQuantity: 2,
        providers: [
            {
                id: 1,
                name: "Provider 1"
            },
            {
                id: 2,
                name: "Provider 2"
            }
        ]
    },
    {
        id: 3,
        name: "Fahrzeug wieder anmelden",
        maxQuantity: 2,
        providers: [
            {
                id: 1,
                name: "Provider 1"
            },
            {
                id: 2,
                name: "Provider 2"
            }
        ]
    }
]

store.state.data.servce = {
    id: 1,
    name: "Meldebescheinigung",
    maxQuantity: 3,
    providers: [
        {
            id: 1,
            name: "Provider 1"
        },
        {
            id: 2,
            name: "Provider 2"
        }
    ]
}

store.state.preselectedProvider = {
    id: 1,
    name: "Provider 1"
}

const wrapper = mount(Calendar, {
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

describe('Calendar', () => {
    it('Component is shown', () => {
        expect(wrapper.exists()).toBe(true)
    })

    it('providers are shown', async () => {
        wrapper.vm.$store.state.data.service = {
            id: 1,
            name: "Meldebescheinigung",
            maxQuantity: 3,
            providers: [
                {
                    id: 1,
                    name: "Provider 1"
                },
                {
                    id: 2,
                    name: "Provider 2"
                }
            ]
        }

        await wrapper.vm.$nextTick()

        expect(wrapper.html()).toContain('Provider 1')
        expect(wrapper.html()).toContain('Provider 2')
        expect(wrapper.find('.v-tab--active').html()).toContain('Provider 1')
    })

    it('show preselected provider', async () => {

        console.log(wrapper.html())
    })

    it('right month is shown', async () => {
        wrapper.vm.date = '2023-04-02'

        await wrapper.vm.$nextTick()
        const weeks = wrapper.findAll('tbody tr')

        expect(wrapper.html()).toContain('So., 2. Apr.')
        expect(weeks.at(0).text()).toContain('12')
        expect(weeks.at(1).text()).toContain('3456789')
        expect(weeks.at(2).text()).toContain('10111213141516')
        expect(weeks.at(3).text()).toContain('17181920212223')
        expect(weeks.at(4).text()).toContain('24252627282930')
    })

    it('right days are available', async () => {
        wrapper.vm.maxDate = new Date('2023-05-30T01:00:00')
        wrapper.vm.selectableDates = [
            '2023-05-20',
            '2023-05-21',
            '2023-05-22'
        ]

        await wrapper.vm.$nextTick()

        expect(wrapper.vm.allowedDates(new Date('2023-05-15T01:00:00'))).toBeFalsy()
        expect(wrapper.vm.allowedDates(new Date('2023-05-20T01:00:00'))).toBeTruthy()
        expect(wrapper.vm.allowedDates(new Date('2023-05-31T01:00:00'))).toBeFalsy()
    })


})