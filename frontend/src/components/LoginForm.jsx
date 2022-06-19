import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./LoginForm.module.css";

function LoginForm(props) {
  const {
    title,
    msg: { text, goto, linkText },
    inputs,
  } = props;
  const initialState = inputs.reduce((prev, curr) => {
    return { ...prev, [curr.id]: "" };
  }, {});
  const [fields, setFields] = useState(initialState);
  const handleInput = (e) => {
    setFields({
      ...fields,
      [e.target.id]: e.target.value,
    });
  };
  return (
    <div className={styles["login-form-wrap"]}>
      <main className={styles.main}>
        <h1 className={styles.h1}>{title}</h1>
        <form className={styles.form}>
          {inputs.map((input) => (
            <input
              className={styles["form-input"]}
              type={input.type}
              id={input.id}
              key={input.id}
              placeholder={input.placeholder}
              value={fields[input.id]}
              onChange={handleInput}
            />
          ))}
          <button className={styles["form-btn"]}>{title}</button>
        </form>
        <p className={styles.msg}>
          {text} <Link to={goto}>{linkText}</Link>.
        </p>
      </main>
    </div>
  );
}

export default LoginForm;
