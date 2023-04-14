<template>
  <div>
    <v-text-field
        v-model="name"
        :error-messages="nameErrors"
        @input="$v.name.$touch()"
        @blur="$v.name.$touch()"
        @change="changed"
        counter="50"
        filled
        :label="$t('name')"
    ></v-text-field>

    <v-text-field
        v-model="email"
        counter="50"
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
    name: {
      required,
      maxLength: maxLength(50)
    },
    email: {
      required,
      email,
      maxLength: maxLength(50)
    },
    dataProtection: {
      required
    }
  },
  computed: {
    name: {
      get() {
        return this.$store.state.data.customer.name
      },
      set(newValue) {
        return this.$store.state.data.customer.name = newValue
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
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      ! this.$v.name.required && errors.push(this.$t('name') + ' ' + this.$t('isRequired'));
      ! this.$v.name.maxLength && errors.push(this.$t('textLengthExceeded'));

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

      if (this.emailErrors.length || this.nameErrors.length || this.dataProtectionErrors.length) {
        return
      }

      let customer = {
        name: this.name,
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