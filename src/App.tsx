import "./index.css";
import { useState, useEffect } from "react";

// Define the Transaction interface based on the API response
interface Transaction {
	id: number;
	coin_id: number;
	amount: number;
	transaction_date: string;
	seller_id: number | null;
	seller_name: string | null;
	buyer_id: number;
	buyer_name: string;
	bit1: number;
	bit2: number;
	bit3: number;
	value: number;
	computedBitSlow: string;
}

const ENDPOINT_URL = "http://localhost:3000/"; // NOTE: change this based on your environment.

function fetchTransactions(): Promise<Transaction[]> {
	return fetch(ENDPOINT_URL + "api/transactions")
		.then((response) => response.json())
		.catch((error) => console.error("Error fetching data:", error));
}

function useTransactions() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		fetchTransactions()
			.then((data) => {
				setTransactions(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
			});
	}, []);

	return { transactions, loading, error };
}

export function App() {
	const { transactions, loading, error } = useTransactions();
	const [loadingTime, setLoadingTime] = useState(0);

	useEffect(() => {
		let timerId: number | undefined;

		if (loading) {
			timerId = window.setInterval(() => {
				setLoadingTime((prevTime) => prevTime + 1);
			}, 1000);
		}

		return () => {
			if (timerId) clearInterval(timerId);
		};
	}, [loading]);

	if (loading) {
		return (
			<div className="flex flex-col justify-center items-center h-screen bg-gray-50">
				<div className="w-16 h-16 mb-4 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
				<div className="animate-pulse flex flex-col items-center">
					<h2 className="text-xl font-semibold text-gray-700 mb-2">
						Loading Transactions
					</h2>
					<p className="text-sm text-gray-600 mb-2">
						Time elapsed: {loadingTime} seconds
					</p>
					<div className="flex space-x-1">
						<div
							className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
							style={{ animationDelay: "0ms" }}
						></div>
						<div
							className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
							style={{ animationDelay: "150ms" }}
						></div>
						<div
							className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
							style={{ animationDelay: "300ms" }}
						></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-red-500 p-4 text-center">
				Error loading transactions: {error.message}
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto p-4">
			<h1 className="text-3xl font-bold mb-8 text-gray-800">
				BitSlow Transactions
			</h1>

			{transactions.length === 0 ? (
				<p className="text-gray-500">No transactions found</p>
			) : (
				<div className="overflow-x-auto rounded-lg shadow-md">
					<table className="w-full border-collapse bg-white">
						<thead>
							<tr className="bg-gray-800 text-white">
								<th className="p-4 text-left">ID</th>
								<th className="p-4 text-left">BitSlow</th>
								<th className="p-4 text-left">Seller</th>
								<th className="p-4 text-left">Buyer</th>
								<th className="p-4 text-right">Amount</th>
								<th className="p-4 text-left">Date</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((transaction, index) => (
								<tr
									key={transaction.id}
									className={`hover:bg-gray-50 transition-colors ${index === transactions.length - 1 ? "" : "border-b border-gray-200"}`}
								>
									<td className="p-4 text-gray-600">{transaction.id}</td>
									<td className="p-4">
										<div>
											<div className="font-medium text-gray-800">
												{transaction.computedBitSlow}
											</div>
											<div className="text-xs text-gray-500 mt-1">
												Bits: {transaction.bit1}, {transaction.bit2},{" "}
												{transaction.bit3}
											</div>
											<div className="text-xs text-gray-500">
												Value: ${transaction.value.toLocaleString()}
											</div>
										</div>
									</td>
									<td className="p-4 text-gray-700">
										{transaction.seller_name
											? transaction.seller_name
											: "Original Issuer"}
									</td>
									<td className="p-4 text-gray-700">
										{transaction.buyer_name}
									</td>
									<td className="p-4 text-right font-semibold text-gray-800">
										${transaction.amount.toLocaleString()}
									</td>
									<td className="p-4 text-sm text-gray-600">
										{new Date(transaction.transaction_date).toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

export default App;
