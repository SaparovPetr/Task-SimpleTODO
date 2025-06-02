import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// отлючение console.error для jsdom scrollTo (framer-motion вызывает его)
beforeAll(() => {
	window.scrollTo = () => {};
});

describe("Todo App", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test("добавляет таску", async () => {
		render(<App />);
		const input = screen.getByPlaceholderText(
			/what nedds to be done\?/i
		) as HTMLInputElement;
		const addButton = screen.getByRole("button", { name: /add/i });

		await userEvent.type(input, "Test task");
		expect(input).toHaveValue("Test task");
		await userEvent.click(addButton);

		expect(await screen.findByText("Test task")).toBeInTheDocument();
		expect(input).toHaveValue("");
	});

	test("удаляет таску", async () => {
		render(<App />);
		const input = screen.getByPlaceholderText(
			/what nedds to be done\?/i
		) as HTMLInputElement;
		const addButton = screen.getByRole("button", { name: /add/i });

		await userEvent.type(input, "Task to delete");
		await userEvent.click(addButton);

		expect(await screen.findByText("Task to delete")).toBeInTheDocument();

		const removeButton = await screen.findByRole("button", { name: /remove/i });
		await userEvent.click(removeButton);

		expect(screen.queryByText("Task to delete")).not.toBeInTheDocument();
	});

	test("переключает статус таски", async () => {
		render(<App />);
		const input = screen.getByPlaceholderText(
			/what nedds to be done\?/i
		) as HTMLInputElement;
		const addButton = screen.getByRole("button", { name: /add/i });

		await userEvent.type(input, "Toggle task");
		await userEvent.click(addButton);

		const checkbox = (await screen.findByRole("checkbox")) as HTMLInputElement;
		expect(checkbox.checked).toBe(false);

		await userEvent.click(checkbox);
		expect(checkbox.checked).toBe(true);

		await userEvent.click(checkbox);
		expect(checkbox.checked).toBe(false);
	});

	test("фильтрует таски", async () => {
		render(<App />);
		const input = screen.getByPlaceholderText(
			/what nedds to be done\?/i
		) as HTMLInputElement;
		const addButton = screen.getByRole("button", { name: /add/i });

		// довбавлние дух задач
		await userEvent.type(input, "Active task");
		await userEvent.click(addButton);

		await userEvent.type(input, "Completed task");
		await userEvent.click(addButton);

		// клик по второму чекбоксу
		const checkboxes = await screen.findAllByRole("checkbox");
		await userEvent.click(checkboxes[1]);

		// Проверка фильтра All
		const allTab = screen.getByRole("button", { name: /^all/i });
		await userEvent.click(allTab);
		expect(await screen.findByText("Active task")).toBeInTheDocument();
		expect(await screen.findByText("Completed task")).toBeInTheDocument();

		// Проверка фильтра  Active
		const activeTab = screen.getByRole("button", { name: /^active/i });
		await userEvent.click(activeTab);
		expect(await screen.findByText("Active task")).toBeInTheDocument();
		await waitFor(() => {
			expect(screen.queryByText("Completed task")).not.toBeInTheDocument();
		});

		// Проверка фильтра  Completed
		const completedTab = screen.getByRole("button", { name: /^completed/i });
		await userEvent.click(completedTab);

		// waitFor - чтобы дождаться исчезновения "Active task" (прикол от framer-motion)
		await waitFor(() => {
			expect(screen.queryByText("Active task")).not.toBeInTheDocument();
		});

		expect(await screen.findByText("Completed task")).toBeInTheDocument();
	});
});
