<script setup lang="ts">
import CalendarsSection from './components/CalendarsSection.vue';
import GeopassportSection from './components/GeopassportSection.vue';
</script>

<template>
	<main>
		<CalendarsSection />
		<GeopassportSection />
	</main>
</template>

<style lang="scss" scoped>
main {
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

// Адаптив для мобильных устройств
@media screen and (max-width: 480px) {
	main {
		position: relative;
	}
}
</style>
