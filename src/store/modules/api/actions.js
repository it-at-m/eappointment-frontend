import moment from "moment";

export default {
    confirmReservation(store, { appointmentData }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "processId": appointmentData.processId,
                    "authKey": appointmentData.authKey
                })
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_CONFIRM_RESERVATION_ENDPOINT, requestOptions)
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
    cancelAppointment(store, { appointmentData }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "processId": appointmentData.processId,
                    "authKey": appointmentData.authKey
                })
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_CANCEL_APPOINTMENT_ENDPOINT, requestOptions)
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
    getSettings() {
        return new Promise((resolve, reject) => {
            fetch(process.env.VUE_APP_SETTINGS_ENDPOINT)
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
    fetchAvailableDays(state, { provider, serviceId, count }) {
        return new Promise((resolve, reject) => {
            const dateIn6Months = moment().add(6, 'M')
            const params = {
                'startDate': moment().format('YYYY-M-D'),
                'endDate': dateIn6Months.format('YYYY-M-D'),
                'officeId': provider.id,
                'serviceId': serviceId,
                'serviceCount': count,
            }

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_CALENDAR_ENDPOINT
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
    fetchServicesAndProviders() {
        return new Promise((resolve, reject) => {
            fetch(process.env.VUE_APP_ZMS_API_BASE
                + process.env.VUE_APP_ZMS_API_PROVIDERS_AND_SERVICES_ENDPOINT
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
    fetchAppointment(state, { processId, authKey }) {
        const params = {
            'processId': processId,
            'authKey': authKey
        }

        return new Promise((resolve, reject) => {
            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_APPOINTMENT_ENDPOINT
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
    fetchAvailableTimeSlots(store, { date, provider, count, serviceId }) {
        return new Promise((resolve, reject) => {
            const params = {
                'date': moment(date).format('YYYY-M-D'),
                'officeId': provider.id,
                'serviceId': serviceId,
                'serviceCount': count
            }

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_AVAILABLE_TIME_SLOTS_ENDPOINT
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

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_UPDATE_APPOINTMENT_ENDPOINT
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
    reserveAppointment(store, { timeSlot, count, serviceId, providerId }) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "timestamp": timeSlot.unix(),
                    "serviceCount": count,
                    "officeId": providerId,
                    "serviceId": serviceId
                })
            };

            fetch(process.env.VUE_APP_ZMS_API_BASE + process.env.VUE_APP_ZMS_API_RESERVE_APPOINTMENT_ENDPOINT, requestOptions)
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