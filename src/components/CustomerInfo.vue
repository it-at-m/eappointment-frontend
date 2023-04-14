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
import { required, email, maxLength } from "vuelidate/lib/validators";

export default {
  name: 'CustomerInfo',
  mixins: [validationMixin],
  validations: {
    firstName: {
      required,
      maxLength: maxLength(200)
    },
    lastName: {
      required,
      maxLength: maxLength(200)
    },
    email: {
      required,
      email,
      maxLength: maxLength(200)
    },
    dataProtection: {
      required
    }
  },
  computed: {
    firstName: {
      get() {
        return this.$store.state.data.customer.firstName
      },
      set(newValue) {
        return this.$store.state.data.customer.firstName = newValue
      }
    },
    lastName: {
      get() {
        return this.$store.state.data.customer.lastName
      },
      set(newValue) {
        return this.$store.state.data.customer.lastName = newValue
      }
    },
    email: {
      get() {
        return this.$store.state.data.customer.email
      },
      set(newValue) {
        return this.$store.state.data.customer.email = newValue
      }
    },
    dataProtection: {
      get() {
        return this.$store.state.data.customer.dataProtection
      },
      set(newValue) {
        return this.$store.state.data.customer.dataProtection = newValue
      }
    },
    firstNameErrors() {
      const errors = [];
      if (!this.$v.firstName.$dirty) return errors;
      !this.$v.firstName.required && errors.push(this.$t('firstName') + ' ' + this.$t('isRequired'));
      ! this.$v.firstName.maxLength && errors.push(this.$t('textLengthExceeded'));
      return errors;
    },
    lastNameErrors() {
      const errors = [];
      if (!this.$v.lastName.$dirty) return errors;
      ! this.$v.lastName.required && errors.push(this.$t('lastName') + ' ' + this.$t('isRequired'));
      ! this.$v.lastName.maxLength && errors.push(this.$t('textLengthExceeded'));

      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      console.log(this.$v.email)
      ! this.$v.email.email && errors.push(this.$t('mustBeValidEmail'));
      ! this.$v.email.required && errors.push(this.$t('email') + ' ' + this.$t('isRequired'));
      ! this.$v.email.maxLength && errors.push(this.$t('textLengthExceeded'));

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
      this.$v.$reset()
    }
  }
}
</script>
<style>
</style>