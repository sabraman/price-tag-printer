import { InlineKeyboard } from "grammy";
import type { Item } from "@/store/priceTagsStore";

// Main menu keyboard
export function createMainMenuKeyboard() {
	return new InlineKeyboard()
		.text("📦 Товары", "menu_items")
		.text("🎨 Дизайн", "menu_design")
		.row()
		.text("📄 Создать PDF", "generate_pdf")
		.text("⚙️ Настройки", "menu_settings");
}

// Items management keyboard
export function createItemsMenuKeyboard(itemsCount: number) {
	const keyboard = new InlineKeyboard();

	if (itemsCount > 0) {
		keyboard
			.text(`📋 Список товаров (${itemsCount})`, "items_list")
			.text("✏️ Режим редактирования", "items_edit_mode")
			.row()
			.text("🗑️ Очистить все", "items_clear");
	} else {
		keyboard.text("➕ Добавить первый товар", "items_add_first");
	}

	keyboard
		.row()
		.text("📁 Загрузить Excel", "items_upload")
		.text("🔙 Назад", "back_to_main");

	return keyboard;
}

// Edit mode keyboard
export function createEditModeKeyboard(items: Item[], editingItemId?: number) {
	const keyboard = new InlineKeyboard();

	if (items.length === 0) {
		return keyboard
			.text("➕ Добавить товар", "edit_add_item")
			.text("🏠 Главное меню", "back_to_main");
	}

	// Show current editing item if any
	if (editingItemId) {
		const item = items.find((i) => i.id === editingItemId);
		if (item) {
			keyboard
				.text(`Редактируется: ${item.data}`, "edit_current_info")
				.row()
				.text("💰 Цена", `edit_item_price_${editingItemId}`)
				.text("📝 Название", `edit_item_name_${editingItemId}`)
				.row()
				.text("🎨 Дизайн", `edit_item_design_${editingItemId}`)
				.text("💸 Скидка", `edit_item_discount_${editingItemId}`)
				.row()
				.text("📊 Цены опт", `edit_item_bulk_${editingItemId}`)
				.text("❌ Удалить", `edit_item_delete_${editingItemId}`)
				.row()
				.text("✅ Готово", "edit_finish_item")
				.row();
		}
	}

	// Navigation buttons
	keyboard
		.text("➕ Добавить товар", "edit_add_item")
		.text("📋 Выбрать другой", "edit_select_item")
		.row()
		.text("🏠 Главное меню", "back_to_main");

	return keyboard;
}

// Item selection keyboard for editing
export function createItemSelectionKeyboard(
	items: Item[],
	page = 0,
	perPage = 8,
) {
	const keyboard = new InlineKeyboard();
	const start = page * perPage;
	const end = start + perPage;
	const pageItems = items.slice(start, end);

	// Add items in rows of 2
	for (let i = 0; i < pageItems.length; i += 2) {
		const item1 = pageItems[i];
		const item2 = pageItems[i + 1];

		if (item2) {
			keyboard
				.text(`${item1.data} (${item1.price}₽)`, `select_item_${item1.id}`)
				.text(`${item2.data} (${item2.price}₽)`, `select_item_${item2.id}`)
				.row();
		} else {
			keyboard
				.text(`${item1.data} (${item1.price}₽)`, `select_item_${item1.id}`)
				.row();
		}
	}

	// Pagination
	const navButtons = [];
	if (page > 0) {
		navButtons.push(["⬅️", `items_page_${page - 1}`]);
	}
	if (end < items.length) {
		navButtons.push(["➡️", `items_page_${page + 1}`]);
	}

	if (navButtons.length > 0) {
		navButtons.forEach(([text, data]) => {
			keyboard.text(text, data);
		});
		keyboard.row();
	}

	keyboard.text("🔙 Назад", "menu_items");
	return keyboard;
}

// Design menu keyboard
export function createDesignMenuKeyboard() {
	return new InlineKeyboard()
		.text("🎨 Темы", "design_themes")
		.text("💰 Скидки", "design_discounts")
		.row()
		.text("🔤 Шрифт", "design_font")
		.text("🏷️ Метки", "design_labels")
		.row()
		.text("📏 Линии отреза", "design_cutting_lines")
		.text("🔙 Назад", "back_to_main");
}

// Theme selection keyboard - now shows categories like web app
export function createThemeSelectionKeyboard(
	_currentTheme: string,
	_category: string,
) {
	const keyboard = new InlineKeyboard();

	// Theme categories matching web app exactly
	keyboard.text("🌙 Темные темы", "theme_category_dark").row();
	keyboard.text("☀️ Светлые темы", "theme_category_light").row();
	keyboard.text("⚪ Светлые монохром", "theme_category_light_mono").row();
	keyboard.text("⚫ Темные монохром", "theme_category_dark_mono").row();
	keyboard.text("🔙 Назад", "menu_design");

	return keyboard;
}

