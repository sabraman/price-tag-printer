import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-6xl font-bold mb-4">404</h1>
				<h2 className="text-2xl font-semibold mb-4">Страница не найдена</h2>
				<p className="text-gray-600 mb-6">
					Извините, но страница, которую вы ищете, не существует.
				</p>
				<Link
					href="/"
					className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded inline-block"
				>
					Вернуться на главную
				</Link>
			</div>
		</div>
	);
}