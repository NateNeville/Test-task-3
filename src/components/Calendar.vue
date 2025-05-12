<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { store } from '../store.ts';

/* Входные параметры */
const props = defineProps<{
	months: string[];
	weekDays: string[];
	month: number;
	year: number;
	id: number;
	selectedCalenarId?: number;
	selectedDay?: number;
	selectedMonth?: number;
}>();

/* События для прослушивания */
const emit = defineEmits<{
	(e: 'switchToPrevMonth'): number;
	(e: 'switchToNextMonth'): number;
	(e: 'switchToPrevYear'): number;
	(e: 'switchToNextYear'): number;
	(e: 'selectCalendar', id: number): void;
	(e: 'setSelectedDay', day: number, month: number): void;
}>();

/* Создаём состояния, в которые будем добавлять массив с датами... */
const prevMonthDates = ref<number[]>([]); // предыдущего месяца
const currMonthDates = ref<number[]>([]); // текущего месяца
const nextMonthDates = ref<number[]>([]); // следующего месяца

/* Описываем функцию для вычисления дат календаря */
const renderDates = (): void => {
	// День недели на первое число текущего месяца
	const currMonthFirstDateWeekDay = computed<number>(() =>
		new Date(props.year, props.month, 0).getDay()
	);

	// Последнее число текущего месяца
	const currMonthLastDate = computed<number>(() =>
		new Date(props.year, props.month + 1, 0).getDate()
	);

	// Последнее число предыдущего месяца
	const prevMonthLastDate = computed<number>(() =>
		new Date(props.year, props.month, 0).getDate()
	);

	// День недели на первое число следующего месяца
	const nextMonthFirstDateWeekDay = computed<number>(
		() => 7 - new Date(props.year, props.month + 1, 0).getDay()
	);

	// Сбрасываем и задаем начальное значение для рефов, куда будем добавлять даты
	prevMonthDates.value = [];
	currMonthDates.value = [];
	nextMonthDates.value = [];

	// Добавляем даты предыдущего месяца
	for (let i = currMonthFirstDateWeekDay.value; i > 0; i--) {
		const date = prevMonthLastDate.value - i + 1;
		prevMonthDates.value.push(date);
	}

	// Добавляем даты текущего месяца
	for (let i = 1; i <= currMonthLastDate.value; i++) {
		const date = i;
		currMonthDates.value.push(date);
	}

	// Добавляем даты следующего месяца
	for (let i = 1; i <= nextMonthFirstDateWeekDay.value; i++) {
		const date = i;
		nextMonthDates.value.push(date);
	}
};

/* Вызываем функцию для вычисления дат календаря каждый раз, когда значение текущей даты изменяется */
watchEffect(renderDates);
</script>