// Theme category keyboard - shows themes within specific category
export function createThemeCategoryKeyboard(
	category: string,
	currentTheme: string,
) {
	const keyboard = new InlineKeyboard();

	// Theme definitions matching web app store exactly
	const themeCategories = {
		dark: [
			{ key: "default", name: "🌈 По умолчанию", desc: "Розовый градиент" },
			{ key: "new", name: "🆕 Новинка", desc: "Зеленый градиент" },
			{ key: "sale", name: "🏷️ Распродажа", desc: "Красный градиент" },
			{ key: "sunset", name: "🌅 Закат", desc: "Оранжевый градиент" },
			{ key: "ocean", name: "🌊 Океан", desc: "Синий градиент" },
			{ key: "forest", name: "🌲 Лес", desc: "Зеленый градиент" },
			{ key: "royal", name: "👑 Королевский", desc: "Фиолетовый градиент" },
			{ key: "vintage", name: "📜 Винтаж", desc: "Коричневый градиент" },
		],
		light: [{ key: "neon", name: "💡 Неон", desc: "Яркий неоновый" }],
		light_mono: [
			{ key: "white", name: "⚪ Белый", desc: "Классический белый" },
			{ key: "snow", name: "❄️ Снег", desc: "Чисто белый" },
			{ key: "paper", name: "📄 Бумага", desc: "Светло-серый" },
			{ key: "silver", name: "🥈 Серебро", desc: "Серебристый" },
		],
		dark_mono: [
			{ key: "black", name: "⚫ Черный", desc: "Элегантный черный" },
			{ key: "ink", name: "🖤 Чернила", desc: "Глубокий черный" },
			{ key: "charcoal", name: "🔥 Уголь", desc: "Темно-серый" },
			{ key: "monochrome", name: "📺 Монохром", desc: "Серый градиент" },
		],
	};

	const themes =
		themeCategories[category as keyof typeof themeCategories] || [];

	// Add themes in rows of 2
	for (let i = 0; i < themes.length; i += 2) {
		const theme1 = themes[i];
		const theme2 = themes[i + 1];

		const button1Text =
			theme1.key === currentTheme ? `✅ ${theme1.name}` : theme1.name;

		if (theme2) {
			const button2Text =
				theme2.key === currentTheme ? `✅ ${theme2.name}` : theme2.name;
			keyboard
				.text(button1Text, `theme_select_${theme1.key}`)
				.text(button2Text, `theme_select_${theme2.key}`)
				.row();
		} else {
			keyboard.text(button1Text, `theme_select_${theme1.key}`).row();
		}
	}

	keyboard.text("🔙 Назад", "design_themes");
	return keyboard;
}

// Discount settings keyboard
export function createDiscountSettingsKeyboard(
	design: boolean,
	discountAmount: number,
	maxPercent: number,
) {
	return new InlineKeyboard()
		.text(
			design ? "✅ Скидки включены" : "❌ Скидки выключены",
			"toggle_discount",
		)
		.row()
		.text(`💰 Размер скидки: ${discountAmount}₽`, "set_discount_amount")
		.row()
		.text(`📊 Макс. процент: ${maxPercent}%`, "set_max_percent")
		.row()
		.text("📝 Текст скидки", "set_discount_text")
		.row()
		.text("🔙 Назад", "menu_design");
}

// Font selection keyboard
export function createFontSelectionKeyboard(_currentValue: string) {
	const fonts = [
		{ key: "montserrat", name: "Montserrat", desc: "Современный" },
		{ key: "roboto", name: "Roboto", desc: "Читаемый" },
		{ key: "opensans", name: "Open Sans", desc: "Универсальный" },
		{ key: "lato", name: "Lato", desc: "Элегантный" },
	];

	const keyboard = new InlineKeyboard();

	fonts.forEach((font) => {
		const buttonText =
			font.key === _currentValue ? `✅ ${font.name}` : `${font.name}`;
		keyboard.text(buttonText, `font_select_${font.key}`).row();
	});

	keyboard.text("🔙 Назад", "menu_design");
	return keyboard;
}

// Settings menu keyboard
export function createSettingsMenuKeyboard() {
	return new InlineKeyboard()
		.text("🔄 Сброс настроек", "settings_reset")
		.text("📊 Статистика", "settings_stats")
		.row()
		.text("ℹ️ Помощь", "settings_help")
		.text("🔙 Назад", "back_to_main");
}

// Confirmation keyboard
export function createConfirmationKeyboard(action: string, data?: string) {
	return new InlineKeyboard()
		.text("✅ Да", `confirm_${action}${data ? `_${data}` : ""}`)
		.text("❌ Нет", "cancel_action");
}

// Back button
export function createBackButton(action: string) {
	return new InlineKeyboard().text("🔙 Назад", action);
}

// Number input keyboard for common values
export function createNumberInputKeyboard(
	type: "price" | "discount" | "percent",
	_currentValue: number,
) {
	const keyboard = new InlineKeyboard();

	if (type === "price") {
		const prices = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
		for (let i = 0; i < prices.length; i += 4) {
			const row = prices.slice(i, i + 4);
			row.forEach((price) => {
				keyboard.text(`${price}₽`, `set_${type}_${price}`);
			});
			keyboard.row();
		}
	} else if (type === "discount") {
		const discounts = [100, 200, 300, 500, 1000, 1500, 2000, 3000];
		for (let i = 0; i < discounts.length; i += 4) {
			const row = discounts.slice(i, i + 4);
			row.forEach((discount) => {
				keyboard.text(`${discount}₽`, `set_${type}_${discount}`);
			});
			keyboard.row();
		}
	} else if (type === "percent") {
		const percents = [1, 2, 3, 5, 10, 15, 20, 25];
		for (let i = 0; i < percents.length; i += 4) {
			const row = percents.slice(i, i + 4);
			row.forEach((percent) => {
				keyboard.text(`${percent}%`, `set_${type}_${percent}`);
			});
			keyboard.row();
		}
	}

	keyboard
		.text("💬 Ввести вручную", `manual_input_${type}`)
		.text("🔙 Назад", "design_discounts");

	return keyboard;
}
