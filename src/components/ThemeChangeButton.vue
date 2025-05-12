<script setup lang="ts">
import { store } from '../store.ts';
</script>

<template>
	<!-- Кнопка смены цветовой темы -->
	<button
		type="button"
		class="theme-change-btn"
		:class="store.isDarkModeOn && 'active'"
		@click="store.toggleDarkMode()">
		<i class="fa-regular fa-sun"></i>
		<i class="fa-regular fa-moon"></i>
	</button>
</template>

<style lang="scss" scoped>
// Кнопка смены цветовой схемы
.theme-change-btn {
	position: relative;
	width: 80px;
	height: 40px;

	border: none;
	border-radius: 20px;
	background-color: rgba(0, 0, 0, 0.75);

	cursor: pointer;
	transition: all 0.3s ease-in;

	&::before {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 34px;
		height: 34px;

		border-radius: 50%;
		background-color: #fff;
		transition: all 0.3s ease-in;
	}

	// Иконка месяца внутри кнопки
	.fa-moon {
		position: absolute;
		top: 10px;
		right: 10px;

		font-size: 20px;
		color: rgb(255, 255, 255);
		opacity: 1;
		transition: all 0.3s ease-in;
	}

	// Иконка солнца внутри кнопки
	.fa-sun {
		position: absolute;
		top: 10px;
		left: 10px;

		font-size: 20px;
		color: rgb(251, 251, 113);
		opacity: 0;
		transition: all 0.3s ease-in;
	}

	// Изменения при добавлении для кнопки класса 'active' при переключении цветовой схемы
	&.active {
		background-color: #99c2dcf9;
	}
	&.active::before {
		background-color: #fbfb71;
		transform: translateX(40px);
	}
	&.active .fa-moon {
		opacity: 0;
	}
	&.active .fa-sun {
		opacity: 1;
	}
}
</style>
