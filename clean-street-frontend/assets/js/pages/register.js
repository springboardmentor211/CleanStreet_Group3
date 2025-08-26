import { http } from "../../assets/js/utils/http.js";
const form = document.querySelector("#registerForm");
form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const body = Object.fromEntries(new FormData(form).entries());
  try{ await http('/auth/register',{method:'POST',body}); location.href="./login.html"; }
  catch(err){ alert(err.message || "Register failed"); }
});
