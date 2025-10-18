'use client';

import { useEffect } from 'react';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-4">Что-то пошло не так!</h2>
				<p className="text-gray-600 mb-6">Произошла непредвиденная ошибка.</p>
				<button
					onClick={reset}
					className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
				>
					Попробовать снова
				</button>
			</div>
		</div>
	);
}