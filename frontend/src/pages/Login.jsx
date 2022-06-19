import LoginForm from "../components/LoginForm.jsx";

function Login() {
  const props = {
    title: "Login",
    msg: {
      text: "Don't have an account yet?",
      goto: "/register",
      linkText: "Sign up",
    },
    inputs: [
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
    ],
  };
  return <LoginForm {...props} />;
}

export default Login;
