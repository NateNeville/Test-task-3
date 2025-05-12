import { reactive } from 'vue';

interface Store {
	isDarkModeOn: boolean;
	toggleDarkMode: () => void;
}

/* Кэшированное значение состояния цветовой темы */
const cachedDarkMode = localStorage.getItem('dark');

export const store: Store = reactive({
	/* Состояние для режима цветовой темы */
	isDarkModeOn: cachedDarkMode ? JSON.parse(cachedDarkMode) : false,
	/* Фукнция для переключения цветовой темы и обновления её значения в localStorage */
	toggleDarkMode() {
		this.isDarkModeOn = !this.isDarkModeOn;
		localStorage.setItem('dark', JSON.stringify(this.isDarkModeOn));
	},
});
