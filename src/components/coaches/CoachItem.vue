<template>
  <base-card mode="shadow">
    <li>
      <h3>{{ fullName }}</h3>
      <base-price :rate="rate"></base-price>
      <div>
        <base-badge
          v-for="area in areas"
          :key="area"
          :type="area"
          :field="area"
        ></base-badge>
      </div>
      <div class="actions">
        <base-button link :to="coachContactLink" mode="outline">
          联系
        </base-button>
        <base-button link :to="coachDetailsLink">查看细节</base-button>
      </div>
    </li>
  </base-card>
</template>

<script>
export default {
  props: ['id', 'firstName', 'lastName', 'rate', 'areas'],
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
    coachContactLink() {
      return {
        name: 'coach-contact',
        params: { id: this.id },
      };
    },
    coachDetailsLink() {
      return {
        name: 'coach-profile',
        params: { id: this.id },
      };
    },
  },
};
</script>

<style scoped>
.card:hover {
  border-color: var(--purple-2);
  box-shadow: 1rem 1rem var(--purple-1);
}

li {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

h3 {
  font-size: 2.4rem;
  color: var(--purple-2);
  font-family: var(--font-display);
  font-weight: normal;
}

.actions {
  padding-top: 1.6rem;
  display: flex;
  justify-content: flex-end;
  gap: 1.6rem;
}
</style>
