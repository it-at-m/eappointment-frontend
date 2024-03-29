<template>
  <div>

    <v-text-field
        v-model="firstName"
        :error-messages="firstNameErrors"
        @input="$v.firstName.$touch()"
        @blur="$v.firstName.$touch()"
        counter="200"
        filled
        :label="$t('firstName')"
    ></v-text-field>

    <v-text-field
        v-model="lastName"
        :error-messages="lastNameErrors"
        @input="$v.lastName.$touch()"
        @blur="$v.lastName.$touch()"
        @change="changed"
        counter="200"
        filled
        :label="$t('lastName')"
    ></v-text-field>

    <v-text-field
        v-model="email"
        counter="200"
        filled
        :error-messages="emailErrors"
        @input="$v.email.$touch()"
        @blur="$v.email.$touch()"
        @change="changed"
        required
        :label="$t('email')"
    ></v-text-field>

    <v-checkbox
        v-model="dataProtection"
        label=""
        :error-messages="dataProtectionErrors"
        required
        @input="$v.dataProtection.$touch()"
        @blur="$v.dataProtection.$touch()"
        @change="changed"
    >
      <template v-slot:label>
        <div
            v-html="$t('privacyPolicyAccepted')"
            @click.stop
        ></div>
      </template>
    </v-checkbox>

    <v-btn
        class="button-next"
        elevation="2"
        depressed
        color="primary"
        @click="saveCustomer()"
    >{{ $t('next') }}</v-btn>
  </div>
</template>
<script>
import { validationMixin } from "vuelidate";
import { required, email } from "vuelidate/lib/validators";

export default {
  name: 'CustomerInfo',
  mixins: [validationMixin],
  validations: {
    firstName: { required },
    lastName: { required },
    email: { required, email },
    dataProtection: { required }
  },
  data: function () {
    return {
      firstName: '',
      lastName: '',
      email: '',
      dataProtection: false
    }
  },
  computed: {
    firstNameErrors() {
      const errors = [];
      if (!this.$v.firstName.$dirty) return errors;
      !this.$v.firstName.required && errors.push(this.$t('firstName') + ' ' + this.$t('isRequired'));
      return errors;
    },
    lastNameErrors() {
      const errors = [];
      if (!this.$v.lastName.$dirty) return errors;
      ! this.$v.lastName.required && errors.push(this.$t('lastName') + ' ' + this.$t('isRequired'));

      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      ! this.$v.email.email && errors.push(this.$t('mustBeValidEmail'));
      ! this.$v.email.required && errors.push(this.$t('email') + ' ' + this.$t('isRequired'));

      return errors;
    },
    dataProtectionErrors() {
      const errors = [];
      if (!this.$v.dataProtection.$dirty) return errors;
      ! this.dataProtection && errors.push(this.$t('acceptPrivacyPolicy'));

      return errors;
    }
  },
  methods: {
    changed() {
      this.$emit('changed')
    },
    saveCustomer() {
      this.$v.$touch()

      if (this.emailErrors.length || this.firstNameErrors.length || this.lastNameErrors.length || this.dataProtectionErrors.length) {
        return
      }

      let customer = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email
      }

      let appointment = this.$store.state.data.appointment
      appointment.client = customer

      this.$store.dispatch('updateAppointmentData', appointment)
      this.$emit('next')
    }
  }
}
</script>
<style>
</style>