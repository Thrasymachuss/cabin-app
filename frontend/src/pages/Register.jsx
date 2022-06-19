import LoginForm from "../components/LoginForm";

function Register() {
  const props = {
    title: "Register",
    msg: {
      text: "Already have an account?",
      goto: "/login",
      linkText: "Login",
    },
    inputs: [
      {
        id: "first-name",
        type: "text",
        placeholder: "First Name",
      },
      {
        id: "last-name",
        type: "text",
        placeholder: "Last Name",
      },
      {
        id: "email",
        type: "text",
        placeholder: "Email",
      },
      {
        id: "password",
        type: "password",
        placeholder: "Password",
      },
      {
        id: "retype-pswd",
        type: "password",
        placeholder: "Retype Password",
      },
      {
        id: "key",
        text: "text",
        placeholder: "Registration Key",
      },
    ],
  };
  return <LoginForm {...props} />;
}

export default Register;
