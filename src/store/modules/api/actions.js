import moment from "moment";

export default {
    confirmReservation(store, { processId, authKey }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "processId": processId,
                    "authKey": authKey
                })
            };
            fetch(store.rootState.settings.endpoints.VUE_APP_ZMS_API_BASE + store.rootState.settings.endpoints.VUE_APP_ZMS_API_CONFIRM_RESERVATION_ENDPOINT, requestOptions)
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data)
                }, error => {
                    reject(error)
                })
        })
    },
    preconfirmReservation(store, { processId, authKey }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "processId": processId,
                    "authKey": authKey
                })
            };

            fetch(store.rootState.settings.endpoints.VUE_APP_ZMS_API_BASE + store.rootState.settings.endpoints.VUE_APP_ZMS_API_PRECONFIRM_RESERVATION_ENDPOINT, requestOptions)
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data)
                }, error => {
                    reject(error)
                })
        })
    },
    cancelAppointment(store, { processId, authKey }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "processId": processId,
                    "authKey": authKey
                })
            };

            fetch(store.rootState.settings.endpoints.VUE_APP_ZMS_API_BASE + store.rootState.settings.endpoints.VUE_APP_ZMS_API_CANCEL_APPOINTMENT_ENDPOINT, requestOptions)
                .then(response =>
                    response.json().then(data => ({
                        data: data.data,
                        status: response.status
                    })
                ))
                .then(data => {
                    resolve(data)
                }, error => {
                    reject(error)
                })
        })
    },
    fetchAvailableDays(store, { provider, serviceIds, serviceCounts }) {
        return new Promise((resolve, reject) => {
            const dateIn6Months = moment().add(6, 'M')
            const params = {
                'startDate': moment().format('YYYY-M-D'),
                'endDate': dateIn6Months.format('YYYY-M-D'),
                'officeId': provider.id,
                'serviceId': serviceIds,
                'serviceCount': serviceCounts,
            }

            fetch(store.rootState.settings.endpoints.VUE_APP_ZMS_API_BASE + store.rootState.settings.endpoints.VUE_APP_ZMS_API_CALENDAR_ENDPOINT
                + '?' + new URLSearchParams(params).toString())
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data)
                }, error => {
                    reject(error)
                })
        })
    },
    fetchServicesAndProviders(store) {
        return new Promise((resolve, reject) => {
            fetch(store.rootState.settings.endpoints.VUE_APP_ZMS_API_BASE
                + store.rootState.settings.endpoints.VUE_APP_ZMS_API_PROVIDERS_AND_SERVICES_ENDPOINT
            )
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data)
                }, error => {
                    reject(error)
                })
        })
    },
    fetchAppointment(store, { processId, authKey }) {
        const params = {
            'processId': processId,
            'authKey': authKey
        }

        return new Promise((resolve, reject) => {
            fetch(store.rootState.settings.endpoints.VUE_APP_ZMS_API_BASE + store.rootState.settings.endpoints.VUE_APP_ZMS_API_APPOINTMENT_ENDPOINT
                + '?' + new URLSearchParams(params).toString())
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data)
                }, error => {
                    reject(error)
                })
        })
    },
    fetchAvailableTimeSlots(store, { date, provider, serviceIds, serviceCounts }) {
        return new Promise((resolve, reject) => {
            const params = {
                'date': moment(date).format('YYYY-M-D'),
                'officeId': provider.id,
                'serviceId': serviceIds,
                'serviceCount': serviceCounts
            }

            fetch(store.rootState.settings.endpoints.VUE_APP_ZMS_API_BASE + store.rootState.settings.endpoints.VUE_APP_ZMS_API_AVAILABLE_TIME_SLOTS_ENDPOINT
                + '?' + new URLSearchParams(params).toString())
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data)
                }, error => {
                    reject(error)
                })
        })
    },
    updateAppointmentData(store, appointment) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "processId": appointment.processId,
                    "authKey": appointment.authKey,
                    "familyName": appointment.familyName,
                    "email": appointment.email
                })
            };

            fetch(store.rootState.settings.endpoints.VUE_APP_ZMS_API_BASE + store.rootState.settings.endpoints.VUE_APP_ZMS_API_UPDATE_APPOINTMENT_ENDPOINT
                .replace('{appointmentId}', appointment.processId)
                .replace('{authKey}', appointment.authKey),
                requestOptions
            )
            .then((response) => {
                return response.json();
            })
            .then(data => {
                resolve(data)
            }, error => {
                reject(error)
            })
        })
    },
    reserveAppointment(store, { timeSlot, serviceIds, serviceCounts, providerId }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "timestamp": timeSlot.unix(),
                    "serviceCount": serviceCounts,
                    "officeId": providerId,
                    "serviceId": serviceIds
                })
            };

            fetch(store.rootState.settings.endpoints.VUE_APP_ZMS_API_BASE + store.rootState.settings.endpoints.VUE_APP_ZMS_API_RESERVE_APPOINTMENT_ENDPOINT, requestOptions)
                .then((response) => {
                    return response.json();
                })
                .then(data => {
                    resolve(data)
                }, error => {
                    reject(error)
                })
        })
    }
}