<template>
	<!-- Календарь -->
	<div
		class="calendar"
		:class="{ dark: store.isDarkModeOn, selected: id === selectedCalenarId as number }"
		@click="$emit('selectCalendar', id)">
		<!-- Навигация календаря -->
		<nav class="calendar-header">
			<div class="nav-arrow-btn prev-year" @click="$emit('switchToPrevYear')">&lt;&lt;</div>
			<div class="nav-arrow-btn prev-month" @click="$emit('switchToPrevMonth')">&lt;</div>

			<!-- Год и месяц -->
			<div class="month-year">
				{{ `${months[month]} ${year}` }}
			</div>

			<div class="nav-arrow-btn next-month" @click="$emit('switchToNextMonth')">&gt;</div>
			<div class="nav-arrow-btn next-year" @click="$emit('switchToNextYear')">&gt;&gt;</div>
		</nav>

		<!-- Дни недели -->
		<div class="weekdays">
			<div v-for="(day, index) in weekDays" :key="index">
				{{ day }}
			</div>
		</div>

		<!-- Даты -->
		<div class="dates-container">
			<div
				class="date fade prev-month-date"
				:class="(date === (selectedDay as number) && (month >= 1 ? month - 1 : 11) === (selectedMonth as number)) && 'selected'"
				v-for="(date, index) in prevMonthDates"
				:key="index"
				@click="$emit('setSelectedDay', date, month >= 1 ? month - 1 : 11)">
				{{ date }}
			</div>

			<div
				class="date curr-month-date"
				:class="(date === (selectedDay as number) && month === (selectedMonth as number)) && 'selected'"
				v-for="(date, index) in currMonthDates"
				:key="index"
				@click="$emit('setSelectedDay', date, month)">
				{{ date }}
			</div>

			<div
				class="date fade next-month-date"
				:class="(date === (selectedDay as number) && (month <= 10 ? month + 1 : 0) === (selectedMonth as number)) && 'selected'"
				v-for="(date, index) in nextMonthDates"
				:key="index"
				@click="$emit('setSelectedDay', date, month <= 10 ? month + 1 : 0)">
				{{ date }}
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
// Календарь
.calendar {
	user-select: none;
	display: flex;
	flex-direction: column;
	gap: 15px;

	width: 300px;
	padding: 15px;

	font-size: 14px;
	border-radius: 5px;
	background-color: rgba(0, 0, 0, 0);
	border: 1px solid rgba(0, 0, 0, 0.1);
	box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.1);

	transition: all 0.1s ease-in;

	&:active {
		cursor: pointer;
	}

	// Шапка календаря с информацией месяца, года и стрелками навигации
	.calendar-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		.nav-arrow-btn {
			padding: 5px;
			border: 1px solid rgba(0, 0, 0, 0.1);
			border-radius: 3px;
			cursor: pointer;
			z-index: -1;

			transition: all 0.15s ease-in-out;

			&:hover {
				background-color: rgba(0, 0, 0, 0.35);
			}
		}

		.month-year {
			width: 115px;
			text-align: center;
		}
	}

	// Контейнер для дней недели
	.weekdays {
		display: flex;
	}

	// Контейнер для всех видимых дат предыдущего, текущего и следующего месяца
	.dates-container {
		display: flex;
		flex-wrap: wrap;
		height: 200px;

		.date {
			cursor: pointer;
			transition: all 0.15s ease-in-out;
			z-index: -1;
		}

		.date.fade {
			color: rgba(0, 0, 0, 0.3);
		}
	}

	// Ячейки непосредственно с днями недели и датами месяца
	.weekdays div,
	.dates-container div {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 14.28%;
	}

	// Стили для выбранного календаря
	&.selected {
		.calendar-header {
			.nav-arrow-btn {
				z-index: 1;
			}
		}
		.dates-container {
			.date {
				z-index: 1;

				&:hover {
					border-radius: 5px;
					background-color: rgba(247, 51, 115, 0.15);
				}
			}
			.date.selected {
				border-radius: 5px;
				background-color: rgba(247, 51, 115, 0.45);
				font-weight: 500;
			}
		}

		background-color: rgba(111, 69, 224, 0.1);
		border: 1px solid rgba(111, 69, 224, 0.35);
		box-shadow: 0px 4px 5px rgba(111, 69, 224, 0.25);
	}

	// Стили для тёмной цветовой темы
	&.dark {
		background-color: rgba(0, 0, 0, 0);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0px 4px 5px rgba(255, 255, 255, 0.05);

		&.selected {
			background-color: rgba(111, 69, 224, 0.1);
			border: 1px solid rgba(111, 69, 224, 0.35);
			box-shadow: 0px 4px 5px rgba(111, 69, 224, 0.25);
		}

		.calendar-header {
			.nav-arrow-btn {
				border: 1px solid rgba(255, 255, 255, 0.1);

				&:hover {
					background-color: rgba(255, 255, 255, 0.35);
				}
			}
		}

		.dates-container {
			.date.fade {
				color: rgba(255, 255, 255, 0.3);
			}
		}
	}

	// Адаптив для различных устройств
	@media screen and (max-width: 480px) {
		gap: 10px;
		width: 250px;
		padding: 10px;

		.dates-container {
			height: 185px;
		}
	}
}
</style>
