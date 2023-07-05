<template>
  <div>
    <div id="customer-name-section">
      <v-text-field
          v-model="customer.name"
          id="customer-name"
          :error-messages="nameErrors"
          @input="$v.name.$touch()"
          @blur="$v.name.$touch()"
          @change="changed"
          counter="50"
          filled
          :label="$t('name')"
      ></v-text-field>
    </div>

    <div id="customer-email-section">
      <v-text-field
          v-model="customer.email"
          id="customer-email"
          counter="50"
          filled
          :error-messages="emailErrors"
          @input="$v.email.$touch()"
          @blur="$v.email.$touch()"
          @change="changed"
          required
          :label="$t('email')"
      ></v-text-field>
    </div>

    <v-checkbox
        id="customer-data-protection"
        v-model="customer.dataProtection"
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
        id="customer-submit-button"
        class="button-next"
        elevation="2"
        depressed
        color="primary"
        @click="saveCustomer()"
    >{{ $t('nextToReservation') }}</v-btn>
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
  data() {
    return {
      customer: {}
    };
  },
  computed: {
    name: {
      get() {
        return this.customer.name
      },
      set(newValue) {
        return this.customer.name = newValue
      }
    },
    email: {
      get() {
        return this.customer.email
      },
      set(newValue) {
        return this.customer.email = newValue
      }
    },
    dataProtection: {
      get() {
        return this.customer.dataProtection
      },
      set(newValue) {
        return this.customer.dataProtection = newValue
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
      ! this.$v.email.email && errors.push(this.$t('mustBeValidEmail'));
      ! this.$v.email.required && errors.push(this.$t('email') + ' ' + this.$t('isRequired'));
      ! this.$v.email.maxLength && errors.push(this.$t('textLengthExceeded'));

      return errors;
    },
    dataProtectionErrors() {
      const errors = [];
      if (!this.$v.dataProtection.$dirty) return errors;
      ! this.customer.dataProtection && errors.push(this.$t('acceptPrivacyPolicy'));

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

      this.$store.dispatch('updateAppointmentData', {
        ...this.$store.state.data.appointment,
        ...{ client: this.customer }
      })
      this.$emit('next')
      this.$v.$reset()
    }
  },
  mounted() {
    this.customer = this.$store.state.data.customer
  }
}
</script>
<style>
</style>