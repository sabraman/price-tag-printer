import type React from "react";
import { Label } from "@/components/ui/label";
import { usePriceTagsStore } from "@/store/priceTagsStore";
import PlusMinusInput from "./PlusMinusInput";
import RadioGroupSwitcher from "./RadioGroupSwitcher";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

const Switcher: React.FC = () => {
	const {
		design,
		discountAmount,
		maxDiscountPercent,
		designType,
		hasTableDesigns,
		hasTableDiscounts,
		setDesign,
		setDiscountAmount,
		setMaxDiscountPercent,
		setDesignType,
		updateItemPrices,
		clearSettings,
	} = usePriceTagsStore();

	// Базовые опции дизайна
	let designItems = [
		{ value: "default", label: "Обычный" },
		{ value: "new", label: "Новинка" },
		{ value: "sale", label: "Распродажа" },
	];

	// Добавляем опцию "взять из таблицы", если есть дизайны в таблице
	if (hasTableDesigns) {
		designItems = [
			...designItems,
			{ value: "table", label: "Взять из таблицы" },
		];
	}

	// Определяем, нужно ли показывать переключатель скидок
	// Не показываем если "взять из таблицы" и есть настройки скидок в таблице
	const showDiscountSwitch = !(designType === "table" && hasTableDiscounts);

	// Показываем настройки скидок только если:
	// 1. Включен глобальный переключатель скидок, ИЛИ
	// 2. Мы в режиме таблицы с настройками скидок из таблицы
	const showDiscountSettings =
		design || (designType === "table" && hasTableDiscounts);

	// Для отладки - выводим в консоль текущие настройки
	console.log(
		`Switcher state: designType=${designType}, hasTableDiscounts=${hasTableDiscounts}, design=${design}, showDiscountSwitch=${showDiscountSwitch}`,
	);

	const handleChange = (checked: boolean) => {
		setDesign(checked);
		updateItemPrices();
	};

	const handleDiscountChange = (value: number) => {
		setDiscountAmount(value);
		// Always update prices when discount settings change
		updateItemPrices();
	};

	const handleMaxPercentChange = (value: number) => {
		setMaxDiscountPercent(value);
		// Always update prices when discount settings change
		updateItemPrices();
	};

	const handleDesignTypeChange = (value: string) => {
		// Если переключились на "взять из таблицы" и есть настройки скидок в таблице
		if (value === "table" && hasTableDiscounts) {
			// Отключаем глобальную настройку скидки
			setDesign(false);
		}

		setDesignType(value);
		updateItemPrices();
	};

	// Функция для сброса настроек (может быть полезна при отладке)
	const handleClearSettings = () => {
		clearSettings();
		window.location.reload();
	};

	return (
		<div className="border flex flex-col gap-4 p-4 border-secondary w-full rounded-lg">
			<RadioGroupSwitcher
				items={designItems}
				defaultValue={designType}
				onChange={handleDesignTypeChange}
				className="w-full"
			/>

			{/* Показываем переключатель только если не "взять из таблицы" с настройками скидок */}
			{showDiscountSwitch && (
				<div className="flex justify-between items-center">
					<Label htmlFor="discount" className="leading-normal">
						Использовать ценник со скидкой
					</Label>
					<Switch
						id="discount"
						onCheckedChange={handleChange}
						checked={design}
					/>
				</div>
			)}

			{/* Показываем настройки скидок всегда, когда отображается переключатель скидок */}
			{showDiscountSettings && (
				<div className="flex flex-col gap-4">
					<PlusMinusInput
						label="Максимальная скидка в рублях"
						defaultValue={discountAmount}
						minValue={0}
						step={5}
						onChange={handleDiscountChange}
					/>
					<PlusMinusInput
						label="Максимальный процент скидки"
						defaultValue={maxDiscountPercent}
						minValue={0}
						step={1}
						onChange={handleMaxPercentChange}
					/>
				</div>
			)}

			{/* Кнопка сброса настроек */}
			<Button type="button" variant={"link"} onClick={handleClearSettings}>
				Сбросить все настройки
			</Button>
		</div>
	);
};

export default Switcher;
