import React from "react";
import styles from "./Button.module.css";

type ButtonProps = {
	text: string;
	onClick: () => void;
	disabled?: boolean;
	title?: string;
};

const Button: React.FC<ButtonProps> = ({ text, onClick, disabled, title }) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={disabled ? styles.buttonDisabled : styles.button}
		>
			{text}
		</button>
	);
};

export default Button;
