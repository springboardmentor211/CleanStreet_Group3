import { http } from "../../assets/js/utils/http.js";
import { setToken } from "../../assets/js/utils/storage.js";
const form = document.querySelector("#loginForm");
form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const body = { email: form.email.value, password: form.password.value };
  try{
    const data = await http('/auth/login',{method:'POST',body});
    setToken(data.token); location.href="../app/dashboard.html";
  }catch(err){ alert(err.message || "Login failed"); }
});
