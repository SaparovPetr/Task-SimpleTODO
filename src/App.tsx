import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./App.module.css";
import Button from "./Button/Button";

type Todo = {
	id: string;
	text: string;
	completed: boolean;
};

function App() {
	// состояния
	const [todos, setTodos] = useState<Todo[]>(() => {
		const savedTodos = localStorage.getItem("todos");
		return savedTodos ? JSON.parse(savedTodos) : [];
	});

	const [inputValue, setInputValue] = useState<string>("");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

	// ждля сохранения списка при перезагрузках. Ну и PWA теперь можно из него вылепить
	useEffect(() => {
		localStorage.setItem("todos", JSON.stringify(todos));
	}, [todos]);

	// хендлеры
	const handleAddTodo = () => {
		const trimmed = inputValue.trim();
		if (!trimmed) return;

		const newTodo: Todo = {
			id: uuidv4(),
			text: trimmed,
			completed: false,
		};

		setTodos([...todos, newTodo]);
		setInputValue("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleAddTodo();
		}
	};

	const toggleTodoCompleted = (id: string) => {
		setTodos(
			todos.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo
			)
		);
	};

	const deleteTodo = (id: string) => {
		setTodos(todos.filter((todo) => todo.id !== id));
	};

	const clearCompletedTasks = () => {
		setTodos(todos.filter((todo) => !todo.completed));
	};

	// переменная подсчета активныхъ тасок
	const activeTasksCount = todos.filter((todo) => !todo.completed).length;

	const filteredTasks = todos.filter((todo) => {
		if (filter === "active") return !todo.completed;
		if (filter === "completed") return todo.completed;
		return true;
	});

	return (
		<div className={styles.container}>
			<div className={styles.inputArea}>
				<input
					type="text"
					placeholder="What nedds to be done?"
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					className={styles.input}
				/>
				<Button text="Add" onClick={handleAddTodo} />
				<div className={styles.tabsContainer}>
					<button
						className={`${styles.tabButton} ${
							filter === "all" ? styles.tabButtonActive : ""
						}`}
						onClick={() => setFilter("all")}
					>
						All ({todos.length})
					</button>
					<button
						className={`${styles.tabButton} ${
							filter === "active" ? styles.tabButtonActive : ""
						}`}
						onClick={() => setFilter("active")}
					>
						Active ({todos.filter((t) => !t.completed).length})
					</button>
					<button
						className={`${styles.tabButton} ${
							filter === "completed" ? styles.tabButtonActive : ""
						}`}
						onClick={() => setFilter("completed")}
					>
						Completed ({todos.filter((t) => t.completed).length})
					</button>
				</div>
			</div>

			<AnimatePresence>
				{filteredTasks.length === 0 ? (
					<p className={styles.hint}>
						{filter === "all"
							? "list is empty"
							: filter === "active"
							? "There aren't active tasks"
							: "There aren't completd tasks"}
					</p>
				) : (
					<ul className={styles.list}>
						<AnimatePresence>
							{filteredTasks.map((todo) => (
								<motion.li
									key={todo.id}
									className={styles.listItem}
									initial={{
										opacity: 0,
										height: 0,
										paddingTop: 0,
										paddingBottom: 0,
									}}
									animate={{
										opacity: 1,
										height: "auto",
										paddingTop: 10,
										paddingBottom: 10,
									}}
									exit={{
										opacity: 0,
										height: 0,
										paddingTop: 0,
										paddingBottom: 0,
									}}
									transition={{ duration: 0.3 }}
									layout
								>
									<label className={styles.todoLabel}>
										<input
											type="checkbox"
											checked={todo.completed}
											onChange={() => toggleTodoCompleted(todo.id)}
											className={styles.checkbox}
										/>
										<span
											className={`${styles.listText} ${
												todo.completed ? styles.listTextCompleted : ""
											}`}
										>
											{todo.text}
										</span>
									</label>

									<Button
										text="Remove"
										onClick={() => deleteTodo(todo.id)}
										title="Remove task"
									/>
								</motion.li>
							))}
						</AnimatePresence>
					</ul>
				)}
			</AnimatePresence>

			<div className={styles.footer}>
				<div>Items left: {activeTasksCount} </div>
				<Button
					text="Clear completed"
					onClick={clearCompletedTasks}
					disabled={!todos.some((t) => t.completed)}
					title="Clear completed tasks"
				/>
			</div>
		</div>
	);
}

export default App;
