async function run() {
  const data = {
    name: "Random Name 2",
    email: "random_1234_def@example.com",
    password: "password123",
    role: "buyer"
  };
  const response = await fetch("http://localhost:8000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  console.log("Register response:", response.status);
  console.log(await response.json());

  const loginResponse = await fetch("http://localhost:8000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email, password: data.password })
  });
  console.log("Login response:", loginResponse.status);
  console.log(await loginResponse.json());
}
run();
